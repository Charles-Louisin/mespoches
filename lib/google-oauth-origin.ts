/**
 * Origine publique utilisée pour OAuth Google (redirect_uri).
 * Doit être déclarée dans Google Cloud Console.
 */
export function getGoogleOAuthOrigin(): string {
  const fromEnv = (
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_ORIGIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    ''
  ).replace(/\/$/, '');
  if (fromEnv.startsWith('http')) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
