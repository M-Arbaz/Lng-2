import SignupRoute from '@/components/routes/SignupRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Create Account',
  description: 'Create your Lamp & Glow customer account.',
  path: '/signup',
  noIndex: true,
})

export default function Page() {
  return <SignupRoute />
}
