import AdminGuard from '@/components/AdminGuard'
import AdminCouponsPage from '@/pages/AdminCouponsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Coupons', path: '/admin/coupons', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminCouponsPage /></AdminGuard>
}
