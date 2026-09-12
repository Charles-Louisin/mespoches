'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { isLandingPublicPath, shouldShowPublicLanding } from '@/lib/web-gate'

/**
 * Filet de sécurité : si le middleware n'a pas encore le cookie APK,
 * on évite d'afficher la landing dans l'app native.
 */
export default function WebLandingGate() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isLandingPublicPath(pathname)) return

    if (Capacitor.isNativePlatform()) return

    const showLanding = shouldShowPublicLanding({
      hostname: window.location.hostname,
      isDev: process.env.NODE_ENV === 'development',
      isNative: false,
    })

    if (showLanding) {
      router.replace('/download')
    }
  }, [pathname, router])

  return null
}
