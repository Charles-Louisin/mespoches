import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const page = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' | 'yearly') => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  })
  return [
    page('/', 1, 'weekly'),
    page('/legal', 0.4, 'yearly'),
    page('/legal/privacy', 0.6, 'monthly'),
    page('/legal/terms', 0.5, 'monthly'),
    page('/legal/mentions', 0.3, 'yearly'),
    page('/suppression-compte', 0.5, 'yearly'),
  ]
}
