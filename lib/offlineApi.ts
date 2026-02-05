import { db } from './db';
import { walletApi, transactionApi, categoryApi, Wallet, Transaction, Category } from './api';
import { isOnline, addToSyncQueue } from './sync';
import { normalizeTransaction } from './normalizeData';

// API Wallet avec support offline
export const offlineWalletApi = {
  getAll: async (): Promise<Wallet[]> => {
    if (isOnline()) {
      try {
        const wallets = await walletApi.getAll();
        
        // Mettre à jour la base locale
        for (const wallet of wallets) {
          const existing = await db.wallets.where('_id').equals(wallet._id).first();
          if (existing) {
            await db.wallets.update(existing.id!, { ...wallet, synced: true });
          } else {
            await db.wallets.add({ ...wallet, synced: true });
          }
        }
        
        return wallets;
      } catch (error) {
        console.error('Erreur API, utilisation des données locales:', error);
      }
    }
    
    // Mode offline : récupérer depuis IndexedDB
    const localWallets = await db.wallets.toArray();
    return localWallets as Wallet[];
  },

  create: async (data: { name: string; currency?: string }): Promise<Wallet> => {
    if (isOnline()) {
      try {
        const wallet = await walletApi.create(data);
        await db.wallets.add({ ...wallet, synced: true });
        return wallet;
      } catch (error) {
        console.error('Erreur création, mode offline:', error);
      }
    }

    // Mode offline : créer localement
    const localWallet: any = {
      name: data.name,
      currency: data.currency || 'XAF',
      current_balance: 0,
      created_at: new Date().toISOString(),
      synced: false,
      pendingAction: 'create'
    };

    const id = await db.wallets.add(localWallet);
    localWallet.id = id;

    // Ajouter à la file de synchronisation
    await addToSyncQueue('wallet', 'create', data, id);

    return localWallet;
  },

  getTotalBalance: async (): Promise<{ total: number; wallets: Wallet[] }> => {
    const wallets = await offlineWalletApi.getAll();
    const total = wallets.reduce((sum, w) => sum + w.current_balance, 0);
    return { total, wallets };
  }
};

