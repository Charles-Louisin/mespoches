const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

class TransactionService {
  /**
   * Crée une transaction de type INCOME
   */
  async createIncome(data, userId) {
    try {
      const wallet = await Wallet.findOne({ _id: data.wallet_id, user_id: userId });
      
      if (!wallet) {
        throw new Error('Portefeuille introuvable');
      }

      const balance_before = wallet.current_balance;
      const balance_after = balance_before + data.amount;

      const transaction = new Transaction({
        user_id: userId,
        type: 'income',
        amount: data.amount,
        wallet_id: data.wallet_id,
        category_id: data.category_id,
        description: data.description || '',
        date: data.date || new Date(),
        balance_before,
        balance_after
      });

      await transaction.save();

      wallet.current_balance = balance_after;
      await wallet.save();

      return await Transaction.findById(transaction._id)
        .populate('wallet_id')
        .populate('category_id');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crée une transaction de type EXPENSE
   */
  async createExpense(data, userId) {
    try {
      const wallet = await Wallet.findOne({ _id: data.wallet_id, user_id: userId });
      
      if (!wallet) {
        throw new Error('Portefeuille introuvable');
      }

      const balance_before = wallet.current_balance;
      const balance_after = balance_before - data.amount;

      if (balance_after < 0) {
        throw new Error('Solde insuffisant pour cette dépense');
      }

      const transaction = new Transaction({
        user_id: userId,
        type: 'expense',
        amount: data.amount,
        wallet_id: data.wallet_id,
        category_id: data.category_id,
        description: data.description || '',
        date: data.date || new Date(),
        balance_before,
        balance_after
      });

      await transaction.save();

      wallet.current_balance = balance_after;
      await wallet.save();

      return await Transaction.findById(transaction._id)
        .populate('wallet_id')
        .populate('category_id');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crée une transaction de type TRANSFER
   * Note: Sans replica set, on fait les opérations séquentiellement
   */
  async createTransfer(data, userId) {
    try {
      const sourceWallet = await Wallet.findOne({ _id: data.wallet_id, user_id: userId });
      const destWallet = await Wallet.findOne({ _id: data.destination_wallet_id, user_id: userId });
      
      if (!sourceWallet || !destWallet) {
        throw new Error('Portefeuille introuvable');
      }

      if (data.wallet_id.toString() === data.destination_wallet_id.toString()) {
        throw new Error('Impossible de transférer vers le même portefeuille');
      }

      const source_balance_before = sourceWallet.current_balance;
      const source_balance_after = source_balance_before - data.amount;

      if (source_balance_after < 0) {
        throw new Error('Solde insuffisant pour ce transfert');
      }

      const dest_balance_before = destWallet.current_balance;
      const dest_balance_after = dest_balance_before + data.amount;

      // Transaction de débit (source)
      const debitTransaction = new Transaction({
        user_id: userId,
        type: 'transfer',
        amount: data.amount,
        wallet_id: data.wallet_id,
        destination_wallet_id: data.destination_wallet_id,
        description: data.description || `Transfert vers ${destWallet.name}`,
        date: data.date || new Date(),
        balance_before: source_balance_before,
        balance_after: source_balance_after
      });

      // Transaction de crédit (destination)
      const creditTransaction = new Transaction({
        user_id: userId,
        type: 'transfer',
        amount: data.amount,
        wallet_id: data.destination_wallet_id,
        destination_wallet_id: data.wallet_id,
        description: data.description || `Transfert de ${sourceWallet.name}`,
        date: data.date || new Date(),
        balance_before: dest_balance_before,
        balance_after: dest_balance_after
      });

      await debitTransaction.save();
      await creditTransaction.save();

      sourceWallet.current_balance = source_balance_after;
      destWallet.current_balance = dest_balance_after;

      await sourceWallet.save();
      await destWallet.save();

      return {
        debit: await Transaction.findById(debitTransaction._id)
          .populate('wallet_id')
          .populate('destination_wallet_id'),
        credit: await Transaction.findById(creditTransaction._id)
          .populate('wallet_id')
          .populate('destination_wallet_id')
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Récupère toutes les transactions d'un utilisateur
   */
  async getAllTransactions(userId, filters = {}) {
    const query = { user_id: userId };

    if (filters.wallet_id) {
      query.wallet_id = filters.wallet_id;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    return await Transaction.find(query)
      .populate('wallet_id')
      .populate('destination_wallet_id')
      .populate('category_id')
      .sort({ date: -1 });
  }

  /**
   * Récupère une transaction par ID (vérifie user_id)
   */
  async getTransactionById(id, userId) {
    const transaction = await Transaction.findOne({ _id: id, user_id: userId })
      .populate('wallet_id')
      .populate('destination_wallet_id')
      .populate('category_id');

    if (!transaction) {
      throw new Error('Transaction introuvable');
    }

    return transaction;
  }
}

module.exports = new TransactionService();
