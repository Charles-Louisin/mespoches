import { Capacitor } from '@capacitor/core'

function stripSlash(value: string): string {
  return value.replace(/\/$/, '')
}

function canonicalizePublicOrigin(origin: string): string {
  try {
    const parsed = new URL(origin)
    const host = parsed.hostname.toLowerCase()
    if (host === 'mespoches.store' || host === 'www.mespoches.store') {
      return 'https://www.mespoches.store'
    }
  } catch {
    /* ignore */
  }
  return stripSlash(origin)
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
    return canonicalizePublicOrigin(localHttpOrigin(stripSlash(window.location.origin)))
  }

  const fromEnv = stripSlash(
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_ORIGIN ||
      process.env.NEXT_PUBLIC_APP_URL ||
      ''
  )
  if (fromEnv.startsWith('http')) return canonicalizePublicOrigin(fromEnv)

  if (typeof window !== 'undefined' && window.location?.origin) {
    return canonicalizePublicOrigin(localHttpOrigin(stripSlash(window.location.origin)))
  }
  return ''
}
