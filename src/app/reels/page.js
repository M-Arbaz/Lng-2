import ReelsPage from '@/pages/ReelsPage'
import { createMetadata } from '@/lib/seo'

export const metadata = createMetadata({
  title: 'Reels', description: 'Watch Lamp & Glow product and styling reels.', path: '/reels', noIndex: false
})

export default function Page() {
  return <ReelsPage />
}
