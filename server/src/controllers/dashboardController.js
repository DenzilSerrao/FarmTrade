import express from 'express';
const router = express.Router();
import DashboardService from '../services/dashboardService';

const dashboardService = new DashboardService();

// GET news
exports.getNews = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional user context for personalization
    const news = await dashboardService.getNews(userId);
    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: 'FETCH_NEWS_ERROR',
    });
  }
};

// GET sales analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const analytics = await dashboardService.getSalesAnalytics(userId);
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: 'FETCH_ANALYTICS_ERROR',
    });
  }
};

// GET market data
exports.getMarketData = async (req, res) => {
  try {
    const { region, crop } = req.query;
    const marketData = await dashboardService.getMarketData(region, crop);
    res.status(200).json({
      success: true,
      data: marketData,
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data',
      error: 'FETCH_MARKET_ERROR',
    });
  }
};

// GET dashboard summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await dashboardService.getDashboardSummary(userId);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: 'FETCH_SUMMARY_ERROR',
    });
  }
};

export default dashboardController;
