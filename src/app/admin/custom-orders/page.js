import AdminGuard from '@/components/AdminGuard'
import AdminCustomOrdersPage from '@/pages/AdminCustomOrdersPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Custom Orders', path: '/admin/custom-orders', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminCustomOrdersPage /></AdminGuard>
}
