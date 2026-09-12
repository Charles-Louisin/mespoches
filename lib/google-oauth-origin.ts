import { Capacitor } from '@capacitor/core'

function stripSlash(value: string): string {
  return value.replace(/\/$/, '')
}

function localHttpOrigin(origin: string): string {
  return origin.replace(/^https:\/\/(localhost|127\.0\.0\.1)/i, 'http://$1')
}

/**
 * Origine OAuth Google.
 * Web : toujours l'onglet courant (localhost reste localhost).
 * App native : tunnel / URL publique pour Custom Tabs.
 */
export function getGoogleOAuthOrigin(): string {
  if (typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
    return localHttpOrigin(stripSlash(window.location.origin))
  }

  const fromEnv = stripSlash(
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_ORIGIN ||
      process.env.NEXT_PUBLIC_APP_URL ||
      ''
  )
  if (fromEnv.startsWith('http')) return fromEnv

  if (typeof window !== 'undefined' && window.location?.origin) {
    return localHttpOrigin(stripSlash(window.location.origin))
  }
  return ''
}
