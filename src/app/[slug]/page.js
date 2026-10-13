import PublicPage from '@/pages/PublicPage'
import { createMetadata, humanizeSlug } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { slug } = await params
  return createMetadata({
    title: humanizeSlug(slug),
    description: `${humanizeSlug(slug)} — Lamp & Glow.`,
    path: `/${slug}`,
  })
}

export default function Page() {
  return <PublicPage />
}
