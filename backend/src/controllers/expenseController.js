const { db } = require('../config/firebase');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const snapshot = await db.collection('expenses').orderBy('date', 'desc').get();
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(expenses);
    } catch (error) {
        console.error('Get Expenses Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private/Admin
const addExpense = async (req, res) => {
    try {
        const { title, amount, category, date, description } = req.body;

        if (!title || !amount || !date) {
            return res.status(400).json({ error: 'Title, amount and date are required' });
        }

        const expense = {
            title,
            amount: Number(amount),
            category: category || 'General',
            date,
            description: description || '',
            createdAt: new Date().toISOString(),
            createdBy: req.user.id
        };

        const docRef = await db.collection('expenses').add(expense);
        res.status(201).json({ id: docRef.id, ...expense });

    } catch (error) {
        console.error('Add Expense Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = async (req, res) => {
    try {
        await db.collection('expenses').doc(req.params.id).delete();

        const { logAction } = require('../utils/auditLogger');
        // Note: We might want the expense details before deleting to log them, but ID is fine for now.
        // Or we assume req.user is populated since it's an admin route.
        if (req.user) {
            await logAction(req.user.id, req.user.name, 'DELETE', 'EXPENSE', req.params.id);
        }

        res.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error('Delete Expense Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    getExpenses,
    addExpense,
    deleteExpense
};
