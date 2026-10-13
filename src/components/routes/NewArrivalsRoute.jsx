'use client'

import NewArrivalsPage from '@/pages/NewArrivalsPage'
import { useAppState } from '@/context/AppStateContext'

export default function NewArrivalsRoute() {
  const app = useAppState()
  return (
    <NewArrivalsPage
      products={app.products}
      handleAddToCart={app.handleAddToCart}
      handleToggleWishlist={app.handleToggleWishlist}
      isInWishlist={app.isInWishlist}
    />
  )
}
