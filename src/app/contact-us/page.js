import ContactUsPage from '@/views/ContactUsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Contact Us', description: 'Get in touch with Lamp & Glow for support and inquiries.', path: '/contact-us', noIndex: false
})

export default function Page() {
  return <ContactUsPage />
}
