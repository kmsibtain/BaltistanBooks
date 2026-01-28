const express = require('express');
const router = express.Router();
const {
  getAllCreditors,
  addCreditor,
  recordPayment,
  getCreditorById,
} = require('../controllers/creditorController');

router.get('/', getAllCreditors);
router.post('/', addCreditor);
router.post('/:id/pay', recordPayment);
router.get('/:id', getCreditorById);
module.exports = router;