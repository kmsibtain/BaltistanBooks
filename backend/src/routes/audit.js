const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/auditController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getLogs);

module.exports = router;
