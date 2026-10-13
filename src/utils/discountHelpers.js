/**
 * Get discount display info for a product.
 * Supports both the new discount system (originalPrice + price) and
 * the legacy compareAtPrice system.
 */
export function getDiscountInfo(product) {
  const price = typeof product.price === 'number' && !Number.isNaN(product.price) ? product.price : 0

  // New system: originalPrice is the base price, price is the final discounted price
  const originalPrice =
    typeof product.originalPrice === 'number' && !Number.isNaN(product.originalPrice)
      ? product.originalPrice
      : typeof product.compareAtPrice === 'number' && !Number.isNaN(product.compareAtPrice)
        ? product.compareAtPrice
        : null

  if (originalPrice !== null && originalPrice > price && price >= 0) {
    const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100)
    return {
      hasDiscount: true,
      originalPrice,
      discountedPrice: price,
      discountPercent: Math.max(0, Math.min(100, discountPercent)),
    }
  }

  return {
    hasDiscount: false,
    originalPrice: price,
    discountedPrice: price,
    discountPercent: 0,
  }
}

/**
 * Calculate final price from base price, discount type and discount value.
 */
export function calculateFinalPrice(basePrice, discountType, discountValue) {
  const base = typeof basePrice === 'number' ? basePrice : parseFloat(basePrice)
  if (Number.isNaN(base) || base <= 0) return 0

  const value = typeof discountValue === 'number' ? discountValue : parseFloat(discountValue)
  if (Number.isNaN(value) || value <= 0) return base

  if (discountType === 'percentage') {
    const final = base - base * (value / 100)
    return Math.max(0, Math.round(final * 100) / 100)
  }

  if (discountType === 'fixed') {
    const final = base - value
    return Math.max(0, Math.round(final * 100) / 100)
  }

  return base
}
