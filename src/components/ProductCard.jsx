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
    product.productDetails?.colorVariants,
  )
    ? product.productDetails.colorVariants
    : []

  const visibleVariants = variants.slice(0, 3)
  const remainingVariants = Math.max(
    variants.length - 3,
    0,
  )

  const productUrl = `/products/${slugify(product.name)}`

  return (
    <article
      className="
        group
        flex h-full flex-col
        overflow-hidden
        rounded-2xl
        border border-[#E9DFD5]
        bg-[#FFFCF9]
        shadow-[0_3px_16px_rgba(75,45,20,0.045)]
        transition-all duration-300
        hover:-translate-y-[3px]
        hover:border-[#D8C1AB]
        hover:shadow-[0_14px_34px_rgba(75,45,20,0.10)]
      "
    >
      {/* IMAGE */}
      <Link
        to={productUrl}
        className="
          relative block aspect-square overflow-hidden
          bg-[#F3EEE8]
        "
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="
              h-full w-full object-cover
              transition-transform duration-500 ease-out
              group-hover:scale-[1.035]
            "
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-stone-400">
            No image
          </div>
        )}

        {/* SUBTLE IMAGE SHADE */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.04] via-transparent to-transparent" />

        {/* BADGES */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span
              className="
                w-fit rounded-full
                border border-white/20
                bg-[#5A3422]/95
                px-2.5 py-1
                text-[9px] font-semibold uppercase
                tracking-[0.12em] text-white
                shadow-sm backdrop-blur
              "
            >
              New
            </span>
          )}

          {hasDiscount && (
            <span
              className="
                w-fit rounded-full
                bg-[#B6533C]
                px-2.5 py-1
                text-[9px] font-semibold
                text-white shadow-sm
              "
            >
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
          className="
            absolute right-2.5 top-2.5 z-20
            flex h-9 w-9 items-center justify-center
            rounded-full
            border border-white/70
            bg-white/90
            text-[#66564B]
            shadow-[0_4px_14px_rgba(0,0,0,0.08)]
            backdrop-blur-md
            transition-all duration-200
            hover:scale-105
            hover:border-[#DABAA0]
            hover:text-[#8A562F]
          "
        >
          <Heart
            size={16}
            strokeWidth={1.8}
            fill={inWishlist ? 'currentColor' : 'none'}
            className={
              inWishlist
                ? 'text-[#A24E37]'
                : 'text-[#66564B]'
            }
          />
        </button>

        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-[#30261F] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-3">
        {/* CATEGORY */}
        {product.category && (
          <p
            className="
              mb-1.5 truncate
              text-[9px] font-semibold uppercase
              tracking-[0.14em]
              text-[#A07859]
            "
          >
            {product.category}
          </p>
        )}

        {/* TITLE */}
        <Link to={productUrl}>
          <h3
            className="
  line-clamp-2 min-h-[36px]
  text-[13px] font-semibold uppercase
  leading-[1.5]
  tracking-[0.02em]
  text-[#30251E]
  transition-colors duration-200
  group-hover:text-[#6A3E22]
  sm:text-[13.5px]
"
          >
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}
        <div className="mt-2 flex min-h-[22px] flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className={`text-[14px] font-bold tracking-[-0.01em] ${hasDiscount
              ? 'text-[#A64735]'
              : 'text-[#33271F]'
              }`}
          >
            PKR {formatPricePKR(discountedPrice)}
          </span>

          {hasDiscount && (
            <span className="text-[10px] font-medium text-[#AAA096] line-through">
              PKR {formatPricePKR(originalPrice)}
            </span>
          )}
        </div>

        {/* COLORS */}
        <div className="mt-2 min-h-[20px]">
          {visibleVariants.length > 0 && (
            <div className="flex items-center gap-1.5">
              {visibleVariants.map(
                (variant, index) => (
                  <div
                    key={`${variant.name || 'variant'
                      }-${index}`}
                    title={variant.name || 'Color'}
                    className="
                     h-[18px] w-[18px]
                      overflow-hidden
                      rounded-full
                      border border-[#D9CFC5]
                      bg-white
                      p-[2px]
                      shadow-[0_1px_3px_rgba(0,0,0,0.06)]
                    "
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
                ),
              )}

              {remainingVariants > 0 && (
                <span className="ml-0.5 text-[9px] font-semibold text-[#8E7B6B]">
                  +{remainingVariants}
                </span>
              )}
            </div>
          )}
        </div>

        {/* CART */}
        <div className="mt-auto pt-2.5">
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
            className={`
              flex w-full items-center justify-center gap-2
              rounded-xl
         px-3 py-2
              text-[11px] font-semibold
              tracking-[0.025em]
              transition-all duration-200
              ${isOutOfStock
                ? 'cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400'
                : 'bg-[#5A3422] text-white shadow-[0_5px_14px_rgba(90,52,34,0.16)] hover:bg-[#452719] hover:shadow-[0_7px_18px_rgba(90,52,34,0.22)] active:scale-[0.985]'
              }
            `}
          >
            <ShoppingBag
              size={15}
              strokeWidth={1.8}
            />

            {isOutOfStock
              ? 'Out of Stock'
              : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  )
}