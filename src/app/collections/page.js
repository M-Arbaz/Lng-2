import CollectionsRoute from '@/components/routes/CollectionsRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Collections',
  description: 'Explore Lamp & Glow lighting and decor collections.',
  path: '/collections',
  noIndex: false,
})

export default function Page() {
  return <CollectionsRoute />
}
