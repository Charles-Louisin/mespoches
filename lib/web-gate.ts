/**
 * Tri landing vs app.
 *
 * - Local / développement → l'app complète (tests)
 * - APK Capacitor → l'app complète (cookie posé au boot)
 * - Navigateur en production → landing de téléchargement
 */

export const NATIVE_APP_COOKIE = 'mp_native'

export const LANDING_PUBLIC_PREFIXES = [
  '/download',
  '/legal',
  '/auth',
] as const

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

export function isLocalHostname(hostname: string): boolean {
  const host = hostname.split(':')[0].toLowerCase()
  return LOCAL_HOSTS.has(host)
}

export function isLandingPublicPath(pathname: string): boolean {
  return LANDING_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/** User-Agent Capacitor (appendUserAgent dans capacitor.config.ts). */
export function isNativeUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return /MesPochesNative/i.test(userAgent) || /Capacitor/i.test(userAgent)
}

export function shouldShowPublicLanding(opts: {
  hostname: string
  isDev: boolean
  isNative: boolean
}): boolean {
  if (opts.isDev || opts.isNative) return false
  return !isLocalHostname(opts.hostname)
}
