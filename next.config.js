/** @type {import('next').NextConfig} */

const backendUrl = (process.env.DEV_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')

function productionBackendOrigin() {
  const raw = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mespochesbackend-production-9bfe.up.railway.app'
  ).replace(/\/$/, '')
  if (!raw.startsWith('http')) {
    return 'https://mespochesbackend-production-9bfe.up.railway.app'
  }
  return raw.replace(/\/api$/i, '')
}

function cspConnectSrc() {
  const origins = new Set([
    "'self'",
    'http://localhost:*',
    'http://127.0.0.1:*',
    'https://accounts.google.com',
    'https://oauth2.googleapis.com',
  ])

  const addUrl = (raw) => {
    if (!raw) return
    try {
      const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
      origins.add(`${u.protocol}//${u.host}`)
    } catch {
      /* ignore */
    }
  }

  addUrl(process.env.NEXT_PUBLIC_API_URL)
  addUrl(process.env.NEXT_PUBLIC_APP_URL)
  addUrl(process.env.DEV_BACKEND_URL)
  origins.add('https://mespochesbackend-production-9bfe.up.railway.app')
  origins.add('https://mespochesbackend-production.up.railway.app')

  return Array.from(origins).join(' ')
}

const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              process.env.NODE_ENV === 'production'
                ? "script-src 'self' 'unsafe-inline'"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob:",
              `connect-src ${cspConnectSrc()}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
            ].join('; '),
          },
        ],
      },
    ]
  },
  async rewrites() {
    const dest =
      process.env.NODE_ENV === 'development' ? backendUrl : productionBackendOrigin()

    // Uniquement les routes publiques (sans session) : tout ce qui est
    // authentifié passe par /api/proxy, qui injecte le Bearer côté serveur.
    const afterFiles = [
      { source: '/api/auth/check-availability', destination: `${dest}/api/auth/check-availability` },
      { source: '/api/auth/google/exchange', destination: `${dest}/api/auth/google/exchange` },
      { source: '/api/auth/google/handoff', destination: `${dest}/api/auth/google/handoff` },
      { source: '/api/auth/google/client', destination: `${dest}/api/auth/google/client` },
    ]

    return { afterFiles }
  },
}

module.exports = nextConfig
