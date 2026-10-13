import ReelsPage from '@/pages/ReelsPage'
import { createMetadata } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { reelId } = await params
  return createMetadata({ title: 'Reel', description: 'Watch a Lamp & Glow reel.', path: `/reels/${reelId}` })
}

export default function Page() {
  return <ReelsPage />
}
