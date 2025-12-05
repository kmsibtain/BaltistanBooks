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

module.exports = { getAllSuppliers, addSupplier, updateSupplier };