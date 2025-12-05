// scripts/seed.js
const { db, admin } = require('../src/config/firebase');
const { mockProducts, mockCreditors, mockSuppliers, mockSales } = require('./mockData'); // ← now .js

const seed = async () => {
  try {
    const batch = db.batch();

    // Clear collections first (optional)
    const collections = ['products', 'creditors', 'suppliers', 'sales'];
    for (const coll of collections) {
      const snapshot = await db.collection(coll).get();
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
      }
    }

    // Add products
    for (const p of mockProducts) {
      const ref = db.collection('products').doc();
      batch.set(ref, { ...p, id: ref.id });
    }

    // Add creditors
    for (const c of mockCreditors) {
      const ref = db.collection('creditors').doc();
      batch.set(ref, { ...c, id: ref.id, transactions: [] });
    }

    // Add suppliers
    for (const s of mockSuppliers) {
      const ref = db.collection('suppliers').doc();
      batch.set(ref, { ...s, id: ref.id });
    }

    // Add sales
    for (const s of mockSales) {
      const ref = db.collection('sales').doc();
      batch.set(ref, { ...s, id: ref.id });
    }

    await batch.commit();
    console.log('Database seeded successfully with mock data!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();