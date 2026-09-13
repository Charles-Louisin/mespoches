'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import {
  NATIVE_APP_COOKIE,
  isLandingPublicPath,
  shouldShowPublicLanding,
} from '@/lib/web-gate'

function setNativeCookie() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${NATIVE_APP_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
}

/**
 * - Navigateur prod → /download
 * - APK → jamais la landing ; si on y est, retour vers l'app
 */
export default function WebLandingGate() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (Capacitor.isNativePlatform()) {
      setNativeCookie()
      if (pathname === '/download' || pathname.startsWith('/download/')) {
        router.replace('/login')
      }
      return
    }

    if (isLandingPublicPath(pathname)) return

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
