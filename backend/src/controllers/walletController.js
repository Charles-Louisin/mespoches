const walletService = require('../services/walletService');
const { createWalletSchema, updateWalletSchema } = require('../validators/walletValidator');

class WalletController {
  async createWallet(req, res, next) {
    try {
      const { error, value } = createWalletSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const wallet = await walletService.createWallet(value, req.user.id);
      
      res.status(201).json({
        success: true,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllWallets(req, res, next) {
    try {
      const wallets = await walletService.getAllWallets(req.user.id);
      
      res.status(200).json({
        success: true,
        count: wallets.length,
        data: wallets
      });
    } catch (error) {
      next(error);
    }
  }

  async getWalletById(req, res, next) {
    try {
      const wallet = await walletService.getWalletById(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWallet(req, res, next) {
    try {
      const { error, value } = updateWalletSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const wallet = await walletService.updateWallet(req.params.id, value, req.user.id);
      
      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteWallet(req, res, next) {
    try {
      const result = await walletService.deleteWallet(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getWalletHistory(req, res, next) {
    try {
      const result = await walletService.getWalletHistory(req.params.id, req.user.id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getTotalBalance(req, res, next) {
    try {
      const result = await walletService.getTotalBalance(req.user.id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
