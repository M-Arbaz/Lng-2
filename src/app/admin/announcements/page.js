import AdminGuard from '@/components/AdminGuard'
import AdminAnnouncementsPage from '@/views/AdminAnnouncementsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Announcements', path: '/admin/announcements', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminAnnouncementsPage /></AdminGuard>
}
