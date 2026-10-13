import AdminGuard from '@/components/AdminGuard'
import AdminInstagramGridPage from '@/pages/AdminInstagramGridPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Instagram Grid', path: '/admin/instagram-grid', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminInstagramGridPage /></AdminGuard>
}
