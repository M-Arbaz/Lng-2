import AdminGuard from '@/components/AdminGuard'
import AdminFooterPage from '@/pages/AdminFooterPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Footer', path: '/admin/footer', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminFooterPage /></AdminGuard>
}
