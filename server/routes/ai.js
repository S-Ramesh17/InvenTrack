const express = require('express');
const router = express.Router();
const { getRecommendations, getProductInsight } = require('../controllers/aiController');
const { requireAuth } = require('../middleware/auth');

// Rule-based recommendations for all users
router.get('/recommendations', requireAuth, getRecommendations);

// Gemini AI insights for all users
router.get('/product-insight/:id', requireAuth, getProductInsight);

module.exports = router;
