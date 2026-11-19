import type { MetadataRoute } from 'next'
import { profile } from '@/data/resume'
import { NAV_ROUTES } from '@/data/routes'
import { studies } from '@/data/research'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', ...NAV_ROUTES.map((r) => r.href), ...studies.map((s) => `/research/${s.id}`)].map((path) => ({
    url: `${profile.siteUrl}${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))
}
