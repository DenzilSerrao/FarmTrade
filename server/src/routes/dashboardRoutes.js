const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { optionalAuth } = require('../middlewares/auth.middleware');

// GET news (can be accessed with optional auth for personalization)
router.get('/news', optionalAuth, dashboardController.getNews);

// GET sales analytics (requires authentication)
router.get('/analytics', dashboardController.getSalesAnalytics);

// GET market data (public with optional auth)
router.get('/market-data', optionalAuth, dashboardController.getMarketData);

// GET user dashboard summary (requires authentication)
router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router;