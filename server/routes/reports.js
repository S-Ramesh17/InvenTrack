const express = require('express');
const router = express.Router();
const { getMovements, getSummary } = require('../controllers/reportsController');
const { requireAdmin, requireAuth } = require('../middleware/auth');

// Admin only for detailed reports
router.get('/movements', requireAdmin, getMovements);

// Both admin and staff can see summary
router.get('/summary', requireAuth, getSummary);

module.exports = router;
