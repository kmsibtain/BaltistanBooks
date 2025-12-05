const express = require('express');
const router = express.Router();
const { getAllSuppliers, addSupplier, updateSupplier } = require('../controllers/supplierController');

router.get('/', getAllSuppliers);
router.post('/', addSupplier);
router.patch('/:id', updateSupplier);

module.exports = router;