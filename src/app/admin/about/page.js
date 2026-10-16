import AdminGuard from '@/components/AdminGuard'
import AdminAboutPage from '@/views/AdminAboutPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin About', path: '/admin/about', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminAboutPage /></AdminGuard>
}
