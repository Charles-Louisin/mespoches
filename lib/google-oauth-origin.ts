import { Capacitor } from '@capacitor/core'

function stripSlash(value: string): string {
  return value.replace(/\/$/, '')
}

function localHttpOrigin(origin: string): string {
  return origin.replace(/^https:\/\/(localhost|127\.0\.0\.1)/i, 'http://$1')
}

/**
 * Origine OAuth Google.
 * Web : onglet courant.
 * App native : host de la WebView (même origine que les cookies OAuth).
 */
export function getGoogleOAuthOrigin(): string {
  if (typeof window !== 'undefined') {
    const current = localHttpOrigin(stripSlash(window.location.origin))
    if (Capacitor.isNativePlatform()) {
      // Toujours l’URL chargée dans la WebView (évite vercel vs .store)
      if (current.startsWith('https://')) return current
    } else {
      return current
    }
  }

  const fromEnv = stripSlash(
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_ORIGIN ||
      process.env.NEXT_PUBLIC_APP_URL ||
      ''
  )
  if (fromEnv.startsWith('http')) return fromEnv
  return ''
}
