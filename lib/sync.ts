import { db, SyncQueue } from './db';
import { walletApi, transactionApi, categoryApi } from './api';
import { isAuthenticated } from './auth';

// Détection de la connexion
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Ajouter une action à la file de synchronisation
export const addToSyncQueue = async (
  type: 'wallet' | 'transaction' | 'category',
  action: 'create' | 'update' | 'delete',
  data: any,
  localId?: number
): Promise<void> => {
  await db.syncQueue.add({
    type,
    action,
    data,
    localId,
    timestamp: Date.now(),
    retryCount: 0
  });
};

// Synchroniser les données avec le serveur
export const syncData = async (): Promise<{
  success: boolean;
  synced: number;
  errors: number;
}> => {
  if (!isOnline() || !isAuthenticated()) {
    return { success: false, synced: 0, errors: 0 };
  }

  let synced = 0;
  let errors = 0;

  try {
    // Récupérer toutes les actions en attente
    const queue = await db.syncQueue.orderBy('timestamp').toArray();

    for (const item of queue) {
      try {
        await processSyncItem(item);
        await db.syncQueue.delete(item.id!);
        synced++;
      } catch (error) {
        console.error('Erreur de synchronisation:', error);
        
        // Incrémenter le compteur de tentatives
        await db.syncQueue.update(item.id!, {
          retryCount: item.retryCount + 1
        });

        // Supprimer après 5 tentatives
        if (item.retryCount >= 5) {
          await db.syncQueue.delete(item.id!);
        }
        
        errors++;
      }
    }

    // Synchroniser les données depuis le serveur
    await syncFromServer();

    return { success: true, synced, errors };
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return { success: false, synced, errors };
  }
};

// Traiter un élément de la file de synchronisation
const processSyncItem = async (item: SyncQueue): Promise<void> => {
  switch (item.type) {
    case 'wallet':
      await syncWallet(item);
      break;
    case 'transaction':
      await syncTransaction(item);
      break;
    case 'category':
      await syncCategory(item);
      break;
  }
};

// Synchroniser un portefeuille
const syncWallet = async (item: SyncQueue): Promise<void> => {
  const { action, data, localId } = item;

  switch (action) {
    case 'create':
      const createdWallet = await walletApi.create(data);
      if (localId) {
        await db.wallets.update(localId, {
          _id: createdWallet._id,
          synced: true,
          pendingAction: undefined
        });
      }
      break;

    case 'update':
      await walletApi.update(data._id, data);
      if (localId) {
        await db.wallets.update(localId, {
          synced: true,
          pendingAction: undefined
        });
      }
      break;

    case 'delete':
      await walletApi.delete(data._id);
      if (localId) {
        await db.wallets.delete(localId);
      }
      break;
  }
};

// Synchroniser une transaction
const syncTransaction = async (item: SyncQueue): Promise<void> => {
  const { action, data, localId } = item;

  switch (action) {
    case 'create':
      let createdTransaction;
      
      if (data.type === 'income') {
        createdTransaction = await transactionApi.createIncome(data);
      } else if (data.type === 'expense') {
        createdTransaction = await transactionApi.createExpense(data);
      } else if (data.type === 'transfer') {
        const result = await transactionApi.createTransfer(data);
        createdTransaction = result.debit;
      }

      if (localId && createdTransaction) {
        await db.transactions.update(localId, {
          _id: createdTransaction._id,
          synced: true,
          pendingAction: undefined
        });
      }
      break;

    case 'update':
      // Les transactions ne sont généralement pas modifiables
      if (localId) {
        await db.transactions.update(localId, {
          synced: true,
          pendingAction: undefined
        });
      }
      break;

    case 'delete':
      // Les transactions ne sont généralement pas supprimables
      if (localId) {
        await db.transactions.delete(localId);
      }
      break;
  }
};

// Synchroniser une catégorie
const syncCategory = async (item: SyncQueue): Promise<void> => {
  const { action, data, localId } = item;

  switch (action) {
    case 'create':
      const createdCategory = await categoryApi.create(data);
      if (localId) {
        await db.categories.update(localId, {
          _id: createdCategory._id,
          synced: true,
          pendingAction: undefined
        });
      }
      break;

    case 'update':
      await categoryApi.update(data._id, data);
      if (localId) {
        await db.categories.update(localId, {
          synced: true,
          pendingAction: undefined
        });
      }
      break;

    case 'delete':
      await categoryApi.delete(data._id);
      if (localId) {
        await db.categories.delete(localId);
      }
      break;
  }
};

// Synchroniser les données depuis le serveur vers IndexedDB
const syncFromServer = async (): Promise<void> => {
  try {
    // Récupérer les portefeuilles
    const wallets = await walletApi.getAll();
    for (const wallet of wallets) {
      const existing = await db.wallets.where('_id').equals(wallet._id).first();
      if (existing) {
        await db.wallets.update(existing.id!, {
          ...wallet,
          synced: true,
          pendingAction: undefined
        });
      } else {
        await db.wallets.add({
          ...wallet,
          synced: true
        });
      }
    }

    // Récupérer les transactions
    const transactions = await transactionApi.getAll();
    for (const transaction of transactions) {
      const existing = await db.transactions.where('_id').equals(transaction._id).first();
      if (existing) {
        await db.transactions.update(existing.id!, {
          ...transaction,
          synced: true,
          pendingAction: undefined
        });
      } else {
        await db.transactions.add({
          ...transaction,
          synced: true
        });
      }
    }

    // Récupérer les catégories
    const categories = await categoryApi.getAll();
    for (const category of categories) {
      const existing = await db.categories.where('_id').equals(category._id).first();
      if (existing) {
        await db.categories.update(existing.id!, {
          ...category,
          synced: true,
          pendingAction: undefined
        });
      } else {
        await db.categories.add({
          ...category,
          synced: true
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation depuis le serveur:', error);
    throw error;
  }
};

// Vérifier le statut de synchronisation
export const getSyncStatus = async (): Promise<{
  pending: number;
  lastSync: number | null;
}> => {
  const pending = await db.syncQueue.count();
  
  // Récupérer la dernière synchronisation (vous pouvez stocker cela dans localStorage)
  const lastSync = localStorage.getItem('lastSync');
  
  return {
    pending,
    lastSync: lastSync ? parseInt(lastSync) : null
  };
};

// Marquer la dernière synchronisation
export const markLastSync = (): void => {
  localStorage.setItem('lastSync', Date.now().toString());
};
