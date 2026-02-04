const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  async getCurrentMonthStats(req, res, next) {
    try {
      const stats = await analyticsService.getCurrentMonthStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpensesByCategory(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await analyticsService.getExpensesByCategory(startDate, endDate);
      
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  async getIncomesByCategory(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await analyticsService.getIncomesByCategory(startDate, endDate);
      
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
