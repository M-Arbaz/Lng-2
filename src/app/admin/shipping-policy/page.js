import AdminGuard from '@/components/AdminGuard'
import AdminShippingPolicyPage from '@/pages/AdminShippingPolicyPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Shipping Policy', path: '/admin/shipping-policy', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminShippingPolicyPage /></AdminGuard>
}
