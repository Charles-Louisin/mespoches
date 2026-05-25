import { getToken } from './auth';
import { PREMIUM_REQUIRED_CODE } from './planLimits';
import { PremiumRequiredError } from './subscription';

// En frontend (Next.js), l’API pointe maintenant vers le backend séparé
// Sur Vercel : configurez NEXT_PUBLIC_API_URL (ex: https://votre-backend.vercel.app/api)
// En local : mettez http://localhost:5000/api dans .env.local
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  code?: string;
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
    const msg = data.message || 'Une erreur est survenue';
    if (data.code === PREMIUM_REQUIRED_CODE) {
      throw new PremiumRequiredError(msg);
    }
    throw new Error(msg);
  }

  return data.data as T;
}

export async function fetchApiBlob(
  endpoint: string,
  options?: RequestInit
): Promise<Blob> {
  const token = getToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = 'Une erreur est survenue';
    try {
      const data = await response.json();
      message = data.message || message;
      if (data.code === PREMIUM_REQUIRED_CODE) {
        throw new PremiumRequiredError(message);
      }
    } catch (e) {
      if (e instanceof PremiumRequiredError) throw e;
    }
    throw new Error(message);
  }

  return response.blob();
}

// Wallets
export const walletApi = {
  getAll: () => fetchApi<Wallet[]>('/wallets'),
  getById: (id: string) => fetchApi<Wallet>(`/wallets/${id}`),
  getTotalBalance: () => fetchApi<{ total: number; wallets: Wallet[] }>('/wallets/total-balance'),
  create: (data: { name: string; currency?: string; image_url?: string | null }) => 
    fetchApi<Wallet>('/wallets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; currency?: string; image_url?: string | null }) =>
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
  getTransferPair: (id: string) =>
    fetchApi<{ debit: Transaction | null; credit: Transaction | null }>(
      `/transactions/${id}/transfer-pair`
    ),
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
  update: (
    id: string,
    data: {
      description?: string
      amount?: number
      wallet_id?: string
      category_id?: string | null
      date?: string
    }
  ) =>
    fetchApi<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
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
  create: (data: { name: string; type: 'income' | 'expense'; image_url?: string | null }) =>
    fetchApi<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { name?: string; type?: 'income' | 'expense'; image_url?: string | null }) =>
    fetchApi<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi(`/categories/${id}`, { method: 'DELETE' }),
};

// Analytics (utilisateur)
export const analyticsApi = {
  getCurrentMonth: () =>
    fetchApi<MonthStats>('/analytics/current-month'),
  getMonth: (year: number, month: number) =>
    fetchApi<MonthStats>(`/analytics/month?year=${year}&month=${month}`),
  getMonthComparison: (year: number, month: number) =>
    fetchApi<MonthComparison>(`/analytics/month-comparison?year=${year}&month=${month}`),
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

// Subscription
export const subscriptionApi = {
  getPlans: () =>
    fetchApi<{
      plans: typeof import('./planLimits').SUBSCRIPTION_PLANS;
      paymentAvailable: boolean;
      message: string;
    }>('/subscription/plans'),
  getStatus: () =>
    fetchApi<{ user: MeUser; isPremium: boolean; paymentAvailable: boolean }>(
      '/subscription/status'
    ),
};

// Budgets (Premium)
export interface Budget {
  _id: string;
  category_id: Category | string;
  year: number;
  month: number;
  limit_amount: number;
  spent?: number;
  percent?: number;
}

export const budgetApi = {
  getAll: (year: number, month: number) =>
    fetchApi<Budget[]>(`/budgets?year=${year}&month=${month}`),
  create: (data: {
    category_id: string;
    year: number;
    month: number;
    limit_amount: number;
  }) =>
    fetchApi<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, limit_amount: number) =>
    fetchApi<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ limit_amount }),
    }),
  delete: (id: string) =>
    fetchApi(`/budgets/${id}`, { method: 'DELETE' }),
};

// Objectifs d'épargne (Premium)
export interface SavingsGoal {
  _id: string;
  title: string;
  target_amount: number;
  wallet_id?: Wallet | string | null;
  deadline?: string | null;
  current_amount?: number;
  progress_percent?: number;
}

