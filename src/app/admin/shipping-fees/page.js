import AdminGuard from '@/components/AdminGuard'
import AdminShippingPage from '@/views/AdminShippingPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Shipping Fees', path: '/admin/shipping-fees', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminShippingPage /></AdminGuard>
}
