import AdminGuard from '@/components/AdminGuard'
import AdminProductsPage from '@/pages/AdminProductsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Products', path: '/admin/products', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminProductsPage /></AdminGuard>
}
