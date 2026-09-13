'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { NATIVE_APP_COOKIE } from '@/lib/web-gate'

/** Pose un cookie pour que le middleware reconnaisse l'APK (WebView Capacitor). */
export default function NativeAppCookie() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${NATIVE_APP_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
  }, [])

  return null
}
