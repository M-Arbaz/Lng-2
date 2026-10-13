import AdminGuard from '@/components/AdminGuard'
import AdminBankDetailsPage from '@/pages/AdminBankDetailsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Bank Details', path: '/admin/bank-details', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminBankDetailsPage /></AdminGuard>
}
