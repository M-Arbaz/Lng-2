import NewArrivalsRoute from '@/components/routes/NewArrivalsRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'New Arrivals',
  description: 'Discover the newest Lamp & Glow lighting and decor arrivals.',
  path: '/new-arrivals',
  noIndex: false,
})

export default function Page() {
  return <NewArrivalsRoute />
}
