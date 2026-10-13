import AdminGuard from '@/components/AdminGuard'
import AdminCustomersPage from '@/pages/AdminCustomersPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Customers', path: '/admin/customers', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminCustomersPage /></AdminGuard>
}
