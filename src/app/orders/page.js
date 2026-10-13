import OrdersRoute from '@/components/routes/OrdersRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'My Orders',
  description: 'View and track your Lamp & Glow orders.',
  path: '/orders',
  noIndex: true,
})

export default function Page() {
  return <OrdersRoute />
}
