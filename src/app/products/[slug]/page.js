import ProductDetailRoute from '@/components/routes/ProductDetailRoute'
import { createMetadata, humanizeSlug } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const name = humanizeSlug(slug)
  return createMetadata({
    title: name,
    description: `Shop ${name} from Lamp & Glow. View details, options, reviews and availability.`,
    path: `/products/${slug}`,
    type: 'website',
  })
}

export default function Page() {
  return <ProductDetailRoute />
}
