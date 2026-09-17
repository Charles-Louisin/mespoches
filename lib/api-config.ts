/**
 * URL API côté client (fetch navigateur).
 * En production, même origine que le site → rewrite Vercel vers Railway.
 * En développement : /api via proxy Next.js (rewrites → localhost:5000).
 */
function isProdFrontendHost(host: string): boolean {
  return (
    host === 'mespoches.store' ||
    host.endsWith('.mespoches.store') ||
    host === 'mespoches.vercel.app' ||
    host.endsWith('.vercel.app')
  )
}

export function getClientApiUrl(): string {
  if (typeof window !== 'undefined' && isProdFrontendHost(window.location.hostname)) {
    return '/api'
  }

  const configured = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  return '/api'
}

/**
 * URL API Express pour les routes Next.js server-side (login / Google / register).
 */
const PRODUCTION_BACKEND_API =
  'https://mespochesbackend-production-9bfe.up.railway.app/api'

export function getServerBackendApiUrl(): string {
  const devBackend = (process.env.DEV_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')

  if (process.env.NODE_ENV === 'development') {
    const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
    if (!publicUrl || publicUrl.startsWith('/')) {
      return `${devBackend}/api`
    }
    return publicUrl.replace(/\/$/, '')
  }

  const configured = (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '').trim()
  if (configured.startsWith('http')) {
    return configured.replace(/\/$/, '')
  }

  return PRODUCTION_BACKEND_API
}
