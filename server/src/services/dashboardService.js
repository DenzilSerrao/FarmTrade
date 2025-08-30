class DashboardService {
  async getNews() {
    // For now return dummy static data, or fetch from an API
    return [
      { title: 'Market prices rising for rice', date: '2025-08-25' },
      {
        title: 'New government scheme announced for farmers',
        date: '2025-08-20',
      },
    ];
  }

  async getSalesAnalytics() {
    // Static analytics example; replace with DB query later
    return {
      totalSales: 12000,
      topCrop: 'Wheat',
      monthlyTrends: [
        { month: 'Jan', sales: 1000 },
        { month: 'Feb', sales: 1500 },
        { month: 'Mar', sales: 2000 },
      ],
    };
  }
}

module.exports = DashboardService;
