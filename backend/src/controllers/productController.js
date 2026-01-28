const { db, admin } = require('../config/firebase');
const { logAction } = require('../utils/auditLogger');

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
    const { name, sku, quantity = 0, price, costPrice = 0, category } = req.body;
    if (!name || !sku || !price || !category) {
      return res.status(400).json({ error: 'Name, SKU, price and category are required' });
    }

    const productRef = await db.collection('products').add({
      name,
      sku: sku.toUpperCase(),
      quantity: Number(quantity),
      price: Number(price),
      costPrice: Number(costPrice),
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

    // Audit
    if (req.user) {
      logAction(req.user.id, req.user.name, 'CREATE', 'PRODUCT', productRef.id, { name, sku });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const importProducts = async (req, res) => {
  try {
    const { products } = req.body; // Expecting array of { name, sku, price, costPrice, quantity, category }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products provided' });
    }

    const batch = db.batch();
    const productsRef = db.collection('products');
    let count = 0;

    products.forEach(p => {
      if (p.name && p.sku && p.price) {
        const docRef = productsRef.doc();
        batch.set(docRef, {
          name: p.name,
          sku: p.sku.toUpperCase(),
          quantity: Number(p.quantity || 0),
          price: Number(p.price),
          costPrice: Number(p.costPrice || 0),
          category: p.category || 'Uncategorized',
          priceHistory: [{
            date: new Date().toISOString().split('T')[0],
            oldPrice: 0,
            newPrice: Number(p.price)
          }],
          quantityHistory: [],
          createdAt: new Date().toISOString()
        });
        count++;
      }
    });

    await batch.commit();

    // Audit
    if (req.user) {
      logAction(req.user.id, req.user.name, 'IMPORT', 'PRODUCT', 'BATCH', { count });
    }

    res.status(201).json({ message: `Successfully imported ${count} products` });
  } catch (error) {
    console.error('Import Error:', error);
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

    // Audit
    if (req.user) {
      logAction(req.user.id, req.user.name, 'UPDATE', 'STOCK', req.params.id, {
        change,
        reason,
        newQuantity: current.quantity + change
      });
    }
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

    // Audit
    if (req.user) {
      logAction(req.user.id, req.user.name, 'UPDATE', 'PRICE', req.params.id, {
        oldPrice: current.price,
        newPrice: Number(newPrice)
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  importProducts,
  updateProductQuantity,
  updateProductPrice,
};