'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { authApi } from '@/lib/api'
import { getToken, hydrateAuthSession, setOnboardingSeen, setUser } from '@/lib/auth'
import AppLogo from '@/components/AppLogo'
import LoadingBar from '@/components/LoadingBar'

/** Finalise la session après OAuth Google (cookies déjà posés). */
export default function AuthCompletePage() {
  const [message, setMessage] = useState('Connexion en cours…')

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          try {
            const { Browser } = await import('@capacitor/browser')
            await Browser.close()
          } catch {
            /* déjà fermé */
          }
        }

        await hydrateAuthSession({ preserveExisting: true })
        if (cancelled) return

        if (!getToken()) {
          setMessage('Session introuvable')
          window.location.replace('/login?error=google_session')
          return
        }

        const me = await authApi.me()
        if (cancelled) return

        setOnboardingSeen()
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

        try {
          const { syncSmsMonitorToken } = await import(
            '@/lib/capacitor/app-notifications'
          )
          await syncSmsMonitorToken(getToken())
        } catch {
          /* ignore hors Android */
        }

        void import('@/lib/api').then(async ({ walletApi }) => {
          const { startSetupGuide, setSetupStep } = await import('@/lib/setupGuide')
          const wallets = await walletApi.getAll().catch(() => [])
          if (wallets.length === 0) startSetupGuide()
          else setSetupStep('done')
        })

        window.location.replace('/')
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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-5 px-4">
      <AppLogo size="md" />
      <LoadingBar label={message} />
    </div>
  )
}
