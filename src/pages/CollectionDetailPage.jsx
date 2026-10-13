'use client'

import { useParams, Link, useNavigate } from '@/lib/navigation'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import useCategories from '../hooks/useCategories.js'
import useProducts from '../hooks/useProducts.js'
import { findCategoryBySlug, slugify } from '../utils/slugify.js'
import { getDiscountInfo } from '../utils/discountHelpers.js'

const formatPricePKR = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return ''
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function CollectionDetailPage({ handleToggleWishlist, isInWishlist }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { categories, loading: catsLoading } = useCategories()
  const { products, loading: prodsLoading } = useProducts()

  const category = findCategoryBySlug(categories, slug)
  const filteredProducts = category
    ? products.filter((p) => p.category === category.id)
    : []

  const loading = catsLoading || prodsLoading

  return (
    <section className="w-full min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <button
          type="button"
          onClick={() => navigate('/collections')}
          className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Collections
        </button>

        {loading ? (
          <div className="mt-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !category ? (
          <div className="mt-12 text-center">
            <h2 className="text-xl font-bold text-stone-800">Collection not found</h2>
            <p className="mt-2 text-sm text-stone-500">
              The collection you are looking for does not exist.
            </p>
            <button
              onClick={() => navigate('/collections')}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-stone-900 text-sm font-bold rounded-lg hover:bg-[#FFD400] transition"
            >
              Browse Collections
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">{category.title}</h1>
              {category.description && (
                <div
                  className="page-content mt-2 text-sm text-stone-500 max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: category.description }}
                />
              )}
              <p className="mt-1 text-sm text-stone-400">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="mt-12 text-center py-16 bg-white rounded-2xl border border-stone-200">
                <p className="text-stone-500 text-sm">No products found in this collection.</p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredProducts.map((product) => {
                  const { hasDiscount, originalPrice, discountedPrice, discountPercent } =
                    getDiscountInfo(product)

                  return (
                    <article
                      key={product.id}
                      className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-[#FFD400]/30/70"
                    >
                      <Link to={`/products/${slugify(product.name)}`} className="group block">
                        <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                          {product.isNewArrival && (
                            <span className="absolute left-0 top-0 z-10 bg-[#F5F1EA]0 px-2 py-1 text-xs font-semibold text-white">
                              New Arrival
                            </span>
                          )}
                          {hasDiscount ? (
                            <span
                              className={`absolute ${product.isNewArrival ? 'left-0 top-7' : 'left-0 top-0'} z-10 bg-[#E53935] px-2 py-1 text-xs font-semibold text-white`}
                            >
                              -{discountPercent}%
                            </span>
                          ) : null}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="px-4 pt-4 pb-3">
                          <h2 className="text-sm font-semibold text-stone-900 leading-snug">
                            {product.name}
                          </h2>

                          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            {hasDiscount ? (
                              <span className="text-stone-700 line-through">
                                Rs.{formatPricePKR(originalPrice)}
                              </span>
                            ) : null}
                            <span className="font-semibold text-[#E53935]">
                              Rs.{formatPricePKR(discountedPrice)}
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="mt-auto px-4 pb-4 flex items-center gap-2">
                        <Link
                          to={`/products/${slugify(product.name)}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5A2D0C] px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#FFD400] hover:shadow-sm active:scale-[0.98]"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          View Product
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleWishlist?.(product)}
                          className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white p-2 transition-all duration-200 hover:bg-stone-50 hover:shadow-sm active:scale-[0.98]"
                          aria-label={isInWishlist?.(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          {isInWishlist?.(product.id) ? (
                            <FaHeart className="text-rose-600 text-xs" />
                          ) : (
                            <FaRegHeart className="text-stone-600 text-xs" />
                          )}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
