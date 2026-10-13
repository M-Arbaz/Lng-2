import AdminGuard from '@/components/AdminGuard'
import AdminBlogsPage from '@/pages/AdminBlogsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Blogs', path: '/admin/blogs', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminBlogsPage /></AdminGuard>
}
