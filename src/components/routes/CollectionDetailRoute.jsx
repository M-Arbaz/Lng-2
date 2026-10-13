'use client'

import CollectionDetailPage from '@/pages/CollectionDetailPage'
import { useAppState } from '@/context/AppStateContext'

export default function CollectionDetailRoute() {
  const app = useAppState()
  return <CollectionDetailPage handleToggleWishlist={app.handleToggleWishlist} isInWishlist={app.isInWishlist} />
}
