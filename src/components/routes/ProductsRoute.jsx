'use client'

import ProductsPage from '@/pages/ProductsPage'
import { useAppState } from '@/context/AppStateContext'

export default function ProductsRoute() {
  const app = useAppState()
  return (
    <ProductsPage
      categories={app.dynamicCategories}
      filteredProducts={app.filteredProducts}
      productAverageRating={app.productAverageRating}
      selectedCategory={app.selectedCategory}
      setSelectedCategory={app.setSelectedCategory}
      handleAddToCart={app.handleAddToCart}
      setReviewForm={app.setReviewForm}
      handleToggleWishlist={app.handleToggleWishlist}
      isInWishlist={app.isInWishlist}
    />
  )
}
