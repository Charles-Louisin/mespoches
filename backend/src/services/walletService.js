const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

class WalletService {
  /**
   * Crée un nouveau portefeuille
   */
  async createWallet(data, userId) {
    const wallet = new Wallet({
      user_id: userId,
      name: data.name,
      currency: data.currency || 'XAF',
      current_balance: 0
    });

    return await wallet.save();
  }

  /**
   * Récupère tous les portefeuilles d'un utilisateur
   */
  async getAllWallets(userId) {
    return await Wallet.find({ user_id: userId }).sort({ created_at: -1 });
  }

  /**
   * Récupère un portefeuille par ID (vérifie user_id)
   */
  async getWalletById(id, userId) {
    const wallet = await Wallet.findOne({ _id: id, user_id: userId });
    
    if (!wallet) {
      throw new Error('Portefeuille introuvable');
    }

    return wallet;
  }

  /**
   * Met à jour un portefeuille
   */
  async updateWallet(id, data, userId) {
    const wallet = await Wallet.findOne({ _id: id, user_id: userId });
    
    if (!wallet) {
      throw new Error('Portefeuille introuvable');
    }

    if (data.name) wallet.name = data.name;
    if (data.currency) wallet.currency = data.currency;

    return await wallet.save();
  }

  /**
   * Supprime un portefeuille (seulement si aucune transaction)
   */
  async deleteWallet(id, userId) {
    const wallet = await Wallet.findOne({ _id: id, user_id: userId });
    
    if (!wallet) {
      throw new Error('Portefeuille introuvable');
    }

    const transactionCount = await Transaction.countDocuments({
      user_id: userId,
      $or: [
        { wallet_id: id },
        { destination_wallet_id: id }
      ]
    });

    if (transactionCount > 0) {
      throw new Error('Impossible de supprimer un portefeuille avec des transactions');
    }

    await Wallet.findByIdAndDelete(id);
    return { message: 'Portefeuille supprimé avec succès' };
  }

  /**
   * Récupère l'historique d'un portefeuille
   */
  async getWalletHistory(id, userId) {
    const wallet = await this.getWalletById(id, userId);
    
    const transactions = await Transaction.find({
      user_id: userId,
      $or: [
        { wallet_id: id },
        { destination_wallet_id: id }
      ]
    })
      .populate('wallet_id')
      .populate('destination_wallet_id')
      .populate('category_id')
      .sort({ date: -1 });

    return {
      wallet,
      transactions
    };
  }

  /**
   * Calcule le solde total de tous les portefeuilles d'un utilisateur
   */
  async getTotalBalance(userId) {
    const wallets = await Wallet.find({ user_id: userId });
    const total = wallets.reduce((sum, wallet) => sum + wallet.current_balance, 0);
    
    return {
      total,
      wallets
    };
  }
}

module.exports = new WalletService();
