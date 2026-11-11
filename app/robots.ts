import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/** Pages publiques indexables ; espaces connectés et API exclus. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/compte', '/login', '/auth/', '/verify-email', '/forgot-password', '/paiement/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
