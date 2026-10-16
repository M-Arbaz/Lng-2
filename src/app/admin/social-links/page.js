import AdminGuard from '@/components/AdminGuard'
import AdminSocialLinksPage from '@/views/AdminSocialLinksPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Social Links', path: '/admin/social-links', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminSocialLinksPage /></AdminGuard>
}
