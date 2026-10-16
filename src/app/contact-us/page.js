import ContactRoute from '@/components/routes/ContactRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Contact Us',

  description:
    'Contact Lamp & Glow for product, order and support questions.',

  path: '/contact-us',

  noIndex: false,
})

export default function Page() {
  return <ContactRoute />
}