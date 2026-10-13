import './globals.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import 'react-quill-new/dist/quill.snow.css'
import Providers from '@/components/Providers'
import SiteChrome from '@/components/SiteChrome'
import { siteUrl } from '@/lib/seo'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lamp & Glow | Handcrafted Lighting & Decor',
    template: '%s | Lamp & Glow',
  },
  description: 'Shop handcrafted lamps, ambient lighting and decor from Lamp & Glow in Pakistan.',
  applicationName: 'Lamp & Glow',
  keywords: ['lamps Pakistan', 'handcrafted lamps', 'wooden lamps', 'ambient lighting', 'home decor Pakistan', 'Lamp and Glow'],
  authors: [{ name: 'Lamp & Glow' }],
  creator: 'Lamp & Glow',
  publisher: 'Lamp & Glow',
  formatDetection: { email: false, address: false, telephone: false },
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    type: 'website',
    siteName: 'Lamp & Glow',
    title: 'Lamp & Glow | Handcrafted Lighting & Decor',
    description: 'Shop handcrafted lamps, ambient lighting and decor from Lamp & Glow in Pakistan.',
    url: '/',
    images: [{ url: '/logo.png', alt: 'Lamp & Glow' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamp & Glow | Handcrafted Lighting & Decor',
    description: 'Shop handcrafted lamps, ambient lighting and decor from Lamp & Glow in Pakistan.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lamp & Glow',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    email: 'lampandglowofficial01@gmail.com',
  }

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
