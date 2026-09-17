'use client'

import { useEffect, useState } from 'react'
import { authApi } from '@/lib/api'
import { hasSession, hydrateAuthSession, redirectAfterAuth, setUser } from '@/lib/auth'
import AppLogo from '@/components/AppLogo'
import LoadingBar from '@/components/LoadingBar'

/** Finalise la session après OAuth Google (cookies déjà posés). */
export default function AuthCompletePage() {
  const [message, setMessage] = useState('Connexion en cours…')

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        await hydrateAuthSession({ preserveExisting: true })
        if (cancelled) return

        if (!hasSession()) {
          setMessage('Session introuvable')
          window.location.replace('/login?error=google_session')
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

        redirectAfterAuth()
      } catch {
        if (!cancelled) {
          window.location.replace('/login?error=google_session')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface px-4">
      <AppLogo size="md" />
      <LoadingBar label={message} />
    </div>
  )
}
