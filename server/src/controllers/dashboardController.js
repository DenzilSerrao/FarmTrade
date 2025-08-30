const express = require('express');
const router = express.Router();
const DashboardService = require('../services/dashboardService');

const dashboardService = new DashboardService();

// GET news
router.get('/news', async (req, res) => {
  try {
    const news = await dashboardService.getNews();
    res.status(200).json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET sales analytics
router.get('/sales-analytics', async (req, res) => {
  try {
    const analytics = await dashboardService.getSalesAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
