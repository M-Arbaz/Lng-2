import AdminGuard from '@/components/AdminGuard'
import AdminReelsPage from '@/pages/AdminReelsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Reels', path: '/admin/reels', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminReelsPage /></AdminGuard>
}
