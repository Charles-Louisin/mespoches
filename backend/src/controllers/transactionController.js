const transactionService = require('../services/transactionService');
const { 
  createIncomeSchema, 
  createExpenseSchema, 
  createTransferSchema 
} = require('../validators/transactionValidator');

class TransactionController {
  async createIncome(req, res, next) {
    try {
      const { error, value } = createIncomeSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const transaction = await transactionService.createIncome(value, req.user.id);
      
      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async createExpense(req, res, next) {
    try {
      const { error, value } = createExpenseSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const transaction = await transactionService.createExpense(value, req.user.id);
      
      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async createTransfer(req, res, next) {
    try {
      const { error, value } = createTransferSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const result = await transactionService.createTransfer(value, req.user.id);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTransactions(req, res, next) {
    try {
      const filters = {
        wallet_id: req.query.wallet_id,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const transactions = await transactionService.getAllTransactions(req.user.id, filters);
      
      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req, res, next) {
    try {
      const transaction = await transactionService.getTransactionById(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
