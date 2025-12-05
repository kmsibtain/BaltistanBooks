const { db } = require('../config/firebase');

const getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);

    const [salesSnap, creditorsSnap, suppliersSnap] = await Promise.all([
      db.collection('sales').get(),
      db.collection('creditors').get(),
      db.collection('suppliers').get(),
    ]);

    const todaySales = salesSnap.docs
      .filter(d => d.data().date === today)
      .reduce((sum, d) => sum + d.data().total, 0);

    const monthSales = salesSnap.docs
      .filter(d => d.data().date.startsWith(currentMonth))
      .reduce((sum, d) => sum + d.data().total, 0);

    const totalOutstandingCredits = creditorsSnap.docs.reduce((s, d) => s + (d.data().totalOutstanding || 0), 0);
    const totalPendingDebits = suppliersSnap.docs.reduce((s, d) => s + (d.data().amountOwed || 0), 0);

    res.json({
      todaySales,
      monthSales,
      totalOutstandingCredits,
      totalPendingDebits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboardMetrics };