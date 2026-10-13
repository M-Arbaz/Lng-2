import CartRoute from '@/components/routes/CartRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Shopping Cart',
  description: 'Review items in your Lamp & Glow shopping cart.',
  path: '/cart',
  noIndex: true,
})

export default function Page() {
  return <CartRoute />
}
