'use client'

import { useNavigate } from '@/lib/navigation'
import ProductsSection from '../sections/ProductsSection.jsx'

export default function ProductsPage({
  categories,
  filteredProducts,
  productAverageRating,
  selectedCategory,
  setSelectedCategory,
  handleAddToCart,
  setReviewForm,
  handleToggleWishlist,
  isInWishlist,
}) {
  const navigate = useNavigate()

  const handleNavigate = (section) => {
    if (section === 'reviews') {
      navigate('/reviews')
    } else if (section === 'home') {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <ProductsSection
        categories={categories}
        filteredProducts={filteredProducts}
        productAverageRating={productAverageRating}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        handleAddToCart={handleAddToCart}
        handleNavigate={handleNavigate}
        setReviewForm={setReviewForm}
        handleToggleWishlist={handleToggleWishlist}
        isInWishlist={isInWishlist}
      />
    </div>
  )
}
