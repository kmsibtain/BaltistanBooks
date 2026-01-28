const express = require('express');
const router = express.Router();
const { getPnL } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/pnl', protect, admin, getPnL);

module.exports = router;
