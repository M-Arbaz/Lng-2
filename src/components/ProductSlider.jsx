'use client'

import { useMemo } from 'react'
import { Link } from '@/lib/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getDiscountInfo } from '../utils/discountHelpers.js'
import { slugify } from '../utils/slugify.js'
import { useHorizontalSlider } from '../hooks/useHorizontalSlider.js'

export default function ProductSlider({ products, theme = 'light' }) {

  const formatPrice = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return ''
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Remove duplicate products by ID
  const uniqueProducts = useMemo(() => {
    const seen = new Set()
    return products.filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
  }, [products])

  const displayProducts = uniqueProducts.slice(0, 8)

  const { scrollContainerRef, canScrollLeft, canScrollRight, checkScroll, scroll } =
    useHorizontalSlider(displayProducts.length)

  return (
    <section
      className={
        theme === 'dark'
          ? 'bg-transparent border-y border-white/10'
          : 'bg-white border-y border-stone-200/80'
      }
    >
      <div className="w-full px-0 py-10 sm:py-14">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2
                className={
                  theme === 'dark'
                    ? 'text-xl sm:text-2xl font-semibold tracking-tight text-stone-100'
                    : 'text-xl sm:text-2xl font-semibold tracking-tight text-stone-900'
                }
              >
                Explore our best sellers
              </h2>
              <p className={theme === 'dark' ? 'mt-1 text-xs sm:text-sm text-stone-300' : 'mt-1 text-xs sm:text-sm text-stone-600'}>
                Handpicked decor to start your Lamp &amp; Glow collection.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: horizontal swipeable carousel, exactly 1 full-width slide per view */}
        <div
          className="
            flex sm:hidden
            overflow-x-auto snap-x snap-mandatory scroll-smooth
            [&::-webkit-scrollbar]:hidden
            [scrollbar-width:none]
          "
        >
          {displayProducts.map((product) => {
            const { hasDiscount, originalPrice, discountedPrice, discountPercent } = getDiscountInfo(product)

            return (
              <Link
                key={product.id}
                to={`/products/${slugify(product.name)}`}
                className="group block shrink-0 w-screen snap-center overflow-hidden bg-stone-50 transition-all duration-300 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                  {hasDiscount ? (
                    <span className="absolute left-0 top-0 z-10 bg-[#E53935] px-2 py-1 text-xs font-semibold text-white">
                      -{discountPercent}%
                    </span>
                  ) : null}
                  <img
                    src={product.image || (product.images && product.images[0])}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="px-4 pt-4 pb-3">
                  <h3 className="text-sm font-semibold text-stone-900 leading-snug">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    {hasDiscount ? (
                      <span className="text-stone-700 line-through">
                        Rs.{formatPrice(originalPrice)}
                      </span>
                    ) : null}
                    <span className="font-semibold text-[#E53935]">
                      Rs.{formatPrice(discountedPrice)}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Desktop slider with arrows */}
        <div className="hidden sm:block px-4 sm:px-6 lg:px-8 min-w-0 overflow-hidden">
          <div className="relative min-w-0">
            {/* Left Arrow — desktop only */}
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className={`hidden sm:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full transition-all duration-200 ${
                canScrollLeft
                  ? 'bg-[#FFD400] hover:bg-[#FFE566] text-[#5A2D0C] shadow-lg'
                  : 'bg-[#FFD400]/30 text-yellow-100/60 cursor-not-allowed'
              }`}
              title="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Arrow — desktop only */}
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className={`hidden sm:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full transition-all duration-200 ${
                canScrollRight
                  ? 'bg-[#FFD400] hover:bg-[#FFE566] text-[#5A2D0C] shadow-lg'
                  : 'bg-[#FFD400]/30 text-yellow-100/60 cursor-not-allowed'
              }`}
              title="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex w-full min-w-0 max-w-full gap-5 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
              onScroll={checkScroll}
            >
              {displayProducts.map((product) => {
                const { hasDiscount, originalPrice, discountedPrice, discountPercent } = getDiscountInfo(product)

                return (
                  <Link
                    key={product.id}
                    to={`/products/${slugify(product.name)}`}
                    className="flex-shrink-0 w-[calc((100%_-_3rem)/4)] lg:w-[calc((100%_-_6rem)/5)] group block overflow-hidden rounded-3xl bg-stone-50 ring-1 ring-stone-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-[#FFD400]/30/70 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                      {hasDiscount ? (
                        <span className="absolute left-0 top-0 z-10 bg-[#E53935] px-2 py-1 text-xs font-semibold text-white">
                          -{discountPercent}%
                        </span>
                      ) : null}
                      <img
                        src={product.image || (product.images && product.images[0])}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                      />
                    </div>

                    <div className="px-4 pt-4 pb-3">
                      <h3 className="text-sm font-semibold text-stone-900 leading-snug">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                        {hasDiscount ? (
                          <span className="text-stone-700 line-through">
                            Rs.{formatPrice(originalPrice)}
                          </span>
                        ) : null}
                        <span className="font-semibold text-[#E53935]">
                          Rs.{formatPrice(discountedPrice)}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
