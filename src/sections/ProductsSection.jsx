'use client'

import { useState } from 'react'
import { Link } from '@/lib/navigation'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import classNames from '../utils/classNames.js'
import { getDiscountInfo } from '../utils/discountHelpers.js'
import { slugify } from '../utils/slugify.js'

const formatPricePKR = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return ''
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/* ── Mobile filter drawer toggle icon ── */
function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="14" y2="12" />
      <line x1="4" y1="18" x2="10" y2="18" />
    </svg>
  )
}

/* ── Chevron for collapsible sections ── */
function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={classNames('h-4 w-4 shrink-0 transition-transform duration-200', open ? 'rotate-180' : '')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/* ── Collapsible filter group ── */
function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-stone-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500 hover:text-stone-800 transition-colors"
      >
        {title}
        <Chevron open={open} />
      </button>
      <div className={classNames('overflow-hidden transition-all duration-300', open ? 'max-h-96 pb-4' : 'max-h-0')}>
        {children}
      </div>
    </div>
  )
}

export default function ProductsSection({
  categories,
  filteredProducts: externalFilteredProducts,
  productAverageRating,
  selectedCategory,
  setSelectedCategory,
  handleAddToCart,
  handleNavigate,
  setReviewForm,
  handleToggleWishlist,
  isInWishlist,
}) {
  // ── Local filter state ──
  const [showNewArrival, setShowNewArrival] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // ── Apply local filters on top of parent's category filter ──
  const filteredProducts = externalFilteredProducts.filter((p) => {
    if (showNewArrival && !p.isNewArrival) return false
    if (showDiscount && !getDiscountInfo(p).hasDiscount) return false
    return true
  })

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (showNewArrival ? 1 : 0) +
    (showDiscount ? 1 : 0)

  const clearAll = () => {
    setSelectedCategory('All')
    setShowNewArrival(false)
    setShowDiscount(false)
  }

  /* ── Sidebar content (shared between desktop + mobile drawer) ── */
  const SidebarContent = () => (
    <div className="space-y-0">
      {/* Category */}
      <FilterGroup title="Category">
        <ul className="space-y-1.5">
          <li>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={classNames(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                selectedCategory === 'All'
                  ? 'bg-[#F5F1EA] font-semibold text-[#5A2D0C]'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
              )}
            >
              All Products
              {selectedCategory === 'All' && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5F1EA]0" />
              )}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={classNames(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  selectedCategory === cat.id
                    ? 'bg-[#F5F1EA] font-semibold text-[#5A2D0C]'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                )}
              >
                {cat.title}
                {selectedCategory === cat.id && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F5F1EA]0" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </FilterGroup>

      {/* Special Filters */}
      <FilterGroup title="Special">
        <div className="space-y-2">
          {/* New Arrival toggle */}
          <label className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-stone-100 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#F5F1EA]0/10 text-[#FFD400]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
              <span className="text-sm text-stone-700">New Arrivals</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showNewArrival}
              onClick={() => setShowNewArrival((v) => !v)}
              className={classNames(
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]',
                showNewArrival ? 'bg-[#F5F1EA]0' : 'bg-stone-200',
              )}
            >
              <span
                className={classNames(
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                  showNewArrival ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          </label>

          {/* Discount toggle */}
          <label className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-stone-100 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-red-500/10 text-[#E53935]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 14l6-6M9 9h.01M15 14h.01" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </span>
              <span className="text-sm text-stone-700">On Sale</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showDiscount}
              onClick={() => setShowDiscount((v) => !v)}
              className={classNames(
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                showDiscount ? 'bg-red-500' : 'bg-stone-200',
              )}
            >
              <span
                className={classNames(
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                  showDiscount ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          </label>
        </div>
      </FilterGroup>

      {/* Clear all */}
      {activeFilterCount > 0 && (
        <div className="pt-4">
          <button
            type="button"
            onClick={clearAll}
            className="w-full rounded-lg border border-stone-300 py-2 text-xs font-semibold text-stone-600 hover:border-stone-400 hover:bg-stone-50 transition-colors"
          >
            Clear all filters ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  )

  return (
    <section className="w-full px-0 py-10 sm:py-14">
      <div className="px-4 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="mb-6 flex items-end justify-center relative">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-900">
              Products
            </h1>
            <p className="mt-0.5 text-xs text-stone-400">
              {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'}
              {activeFilterCount > 0 ? ' matching filters' : ''}
            </p>
          </div>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex lg:hidden items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
          >
            <FilterIcon />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F5F1EA]0 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Layout: sidebar + grid ── */}
      <div className="flex gap-8 px-4 sm:px-6 lg:px-8">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-[#5A2D0C]">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div className="flex-1 min-w-0">
          {/* Active filter pills (desktop) */}
          {activeFilterCount > 0 && (
            <div className="mb-4 hidden lg:flex flex-wrap gap-2">
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F1EA] border border-[#FFD400]/30 px-2.5 py-1 text-xs font-medium text-[#5A2D0C]">
                  {categories.find((c) => c.id === selectedCategory)?.title ?? selectedCategory}
                  <button type="button" onClick={() => setSelectedCategory('All')} className="ml-0.5 hover:text-[#FFD400]">✕</button>
                </span>
              )}
              {showNewArrival && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F1EA] border border-[#FFD400]/30 px-2.5 py-1 text-xs font-medium text-[#5A2D0C]">
                  New Arrivals
                  <button type="button" onClick={() => setShowNewArrival(false)} className="ml-0.5 hover:text-[#FFD400]">✕</button>
                </span>
              )}
              {showDiscount && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700">
                  On Sale
                  <button type="button" onClick={() => setShowDiscount(false)} className="ml-0.5 hover:text-red-500">✕</button>
                </span>
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-stone-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <p className="text-sm font-medium text-stone-500">No products match your filters</p>
              <button type="button" onClick={clearAll} className="mt-3 text-xs text-[#FFD400] underline hover:text-[#5A2D0C]">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
              {filteredProducts.map((product) => {
                const avg = productAverageRating[product.id]
                const { hasDiscount, originalPrice, discountedPrice, discountPercent } = getDiscountInfo(product)

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-3xl bg-stone-50 ring-1 ring-stone-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-[#FFD400]/30/70 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <Link to={`/products/${slugify(product.name)}`} className="group block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                        {product.isNewArrival && (
                          <span className="absolute left-0 top-0 z-10 bg-[#F5F1EA]0 px-2 py-1 text-xs font-semibold text-white">
                            New Arrival
                          </span>
                        )}
                        {hasDiscount && (
                          <span className={`absolute ${product.isNewArrival ? 'left-0 top-7' : 'left-0 top-0'} z-10 bg-[#E53935] px-2 py-1 text-xs font-semibold text-white`}>
                            -{discountPercent}%
                          </span>
                        )}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                        />
                        {avg ? (
                          <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-amber-100 backdrop-blur">
                            <span className="text-[#FFD400]">★</span> {avg.toFixed(1)}
                          </div>
                        ) : null}
                      </div>

                      <div className="px-4 pt-4 pb-3">
                        <h2 className="text-sm font-semibold text-stone-900 leading-snug">
                          {product.name}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                          {hasDiscount && (
                            <span className="text-stone-700 line-through text-xs">
                              Rs.{formatPricePKR(originalPrice)}
                            </span>
                          )}
                          <span className="font-semibold text-[#E53935]">Rs.{formatPricePKR(discountedPrice)}</span>
                        </div>
                      </div>
                    </Link>

                    
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Mobile Filter Drawer ═══ */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-stone-900">Filters</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarContent />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mt-4 w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors"
            >
              Show {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}
            </button>
          </div>
        </>
      )}
    </section>
  )
}