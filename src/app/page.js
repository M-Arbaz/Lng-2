import HomeRoute from '@/components/routes/HomeRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Home',
  description: 'Handcrafted lamps, warm ambient lighting and decor for homes across Pakistan.',
  path: '/',
  noIndex: false,
})

export default function Page() {
  return <HomeRoute />
}
