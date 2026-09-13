/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Désactivé en dev, activé en prod
  fallbacks: {
    document: null, // Désactiver la page de fallback offline
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 an
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 semaine
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 semaine
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 heures
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 heures
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 heures
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 heures
        }
      }
    },
    // Pas de cache des réponses API authentifiées (données financières)
    {
      urlPattern: /^https?:\/\/.+\/api\/.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'api-network-only',
      }
    },
    {
      urlPattern: /^https?:\/\/.+\/.*/i, // Cache toutes les pages (localhost ou production)
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 // 24 heures
        }
      }
    }
  ]
})

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
    'https://utfs.io',
    'https://*.ufs.sh',
    'https://*.uploadthing.com',
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
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io', pathname: '/**' },
      { protocol: 'https', hostname: 'ufs.sh', pathname: '/**' },
    ],
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
            value:
              'camera=(self), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()',
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
              "img-src 'self' data: blob: https://utfs.io https://*.ufs.sh https://*.uploadthing.com",
              `connect-src ${cspConnectSrc()}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              ...(process.env.NODE_ENV === 'production'
                ? ['upgrade-insecure-requests']
                : []),
            ].join('; '),
          },
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ]
  },
  async rewrites() {
    const dest =
      process.env.NODE_ENV === 'development'
        ? backendUrl
        : productionBackendOrigin()

    // Ne pas proxyer /api/auth/login|token|google… (cookies Next.js).
    const proxied = [
      'wallets',
      'transactions',
      'categories',
      'analytics',
      'admin',
      'budgets',
      'savings-goals',
      'recurring',
      'export',
      'subscription',
      'webhooks',
      'planned-expenses',
      'pending-transactions',
      'health',
      'cinetpay-setup',
    ]

    const afterFiles = proxied.flatMap((prefix) => [
      {
        source: `/api/${prefix}`,
        destination: `${dest}/api/${prefix}`,
      },
      {
        source: `/api/${prefix}/:path*`,
        destination: `${dest}/api/${prefix}/:path*`,
      },
    ])

    afterFiles.push(
      {
        source: '/api/auth/me',
        destination: `${dest}/api/auth/me`,
      },
      {
        source: '/api/auth/check-availability',
        destination: `${dest}/api/auth/check-availability`,
      },
      {
        source: '/api/auth/google/exchange',
        destination: `${dest}/api/auth/google/exchange`,
      },
      {
        source: '/api/auth/google/handoff',
        destination: `${dest}/api/auth/google/handoff`,
      },
      {
        source: '/api/auth/google/client',
        destination: `${dest}/api/auth/google/client`,
      }
    )

    return { afterFiles }
  },
}

module.exports = withPWA(nextConfig)
