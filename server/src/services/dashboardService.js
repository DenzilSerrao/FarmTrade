import axios from 'axios';

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
  async getSalesAnalytics(userId, timeRange = 'year') {
    try {
      // TODO: Replace with actual database query
      // Example: const analytics = await Sale.aggregate([...complex aggregation pipeline...]);

      const baseData = {
        totalSales: 125000,
        totalRevenue: 2500000,
        topCrop: 'Wheat',
        topCropSales: 45000,
        averageSalePrice: 20,
        totalTransactions: 156,
        monthlyTrends: [
          { month: 'Jan', sales: 8000, revenue: 160000, transactions: 12 },
          { month: 'Feb', sales: 12000, revenue: 240000, transactions: 18 },
          { month: 'Mar', sales: 15000, revenue: 300000, transactions: 22 },
          { month: 'Apr', sales: 18000, revenue: 360000, transactions: 25 },
          { month: 'May', sales: 22000, revenue: 440000, transactions: 28 },
          { month: 'Jun', sales: 20000, revenue: 400000, transactions: 24 },
          { month: 'Jul', sales: 16000, revenue: 320000, transactions: 20 },
          { month: 'Aug', sales: 14000, revenue: 280000, transactions: 17 },
        ],
        cropBreakdown: [
          { crop: 'Wheat', sales: 45000, percentage: 36 },
          { crop: 'Rice', sales: 35000, percentage: 28 },
          { crop: 'Corn', sales: 25000, percentage: 20 },
          { crop: 'Soybeans', sales: 20000, percentage: 16 },
        ],
        recentSales: [
          {
            id: 1,
            crop: 'Wheat',
            quantity: 500,
            price: 25,
            total: 12500,
            buyer: 'ABC Grain Mills',
            date: '2025-08-28',
          },
          {
            id: 2,
            crop: 'Rice',
            quantity: 300,
            price: 30,
            total: 9000,
            buyer: 'City Food Distributors',
            date: '2025-08-27',
          },
        ],
      };

      // Adjust data based on time range
      if (timeRange === 'month') {
        return {
          ...baseData,
          totalSales: Math.floor(baseData.totalSales / 12),
          totalRevenue: Math.floor(baseData.totalRevenue / 12),
          monthlyTrends: baseData.monthlyTrends.slice(-1), // Only current month
        };
      }

      if (timeRange === 'quarter') {
        return {
          ...baseData,
          totalSales: Math.floor(baseData.totalSales / 4),
          totalRevenue: Math.floor(baseData.totalRevenue / 4),
          monthlyTrends: baseData.monthlyTrends.slice(-3), // Last 3 months
        };
      }

      return baseData;
    } catch (error) {
      console.error('Error fetching sales analytics:', error);

      // Return fallback data
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
