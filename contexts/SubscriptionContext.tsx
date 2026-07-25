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
import { getToken, getUser, hydrateAuthSession, setUser } from '@/lib/auth'
import {
  isPremiumUser,
  isPremiumRequiredError,
  getUpgradePath,
} from '@/lib/subscription'

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
  const [user, setUserState] = useState<MeUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    await hydrateAuthSession()
    if (!getToken()) {
      setUserState(null)
      setLoading(false)
      return null
    }
    try {
      const me = await authApi.me()
      setUserState(me)
      const stored = getUser()
      setUser({
        ...(stored ?? {
          id: me.id,
          email: me.email,
        }),
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role,
        plan: me.plan,
        premiumUntil: me.premiumUntil,
        isPremium: me.isPremium,
        currency: me.currency,
        hidePlannedExpensesHelp: me.hidePlannedExpensesHelp,
        lastLoginAt: me.lastLoginAt ?? undefined,
        emailVerified: true,
      })
      return me
    } catch {
      // Ne pas faire confiance au rôle / premium du localStorage
      setUserState(null)
      return null
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
