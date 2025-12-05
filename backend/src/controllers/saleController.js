const { db, admin } = require('../config/firebase');

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
          description: `Sale ${saleRef.id.substring(0,8)}`
        })
      });
    }

    await batch.commit();

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