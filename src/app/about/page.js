import AboutRoute from '@/components/routes/AboutRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'About Us',
  description: 'Learn about Lamp & Glow, our craft and our approach to lighting and decor.',
  path: '/about',
  noIndex: false,
})

export default function Page() {
  return <AboutRoute />
}
