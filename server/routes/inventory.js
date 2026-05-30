const express = require('express');
const router = express.Router();
const { stockIn, stockOut } = require('../controllers/inventoryController');
const { requireAuth } = require('../middleware/auth');

// Both admin and staff can update stock
router.post('/stock-in', requireAuth, stockIn);
router.post('/stock-out', requireAuth, stockOut);

module.exports = router;
