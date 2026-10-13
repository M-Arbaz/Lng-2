import CollectionDetailRoute from '@/components/routes/CollectionDetailRoute'
import { createMetadata, humanizeSlug } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const title = humanizeSlug(slug)
  return createMetadata({
    title: `${title} Collection`,
    description: `Explore the ${title} collection from Lamp & Glow.`,
    path: `/collections/${slug}`,
  })
}

export default function Page() {
  return <CollectionDetailRoute />
}
