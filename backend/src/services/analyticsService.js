const Transaction = require('../models/Transaction');

class AnalyticsService {
  /**
   * Obtient les statistiques du mois en cours
   */
  async getCurrentMonthStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const incomeTransactions = await Transaction.find({
      type: 'income',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const expenseTransactions = await Transaction.find({
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length
    };
  }

  /**
   * Obtient les dépenses par catégorie
   */
  async getExpensesByCategory(startDate, endDate) {
    const query = {
      type: 'expense',
      category_id: { $ne: null }
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).populate('category_id');

    const categoryMap = {};

    transactions.forEach(transaction => {
      if (transaction.category_id) {
        const categoryName = transaction.category_id.name;
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = {
            category: categoryName,
            total: 0,
            count: 0
          };
        }
        categoryMap[categoryName].total += transaction.amount;
        categoryMap[categoryName].count += 1;
      }
    });

    return Object.values(categoryMap).sort((a, b) => b.total - a.total);
  }

  /**
   * Obtient les revenus par catégorie
   */
  async getIncomesByCategory(startDate, endDate) {
    const query = {
      type: 'income',
      category_id: { $ne: null }
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).populate('category_id');

    const categoryMap = {};

    transactions.forEach(transaction => {
      if (transaction.category_id) {
        const categoryName = transaction.category_id.name;
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = {
            category: categoryName,
            total: 0,
            count: 0
          };
        }
        categoryMap[categoryName].total += transaction.amount;
        categoryMap[categoryName].count += 1;
      }
    });

    return Object.values(categoryMap).sort((a, b) => b.total - a.total);
  }
}

module.exports = new AnalyticsService();
