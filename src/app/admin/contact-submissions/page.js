import AdminGuard from '@/components/AdminGuard'
import AdminContactSubmissionsPage from '@/views/AdminContactSubmissionsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Contact Submissions', path: '/admin/contact-submissions', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminContactSubmissionsPage /></AdminGuard>
}
