import CheckoutRoute from '@/components/routes/CheckoutRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Checkout',
  description: 'Complete your Lamp & Glow order securely.',
  path: '/checkout',
  noIndex: true,
})

export default function Page() {
  return <CheckoutRoute />
}
