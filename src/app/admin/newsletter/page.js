import AdminGuard from '@/components/AdminGuard'
import AdminNewsletterPage from '@/views/AdminNewsletterPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Newsletter', path: '/admin/newsletter', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminNewsletterPage /></AdminGuard>
}
