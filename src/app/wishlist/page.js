import WishlistRoute from '@/components/routes/WishlistRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Wishlist',
  description: 'Your saved Lamp & Glow products.',
  path: '/wishlist',
  noIndex: true,
})

export default function Page() {
  return <WishlistRoute />
}
