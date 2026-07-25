'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import AppLogo from '@/components/AppLogo'
import LoadingSpinner from '@/components/LoadingSpinner'

const NONCE_KEY = 'mp_oauth_client_nonce'

/**
 * Pont WebView après deep link mespoches://auth/google.
 * Échange code + nonce local (jamais exposé au schéma custom seul).
 */
export default function GoogleMobileReturnClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Finalisation Google…')

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          try {
            const { Browser } = await import('@capacitor/browser')
            await Browser.close()
          } catch {
            /* Custom Tab déjà fermé */
          }
        }

        const code = searchParams.get('code')?.trim() || ''
        const clientNonce =
          typeof window !== 'undefined'
            ? sessionStorage.getItem(NONCE_KEY) || ''
            : ''

        if (!code || !clientNonce) {
          setMessage('Session Google incomplète')
          router.replace('/login?error=google_nonce')
          return
        }

        const res = await fetch('/api/auth/google/mobile-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ code, clientNonce }),
        })

        sessionStorage.removeItem(NONCE_KEY)

        if (!res.ok) {
          if (!cancelled) {
            router.replace('/login?error=google_session')
          }
          return
        }

        if (!cancelled) {
          router.replace('/auth/complete')
        }
      } catch {
        sessionStorage.removeItem(NONCE_KEY)
        if (!cancelled) {
          router.replace('/login?error=google_session')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-4">
      <AppLogo size="md" />
      <LoadingSpinner />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
