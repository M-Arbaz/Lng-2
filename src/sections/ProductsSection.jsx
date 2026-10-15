'use client'

import { useMemo, useState } from 'react'
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
function FilterGroup({ title, children, defaultOpen = false }) {
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

  const [priceRange, setPriceRange] = useState('all')
  const [customMinPrice, setCustomMinPrice] = useState('')
  const [customMaxPrice, setCustomMaxPrice] = useState('')
  const [availability, setAvailability] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedLampTypes, setSelectedLampTypes] = useState([])
  const [bulbOption, setBulbOption] = useState('all')
  const [heightRange, setHeightRange] = useState('all')
  const [customMinHeight, setCustomMinHeight] = useState('')
  const [customMaxHeight, setCustomMaxHeight] = useState('')
  // ── Apply local filters on top of parent's category filter ──
  const colorOptions = useMemo(() => {
    const colors = new Map()

    externalFilteredProducts.forEach((product) => {
      const variants = Array.isArray(
        product?.productDetails?.colorVariants
      )
        ? product.productDetails.colorVariants
        : []

      variants.forEach((variant) => {
        const name = String(variant?.name || '').trim()

        if (!name) return

        const key = name.toLowerCase()

        if (!colors.has(key)) {
          colors.set(key, {
            key,
            name,
            image: variant?.image || '',
          })
        }
      })
    })

    return Array.from(colors.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [externalFilteredProducts])

  const lampTypeOptions = useMemo(() => {
    const types = new Map()

    externalFilteredProducts.forEach((product) => {
      const name = String(product?.productType || '').trim()

      if (!name) return

      const key = name.toLowerCase()

      if (!types.has(key)) {
        types.set(key, {
          key,
          name,
        })
      }
    })

    return Array.from(types.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [externalFilteredProducts])

  const getHeightInCm = (product) => {
    const rawHeight = parseFloat(product?.dimensions?.height)

    if (Number.isNaN(rawHeight)) return null

    const unit = String(
      product?.dimensions?.unit || 'cm'
    ).toLowerCase()

    if (unit === 'inch' || unit === 'in') {
      return rawHeight * 2.54
    }

    if (unit === 'mm') {
      return rawHeight / 10
    }

    return rawHeight
  }
  const filteredProducts = useMemo(() => {
    const result = externalFilteredProducts.filter((product) => {
      if (showNewArrival && !product.isNewArrival) {
        return false
      }

      const discountInfo = getDiscountInfo(product)

      if (showDiscount && !discountInfo.hasDiscount) {
        return false
      }

      const price = Number(discountInfo.discountedPrice || 0)
      const stock = Number(product.stock || 0)

      if (priceRange === 'under-10000' && price >= 10000) {
        return false
      }

      if (
        priceRange === '10000-20000' &&
        (price < 10000 || price > 20000)
      ) {
        return false
      }

      if (
        priceRange === '20000-30000' &&
        (price < 20000 || price > 30000)
      ) {
        return false
      }

      if (priceRange === 'above-30000' && price <= 30000) {
        return false
      }

      if (priceRange === 'custom') {
        const min =
          customMinPrice === ''
            ? null
            : Number(customMinPrice)

        const max =
          customMaxPrice === ''
            ? null
            : Number(customMaxPrice)

        if (
          min !== null &&
          !Number.isNaN(min) &&
          price < min
        ) {
          return false
        }

        if (
          max !== null &&
          !Number.isNaN(max) &&
          price > max
        ) {
          return false
        }
      }

      if (
        availability === 'in-stock' &&
        stock <= 0
      ) {
        return false
      }

      if (
        availability === 'out-of-stock' &&
        stock > 0
      ) {
        return false
      }

      if (
        availability === 'on-sale' &&
        !discountInfo.hasDiscount
      ) {
        return false
      }
      if (selectedColors.length > 0) {
        const productColors = Array.isArray(
          product?.productDetails?.colorVariants
        )
          ? product.productDetails.colorVariants
            .map((variant) =>
              String(variant?.name || '')
                .trim()
                .toLowerCase()
            )
            .filter(Boolean)
          : []

        const matchesColor = selectedColors.some((color) =>
          productColors.includes(color)
        )

        if (!matchesColor) {
          return false
        }
      }
      if (selectedLampTypes.length > 0) {
        const productType = String(
          product?.productType || ''
        )
          .trim()
          .toLowerCase()

        if (!selectedLampTypes.includes(productType)) {
          return false
        }
      }

      if (
        bulbOption === 'with' &&
        product.bulbEnabled !== true
      ) {
        return false
      }

      if (
        bulbOption === 'without' &&
        product.bulbEnabled === true
      ) {
        return false
      }
      const heightCm = getHeightInCm(product)

      if (heightRange !== 'all') {
        if (heightCm === null) {
          return false
        }

        // Standardized website ranges:
        // Small  = under 50 cm
        // Medium = 50–100 cm
        // Large  = above 100 cm
        if (
          heightRange === 'small' &&
          heightCm >= 50
        ) {
          return false
        }

        if (
          heightRange === 'medium' &&
          (heightCm < 50 || heightCm > 100)
        ) {
          return false
        }

        if (
          heightRange === 'large' &&
          heightCm <= 100
        ) {
          return false
        }

        if (heightRange === 'custom') {
          const min =
            customMinHeight === ''
              ? null
              : Number(customMinHeight)

          const max =
            customMaxHeight === ''
              ? null
              : Number(customMaxHeight)

          if (
            min !== null &&
            !Number.isNaN(min) &&
            heightCm < min
          ) {
            return false
          }

          if (
            max !== null &&
            !Number.isNaN(max) &&
            heightCm > max
          ) {
            return false
          }
        }
      }
      return true
    })

    const getCreatedTime = (value) => {
      if (!value) return 0

      if (typeof value?.toDate === 'function') {
        return value.toDate().getTime()
      }

      if (typeof value?.seconds === 'number') {
        return value.seconds * 1000
      }

      const time = new Date(value).getTime()

      return Number.isNaN(time) ? 0 : time
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            getCreatedTime(b.createdAt) -
            getCreatedTime(a.createdAt)
          )

        case 'best-selling':
          return (
            Number(
              b.salesCount ??
              b.soldCount ??
              b.totalSold ??
              0
            ) -
            Number(
              a.salesCount ??
              a.soldCount ??
              a.totalSold ??
              0
            )
          )

        case 'price-low-high':
          return (
            getDiscountInfo(a).discountedPrice -
            getDiscountInfo(b).discountedPrice
          )

        case 'price-high-low':
          return (
            getDiscountInfo(b).discountedPrice -
            getDiscountInfo(a).discountedPrice
          )

        case 'highest-rated':
          return (
            Number(productAverageRating[b.id] || 0) -
            Number(productAverageRating[a.id] || 0)
          )

        case 'featured':
        default:
          return (
            Number(Boolean(b.featured)) -
            Number(Boolean(a.featured))
          )
      }
    })
  }, [
    externalFilteredProducts,
    showNewArrival,
    showDiscount,
    priceRange,
    customMinPrice,
    customMaxPrice,
    availability,
    selectedColors,
    selectedLampTypes,
    bulbOption,
    heightRange,
    customMinHeight,
    customMaxHeight,
    sortBy,
    productAverageRating,
  ])

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (showNewArrival ? 1 : 0) +
    (showDiscount ? 1 : 0) +
    (priceRange !== 'all' ? 1 : 0) +
    (availability !== 'all' ? 1 : 0) +
    (selectedColors.length > 0 ? 1 : 0) +
    (selectedLampTypes.length > 0 ? 1 : 0) +
    (bulbOption !== 'all' ? 1 : 0) +
    (heightRange !== 'all' ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0)
  const clearAll = () => {
    setSelectedCategory('All')
    setShowNewArrival(false)
    setShowDiscount(false)

    setPriceRange('all')
    setCustomMinPrice('')
    setCustomMaxPrice('')
    setAvailability('all')
    setSelectedColors([])
    setSelectedLampTypes([])
    setBulbOption('all')
    setHeightRange('all')
    setCustomMinHeight('')
    setCustomMaxHeight('')
    setSortBy('featured')
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
      {/* PRICE */}
      <FilterGroup title="Price">
        <div className="space-y-1">
          {[
            ['all', 'All Prices'],
            ['under-10000', 'Under Rs. 10,000'],
            ['10000-20000', 'Rs. 10,000 – 20,000'],
            ['20000-30000', 'Rs. 20,000 – 30,000'],
            ['above-30000', 'Above Rs. 30,000'],
            ['custom', 'Custom Range'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPriceRange(value)}
              className={classNames(
                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[12px] transition-colors',
                priceRange === value
                  ? 'bg-[#F1E8DF] font-semibold text-[#5A3422]'
                  : 'text-[#68584C] hover:bg-[#F8F3EE]',
              )}
            >
              {label}

              {priceRange === value && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#6B4228]" />
              )}
            </button>
          ))}

          {priceRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2 px-1 pt-2">
              <input
                type="number"
                min="0"
                value={customMinPrice}
                onChange={(e) =>
                  setCustomMinPrice(e.target.value)
                }
                placeholder="Min"
                className="min-w-0 rounded-lg border border-[#DACCC0] bg-[#FFFEFC] px-2 py-2 text-xs text-[#281912] outline-none focus:border-[#6B4228]"
              />

              <input
                type="number"
                min="0"
                value={customMaxPrice}
                onChange={(e) =>
                  setCustomMaxPrice(e.target.value)
                }
                placeholder="Max"
                className="min-w-0 rounded-lg border border-[#DACCC0] bg-[#FFFEFC] px-2 py-2 text-xs text-[#281912] outline-none focus:border-[#6B4228]"
              />
            </div>
          )}
        </div>
      </FilterGroup>
      {/* AVAILABILITY */}
      <FilterGroup title="Availability">
        <div className="space-y-1">
          {[
            ['all', 'All'],
            ['in-stock', 'In Stock'],
            ['out-of-stock', 'Out of Stock'],
            ['on-sale', 'On Sale'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAvailability(value)}
              className={classNames(
                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[12px] transition-colors',
                availability === value
                  ? 'bg-[#F1E8DF] font-semibold text-[#5A3422]'
                  : 'text-[#68584C] hover:bg-[#F8F3EE]',
              )}
            >
              {label}

              {availability === value && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#6B4228]" />
              )}
            </button>
          ))}
        </div>
      </FilterGroup>
      {/* COLOR */}
      <FilterGroup title="Color">
        {colorOptions.length === 0 ? (
          <p className="px-2 py-2 text-[11px] text-[#9A897D]">
            No colors available
          </p>
        ) : (
          <div className="space-y-1">
            {colorOptions.map((color) => {
              const active = selectedColors.includes(color.key)

              return (
                <button
                  key={color.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setSelectedColors((prev) =>
                      prev.includes(color.key)
                        ? prev.filter(
                          (item) => item !== color.key
                        )
                        : [...prev, color.key]
                    )
                  }
                  className={classNames(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[12px] transition-colors',
                    active
                      ? 'bg-[#F1E8DF] font-semibold text-[#5A3422]'
                      : 'text-[#68584C] hover:bg-[#F8F3EE]',
                  )}
                >
                  {color.image ? (
                    <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-[#3A2117]/10 bg-[#F7F4EF]">
                      <img
                        src={color.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </span>
                  ) : (
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] text-[9px] font-semibold uppercase text-[#6B4228]">
                      {color.name.slice(0, 1)}
                    </span>
                  )}

                  <span className="min-w-0 flex-1 truncate">
                    {color.name}
                  </span>

                  <span
                    className={classNames(
                      'grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors',
                      active
                        ? 'border-[#6B4228] bg-[#6B4228] text-white'
                        : 'border-[#CFC0B5] bg-white text-transparent',
                    )}
                  >
                    ✓
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </FilterGroup>
      {/* LAMP TYPE */}
      <FilterGroup title="Lamp Type">
        {lampTypeOptions.length === 0 ? (
          <p className="px-2 py-2 text-[11px] text-[#9A897D]">
            No lamp types available
          </p>
        ) : (
          <div className="space-y-1">
            {lampTypeOptions.map((type) => {
              const active = selectedLampTypes.includes(
                type.key
              )

              return (
                <button
                  key={type.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setSelectedLampTypes((prev) =>
                      prev.includes(type.key)
                        ? prev.filter(
                          (item) => item !== type.key
                        )
                        : [...prev, type.key]
                    )
                  }
                  className={classNames(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12px] transition-colors',
                    active
                      ? 'bg-[#F1E8DF] font-semibold text-[#5A3422]'
                      : 'text-[#68584C] hover:bg-[#F8F3EE]',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {type.name}
                  </span>

                  <span
                    className={classNames(
                      'grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors',
                      active
                        ? 'border-[#6B4228] bg-[#6B4228] text-white'
                        : 'border-[#CFC0B5] bg-white text-transparent',
                    )}
                  >
                    ✓
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </FilterGroup>
      {/* BULB OPTION */}
      <FilterGroup title="Bulb Option">
        <div className="space-y-1">
          {[
            ['all', 'All'],
            ['with', 'With Bulb'],
            ['without', 'Without Bulb'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setBulbOption(value)}
              className={classNames(
                'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12px] transition-colors',
                bulbOption === value
                  ? 'bg-[#F1E8DF] font-semibold text-[#5A3422]'
                  : 'text-[#68584C] hover:bg-[#F8F3EE]',
              )}
            >
              {label}

              {bulbOption === value && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#6B4228]" />
              )}
            </button>
          ))}
        </div>
      </FilterGroup>
      {/* SIZE / HEIGHT */}
      <FilterGroup title="Size / Height">
        <div className="space-y-1">
          {[
            ['all', 'All Sizes'],
            ['small', 'Small — Under 50 cm'],
            ['medium', 'Medium — 50 to 100 cm'],
            ['large', 'Large — Above 100 cm'],
            ['custom', 'Custom Height'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setHeightRange(value)}
              className={classNames(
                'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12px] transition-colors',
                heightRange === value
                  ? 'bg-[#F1E8DF] font-semibold text-[#5A3422]'
                  : 'text-[#68584C] hover:bg-[#F8F3EE]',
              )}
            >
              <span>{label}</span>

              {heightRange === value && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B4228]" />
              )}
            </button>
          ))}

          {heightRange === 'custom' && (
            <div className="px-1 pt-2">
              <p className="mb-2 text-[9px] uppercase tracking-[0.12em] text-[#9A897D]">
                Height in centimeters
              </p>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={customMinHeight}
                  onChange={(e) =>
                    setCustomMinHeight(e.target.value)
                  }
                  placeholder="Min"
                  className="min-w-0 rounded-lg border border-[#DACCC0] bg-[#FFFEFC] px-2 py-2 text-xs text-[#281912] outline-none focus:border-[#6B4228]"
                />

                <input
                  type="number"
                  min="0"
                  value={customMaxHeight}
                  onChange={(e) =>
                    setCustomMaxHeight(e.target.value)
                  }
                  placeholder="Max"
                  className="min-w-0 rounded-lg border border-[#DACCC0] bg-[#FFFEFC] px-2 py-2 text-xs text-[#281912] outline-none focus:border-[#6B4228]"
                />
              </div>
            </div>
          )}
        </div>
      </FilterGroup>
      {/* SORT BY */}
      <FilterGroup title="Sort By">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="
      w-full rounded-xl
      border border-[#DACCC0]
      bg-[#FFFEFC]
      px-3 py-2.5
      text-xs text-[#3A2117]
      outline-none
      focus:border-[#6B4228]
    "
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="best-selling">Best Selling</option>
          <option value="price-low-high">
            Price: Low to High
          </option>
          <option value="price-high-low">
            Price: High to Low
          </option>
          <option value="highest-rated">
            Highest Rated
          </option>
        </select>
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
        <aside className="hidden w-56 shrink-0 self-start lg:sticky lg:top-24 lg:block">
          <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-[#5A2D0C]">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            {SidebarContent()}
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
            {SidebarContent()}
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