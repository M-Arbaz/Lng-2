'use client'

import { useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import classNames from '../utils/classNames.js'
import { getDiscountInfo } from '../utils/discountHelpers.js'



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
    <div className="border-b border-[#EAE0D7] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="
          flex w-full items-center justify-between
          py-4
          text-left
          text-[10px] font-semibold uppercase
          tracking-[0.18em]
          text-[#8A6F5B]
          transition-colors duration-200
          hover:text-[#5A3422]
        "
      >
        {title}

        <Chevron open={open} />
      </button>

      <div
        className={classNames(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-[600px] pb-4' : 'max-h-0',
        )}
      >
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
    <div>
      {/* CATEGORY */}
      <FilterGroup title="Category">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={classNames(
              'group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-200',
              selectedCategory === 'All'
                ? 'bg-[#F1E8DF] font-semibold text-[#5A3422]'
                : 'text-[#68584C] hover:bg-[#F8F3EE] hover:text-[#3D2D23]',
            )}
          >
            <span>All Products</span>

            {selectedCategory === 'All' && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#8A562F]" />
            )}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={classNames(
                'group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] leading-5 transition-all duration-200',
                selectedCategory === cat.id
                  ? 'bg-[#F1E8DF] font-semibold text-[#5A3422]'
                  : 'text-[#68584C] hover:bg-[#F8F3EE] hover:text-[#3D2D23]',
              )}
            >
              <span className="pr-3">
                {cat.title}
              </span>

              {selectedCategory === cat.id && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8A562F]" />
              )}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* SPECIAL */}
      <FilterGroup title="Special">
        <div className="space-y-2">
          {/* NEW ARRIVALS */}
          <div
            className="
            flex items-center justify-between
            rounded-xl
            border border-transparent
            px-3 py-2.5
            transition-colors duration-200
            hover:border-[#E8DDD3]
            hover:bg-[#F8F3EE]
          "
          >
            <div className="flex items-center gap-3">
              <span
                className="
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                bg-[#F2E6D9]
                text-[#9A6239]
              "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>

              <span className="text-[13px] font-medium text-[#58473B]">
                New Arrivals
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showNewArrival}
              onClick={() =>
                setShowNewArrival((value) => !value)
              }
              className={classNames(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8A562F]/30',
                showNewArrival
                  ? 'bg-[#6B4028]'
                  : 'bg-[#DDD4CC]',
              )}
            >
              <span
                className={classNames(
                  'inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
                  showNewArrival
                    ? 'translate-x-[21px]'
                    : 'translate-x-[3px]',
                )}
              />
            </button>
          </div>

          {/* ON SALE */}
          <div
            className="
            flex items-center justify-between
            rounded-xl
            border border-transparent
            px-3 py-2.5
            transition-colors duration-200
            hover:border-[#E8DDD3]
            hover:bg-[#F8F3EE]
          "
          >
            <div className="flex items-center gap-3">
              <span
                className="
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                bg-[#F8E8E3]
                text-[#B6533C]
              "
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 14l6-6M9 9h.01M15 14h.01" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>

              <span className="text-[13px] font-medium text-[#58473B]">
                On Sale
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showDiscount}
              onClick={() =>
                setShowDiscount((value) => !value)
              }
              className={classNames(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6533C]/30',
                showDiscount
                  ? 'bg-[#B6533C]'
                  : 'bg-[#DDD4CC]',
              )}
            >
              <span
                className={classNames(
                  'inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
                  showDiscount
                    ? 'translate-x-[21px]'
                    : 'translate-x-[3px]',
                )}
              />
            </button>
          </div>
        </div>
      </FilterGroup>

      {/* CLEAR FILTERS */}
      {activeFilterCount > 0 && (
        <div className="pt-4">
          <button
            type="button"
            onClick={clearAll}
            className="
            w-full rounded-xl
            border border-[#DACCC0]
            bg-white
            px-3 py-2.5
            text-[11px] font-semibold
            uppercase tracking-[0.1em]
            text-[#755640]
            transition-all duration-200
            hover:border-[#A97A55]
            hover:bg-[#F8F3EE]
            hover:text-[#5A3422]
          "
          >
            Clear All ({activeFilterCount})
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
        <aside className="hidden w-56 shrink-0 self-start lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
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
            <div
              className="
    grid
    grid-cols-2
    gap-3
    sm:gap-4
    lg:grid-cols-3
    xl:grid-cols-4
    2xl:grid-cols-5
  "
            >
              {filteredProducts.map((product) => (
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