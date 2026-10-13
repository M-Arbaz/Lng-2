import SaleRoute from '@/components/routes/SaleRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Sale',
  description: 'Shop discounted Lamp & Glow lighting and decor.',
  path: '/sale',
  noIndex: false,
})

export default function Page() {
  return <SaleRoute />
}