// API Transaction avec support offline
export const offlineTransactionApi = {
  getAll: async (): Promise<Transaction[]> => {
    if (isOnline()) {
      try {
        const transactions = await transactionApi.getAll();
        
        // Mettre à jour la base locale
        for (const transaction of transactions) {
          const normalized = normalizeTransaction(transaction);
          const existing = await db.transactions.where('_id').equals(transaction._id).first();
          if (existing) {
            await db.transactions.update(existing.id!, { ...normalized, synced: true });
          } else {
            await db.transactions.add({ ...normalized, synced: true });
          }
        }
        
        return transactions;
      } catch (error) {
        console.error('Erreur API, utilisation des données locales:', error);
      }
    }
    
    // Mode offline : récupérer depuis IndexedDB
    const localTransactions = await db.transactions.orderBy('date').reverse().toArray();
    return localTransactions as Transaction[];
  },

  createIncome: async (data: any): Promise<Transaction> => {
    if (isOnline()) {
      try {
        const transaction = await transactionApi.createIncome(data);
        const normalized = normalizeTransaction(transaction);
        await db.transactions.add({ ...normalized, synced: true });
        
        // Mettre à jour le solde du portefeuille localement
        const wallet = await db.wallets.where('_id').equals(data.wallet_id).first();
        if (wallet) {
          await db.wallets.update(wallet.id!, {
            current_balance: transaction.balance_after
          });
        }
        
        return transaction;
      } catch (error) {
        console.error('Erreur création, mode offline:', error);
      }
    }

    // Mode offline : créer localement
    const wallet = await db.wallets.where('_id').equals(data.wallet_id).first();
    if (!wallet) throw new Error('Portefeuille introuvable');

    const balance_before = wallet.current_balance;
    const balance_after = balance_before + data.amount;

    const localTransaction: any = {
      type: 'income',
      amount: data.amount,
      wallet_id: data.wallet_id,
      category_id: data.category_id,
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      balance_before,
      balance_after,
      created_at: new Date().toISOString(),
      synced: false,
      pendingAction: 'create'
    };

    const id = await db.transactions.add(localTransaction);
    localTransaction.id = id;

    // Mettre à jour le solde localement
    await db.wallets.update(wallet.id!, { current_balance: balance_after });

    // Ajouter à la file de synchronisation
    await addToSyncQueue('transaction', 'create', { ...data, type: 'income' }, id);

    return localTransaction;
  },

  createExpense: async (data: any): Promise<Transaction> => {
    if (isOnline()) {
      try {
        const transaction = await transactionApi.createExpense(data);
        const normalized = normalizeTransaction(transaction);
        await db.transactions.add({ ...normalized, synced: true });
        
        // Mettre à jour le solde du portefeuille localement
        const wallet = await db.wallets.where('_id').equals(data.wallet_id).first();
        if (wallet) {
          await db.wallets.update(wallet.id!, {
            current_balance: transaction.balance_after
          });
        }
        
        return transaction;
      } catch (error) {
        console.error('Erreur création, mode offline:', error);
      }
    }

    // Mode offline : créer localement
    const wallet = await db.wallets.where('_id').equals(data.wallet_id).first();
    if (!wallet) throw new Error('Portefeuille introuvable');

    const balance_before = wallet.current_balance;
    const balance_after = balance_before - data.amount;

    if (balance_after < 0) {
      throw new Error('Solde insuffisant');
    }

    const localTransaction: any = {
      type: 'expense',
      amount: data.amount,
      wallet_id: data.wallet_id,
      category_id: data.category_id,
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      balance_before,
      balance_after,
      created_at: new Date().toISOString(),
      synced: false,
      pendingAction: 'create'
    };

    const id = await db.transactions.add(localTransaction);
    localTransaction.id = id;

    // Mettre à jour le solde localement
    await db.wallets.update(wallet.id!, { current_balance: balance_after });

    // Ajouter à la file de synchronisation
    await addToSyncQueue('transaction', 'create', { ...data, type: 'expense' }, id);

    return localTransaction;
  },

  createTransfer: async (data: any): Promise<{ debit: Transaction; credit: Transaction }> => {
    if (isOnline()) {
      try {
        const result = await transactionApi.createTransfer(data);
        const normalizedDebit = normalizeTransaction(result.debit);
        const normalizedCredit = normalizeTransaction(result.credit);
        await db.transactions.add({ ...normalizedDebit, synced: true });
        await db.transactions.add({ ...normalizedCredit, synced: true });
        
        // Mettre à jour les soldes localement
        const sourceWallet = await db.wallets.where('_id').equals(data.wallet_id).first();
        const destWallet = await db.wallets.where('_id').equals(data.destination_wallet_id).first();
        
        if (sourceWallet) {
          await db.wallets.update(sourceWallet.id!, {
            current_balance: result.debit.balance_after
          });
        }
        
        if (destWallet) {
          await db.wallets.update(destWallet.id!, {
            current_balance: result.credit.balance_after
          });
        }
        
        return result;
      } catch (error) {
        console.error('Erreur transfert, mode offline:', error);
      }
    }

    // Mode offline : créer localement
    const sourceWallet = await db.wallets.where('_id').equals(data.wallet_id).first();
    const destWallet = await db.wallets.where('_id').equals(data.destination_wallet_id).first();
    
    if (!sourceWallet || !destWallet) {
      throw new Error('Portefeuille introuvable');
    }

    const source_balance_after = sourceWallet.current_balance - data.amount;
    if (source_balance_after < 0) {
      throw new Error('Solde insuffisant');
    }

    const dest_balance_after = destWallet.current_balance + data.amount;

    // Transaction de débit
    const debitTransaction: any = {
      type: 'transfer',
      amount: data.amount,
      wallet_id: data.wallet_id,
      destination_wallet_id: data.destination_wallet_id,
      description: data.description || `Transfert vers ${destWallet.name}`,
      date: data.date || new Date().toISOString(),
      balance_before: sourceWallet.current_balance,
      balance_after: source_balance_after,
      created_at: new Date().toISOString(),
      synced: false,
      pendingAction: 'create'
    };

    const debitId = await db.transactions.add(debitTransaction);
    debitTransaction.id = debitId;

    // Mettre à jour les soldes localement
    await db.wallets.update(sourceWallet.id!, { current_balance: source_balance_after });
    await db.wallets.update(destWallet.id!, { current_balance: dest_balance_after });

    // Ajouter à la file de synchronisation
    await addToSyncQueue('transaction', 'create', { ...data, type: 'transfer' }, debitId);

    return { debit: debitTransaction, credit: debitTransaction };
  }
};

// API Category avec support offline
export const offlineCategoryApi = {
  getAll: async (type?: 'income' | 'expense'): Promise<Category[]> => {
    if (isOnline()) {
      try {
        const categories = await categoryApi.getAll(type);
        
        // Mettre à jour la base locale
        for (const category of categories) {
          const existing = await db.categories.where('_id').equals(category._id).first();
          if (existing) {
            await db.categories.update(existing.id!, { ...category, synced: true });
          } else {
            await db.categories.add({ ...category, synced: true });
          }
        }
        
        return categories;
      } catch (error) {
        console.error('Erreur API, utilisation des données locales:', error);
      }
    }
    
    // Mode offline : récupérer depuis IndexedDB
    let query = db.categories.toArray();
    if (type) {
      query = db.categories.where('type').equals(type).toArray();
    }
    
    const localCategories = await query;
    return localCategories as Category[];
  }
};
