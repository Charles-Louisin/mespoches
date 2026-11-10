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

export type GithubReleaseInfo = {
  version: string | null
  apkUrl: string | null
  sizeMb: number | null
  notes: string | null
  publishedAt: string | null
}

export type AdminAppRelease = {
  _id: string
  version: string
  apkUrl: string
  notes: string | null
  minVersion: string | null
  created_at: string
}

export type EffectiveAppVersion = {
  latestVersion: string | null
  minVersion: string | null
  apkUrl: string
  sizeMb: number | null
  notes: string | null
  source: 'github' | 'admin' | 'none'
}

export type AdminPayment = {
  _id: string
  transaction_id: string
  user: { _id: string; email: string; name: string } | null
  tier: 'pro' | 'pro_plus' | 'business'
  period: 'monthly' | 'yearly'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  saspay_status: string | null
  saspay_charged: string | null
  saspay_transaction_id: string | null
  created_at: string
  completed_at: string | null
}

export type AdminPaymentsData = {
  days: number
  summary: {
    revenue: number
    completed: number
    pending: number
    failed: number
    byTier: { tier: string; count: number; amount: number }[]
  }
  payments: AdminPayment[]
  meta: { page: number; limit: number; count: number; hasMore: boolean; total?: number }
}

export const adminPaymentsApi = {
  list: (params: { days: number; status?: string; page?: number }) => {
    const q = new URLSearchParams({ days: String(params.days), page: String(params.page ?? 1), limit: '50' })
    if (params.status) q.set('status', params.status)
    return fetchApi<AdminPaymentsData>(`/admin/payments?${q.toString()}`)
  },
}

export const adminReleaseApi = {
  get: () =>
    fetchApi<{ github: GithubReleaseInfo; admin: AdminAppRelease | null; effective: EffectiveAppVersion }>(
      '/admin/app-release'
    ),
  publish: (body: { version: string; apkUrl: string; notes?: string; minVersion?: string }) =>
    fetchApi<{ effective: EffectiveAppVersion }>('/admin/app-release', { method: 'POST', body: JSON.stringify(body) }),
  withdraw: () => fetchApi<{ effective: EffectiveAppVersion }>('/admin/app-release', { method: 'DELETE' }),
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
  makeUserFree: (id: string) =>
    fetchApi<{ user: MeUser }>(`/admin/users/${id}/make-free`, { method: 'POST' }),
  setUserSubscription: (id: string, body: { tier: 'free' | 'pro' | 'pro_plus' | 'business'; lifetime?: boolean }) =>
    fetchApi<{ user: MeUser; planLabel: string }>(`/admin/users/${id}/subscription`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  resumeUserBilling: (id: string) =>
    fetchApi<{ user: MeUser; planLabel: string }>(`/admin/users/${id}/resume-billing`, { method: 'POST' }),
  suspendUser: (id: string) =>
    fetchApi<{ user: MeUser }>(`/admin/users/${id}/suspend`, { method: 'POST' }),
  unsuspendUser: (id: string) =>
    fetchApi<{ user: MeUser }>(`/admin/users/${id}/unsuspend`, { method: 'POST' }),
  deleteUser: (id: string) =>
    fetchApi<{ deleted: boolean }>(`/admin/users/${id}`, { method: 'DELETE' }),
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
  suspended?: boolean
}

export interface AdminUserSummary {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  created_at: string
  lastLoginAt?: string
  plan?: 'free' | 'premium'
  planLabel?: string
  subscriptionTier?: 'free' | 'pro' | 'pro_plus' | 'business'
  lifetime?: boolean
  premiumSource?: 'trial' | 'paid' | 'lifetime' | null
  suspended?: boolean
  emailVerified?: boolean
  authProvider?: 'email' | 'google' | 'both'
  walletsCount: number
  transactionsCount: number
  incomeCount?: number
  expenseCount?: number
  transferCount?: number
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
    planLabel?: string
    subscriptionTier?: 'free' | 'pro' | 'pro_plus' | 'business'
    lifetime?: boolean
    premiumSource?: 'trial' | 'paid' | 'lifetime' | null
    emailVerified?: boolean
    authProvider?: 'email' | 'google' | 'both'
    premiumUntil?: string | null
    currency?: string
    suspendedAt?: string | null
  }
  walletsCount: number
  categoriesCount: number
  transactionsByType?: Record<string, number>
  transactions: {
    _id: string
    type: 'income' | 'expense' | 'transfer'
    date: string
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
