'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { getToken, hydrateAuthSession, setUser } from '@/lib/auth'
import AppLogo from '@/components/AppLogo'
import LoadingSpinner from '@/components/LoadingSpinner'

/** Finalise la session après OAuth Google (cookies déjà posés). */
export default function AuthCompletePage() {
  const router = useRouter()
  const [message, setMessage] = useState('Connexion en cours…')

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        await hydrateAuthSession()
        if (cancelled) return

        if (!getToken()) {
          setMessage('Session introuvable')
          router.replace('/login?error=google_session')
          return
        }

        const me = await authApi.me()
        if (cancelled) return

        setUser({
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

        router.replace('/')
      } catch {
        if (!cancelled) {
          router.replace('/login?error=google_session')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-4">
      <AppLogo size="md" />
      <LoadingSpinner />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
