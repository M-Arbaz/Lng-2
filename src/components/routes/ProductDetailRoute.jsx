'use client'

import ProductDetail from '@/views/ProductDetail'
import { useAppState } from '@/context/AppStateContext'

export default function ProductDetailRoute() {
  const app = useAppState()
  return (
    <ProductDetail
      products={app.products}
      productsLoading={app.productsLoading}
      onAddToCart={app.handleAddToCart}
      reviews={app.reviews}
      handleToggleWishlist={app.handleToggleWishlist}
      isInWishlist={app.isInWishlist}
      theme={app.theme}
      user={app.user}
      isLoggedIn={app.isLoggedIn()}
      handleSubmitReview={app.handleSubmitReview}
    />
  )
}
