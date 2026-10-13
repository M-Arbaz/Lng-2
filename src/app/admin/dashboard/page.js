import AdminGuard from '@/components/AdminGuard'
import AdminDashboard from '@/pages/AdminDashboard'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Dashboard', path: '/admin/dashboard', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminDashboard /></AdminGuard>
}
