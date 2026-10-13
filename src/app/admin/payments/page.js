import AdminGuard from '@/components/AdminGuard'
import AdminPaymentHistoryPage from '@/pages/AdminPaymentHistoryPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Payments', path: '/admin/payments', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminPaymentHistoryPage /></AdminGuard>
}
