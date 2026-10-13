import ShippingPolicyPage from '@/pages/ShippingPolicyPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Shipping Policy', description: 'Read Lamp & Glow shipping terms, delivery information and policies.', path: '/shipping-policy', noIndex: false
})

export default function Page() {
  return <ShippingPolicyPage />
}
