import BlogDetail from '@/pages/BlogDetail'
import { createMetadata, humanizeSlug } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const title = humanizeSlug(slug)
  return createMetadata({
    title,
    description: `${title} — read the latest article from Lamp & Glow.`,
    path: `/blog/${slug}`,
    type: 'article',
  })
}

export default function Page() {
  return <BlogDetail />
}
