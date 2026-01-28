const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getExpenses);
router.post('/', protect, admin, addExpense);
router.delete('/:id', protect, admin, deleteExpense);

module.exports = router;
