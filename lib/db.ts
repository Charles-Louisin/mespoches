import Dexie, { Table } from 'dexie';

// Types pour les données locales
export interface LocalWallet {
  id?: number;
  _id?: string;
  name: string;
  currency: string;
  current_balance: number;
  created_at: string;
  synced: boolean;
  pendingAction?: 'create' | 'update' | 'delete';
}

export interface LocalTransaction {
  id?: number;
  _id?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  wallet_id: string;
  destination_wallet_id?: string;
  category_id?: string;
  description: string;
  date: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
  synced: boolean;
  pendingAction?: 'create' | 'update' | 'delete';
}

export interface LocalCategory {
  id?: number;
  _id?: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
  synced: boolean;
  pendingAction?: 'create' | 'update' | 'delete';
}

export interface SyncQueue {
  id?: number;
  type: 'wallet' | 'transaction' | 'category';
  action: 'create' | 'update' | 'delete';
  data: any;
  localId?: number;
  timestamp: number;
  retryCount: number;
}

// Base de données Dexie
export class MesPochesDB extends Dexie {
  wallets!: Table<LocalWallet>;
  transactions!: Table<LocalTransaction>;
  categories!: Table<LocalCategory>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('MesPochesDB');
    
    this.version(1).stores({
      wallets: '++id, _id, name, synced',
      transactions: '++id, _id, wallet_id, type, date, synced',
      categories: '++id, _id, name, type, synced',
      syncQueue: '++id, type, timestamp'
    });
  }
}

export const db = new MesPochesDB();

// Fonction pour vider la base de données (utile lors de la déconnexion)
export const clearDatabase = async () => {
  await db.wallets.clear();
  await db.transactions.clear();
  await db.categories.clear();
  await db.syncQueue.clear();
};
