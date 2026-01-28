const { db, admin } = require('../config/firebase');

const getAllSuppliers = async (req, res) => {
  try {
    const snapshot = await db.collection('suppliers').orderBy('name').get();
    const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addSupplier = async (req, res) => {
  try {
    const { name, phone, email, address, notes, amountOwed = 0 } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    await db.collection('suppliers').add({
      name,
      phone,
      email: email || null,
      address: address || null,
      notes: notes || null,
      amountOwed: Number(amountOwed),
      lastPaymentDate: null,
      createdAt: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({ message: 'Supplier added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    await db.collection('suppliers').doc(req.params.id).update(req.body);
    res.json({ message: 'Supplier updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const recordPaymentToSupplier = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid payment amount is required' });
  }

  const paymentAmount = Number(amount);

  try {
    const supplierRef = db.collection('suppliers').doc(id);
    const doc = await supplierRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplier = doc.data();

    // Prevent negative balance (optional — you can allow overdraft if needed)
    if (paymentAmount > supplier.amountOwed) {
      return res.status(400).json({
        error: `Payment exceeds owed amount (${formatCurrency(supplier.amountOwed)})`,
      });
    }

    await supplierRef.update({
      amountOwed: admin.firestore.FieldValue.increment(-paymentAmount),
      lastPaymentDate: new Date().toISOString().split('T')[0],
      // Optional: add payment history
      paymentHistory: admin.firestore.FieldValue.arrayUnion({
        date: new Date().toISOString().split('T')[0],
        amount: paymentAmount,
        method: 'manual', // or from req.body
      }),
    });

    // Return updated supplier
    const updatedDoc = await supplierRef.get();
    const updatedSupplier = { id: updatedDoc.id, ...updatedDoc.data() };

    res.json(updatedSupplier);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

module.exports = { getAllSuppliers, addSupplier, updateSupplier, recordPaymentToSupplier };