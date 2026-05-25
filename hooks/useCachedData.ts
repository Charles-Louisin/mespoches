'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCache, setCache, invalidateCache } from '@/lib/cache'

export function useCachedData<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  enabled = true
) {
  const cachedOnMount = enabled ? getCache<T>(cacheKey) : null

  const [data, setData] = useState<T | null>(cachedOnMount)
  const [loading, setLoading] = useState(enabled && !cachedOnMount)
  const [error, setError] = useState<Error | null>(null)

  const fetchFresh = useCallback(async () => {
    if (!enabled) return
    const result = await fetcher()
    setData(result)
    setCache(cacheKey, result)
    return result
  }, [cacheKey, enabled, fetcher])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const cached = getCache<T>(cacheKey)
    if (cached) {
      setData(cached)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setCache(cacheKey, result)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        const error = err instanceof Error ? err : new Error('Erreur de chargement')
        console.error(`Cache fetch [${cacheKey}]:`, error)
        setError(error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [cacheKey, enabled, fetcher])

  const refresh = useCallback(async () => {
    invalidateCache(cacheKey)
    setLoading(true)
    try {
      return await fetchFresh()
    } finally {
      setLoading(false)
    }
  }, [cacheKey, fetchFresh])

  return { data, loading, error, setData, refresh }
}
