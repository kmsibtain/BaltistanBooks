const express = require('express');
const router = express.Router();
const { getAllSuppliers, addSupplier, updateSupplier, recordPaymentToSupplier } = require('../controllers/supplierController');

router.get('/', getAllSuppliers);
router.post('/', addSupplier);
router.patch('/:id', updateSupplier);
router.post('/:id/pay', recordPaymentToSupplier);

module.exports = router;