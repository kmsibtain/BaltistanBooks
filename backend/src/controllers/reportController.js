const { db } = require('../config/firebase');

// @desc    Get Profit & Loss Report
// @route   GET /api/reports/pnl
// @access  Private/Admin
const getPnL = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        // 1. Get Sales in range
        const salesSnapshot = await db.collection('sales')
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .get();

        let totalRevenue = 0;
        let totalCOGS = 0;

        // We need to fetch product cost prices. Ideally sales should snapshot cost price at time of sale.
        // OPTIMIZATION: For now, we assume current cost price (simpler for MVP, but inaccurate if cost changes).
        // BETTER APPROACH: Fetch all products to a map for quick lookup.

        const productsSnapshot = await db.collection('products').get();
        const productCosts = {};
        productsSnapshot.docs.forEach(doc => {
            productCosts[doc.id] = doc.data().costPrice || 0;
        });

        salesSnapshot.docs.forEach(doc => {
            const sale = doc.data();
            totalRevenue += sale.total;

            sale.items.forEach(item => {
                // item has productId and quantity
                const cost = productCosts[item.productId] || 0;
                totalCOGS += (cost * item.quantity);
            });
        });

        // 2. Get Expenses in range
        const expenseSnapshot = await db.collection('expenses')
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .get();

        let totalExpenses = 0;
        expenseSnapshot.docs.forEach(doc => {
            totalExpenses += doc.data().amount;
        });

        // 3. Calculate Profit
        const grossProfit = totalRevenue - totalCOGS;
        const netProfit = grossProfit - totalExpenses;

        res.json({
            period: { startDate, endDate },
            totalRevenue,
            totalCOGS,
            totalExpenses,
            grossProfit,
            netProfit
        });

    } catch (error) {
        console.error('PnL Report Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getPnL
};
