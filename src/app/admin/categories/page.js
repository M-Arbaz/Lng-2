import AdminGuard from '@/components/AdminGuard'
import AdminCategoriesPage from '@/views/AdminCategoriesPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Categories', path: '/admin/categories', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminCategoriesPage /></AdminGuard>
}
