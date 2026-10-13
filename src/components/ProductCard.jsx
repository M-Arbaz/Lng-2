'use client'

import { Link } from '@/lib/navigation'
import { Heart, ShoppingBag } from 'lucide-react'
import { getDiscountInfo } from '../utils/discountHelpers.js'
import { slugify } from '../utils/slugify.js'

const formatPricePKR = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return ''

  return new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}) {
  const {
    hasDiscount,
    originalPrice,
    discountedPrice,
    discountPercent,
  } = getDiscountInfo(product)

  const inWishlist = isInWishlist
    ? isInWishlist(product.id)
    : false

  const isOutOfStock =
    product.stock !== undefined &&
    Number(product.stock) <= 0

  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : []

  const primaryImage =
    product.image ||
    images[0] ||
    ''

  const variants = Array.isArray(
    product.productDetails?.colorVariants
  )
    ? product.productDetails.colorVariants
    : []

  const visibleVariants = variants.slice(0, 3)
  const remainingVariants = Math.max(variants.length - 3, 0)

  const productUrl = `/products/${slugify(product.name)}`

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#6B3510]/20 hover:shadow-[0_12px_30px_rgba(75,45,20,0.10)]">

      {/* IMAGE */}
      <Link
        to={productUrl}
        className="relative block aspect-square overflow-hidden bg-[#F5F2EE]"
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-stone-400">
            No image
          </div>
        )}

        {/* BADGES */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1">
          {product.isNewArrival && (
            <span className="w-fit rounded-full bg-[#63300C] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm">
              New
            </span>
          )}

          {hasDiscount && (
            <span className="w-fit rounded-full bg-red-500 px-2.5 py-1 text-[9px] font-semibold text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* WISHLIST */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleWishlist?.(product)
          }}
          aria-label={
            inWishlist
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-stone-600 shadow-sm backdrop-blur transition duration-200 hover:scale-105 hover:text-red-500"
        >
          <Heart
            size={15}
            fill={inWishlist ? 'currentColor' : 'none'}
            className={
              inWishlist
                ? 'text-red-500'
                : 'text-stone-600'
            }
          />
        </button>

        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/45 backdrop-blur-[1px]">
            <span className="rounded-full bg-stone-900 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-3.5">

        {/* CATEGORY */}
        {product.category && (
          <p className="mb-1 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-[#A47A50]">
            {product.category}
          </p>
        )}

        {/* TITLE */}
        <Link to={productUrl}>
          <h3 className="line-clamp-2 min-h-[38px] text-[13px] font-semibold leading-[1.45] text-stone-900 transition-colors group-hover:text-[#63300C]">
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}
        <div className="mt-2 flex min-h-[22px] flex-wrap items-baseline gap-1.5">
          <span
            className={`text-[14px] font-bold ${hasDiscount
                ? 'text-[#D43C2F]'
                : 'text-stone-900'
              }`}
          >
            Rs. {formatPricePKR(discountedPrice)}
          </span>

          {hasDiscount && (
            <span className="text-[10px] text-stone-400 line-through">
              Rs. {formatPricePKR(originalPrice)}
            </span>
          )}
        </div>

        {/* COLORS */}
        <div className="mt-2 min-h-[22px]">
          {visibleVariants.length > 0 && (
            <div className="flex items-center gap-1.5">
              {visibleVariants.map((variant, index) => (
                <div
                  key={`${variant.name || 'variant'}-${index}`}
                  title={variant.name || 'Color'}
                  className="h-5 w-5 overflow-hidden rounded-full border border-stone-200 bg-stone-100 p-[1px]"
                >
                  {variant.image ? (
                    <img
                      src={variant.image}
                      alt={variant.name || ''}
                      loading="lazy"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-stone-300" />
                  )}
                </div>
              ))}

              {remainingVariants > 0 && (
                <span className="text-[9px] font-medium text-stone-500">
                  +{remainingVariants}
                </span>
              )}
            </div>
          )}
        </div>

        {/* CART */}
        <div className="mt-auto pt-3">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              if (!isOutOfStock) {
                onAddToCart?.(product)
              }
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold transition duration-200 ${isOutOfStock
                ? 'cursor-not-allowed bg-stone-100 text-stone-400'
                : 'bg-[#63300C] text-white hover:bg-[#4A2308] active:scale-[0.98]'
              }`}
          >
            <ShoppingBag size={14} />

            {isOutOfStock
              ? 'Out of Stock'
              : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  )
}