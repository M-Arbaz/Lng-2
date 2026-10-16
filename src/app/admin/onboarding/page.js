import AdminGuard from '@/components/AdminGuard'
import AdminOnboardingPage from '@/views/AdminOnboardingPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({ title: 'Admin Onboarding', path: '/admin/onboarding', noIndex: true })

export default function Page() {
  return <AdminGuard><AdminOnboardingPage /></AdminGuard>
}
