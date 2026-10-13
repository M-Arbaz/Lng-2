import ReviewsRoute from '@/components/routes/ReviewsRoute'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Customer Reviews',
  description: 'Read customer reviews and ratings for Lamp & Glow products.',
  path: '/reviews',
  noIndex: false,
})

export default function Page() {
  return <ReviewsRoute />
}
