const { db, admin } = require('../config/firebase');
const { logAction } = require('../utils/auditLogger');

const createSale = async (req, res) => {
  try {
    const { items, total, paymentType, creditorId } = req.body;

    const sale = {
      date: new Date().toISOString().split('T')[0],
      items,
      total,
      paymentType,
      creditorId: paymentType === 'credit' ? creditorId : null,
      createdAt: new Date().toISOString()
    };

    const batch = db.batch();

    // 1. Add sale
    const saleRef = db.collection('sales').doc();
    batch.set(saleRef, sale);

    // 2. Update stock
    for (const item of items) {
      const productRef = db.collection('products').doc(item.productId);
      batch.update(productRef, {
        quantity: admin.firestore.FieldValue.increment(-item.quantity)
      });
    }

    // 3. Update creditor balance (if credit sale)
    if (paymentType === 'credit' && creditorId) {
      const creditorRef = db.collection('creditors').doc(creditorId);
      batch.update(creditorRef, {
        totalOutstanding: admin.firestore.FieldValue.increment(total),
        lastPaymentDate: sale.date,
        transactions: admin.firestore.FieldValue.arrayUnion({
          id: saleRef.id,
          date: sale.date,
          type: 'credit_sale',
          amount: total,
          description: `Sale ${saleRef.id.substring(0, 8)}`
        })
      });
    }

    await batch.commit();

    // Audit Log
    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? req.user.name : 'Unknown User';
    // We need to import logAction at top
    // For now I will assume I can add the log call here and the import at top

    // Actually I need to add the import first. I will do this in two steps or use multi_replace.
    // I will use replace_file_content to add import first, then another for the log.

    // Wait, let's look at the plan. I'll verify routes/sales.js first to be safe, but for now let's just update the controller assuming req.user is available if auth is used.

    // Replacing the response line to inject log before it
    const { logAction } = require('../utils/auditLogger'); // It's better to put this at top, but I can put it here if lazy. Better at top.
    // actually let's just do it cleanly.

    await logAction(userId, userName, 'CREATE', 'SALE', saleRef.id, { total, items: items.length });

    res.status(201).json({ id: saleRef.id, ...sale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
};

const getSales = async (req, res) => {
  try {
    let query = db.collection('sales').orderBy('date', 'desc');

    const { startDate, endDate, paymentType, creditorId } = req.query;
    if (startDate) query = query.where('date', '>=', startDate);
    if (endDate) query = query.where('date', '<=', endDate);
    if (paymentType && paymentType !== 'all') query = query.where('paymentType', '==', paymentType);
    if (creditorId && creditorId !== 'all') query = query.where('creditorId', '==', creditorId);

    const snapshot = await query.get();
    const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createSale, getSales };