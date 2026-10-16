'use client'

import CollectionDetailPage from '@/views/CollectionDetailPage'
import { useAppState } from '@/context/AppStateContext'

export default function CollectionDetailRoute() {
  const app = useAppState()

  return (
    <CollectionDetailPage
      theme={app.theme}
      onAddToCart={app.handleAddToCart}
      handleToggleWishlist={app.handleToggleWishlist}
      isInWishlist={app.isInWishlist}
    />
  )
}