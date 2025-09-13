import express from 'express';
const router = express.Router();
import {
  getNews,
  getSalesAnalytics,
  getMarketData,
  getDashboardSummary,
} from '../controllers/dashboardController.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

// GET news (can be accessed with optional auth for personalization)
router.get('/news', optionalAuth, getNews);

// GET sales analytics (requires authentication)
router.get('/analytics', getSalesAnalytics);

// GET market data (public with optional auth)
router.get('/market-data', optionalAuth, getMarketData);

// GET user dashboard summary (requires authentication)
router.get('/summary', getDashboardSummary);

export default router;
