'use client'

import SaleProductsPage from '@/views/SaleProductsPage'
import { useAppState } from '@/context/AppStateContext'

export default function SaleRoute() {
  const app = useAppState()
  return (
    <SaleProductsPage
      products={app.products}
      handleAddToCart={app.handleAddToCart}
      handleToggleWishlist={app.handleToggleWishlist}
      isInWishlist={app.isInWishlist}
    />
  )
}
