import LoginRoute from '@/components/routes/LoginRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Sign In',
  description: 'Sign in to your Lamp & Glow account.',
  path: '/login',
  noIndex: true,
})

export default function Page() {
  return <LoginRoute />
}
