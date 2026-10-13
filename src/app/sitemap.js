import { siteUrl } from '@/lib/seo'

export default function sitemap() {
  const paths = [
    '/', '/products', '/collections', '/blogs', '/reels', '/about', '/contact',
    '/shipping-policy', '/customorder', '/new-arrivals', '/sale', '/reviews',
  ]
  return paths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: path === '/' || path === '/products' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
