const store = new Map<string, unknown>()
const stale = new Set<string>()

export function isCacheValid(key: string): boolean {
  return store.has(key) && !stale.has(key)
}

export function getCache<T>(key: string): T | null {
  if (!isCacheValid(key)) return null
  return store.get(key) as T
}

export function setCache<T>(key: string, data: T): void {
  stale.delete(key)
  store.set(key, data)
}

export function invalidateCache(key: string): void {
  stale.add(key)
}

export function invalidateCachePrefix(prefix: string): void {
  Array.from(store.keys()).forEach((key) => {
    if (key.startsWith(prefix)) stale.add(key)
  })
}

export const CACHE_KEYS = {
  home: 'home',
  transactions: 'transactions',
  wallets: 'wallets',
  analytics: 'analytics',
  categories: 'categories',
  transaction: (id: string) => `transaction:${id}`,
  wallet: (id: string) => `wallet:${id}`,
} as const

/** Invalide les listes après création / modification / suppression */
export function invalidateFinancialCaches(): void {
  invalidateCache(CACHE_KEYS.home)
  invalidateCache(CACHE_KEYS.transactions)
  invalidateCache(CACHE_KEYS.wallets)
  invalidateCache(CACHE_KEYS.analytics)
  invalidateCache(CACHE_KEYS.categories)
  invalidateCachePrefix('transaction:')
  invalidateCachePrefix('wallet:')
}
