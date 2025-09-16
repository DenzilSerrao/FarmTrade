import axios from 'axios';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import User from '../models/User.js';

class DashboardService {
  constructor() {
    this.newsCache = null;
    this.newsCacheExpiry = null;
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  // Enhanced news service with caching and error handling
  async getNews(userId = null) {
    try {
      // Check cache first
      if (
        this.newsCache &&
        this.newsCacheExpiry &&
        Date.now() < this.newsCacheExpiry
      ) {
        return this.newsCache;
      }

      // TODO: Replace with actual news API or database query
      // Example: const response = await axios.get('https://api.agriculturenews.com/latest');

      const news = [
        {
          id: 1,
          title: 'Market prices rising for rice',
          date: '2025-08-25',
          summary:
            'Rice prices have increased by 15% due to seasonal demand and supply chain issues.',
          category: 'market',
          importance: 'high',
          source: 'Agriculture Market Board',
        },
        {
          id: 2,
          title: 'New government scheme announced for farmers',
          date: '2025-08-20',
          summary:
            'The government has launched a new subsidy program for organic farming practices.',
          category: 'policy',
          importance: 'medium',
          source: 'Ministry of Agriculture',
        },
        {
          id: 3,
          title: 'Weather alert: Heavy rains expected next week',
          date: '2025-08-28',
          summary:
            'Farmers advised to take precautions for crops vulnerable to excess water.',
          category: 'weather',
          importance: 'high',
          source: 'Meteorological Department',
        },
        {
          id: 4,
          title: 'New pest control guidelines released',
          date: '2025-08-22',
          summary:
            'Updated integrated pest management strategies for common crop diseases.',
          category: 'farming',
          importance: 'medium',
          source: 'Agricultural Research Institute',
        },
      ];

      // Cache the results
      this.newsCache = news;
      this.newsCacheExpiry = Date.now() + this.cacheTimeout;

      return news;
    } catch (error) {
      console.error('Error fetching news:', error);

      // Return cached data if available, otherwise fallback data
      if (this.newsCache) {
        return this.newsCache;
      }

      return [
        {
          id: 1,
          title: 'Service temporarily unavailable',
          date: new Date().toISOString().split('T')[0],
          summary: 'Unable to fetch latest news. Please try again later.',
          category: 'system',
          importance: 'low',
          source: 'System',
        },
      ];
    }
  }

  // Enhanced sales analytics with more detailed data
  async getSalesAnalytics(userId, timeRange = '30d') {
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get sales data from orders
      const salesData = await Order.aggregate([
        {
          $match: {
            sellerId: userId,
            status: { $in: ['delivered', 'shipped'] },
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$quantity' },
            totalRevenue: { $sum: '$totalPrice' },
            totalTransactions: { $sum: 1 },
            averageSalePrice: { $avg: '$pricePerUnit' },
          },
        },
      ]);

      // Get crop breakdown
      const cropBreakdown = await Order.aggregate([
        {
          $match: {
            sellerId: userId,
            status: { $in: ['delivered', 'shipped'] },
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$productName',
            sales: { $sum: '$quantity' },
            revenue: { $sum: '$totalPrice' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]);

      // Get monthly trends
      const monthlyTrends = await Order.aggregate([
        {
          $match: {
            sellerId: userId,
            status: { $in: ['delivered', 'shipped'] },
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            sales: { $sum: '$quantity' },
            revenue: { $sum: '$totalPrice' },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      // Get recent sales
      const recentSales = await Order.find({
        sellerId: userId,
        status: { $in: ['delivered', 'shipped'] },
      })
        .populate('buyerId', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      const analytics = salesData[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalTransactions: 0,
        averageSalePrice: 0,
      };

      // Calculate total for percentages
      const totalCropRevenue = cropBreakdown.reduce(
        (sum, crop) => sum + crop.revenue,
        0
      );

      return {
        ...analytics,
        topCrop: cropBreakdown[0]?.name || 'No sales yet',
        topCropSales: cropBreakdown[0]?.sales || 0,
        monthlyTrends: monthlyTrends.map((trend) => ({
          month: new Date(
            trend._id.year,
            trend._id.month - 1
          ).toLocaleDateString('en', { month: 'short' }),
          sales: trend.sales,
          revenue: trend.revenue,
          transactions: trend.transactions,
        })),
        cropBreakdown: cropBreakdown.map((crop) => ({
          crop: crop._id,
          sales: crop.sales,
          revenue: crop.revenue,
          percentage:
            totalCropRevenue > 0
              ? Math.round((crop.revenue / totalCropRevenue) * 100)
              : 0,
        })),
        recentSales: recentSales.map((sale) => ({
          id: sale._id,
          crop: sale.productName,
          quantity: sale.quantity,
          price: sale.pricePerUnit,
          total: sale.totalPrice,
          buyer: sale.buyerId.name,
          date: sale.createdAt.toISOString().split('T')[0],
        })),
      };
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      return {
        totalSales: 0,
        totalRevenue: 0,
        topCrop: 'No data',
        topCropSales: 0,
        averageSalePrice: 0,
        totalTransactions: 0,
        monthlyTrends: [],
        cropBreakdown: [],
        recentSales: [],
        error: 'Unable to fetch analytics data',
      };
    }
  }

  // Get dashboard summary with real data
  async getDashboardSummary(userId) {
    try {
      const [userStats, orderStats, itemStats] = await Promise.all([
        User.findById(userId).select('name rating totalTrades verified'),
        Order.aggregate([
          {
            $match: {
              $or: [{ buyerId: userId }, { sellerId: userId }],
            },
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        Item.aggregate([
          {
            $match: { ownerId: userId },
          },
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
              lowStockItems: {
                $sum: {
                  $cond: [{ $lte: ['$quantity', '$lowStockThreshold'] }, 1, 0],
                },
              },
            },
          },
        ]),
      ]);

      const orderStatusCounts = orderStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      const itemSummary = itemStats[0] || {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
      };

      return {
        user: userStats,
        orders: {
          total: Object.values(orderStatusCounts).reduce(
            (sum, count) => sum + count,
            0
          ),
          pending: orderStatusCounts.pending || 0,
          accepted: orderStatusCounts.accepted || 0,
          shipped: orderStatusCounts.shipped || 0,
          delivered: orderStatusCounts.delivered || 0,
        },
        inventory: itemSummary,
        alerts: {
          lowStock: itemSummary.lowStockItems,
          expiringSoon: 0, // TODO: Calculate expiring items
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return {
        user: null,
        orders: { total: 0, pending: 0, accepted: 0, shipped: 0, delivered: 0 },
        inventory: { totalItems: 0, totalValue: 0, lowStockItems: 0 },
        alerts: { lowStock: 0, expiringSoon: 0 },
        error: 'Unable to fetch dashboard data',
      };

      //   if (timeRange === 'quarter') {
      //     return {
      //       ...baseData,
      //       totalSales: Math.floor(baseData.totalSales / 4),
      //       totalRevenue: Math.floor(baseData.totalRevenue / 4),
      //       monthlyTrends: baseData.monthlyTrends.slice(-3), // Last 3 months
      //     };
      //   }

      //   return baseData;
      // } catch (error) {
      //   console.error('Error fetching sales analytics:', error);

      //   // Return fallback data
      //   return {
      //     totalSales: 0,
      //     totalRevenue: 0,
      //     topCrop: 'No data',
      //     topCropSales: 0,
      //     averageSalePrice: 0,
      //     totalTransactions: 0,
      //     monthlyTrends: [],
      //     cropBreakdown: [],
      //     recentSales: [],
      //     error: 'Unable to fetch analytics data',
      //   };
    }
  }

  // Get weather information relevant to farming
  async getWeatherInfo(location = 'default') {
    try {
      // TODO: Integrate with weather API
      // Example: const weather = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}`);

      return {
        current: {
          temperature: 28,
          humidity: 65,
          rainfall: 0,
          windSpeed: 12,
          conditions: 'Partly Cloudy',
        },
        forecast: [
          { day: 'Today', high: 32, low: 22, rain: 10, conditions: 'Sunny' },
          {
            day: 'Tomorrow',
            high: 30,
            low: 20,
            rain: 20,
            conditions: 'Cloudy',
          },
          { day: 'Day 3', high: 28, low: 18, rain: 80, conditions: 'Rainy' },
          { day: 'Day 4', high: 26, low: 16, rain: 60, conditions: 'Rainy' },
          {
            day: 'Day 5',
            high: 29,
            low: 19,
            rain: 30,
            conditions: 'Partly Cloudy',
          },
        ],
        alerts: [
          {
            type: 'warning',
            message:
              'Heavy rainfall expected in 2 days. Secure harvested crops.',
            urgency: 'medium',
          },
        ],
      };
    } catch (error) {
      console.error('Error fetching weather info:', error);
      return {
        current: { temperature: 'N/A', conditions: 'Data unavailable' },
        forecast: [],
        alerts: [],
        error: 'Weather service unavailable',
      };
    }
  }

  // Get crop recommendations based on season, location, etc.
  async getCropRecommendations(userId, location = null, season = null) {
    try {
      // TODO: Implement ML-based recommendations

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-12

      // Simple season-based recommendations
      let seasonalCrops = [];

      if (currentMonth >= 3 && currentMonth <= 6) {
        // Spring/Summer
        seasonalCrops = [
          {
            crop: 'Tomatoes',
            reason: 'Perfect season for tomato cultivation',
            expectedYield: '15-20 tons per hectare',
            profitability: 'high',
            difficulty: 'medium',
          },
          {
            crop: 'Corn',
            reason: 'Good market demand and weather conditions',
            expectedYield: '8-12 tons per hectare',
            profitability: 'medium',
            difficulty: 'low',
          },
        ];
      } else if (currentMonth >= 7 && currentMonth <= 10) {
        // Monsoon/Post-monsoon
        seasonalCrops = [
          {
            crop: 'Rice',
            reason: 'Monsoon season ideal for rice cultivation',
            expectedYield: '4-6 tons per hectare',
            profitability: 'high',
            difficulty: 'low',
          },
          {
            crop: 'Cotton',
            reason: 'High demand and good weather conditions',
            expectedYield: '1.5-2 tons per hectare',
            profitability: 'high',
            difficulty: 'high',
          },
        ];
      } else {
        // Winter
        seasonalCrops = [
          {
            crop: 'Wheat',
            reason: 'Winter crop with stable market prices',
            expectedYield: '3-4 tons per hectare',
            profitability: 'medium',
            difficulty: 'low',
          },
          {
            crop: 'Mustard',
            reason: 'Good for oil production with growing demand',
            expectedYield: '1-1.5 tons per hectare',
            profitability: 'medium',
            difficulty: 'low',
          },
        ];
      }

      return {
        seasonal: seasonalCrops,
        trending: [
          {
            crop: 'Quinoa',
            reason: 'Emerging superfood with premium pricing',
            marketTrend: 'increasing',
            riskLevel: 'medium',
          },
        ],
        location: location || 'General recommendations',
      };
    } catch (error) {
      console.error('Error fetching crop recommendations:', error);
      return {
        seasonal: [],
        trending: [],
        error: 'Unable to fetch recommendations',
      };
    }
  }

  // Get complete dashboard data in one call
  async getDashboardData(userId, options = {}) {
    try {
      const {
        includeNews = true,
        includeAnalytics = true,
        includeWeather = true,
        includeRecommendations = true,
        timeRange = 'year',
        location = null,
      } = options;

      const dashboardData = {
        timestamp: new Date().toISOString(),
        userId,
      };

      // Fetch data in parallel for better performance
      const promises = [];

      if (includeNews) {
        promises.push(
          this.getNews(userId)
            .then((news) => ({ news }))
            .catch((error) => ({ news: [], newsError: error.message }))
        );
      }

      if (includeAnalytics) {
        promises.push(
          this.getSalesAnalytics(userId, timeRange)
            .then((analytics) => ({ analytics }))
            .catch((error) => ({
              analytics: {},
              analyticsError: error.message,
            }))
        );
      }

      if (includeWeather) {
        promises.push(
          this.getWeatherInfo(location)
            .then((weather) => ({ weather }))
            .catch((error) => ({ weather: {}, weatherError: error.message }))
        );
      }

      if (includeRecommendations) {
        promises.push(
          this.getCropRecommendations(userId, location)
            .then((recommendations) => ({ recommendations }))
            .catch((error) => ({
              recommendations: {},
              recommendationsError: error.message,
            }))
        );
      }

      const results = await Promise.all(promises);

      // Merge all results
      results.forEach((result) => {
        Object.assign(dashboardData, result);
      });

      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache() {
    this.newsCache = null;
    this.newsCacheExpiry = null;
  }
}

export default new DashboardService();
