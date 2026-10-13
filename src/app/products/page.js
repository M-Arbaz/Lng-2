import ProductsRoute from '@/components/routes/ProductsRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Products',
  description: 'Browse handcrafted lamps, lighting and decor from Lamp & Glow.',
  path: '/products',
  noIndex: false,
})

export default function Page() {
  return <ProductsRoute />
}
