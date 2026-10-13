import AdminGuard from '@/components/AdminGuard'
import AdminOrdersPage from '@/pages/AdminOrdersPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Orders', path: '/admin/orders', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminOrdersPage /></AdminGuard>
}
