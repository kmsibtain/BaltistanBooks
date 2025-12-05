const express = require('express');
const router = express.Router();
const {
  getAllCreditors,
  addCreditor,
  recordPayment,
} = require('../controllers/creditorController');

router.get('/', getAllCreditors);
router.post('/', addCreditor);
router.post('/:id/pay', recordPayment);

module.exports = router;