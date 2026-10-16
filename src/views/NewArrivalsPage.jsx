'use client'

import { useNavigate } from '@/lib/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'

export default function NewArrivalsPage({ products, handleAddToCart, handleToggleWishlist, isInWishlist }) {
  const navigate = useNavigate()
  const newArrivals = (products || []).filter((p) => p.isNewArrival === true)

  return (
    <section className="w-full min-h-screen bg-[#fafafa]">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="mt-8 flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-[#FFD400]" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">New Arrivals</h1>
            <p className="mt-1 text-sm text-stone-400">
              {newArrivals.length} product{newArrivals.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {newArrivals.length === 0 ? (
          <div className="mt-12 text-center py-16 bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500 text-sm">No new arrivals available right now.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={isInWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
