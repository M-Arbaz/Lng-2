import CustomOrderPage from '@/views/CustomOrderPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Custom Order', description: 'Request a custom Lamp & Glow lighting or decor order.', path: '/custom-order', noIndex: false
})

export default function Page() {
  return <CustomOrderPage />
}
