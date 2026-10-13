const SITE_NAME = 'Lamp & Glow'
const DEFAULT_DESCRIPTION = 'Shop handcrafted lamps, ambient lighting and decor from Lamp & Glow in Pakistan.'

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lampandglow.pk'

export function humanizeSlug(slug = '') {
  return decodeURIComponent(String(slug))
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function createMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  noIndex = false,
  image = '/logo.png',
  type = 'website',
} = {}) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Handcrafted Lighting & Decor`
  const canonical = new URL(path, siteUrl).toString()
  const imageUrl = new URL(image, siteUrl).toString()

  return {
    title: { absolute: pageTitle },
    description,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      url: canonical,
      images: [{ url: imageUrl, alt: title || SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [imageUrl],
    },
  }
}
