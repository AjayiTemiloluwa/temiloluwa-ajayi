import type { MetadataRoute } from 'next'
import { profile } from '@/data/resume'
import { NAV_ROUTES } from '@/data/routes'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', ...NAV_ROUTES.map((r) => r.href)].map((path) => ({
    url: `${profile.siteUrl}${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))
}
