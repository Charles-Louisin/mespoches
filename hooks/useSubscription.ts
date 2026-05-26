'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi, MeUser } from '@/lib/api'
import { getUser, setUser } from '@/lib/auth'
import {
  isPremiumUser,
  isPremiumRequiredError,
  getUpgradePath,
} from '@/lib/subscription'

export function useSubscription() {
  const router = useRouter()
  const [user, setUserState] = useState<MeUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
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
      const stored = getUser()
      if (stored) {
        const fallback: MeUser = {
          id: stored.id,
          email: stored.email,
          name: stored.name,
          role: stored.role,
          plan: stored.plan,
          premiumUntil: stored.premiumUntil,
          isPremium: stored.isPremium,
          created_at: '',
        }
        setUserState(fallback)
        return fallback
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isPremium = isPremiumUser(user)

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

  return {
    user,
    loading,
    isPremium,
    refresh,
    requirePremium,
    handleApiError,
  }
}
