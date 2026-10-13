import AdminGuard from '@/components/AdminGuard'
import AdminHeroBannersPage from '@/pages/AdminHeroBannersPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Hero Banners', path: '/admin/hero-banners', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminHeroBannersPage /></AdminGuard>
}
