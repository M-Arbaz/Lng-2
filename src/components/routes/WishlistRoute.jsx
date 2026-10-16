'use client'

import WishlistPage from '@/views/WishlistPage'
import AuthGuard from '@/components/AuthGuard'
import { useAppState } from '@/context/AppStateContext'

export default function WishlistRoute() {
  const app = useAppState()
  return (
    <AuthGuard>
      <WishlistPage
        wishlist={app.wishlist}
        handleToggleWishlist={app.handleToggleWishlist}
        handleAddToCart={app.handleAddToCart}
        theme={app.theme}
      />
    </AuthGuard>
  )
}
