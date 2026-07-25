/**
 * URL API côté client (fetch navigateur).
 * Production : NEXT_PUBLIC_API_URL pointe vers Render (config Vercel, inchangée).
 * Développement : /api via proxy Next.js (rewrites → localhost:5000).
 */
export function getClientApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'development') return '/api';
  return 'http://localhost:5000/api';
}

/**
 * URL API Express pour les routes Next.js server-side (register/resend proxy).
 * En dev avec NEXT_PUBLIC_API_URL=/api, le serveur appelle Express directement.
 */
export function getServerBackendApiUrl(): string {
  const devBackend = (process.env.DEV_BACKEND_URL || 'http://localhost:5000').replace(
    /\/$/,
    ''
  );

  if (process.env.NODE_ENV === 'development') {
    const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (!publicUrl || publicUrl.startsWith('/')) {
      return `${devBackend}/api`;
    }
  }

  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  return `${devBackend}/api`;
}

/**
 * URL API complète pour le plugin Android (SMS / notifications).
 * Le code natif Java ne supporte pas les chemins relatifs (/api).
 * En dev ngrok : https://xxx.ngrok-free.app/api via window.location.origin.
 * En prod : NEXT_PUBLIC_API_URL absolue (Render), inchangée.
 */
export function getNativeApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured?.startsWith('http')) {
    return configured.replace(/\/$/, '');
  }

  const path = configured?.startsWith('/') ? configured : '/api';

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`.replace(/\/$/, '');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (appUrl) {
    return `${appUrl}${path}`.replace(/\/$/, '');
  }

  return 'http://localhost:5000/api';
}
