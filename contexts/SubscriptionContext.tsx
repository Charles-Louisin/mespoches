'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi, MeUser } from '@/lib/api'
import { getToken, getUser, setUser } from '@/lib/auth'
import {
  isPremiumUser,
  isPremiumRequiredError,
  getUpgradePath,
} from '@/lib/subscription'

function meUserFromStorage(): MeUser | null {
  const stored = getUser()
  if (!stored) return null
  return {
    id: stored.id,
    email: stored.email,
    name: stored.name,
    role: stored.role,
    plan: stored.plan,
    premiumUntil: stored.premiumUntil,
    isPremium: stored.isPremium,
    currency: stored.currency,
    hidePlannedExpensesHelp: stored.hidePlannedExpensesHelp,
    created_at: '',
    lastLoginAt: stored.lastLoginAt,
  }
}

interface SubscriptionContextValue {
  user: MeUser | null
  loading: boolean
  isPremium: boolean
  /** false pendant le chargement → évite le flash « Pro » */
  showProBadge: boolean
  refresh: () => Promise<MeUser | null>
  requirePremium: (message?: string) => void
  handleApiError: (err: unknown, fallbackMessage?: string) => boolean
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUserState] = useState<MeUser | null>(() =>
    typeof window !== 'undefined' ? meUserFromStorage() : null
  )
  const [loading, setLoading] = useState(() =>
    typeof window !== 'undefined' ? !!getToken() : false
  )

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUserState(null)
      setLoading(false)
      return null
    }
    try {
      const me = await authApi.me()
      setUserState(me)
      const stored = getUser()
      if (stored) {
        setUser({
          ...stored,
          plan: me.plan,
          premiumUntil: me.premiumUntil,
          isPremium: me.isPremium,
          currency: me.currency,
        })
      }
      return me
    } catch {
      const fallback = meUserFromStorage()
      if (fallback) setUserState(fallback)
      return fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isPremium = isPremiumUser(user)
  const showProBadge = !loading && !isPremium

  const requirePremium = useCallback(
    (message?: string) => {
      toast.info(message || 'Cette fonctionnalité nécessite Premium')
      router.push(getUpgradePath())
    },
    [router]
  )

  const handleApiError = useCallback(
    (err: unknown, fallbackMessage?: string) => {
      if (isPremiumRequiredError(err)) {
        requirePremium(err.message)
        return true
      }
      if (fallbackMessage) toast.error(fallbackMessage)
      return false
    },
    [requirePremium]
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      isPremium,
      showProBadge,
      refresh,
      requirePremium,
      handleApiError,
    }),
    [user, loading, isPremium, showProBadge, refresh, requirePremium, handleApiError]
  )

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  )
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) {
    throw new Error('useSubscription doit être utilisé dans SubscriptionProvider')
  }
  return ctx
}
