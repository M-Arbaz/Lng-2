import AdminGuard from '@/components/AdminGuard'
import AdminReviewsPage from '@/pages/AdminReviewsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Reviews', path: '/admin/reviews', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminReviewsPage /></AdminGuard>
}
