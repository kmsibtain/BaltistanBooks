const { db, admin } = require('../config/firebase');

const getAllCreditors = async (req, res) => {
  try {
    const snapshot = await db.collection('creditors').orderBy('name').get();
    const creditors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(creditors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addCreditor = async (req, res) => {
  try {
    const { name, phone, cnic, address, email, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const creditorRef = await db.collection('creditors').add({
      name: name.trim(),
      phone: phone.trim(),
      cnic: cnic?.trim() || null,
      address: address?.trim() || null,
      email: email?.trim() || null,
      notes: notes?.trim() || null,
      totalOutstanding: 0,
      lastPaymentDate: null,
      lastPaymentAmount: null,
      transactions: [],
      createdAt: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({ id: creditorRef.id, message: 'Creditor added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const creditorRef = db.collection('creditors').doc(req.params.id);
    const doc = await creditorRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Creditor not found' });

    const current = doc.data();
    const paymentAmount = Number(amount);

    await creditorRef.update({
      totalOutstanding: current.totalOutstanding - paymentAmount,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      lastPaymentAmount: paymentAmount,
      transactions: admin.firestore.FieldValue.arrayUnion({
        id: 'pay_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: 'payment',
        amount: paymentAmount,
        description: 'Payment received'
      })
    });

    res.json({ message: 'Payment recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllCreditors, addCreditor, recordPayment };