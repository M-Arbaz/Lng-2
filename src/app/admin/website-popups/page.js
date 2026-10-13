import AdminGuard from '@/components/AdminGuard'
import AdminWebsitePopupsPage from '@/pages/AdminWebsitePopupsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Website Popups', path: '/admin/website-popups', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminWebsitePopupsPage /></AdminGuard>
}
