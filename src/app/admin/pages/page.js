import AdminGuard from '@/components/AdminGuard'
import AdminPagesPage from '@/views/AdminPagesPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Pages', path: '/admin/pages', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminPagesPage /></AdminGuard>
}
