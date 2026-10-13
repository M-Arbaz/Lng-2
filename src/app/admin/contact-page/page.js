import AdminGuard from '@/components/AdminGuard'
import AdminContactPage from '@/pages/AdminContactPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Contact Page', path: '/admin/contact-page', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminContactPage /></AdminGuard>
}
