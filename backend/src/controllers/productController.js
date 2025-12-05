const { db, admin } = require('../config/firebase');

const getAllProducts = async (req, res) => {
  try {
    const snapshot = await db.collection('products').orderBy('name').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, sku, quantity = 0, price, category } = req.body;
    if (!name || !sku || !price || !category) {
      return res.status(400).json({ error: 'Name, SKU, price and category are required' });
    }

    const productRef = await db.collection('products').add({
      name,
      sku: sku.toUpperCase(),
      quantity: Number(quantity),
      price: Number(price),
      category,
      priceHistory: [{
        date: new Date().toISOString().split('T')[0],
        oldPrice: 0,
        newPrice: Number(price)
      }],
      quantityHistory: [],
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ id: productRef.id, message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProductQuantity = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const productRef = db.collection('products').doc(req.params.id);
    const doc = await productRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' });

    const current = doc.data();
    const change = Number(amount);

    await productRef.update({
      quantity: current.quantity + change,
      quantityHistory: admin.firestore.FieldValue.arrayUnion({
        date: new Date().toISOString().split('T')[0],
        change,
        reason: reason || 'Manual adjustment',
        newQuantity: current.quantity + change
      })
    });

    res.json({ message: 'Stock updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProductPrice = async (req, res) => {
  try {
    const { newPrice } = req.body;
    const productRef = db.collection('products').doc(req.params.id);
    const doc = await productRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' });

    const current = doc.data();
    await productRef.update({
      price: Number(newPrice),
      priceHistory: admin.firestore.FieldValue.arrayUnion({
        date: new Date().toISOString().split('T')[0],
        oldPrice: current.price,
        newPrice: Number(newPrice)
      })
    });

    res.json({ message: 'Price updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProductQuantity,
  updateProductPrice,
};