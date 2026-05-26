'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { toast } from 'sonner'
import { authApi } from '@/lib/api'
import { getUser, isAuthenticated, setUser } from '@/lib/auth'
import {
  AppCurrency,
  DEFAULT_CURRENCY,
  detectCurrencyFromLocale,
  getStoredCurrency,
  setStoredCurrency,
} from '@/lib/currencies'
import { formatCurrency } from '@/lib/utils'

interface CurrencyContextValue {
  currency: AppCurrency
  loading: boolean
  setCurrency: (currency: AppCurrency) => Promise<void>
  formatAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<AppCurrency>(DEFAULT_CURRENCY)
  const [loading, setLoading] = useState(true)

  const applyCurrency = useCallback((next: AppCurrency) => {
    setCurrencyState(next)
    setStoredCurrency(next)
    const stored = getUser()
    if (stored) {
      setUser({ ...stored, currency: next })
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        if (isAuthenticated()) {
          const me = await authApi.me()
          if (!cancelled && me.currency) {
            applyCurrency(me.currency as AppCurrency)
            return
          }
        }
        const local = getStoredCurrency()
        if (!cancelled) {
          applyCurrency(local ?? detectCurrencyFromLocale())
        }
      } catch {
        if (!cancelled) {
          applyCurrency(getStoredCurrency() ?? detectCurrencyFromLocale())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [applyCurrency])

  const setCurrency = useCallback(
    async (next: AppCurrency) => {
      applyCurrency(next)
      if (isAuthenticated()) {
        try {
          const me = await authApi.updateMe({ currency: next })
          applyCurrency((me.currency as AppCurrency) ?? next)
          toast.success('Devise mise à jour')
        } catch (e) {
          toast.error(
            e instanceof Error ? e.message : 'Erreur lors de la mise à jour'
          )
          throw e
        }
      } else {
        toast.success('Devise mise à jour')
      }
    },
    [applyCurrency]
  )

  const formatAmount = useCallback(
    (amount: number) => formatCurrency(amount, currency),
    [currency]
  )

  const value = useMemo(
    () => ({ currency, loading, setCurrency, formatAmount }),
    [currency, loading, setCurrency, formatAmount]
  )

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency doit être utilisé dans CurrencyProvider')
  }
  return ctx
}
