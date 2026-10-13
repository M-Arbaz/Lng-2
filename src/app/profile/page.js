import ProfileRoute from '@/components/routes/ProfileRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'My Account',
  description: 'Manage your Lamp & Glow account, orders and wishlist.',
  path: '/profile',
  noIndex: true,
})

export default function Page() {
  return <ProfileRoute />
}
