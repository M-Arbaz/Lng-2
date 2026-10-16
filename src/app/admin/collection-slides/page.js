import AdminGuard from '@/components/AdminGuard'
import AdminCollectionSlidesPage from '@/views/AdminCollectionSlidesPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Collection Slides', path: '/admin/collection-slides', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminCollectionSlidesPage /></AdminGuard>
}
