const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  addProduct,
  updateProductQuantity,
  updateProductPrice,
  getProductById,
  importProducts,
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.post('/import', addProduct); // Wait, wrong controller function
router.post('/import', importProducts);
router.get('/:id', getProductById);
router.post('/', addProduct);
router.patch('/:id/quantity', updateProductQuantity);
router.patch('/:id/price', updateProductPrice);

module.exports = router;