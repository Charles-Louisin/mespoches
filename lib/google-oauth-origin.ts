function stripSlash(value: string): string {
  return value.replace(/\/$/, '')
}

function localHttpOrigin(origin: string): string {
  return origin.replace(/^https:\/\/(localhost|127\.0\.0\.1)/i, 'http://$1')
}

/** Origine OAuth Google : onglet web courant. */
export function getGoogleOAuthOrigin(): string {
  if (typeof window !== 'undefined') {
    return localHttpOrigin(stripSlash(window.location.origin))
  }

  const fromEnv = stripSlash(
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_ORIGIN ||
      process.env.NEXT_PUBLIC_APP_URL ||
      ''
  )
  if (fromEnv.startsWith('http')) return fromEnv
  return ''
}
