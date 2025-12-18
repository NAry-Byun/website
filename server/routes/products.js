const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductBySku,
  getProductsByCategory,
  createProduct,
  updateProduct,
  partialUpdateProduct,
  deleteProduct
} = require('../controllers/productController');

// Get all products
router.get('/', getAllProducts);

// Get products by category
router.get('/category/:category', getProductsByCategory);

// Get product by SKU
router.get('/sku/:sku', getProductBySku);

// Get product by ID
router.get('/:id', getProductById);

// Create new product
router.post('/', createProduct);

// Update product (full update)
router.put('/:id', updateProduct);

// Partial update product
router.patch('/:id', partialUpdateProduct);

// Delete product
router.delete('/:id', deleteProduct);

module.exports = router;
