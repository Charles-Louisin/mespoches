import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Une erreur est survenue');
  }

  return data.data as T;
}

// Wallets
export const walletApi = {
  getAll: () => fetchApi<Wallet[]>('/wallets'),
  getById: (id: string) => fetchApi<Wallet>(`/wallets/${id}`),
  getTotalBalance: () => fetchApi<{ total: number; wallets: Wallet[] }>('/wallets/total-balance'),
  create: (data: { name: string; currency?: string }) => 
    fetchApi<Wallet>('/wallets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; currency?: string }) =>
    fetchApi<Wallet>(`/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi(`/wallets/${id}`, { method: 'DELETE' }),
  getHistory: (id: string) =>
    fetchApi<{ wallet: Wallet; transactions: Transaction[] }>(`/wallets/${id}/history`),
};

// Transactions
export const transactionApi = {
  getAll: (filters?: {
    wallet_id?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.wallet_id) params.append('wallet_id', filters.wallet_id);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const query = params.toString();
    return fetchApi<Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => fetchApi<Transaction>(`/transactions/${id}`),
  createIncome: (data: TransactionInput) =>
    fetchApi<Transaction>('/transactions/income', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createExpense: (data: TransactionInput) =>
    fetchApi<Transaction>('/transactions/expense', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createTransfer: (data: TransferInput) =>
    fetchApi<{ debit: Transaction; credit: Transaction }>('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Categories
export const categoryApi = {
  getAll: (type?: 'income' | 'expense') => {
    const query = type ? `?type=${type}` : '';
    return fetchApi<Category[]>(`/categories${query}`);
  },
  getById: (id: string) => fetchApi<Category>(`/categories/${id}`),
  create: (data: { name: string; type: 'income' | 'expense' }) =>
    fetchApi<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; type?: 'income' | 'expense' }) =>
    fetchApi<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi(`/categories/${id}`, { method: 'DELETE' }),
};

// Analytics
export const analyticsApi = {
  getCurrentMonth: () =>
    fetchApi<MonthStats>('/analytics/current-month'),
  getExpensesByCategory: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return fetchApi<CategoryStat[]>(`/analytics/expenses-by-category${query ? `?${query}` : ''}`);
  },
  getIncomesByCategory: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return fetchApi<CategoryStat[]>(`/analytics/incomes-by-category${query ? `?${query}` : ''}`);
  },
};

// Types
export interface Wallet {
  _id: string;
  name: string;
  currency: string;
  current_balance: number;
  created_at: string;
}

export interface Transaction {
  _id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  wallet_id: Wallet | string;
  destination_wallet_id?: Wallet | string;
  category_id?: Category | string;
  description: string;
  date: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface TransactionInput {
  amount: number;
  wallet_id: string;
  category_id?: string;
  description?: string;
  date?: string;
}

export interface TransferInput {
  amount: number;
  wallet_id: string;
  destination_wallet_id: string;
  description?: string;
  date?: string;
}

export interface MonthStats {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

export interface CategoryStat {
  category: string;
  total: number;
  count: number;
}
