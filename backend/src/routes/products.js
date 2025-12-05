const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  addProduct,
  updateProductQuantity,
  updateProductPrice,
  getProductById,
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', addProduct);
router.patch('/:id/quantity', updateProductQuantity);
router.patch('/:id/price', updateProductPrice);

module.exports = router;