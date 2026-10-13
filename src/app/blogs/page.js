import BlogsList from '@/pages/BlogsList'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Blog', description: 'Lighting ideas, styling tips and Lamp & Glow updates.', path: '/blogs', noIndex: false
})

export default function Page() {
  return <BlogsList />
}
