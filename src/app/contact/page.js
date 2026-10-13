import ContactRoute from '@/components/routes/ContactRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Contact',
  description: 'Contact Lamp & Glow for product, order and support questions.',
  path: '/contact',
  noIndex: false,
})

export default function Page() {
  return <ContactRoute />
}