export const savingsGoalApi = {
  getAll: () => fetchApi<SavingsGoal[]>('/savings-goals'),
  create: (data: {
    title: string;
    target_amount: number;
    wallet_id?: string | null;
    deadline?: string | null;
  }) =>
    fetchApi<SavingsGoal>('/savings-goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi(`/savings-goals/${id}`, { method: 'DELETE' }),
};

// Transactions récurrentes (Premium)
export interface RecurringTransaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  wallet_id: Wallet | string;
  category_id?: Category | string | null;
  description: string;
  frequency: 'weekly' | 'monthly';
  day_of_month?: number | null;
  next_run_date: string;
  active: boolean;
}

export const recurringApi = {
  getAll: () => fetchApi<RecurringTransaction[]>('/recurring'),
  create: (data: Omit<RecurringTransaction, '_id' | 'active'> & { active?: boolean }) =>
    fetchApi<RecurringTransaction>('/recurring', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  run: (id: string) =>
    fetchApi<{ transaction: Transaction; recurring: RecurringTransaction }>(
      `/recurring/${id}/run`,
      { method: 'POST' }
    ),
  delete: (id: string) =>
    fetchApi(`/recurring/${id}`, { method: 'DELETE' }),
};

// Export (Premium)
export type ExportFormat = 'csv' | 'pdf' | 'xlsx';

export const exportApi = {
  downloadTransactions: (format: ExportFormat) =>
    fetchApiBlob(`/export/transactions?format=${format}`),
  downloadTransaction: (id: string, format: ExportFormat) =>
    fetchApiBlob(`/export/transactions/${id}?format=${format}`),
  /** @deprecated Utiliser downloadTransactions('csv') */
  downloadTransactionsCsv: () => fetchApiBlob('/export/transactions?format=csv'),
};

// Auth
export const authApi = {
  me: () =>
    fetchApi<MeUser>('/auth/me'),
  deleteMe: () =>
    fetchApi<{ message: string }>('/auth/me', { method: 'DELETE' }),
};

// Admin
export const adminApi = {
  getUsers: () =>
    fetchApi<AdminUserSummary[]>('/admin/users'),
  getUserById: (id: string) =>
    fetchApi<AdminUserDetail>(`/admin/users/${id}`),
  getOverviewStats: () =>
    fetchApi<AdminOverviewStats>('/admin/stats/overview'),
  getDailyActiveUsers: (days: number = 30) =>
    fetchApi<DailyActiveUsersStat[]>(`/admin/stats/daily-active-users?days=${days}`),
};

// Types
export interface Wallet {
  _id: string;
  name: string;
  currency: string;
  current_balance: number;
  image_url?: string | null;
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
  transfer_group_id?: string | null;
  is_transfer_mirror?: boolean;
  created_at: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  image_url?: string | null;
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

export interface MonthComparison {
  /** Mois affiché dans le sélecteur */
  selected: MonthStats;
  /** Mois juste avant (référence de comparaison) */
  previous: MonthStats;
  delta: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    incomeCount: number;
    expenseCount: number;
  };
  percent: {
    totalIncome: number | null;
    totalExpense: number | null;
    balance: number | null;
  };
}

export interface MeUser {
  id: string;
  email: string;
  name?: string;
  role?: 'user' | 'admin';
  plan?: 'free' | 'premium';
  premiumUntil?: string | null;
  isPremium?: boolean;
  created_at: string;
  lastLoginAt?: string | null;
}

export interface CategoryStat {
  category: string;
  total: number;
  count: number;
}

// Admin types
export interface AdminUserSummary {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  created_at: string;
  lastLoginAt?: string;
  walletsCount: number;
  transactionsCount: number;
  totalIncome: number;
  totalExpense: number;
}

export interface AdminOverviewStats {
  usersCount: number;
  walletsCount: number;
  transactionsCount: number;
  lastLogins: {
    email: string;
    name?: string;
    role: 'user' | 'admin';
    lastLoginAt: string;
  }[];
}

export interface DailyActiveUsersStat {
  date: string; // YYYY-MM-DD
  activeUsers: number;
}

export interface AdminUserDetail {
  user: {
    _id: string;
    email: string;
    name?: string;
    role: 'user' | 'admin';
    created_at: string;
    lastLoginAt?: string;
  };
  wallets: Wallet[];
  transactions: Transaction[];
}
