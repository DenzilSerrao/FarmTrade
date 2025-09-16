import axios from 'axios';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import User from '../models/User.js';

class DashboardService {
  constructor() {
    this.newsCache = null;
    this.newsCacheExpiry = null;
    this.marketDataCache = null;
    this.marketDataCacheExpiry = null;
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  // Enhanced news service with caching and error handling
  async getNews(userId = null) {
    try {
      if (
        this.newsCache &&
        this.newsCacheExpiry &&
        Date.now() < this.newsCacheExpiry
      ) {
        return this.newsCache;
      }

      const news = [
        {
          id: 1,
          title: 'Market prices rising for rice',
          date: new Date().toISOString().split('T')[0],
          summary:
            'Rice prices have increased by 15% due to seasonal demand and supply chain issues.',
          category: 'market',
          importance: 'high',
          source: 'Agriculture Market Board',
        },
        {
          id: 2,
          title: 'New government scheme announced for farmers',
          date: new Date().toISOString().split('T')[0],
          summary:
            'The government has launched a new subsidy program for organic farming practices.',
          category: 'policy',
          importance: 'medium',
          source: 'Ministry of Agriculture',
        },
        {
          id: 3,
          title: 'Weather alert: Heavy rains expected next week',
          date: new Date().toISOString().split('T')[0],
          summary:
            'Farmers advised to take precautions for crops vulnerable to excess water.',
          category: 'weather',
          importance: 'high',
          source: 'Meteorological Department',
        },
        {
          id: 4,
          title: 'Digital farming tools gaining popularity',
          date: new Date().toISOString().split('T')[0],
          summary:
            'CropKart and similar platforms are revolutionizing how farmers connect with buyers.',
          category: 'technology',
          importance: 'medium',
          source: 'Agricultural Technology Review',
        },
      ];

      this.newsCache = news;
      this.newsCacheExpiry = Date.now() + this.cacheTimeout;
      return news;
    } catch (error) {
      console.error('Error fetching news:', error);
      return (
        this.newsCache || [
          {
            id: 1,
            title: 'Service temporarily unavailable',
            date: new Date().toISOString().split('T')[0],
            summary: 'Unable to fetch latest news. Please try again later.',
            category: 'system',
            importance: 'low',
            source: 'System',
          },
        ]
      );
    }
  }

  // Get marketplace data for dashboard analytics
  async getMarketData() {
    try {
      if (
        this.marketDataCache &&
        this.marketDataCacheExpiry &&
        Date.now() < this.marketDataCacheExpiry
      ) {
        return this.marketDataCache;
      }

      // Get real marketplace statistics
      const [
        totalItems,
        categoryStats,
        priceRanges,
        recentActivity,
        topSellers,
        popularItems,
      ] = await Promise.all([
        // Total active items
        Item.countDocuments({ available: true, isActive: true }),

        // Category distribution
        Item.aggregate([
          { $match: { available: true, isActive: true } },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              avgPrice: { $avg: '$price' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),

        // Price ranges by category
        Item.aggregate([
          { $match: { available: true, isActive: true } },
          {
            $group: {
              _id: '$category',
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' },
              avgPrice: { $avg: '$price' },
            },
          },
        ]),

        // Recent activity (last 7 days)
        Item.countDocuments({
          available: true,
          isActive: true,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),

        // Top sellers by item count
        Item.aggregate([
          { $match: { available: true, isActive: true } },
          { $group: { _id: '$ownerId', itemCount: { $sum: 1 } } },
          { $sort: { itemCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'seller',
            },
          },
          { $unwind: '$seller' },
          {
            $project: {
              sellerId: '$_id',
              sellerName: '$seller.name',
              itemCount: 1,
              rating: '$seller.rating',
            },
          },
        ]),

        // Most viewed items
        Item.find({ available: true, isActive: true })
          .populate('ownerId', 'name rating')
          .sort({ views: -1 })
          .limit(10)
          .select('name category price views ownerId'),
      ]);

      const marketData = {
        totalItems,
        categoryStats: categoryStats.map((cat) => ({
          category: cat._id,
          count: cat.count,
          averagePrice: Math.round(cat.avgPrice * 100) / 100,
        })),
        priceRanges: priceRanges.map((range) => ({
          category: range._id,
          minPrice: range.minPrice,
          maxPrice: range.maxPrice,
          averagePrice: Math.round(range.avgPrice * 100) / 100,
        })),
        recentActivity,
        topSellers,
        popularItems: popularItems.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category,
          price: item.price,
          views: item.views,
          seller: item.ownerId?.name || 'Unknown',
        })),
        trends: {
          weeklyGrowth: Math.round(Math.random() * 20 + 5), // Placeholder
          mostPopularCategory: categoryStats[0]?._id || 'vegetables',
          averagePrice:
            categoryStats.reduce((sum, cat) => sum + cat.avgPrice, 0) /
              categoryStats.length || 0,
        },
      };

      this.marketDataCache = marketData;
      this.marketDataCacheExpiry = Date.now() + this.cacheTimeout;
      return marketData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return {
        totalItems: 0,
        categoryStats: [],
        priceRanges: [],
        recentActivity: 0,
        topSellers: [],
        popularItems: [],
        trends: {
          weeklyGrowth: 0,
          mostPopularCategory: 'vegetables',
          averagePrice: 0,
        },
        error: 'Unable to fetch market data',
      };
    }
  }

  // Enhanced sales analytics with more detailed data
  async getSalesAnalytics(userId, timeRange = '30d') {
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [salesData, cropBreakdown, monthlyTrends, recentSales] =
        await Promise.all([
          // Get sales data from orders
          Order.aggregate([
            {
              $match: {
                sellerId: userId,
                status: { $in: ['delivered', 'shipped', 'completed'] },
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
          ]),

          // Get crop breakdown
          Order.aggregate([
            {
              $match: {
                sellerId: userId,
                status: { $in: ['delivered', 'shipped', 'completed'] },
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: '$productName',
                sales: { $sum: '$quantity' },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
          ]),

          // Get monthly trends
          Order.aggregate([
            {
              $match: {
                sellerId: userId,
                status: { $in: ['delivered', 'shipped', 'completed'] },
                createdAt: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                  day: { $dayOfMonth: '$createdAt' },
                },
                sales: { $sum: '$quantity' },
                revenue: { $sum: '$totalPrice' },
                transactions: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
          ]),

          // Get recent sales
          Order.find({
            sellerId: userId,
            status: { $in: ['delivered', 'shipped', 'completed'] },
          })
            .populate('buyerId', 'name')
            .sort({ createdAt: -1 })
            .limit(5),
        ]);

      const analytics = salesData[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalTransactions: 0,
        averageSalePrice: 0,
      };

      const totalCropRevenue = cropBreakdown.reduce(
        (sum, crop) => sum + crop.revenue,
        0
      );

      return {
        ...analytics,
        topCrop: cropBreakdown[0]?._id || 'No sales yet',
        topCropSales: cropBreakdown[0]?.sales || 0,
        monthlyTrends: monthlyTrends.map((trend) => ({
          date: `${trend._id.year}-${trend._id.month
            .toString()
            .padStart(2, '0')}-${trend._id.day.toString().padStart(2, '0')}`,
          sales: trend.sales,
          revenue: trend.revenue,
          transactions: trend.transactions,
        })),
        cropBreakdown: cropBreakdown.map((crop) => ({
          crop: crop._id,
          sales: crop.sales,
          revenue: crop.revenue,
          orders: crop.orders,
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
          buyer: sale.buyerId?.name || 'Anonymous',
          date: sale.createdAt.toISOString().split('T')[0],
          status: sale.status,
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
      const [userStats, orderStats, itemStats, marketStats] = await Promise.all(
        [
          User.findById(userId).select(
            'name rating totalTrades verified location'
          ),

          // Order statistics
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

          // Item statistics
          Item.aggregate([
            {
              $match: { ownerId: userId },
            },
            {
              $group: {
                _id: null,
                totalItems: { $sum: 1 },
                activeItems: { $sum: { $cond: ['$available', 1, 0] } },
                totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
                totalQuantity: { $sum: '$quantity' },
                lowStockItems: {
                  $sum: {
                    $cond: [
                      { $lte: ['$quantity', '$lowStockThreshold'] },
                      1,
                      0,
                    ],
                  },
                },
                expiringItems: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$expiryDate', null] },
                          {
                            $lte: [
                              '$expiryDate',
                              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ]),

          // Quick market overview for user's categories
          Item.aggregate([
            {
              $match: { ownerId: userId },
            },
            {
              $group: {
                _id: '$category',
                userItems: { $sum: 1 },
                userAvgPrice: { $avg: '$price' },
              },
            },
            {
              $lookup: {
                from: 'items',
                let: { category: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$category', '$category'] },
                      available: true,
                      isActive: true,
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      marketItems: { $sum: 1 },
                      marketAvgPrice: { $avg: '$price' },
                    },
                  },
                ],
                as: 'marketData',
              },
            },
            {
              $unwind: {
                path: '$marketData',
                preserveNullAndEmptyArrays: true,
              },
            },
          ]),
        ]
      );

      const orderStatusCounts = orderStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      const itemSummary = itemStats[0] || {
        totalItems: 0,
        activeItems: 0,
        totalValue: 0,
        totalQuantity: 0,
        lowStockItems: 0,
        expiringItems: 0,
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
          cancelled: orderStatusCounts.cancelled || 0,
        },
        inventory: {
          ...itemSummary,
          utilizationRate:
            itemSummary.totalItems > 0
              ? Math.round(
                  (itemSummary.activeItems / itemSummary.totalItems) * 100
                )
              : 0,
        },
        alerts: {
          lowStock: itemSummary.lowStockItems,
          expiringSoon: itemSummary.expiringItems,
        },
        marketComparison: marketStats.map((stat) => ({
          category: stat._id,
          userItems: stat.userItems,
          userAvgPrice: Math.round(stat.userAvgPrice * 100) / 100,
          marketItems: stat.marketData?.marketItems || 0,
          marketAvgPrice:
            Math.round((stat.marketData?.marketAvgPrice || 0) * 100) / 100,
          competitiveness:
            stat.userAvgPrice && stat.marketData?.marketAvgPrice
              ? stat.userAvgPrice <= stat.marketData.marketAvgPrice
                ? 'competitive'
                : 'premium'
              : 'unknown',
        })),
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return {
        user: null,
        orders: {
          total: 0,
          pending: 0,
          accepted: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
        inventory: {
          totalItems: 0,
          activeItems: 0,
          totalValue: 0,
          lowStockItems: 0,
          expiringItems: 0,
        },
        alerts: { lowStock: 0, expiringSoon: 0 },
        marketComparison: [],
        error: 'Unable to fetch dashboard data',
      };
    }
  }

  // Get weather information relevant to farming
  async getWeatherInfo(location = 'default') {
    try {
      // TODO: Integrate with actual weather API
      const currentDate = new Date();
      const season = this.getCurrentSeason();

      return {
        current: {
          temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
          humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
          rainfall: Math.floor(Math.random() * 20),
          windSpeed: Math.floor(Math.random() * 20) + 5,
          conditions: season === 'monsoon' ? 'Rainy' : 'Partly Cloudy',
          location: location || 'Your Location',
        },
        forecast: Array.from({ length: 5 }, (_, i) => ({
          day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `Day ${i + 1}`,
          high: Math.floor(Math.random() * 10) + 28,
          low: Math.floor(Math.random() * 10) + 18,
          rain: Math.floor(Math.random() * 100),
          conditions: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][
            Math.floor(Math.random() * 4)
          ],
        })),
        alerts: this.getWeatherAlerts(season),
        season,
        lastUpdated: currentDate.toISOString(),
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

  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 6) return 'summer';
    if (month >= 7 && month <= 10) return 'monsoon';
    return 'winter';
  }

  getWeatherAlerts(season) {
    const alerts = {
      summer: [
        {
          type: 'warning',
          message:
            'High temperatures expected. Ensure adequate irrigation for crops.',
          urgency: 'medium',
        },
      ],
      monsoon: [
        {
          type: 'alert',
          message:
            'Heavy rainfall expected. Secure harvested crops and check drainage.',
          urgency: 'high',
        },
      ],
      winter: [
        {
          type: 'info',
          message:
            'Cool weather ideal for winter crops like wheat and mustard.',
          urgency: 'low',
        },
      ],
    };
    return alerts[season] || [];
  }

  // Get crop recommendations based on season, location, market data
  async getCropRecommendations(userId, location = null, season = null) {
    try {
      const currentSeason = season || this.getCurrentSeason();
      const marketData = await this.getMarketData();

      // Get user's past successful crops
      const userHistory = await Order.aggregate([
        {
          $match: {
            sellerId: userId,
            status: { $in: ['delivered', 'completed'] },
          },
        },
        {
          $group: {
            _id: '$productName',
            totalRevenue: { $sum: '$totalPrice' },
            avgPrice: { $avg: '$pricePerUnit' },
            totalSales: { $sum: '$quantity' },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 3 },
      ]);

      const seasonalCrops = this.getSeasonalCrops(currentSeason);
      const trendingCrops = marketData.popularItems.slice(0, 3);

      return {
        seasonal: seasonalCrops,
        trending: trendingCrops.map((item) => ({
          crop: item.name,
          reason: `High demand - ${item.views} recent views`,
          marketTrend: 'increasing',
          riskLevel: 'medium',
          currentPrice: item.price,
        })),
        basedOnHistory: userHistory.map((crop) => ({
          crop: crop._id,
          reason: `You've had success with this crop - ₹${Math.round(
            crop.totalRevenue
          )} total revenue`,
          expectedReturn: 'high',
          difficulty: 'low',
        })),
        location: location || 'General recommendations',
        season: currentSeason,
      };
    } catch (error) {
      console.error('Error fetching crop recommendations:', error);
      return {
        seasonal: [],
        trending: [],
        basedOnHistory: [],
        error: 'Unable to fetch recommendations',
      };
    }
  }

  getSeasonalCrops(season) {
    const crops = {
      summer: [
        {
          crop: 'Tomatoes',
          reason:
            'Perfect season for tomato cultivation with high market demand',
          expectedYield: '15-20 tons per hectare',
          profitability: 'high',
          difficulty: 'medium',
          marketPrice: '₹25-40/kg',
        },
        {
          crop: 'Cucumber',
          reason: 'Summer crop with consistent market demand',
          expectedYield: '20-25 tons per hectare',
          profitability: 'medium',
          difficulty: 'low',
          marketPrice: '₹15-25/kg',
        },
      ],
      monsoon: [
        {
          crop: 'Rice',
          reason: 'Monsoon season ideal for rice cultivation',
          expectedYield: '4-6 tons per hectare',
          profitability: 'high',
          difficulty: 'low',
          marketPrice: '₹20-30/kg',
        },
        {
          crop: 'Sugarcane',
          reason: 'High water requirement met by monsoon rains',
          expectedYield: '80-120 tons per hectare',
          profitability: 'high',
          difficulty: 'medium',
          marketPrice: '₹300-400/quintal',
        },
      ],
      winter: [
        {
          crop: 'Wheat',
          reason: 'Winter crop with stable market prices',
          expectedYield: '3-4 tons per hectare',
          profitability: 'medium',
          difficulty: 'low',
          marketPrice: '₹18-25/kg',
        },
        {
          crop: 'Mustard',
          reason: 'Good for oil production with growing demand',
          expectedYield: '1-1.5 tons per hectare',
          profitability: 'medium',
          difficulty: 'low',
          marketPrice: '₹40-60/kg',
        },
      ],
    };
    return crops[season] || [];
  }

  // Get complete dashboard data in one call
  async getDashboardData(userId, options = {}) {
    try {
      const {
        includeNews = true,
        includeAnalytics = true,
        includeWeather = true,
        includeRecommendations = true,
        includeMarketData = true,
        timeRange = '30d',
        location = null,
      } = options;

      const dashboardData = {
        timestamp: new Date().toISOString(),
        userId,
      };

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

      if (includeMarketData) {
        promises.push(
          this.getMarketData()
            .then((marketData) => ({ marketData }))
            .catch((error) => ({
              marketData: {},
              marketDataError: error.message,
            }))
        );
      }

      // Also get dashboard summary
      promises.push(
        this.getDashboardSummary(userId)
          .then((summary) => ({ summary }))
          .catch((error) => ({ summary: {}, summaryError: error.message }))
      );

      const results = await Promise.all(promises);
      results.forEach((result) => {
        Object.assign(dashboardData, result);
      });

      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  // Clear all caches
  clearCache() {
    this.newsCache = null;
    this.newsCacheExpiry = null;
    this.marketDataCache = null;
    this.marketDataCacheExpiry = null;
  }
}

export default new DashboardService();
