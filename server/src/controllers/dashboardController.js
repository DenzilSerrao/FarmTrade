import DashboardService from '../services/dashboardService.js';

// GET news
export const getNews = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional user context for personalization
    const news = await DashboardService.getNews(userId);
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
export const getSalesAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const analytics = await DashboardService.getSalesAnalytics(userId);
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
export const getMarketData = async (req, res) => {
  try {
    const { region, crop } = req.query;
    const marketData = await DashboardService.getMarketData(region, crop);
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
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await DashboardService.getDashboardSummary(userId);
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

const dashboardController = {
  getNews,
  getSalesAnalytics,
  getMarketData,
  getDashboardSummary,
};

export default dashboardController;
