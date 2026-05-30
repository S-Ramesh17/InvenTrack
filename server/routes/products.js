const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All authenticated users can view products
router.get('/', requireAuth, getProducts);
router.get('/:id', requireAuth, getProductById);

// Only admins can create, update, delete
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
