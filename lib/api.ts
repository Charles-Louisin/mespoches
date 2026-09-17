interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

/**
 * Passe par /api/proxy : le JWT reste dans le cookie HttpOnly côté serveur.
 * Aucun token ne transite par le JavaScript du navigateur.
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/proxy${endpoint}`, {
    ...options,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const fallback =
      response.status === 404 ? 'Route API introuvable' : `Erreur serveur (${response.status})`
    throw new Error(fallback)
  }

  const data: ApiResponse<T> = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Une erreur est survenue')
  }

  return data.data as T
}

export const authApi = {
  me: () => fetchApi<MeUser>('/auth/me'),
}

export const adminApi = {
  getUsers: () => fetchApi<AdminUserSummary[]>('/admin/users'),
  getUserById: (id: string) => fetchApi<AdminUserDetail>(`/admin/users/${id}`),
  getOverviewStats: () => fetchApi<AdminOverviewStats>('/admin/stats/overview'),
  getDailyActiveUsers: (days = 30) =>
    fetchApi<DailyActiveUsersStat[]>(`/admin/stats/daily-active-users?days=${days}`),
  getInsights: (days = 30) => fetchApi<AdminInsights>(`/admin/insights?days=${days}`),
  getTelemetry: (days = 30) => fetchApi<AdminTelemetry>(`/admin/telemetry?days=${days}`),
  getCohort: (key: string, days = 30) =>
    fetchApi<AdminCohort>(`/admin/cohorts?key=${encodeURIComponent(key)}&days=${days}`),
}

export interface MeUser {
  id: string
  email: string
  name?: string
  role?: 'user' | 'admin'
  plan?: 'free' | 'premium'
  premiumUntil?: string | null
  isPremium?: boolean
  currency?: string
  hidePlannedExpensesHelp?: boolean
  created_at: string
  lastLoginAt?: string | null
}

export interface AdminUserSummary {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  created_at: string
  lastLoginAt?: string
  plan?: 'free' | 'premium'
  premiumSource?: 'trial' | 'paid' | null
  emailVerified?: boolean
  authProvider?: 'email' | 'google' | 'both'
  walletsCount: number
  transactionsCount: number
  totalIncome: number
  totalExpense: number
}

export interface AdminOverviewStats {
  usersCount: number
  walletsCount: number
  transactionsCount: number
  lastLogins: {
    email: string
    name?: string
    role: 'user' | 'admin'
    lastLoginAt: string
  }[]
}

export interface DailyActiveUsersStat {
  date: string
  activeUsers: number
}

export interface AdminUserDetail {
  user: {
    _id: string
    email: string
    name?: string
    role: 'user' | 'admin'
    created_at: string
    lastLoginAt?: string
    plan?: 'free' | 'premium'
    premiumSource?: 'trial' | 'paid' | null
    emailVerified?: boolean
    authProvider?: 'email' | 'google' | 'both'
    premiumUntil?: string | null
    currency?: string
  }
  wallets: {
    _id: string
    name: string
    currency: string
    current_balance: number
  }[]
  transactions: {
    _id: string
    type: 'income' | 'expense' | 'transfer'
    amount: number
    category_id?: { name?: string } | string
    date: string
    balance_after: number
  }[]
  pendingByStatus?: Record<string, number>
  events?: { name: string; screen: string; props?: Record<string, string | number>; at: string }[]
}

export interface AdminInsights {
  periodDays: number
  kpis: {
    mau: number
    wau: number
    stickiness: number
    signups7d: number
    premiumActive: number
    trialActive: number
    paidPremium: number
    validationRate: number
    expenseVolume30d: number
    revenueCompleted: number
  }
  census: {
    registered: number
    verified: number
    unverified: number
    googleAuth: number
    signupsPeriod: number
  }
  funnel: {
    signups: number
    mau: number
    capturers: number
    validators: number
    paid: number
  }
  journey: {
    key: string
    title: string
    people: number
    stuck: number
    stuckKey: string
  }[]
  problems: { key: string; title: string; people: number }[]
  wins: { key: string; title: string; people: number }[]
  series: {
    signups: { date: string; count: number }[]
    dau: { date: string; activeUsers: number }[]
    volume: { date: string; income: number; expense: number }[]
  }
  finance: {
    incomeCount: number
    expenseCount: number
    transferCount: number
    incomeVolume: number
    expenseVolume: number
    incomeUsers: number
    expenseUsers: number
    topCategories: { name: string; type: string; count: number; volume: number }[]
    walletsByCurrency: { currency: string; count: number; balance: number }[]
    liveWallets: number
  }
  capture: {
    pending: number
    validated: number
    rejected: number
    queue: number
    pendingUsers: number
    bySource: { source: string; count: number }[]
    byOperator: { operator: string; count: number }[]
  }
  product: {
    categories: number
    budgets: number
    savingsGoals: number
    recurring: number
    planned: number
    smsHabits: number
  }
  revenue: {
    completedAmount: number
    completedCount: number
    failedCount: number
    pendingCount: number
    monthlyPaid: number
    yearlyPaid: number
  }
}

export interface AdminTelemetry {
  periodDays: number
  events: number
  uniqueUsers: number
  clicks: number
  screenViews: number
  errors: number
  errorUsers: number
  byName: { name: string; count: number }[]
  byScreen: { screen: string; count: number }[]
  byPlatform: { platform: string; count: number }[]
  byElement: { element: string; count: number }[]
  byDay: { date: string; count: number }[]
  recent: { name: string; screen: string; platform: string; at: string; user: string; userId?: string }[]
}

export interface AdminCohort {
  key: string
  title: string
  count: number
  people: {
    id: string
    email: string
    name: string
    lastLoginAt?: string | null
    created_at: string
    plan: string
    emailVerified: boolean
    hint?: string
  }[]
}
