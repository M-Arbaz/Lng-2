import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  increment,
} from 'firebase/firestore'
import { db } from './firebase'

const couponsService = {
  // Create coupon
  async createCoupon(couponData) {
    try {
      const docRef = await addDoc(collection(db, 'coupons'), {
        ...couponData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      })
      return {
        id: docRef.id,
        ...couponData,
        createdAt: new Date().toISOString(),
        usageCount: 0,
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      throw error
    }
  },

  // Get all coupons
  async getAllCoupons() {
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'))
      const coupons = []
      querySnapshot.forEach((doc) => {
        coupons.push({
          id: doc.id,
          ...doc.data(),
        })
      })
      return coupons.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })
    } catch (error) {
      console.error('Error fetching coupons:', error)
      throw error
    }
  },

  // Update coupon
  async updateCoupon(couponId, updates) {
    try {
      const docRef = doc(db, 'coupons', couponId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('Error updating coupon:', error)
      throw error
    }
  },
  // Get coupon by code
  async getCouponByCode(code) {
    try {
      const normalizedCode = String(code || '')
        .trim()
        .toUpperCase()

      if (!normalizedCode) {
        return null
      }

      const q = query(
        collection(db, 'coupons'),
        where('code', '==', normalizedCode)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null
      }

      const couponDoc = querySnapshot.docs[0]

      return {
        id: couponDoc.id,
        ...couponDoc.data(),
      }
    } catch (error) {
      console.error(
        'Error fetching coupon by code:',
        error
      )

      throw error
    }
  },

  // Validate coupon against current cart
  async validateCoupon({
    code,
    cart = [],
    cartTotal = 0,
  }) {
    try {
      const coupon =
        await couponsService.getCouponByCode(code)

      if (!coupon) {
        return {
          valid: false,
          message: 'Invalid coupon code.',
        }
      }

      if (coupon.isActive === false) {
        return {
          valid: false,
          message: 'This coupon is currently inactive.',
        }
      }

      if (coupon.expiryDate) {
        const expiryDate = new Date(
          `${coupon.expiryDate}T23:59:59.999`
        )

        if (
          !Number.isNaN(expiryDate.getTime()) &&
          expiryDate.getTime() < Date.now()
        ) {
          return {
            valid: false,
            message: 'This coupon has expired.',
          }
        }
      }

      const usageCount = Number(
        coupon.usageCount || 0
      )

      const maxUsageLimit =
        coupon.maxUsageLimit != null
          ? Number(coupon.maxUsageLimit)
          : null

      if (
        maxUsageLimit != null &&
        Number.isFinite(maxUsageLimit) &&
        maxUsageLimit > 0 &&
        usageCount >= maxUsageLimit
      ) {
        return {
          valid: false,
          message:
            'This coupon has reached its usage limit.',
        }
      }

      const safeCartTotal = Math.max(
        0,
        Number(cartTotal) || 0
      )

      const minOrderValue = Math.max(
        0,
        Number(coupon.minOrderValue) || 0
      )

      if (
        minOrderValue > 0 &&
        safeCartTotal < minOrderValue
      ) {
        return {
          valid: false,
          message: `Minimum order value for this coupon is Rs. ${minOrderValue.toLocaleString(
            'en-PK'
          )}.`,
        }
      }

      const getLineTotal = (item) => {
        const unitPrice = Number(
          item?.unitPrice ??
          item?.product?.price ??
          0
        )

        const quantity = Math.max(
          0,
          Number(item?.quantity || 0)
        )

        return Math.max(
          0,
          unitPrice * quantity
        )
      }

      let eligibleSubtotal = 0

      if (
        !coupon.applicableTo ||
        coupon.applicableTo === 'all'
      ) {
        eligibleSubtotal = safeCartTotal
      } else if (
        coupon.applicableTo === 'products'
      ) {
        const productIds = Array.isArray(
          coupon.productIds
        )
          ? coupon.productIds
          : []

        eligibleSubtotal = cart.reduce(
          (total, item) => {
            const productId =
              item?.product?.id

            if (
              !productId ||
              !productIds.includes(productId)
            ) {
              return total
            }

            return total + getLineTotal(item)
          },
          0
        )
      } else if (
        coupon.applicableTo === 'categories'
      ) {
        const categoryIds = Array.isArray(
          coupon.categoryIds
        )
          ? coupon.categoryIds
          : []

        eligibleSubtotal = cart.reduce(
          (total, item) => {
            const categoryId =
              item?.product?.category

            if (
              !categoryId ||
              !categoryIds.includes(categoryId)
            ) {
              return total
            }

            return total + getLineTotal(item)
          },
          0
        )
      }

      eligibleSubtotal = Math.max(
        0,
        eligibleSubtotal
      )

      if (eligibleSubtotal <= 0) {
        return {
          valid: false,
          message:
            coupon.applicableTo === 'categories'
              ? 'This coupon does not apply to any product in your cart from the selected categories.'
              : 'This coupon does not apply to any product in your cart.',
        }
      }

      const discountValue = Math.max(
        0,
        Number(coupon.discountValue) || 0
      )

      let discountAmount = 0

      if (
        coupon.discountType === 'percentage'
      ) {
        discountAmount =
          eligibleSubtotal *
          (discountValue / 100)
      } else {
        discountAmount = discountValue
      }

      // Discount can never exceed the eligible
      // portion of the cart.
      discountAmount = Math.min(
        eligibleSubtotal,
        Math.max(0, discountAmount)
      )

      discountAmount =
        Math.round(
          (discountAmount +
            Number.EPSILON) *
          100
        ) / 100

      return {
        valid: true,

        message: 'Coupon applied successfully!',

        coupon: {
          id: coupon.id,
          code: coupon.code,
          description:
            coupon.description || '',
          discountType:
            coupon.discountType,
          discountValue:
            coupon.discountValue,
          applicableTo:
            coupon.applicableTo || 'all',
          productIds: Array.isArray(
            coupon.productIds
          )
            ? coupon.productIds
            : [],
          categoryIds: Array.isArray(
            coupon.categoryIds
          )
            ? coupon.categoryIds
            : [],
          minOrderValue:
            Number(
              coupon.minOrderValue || 0
            ),
          maxUsageLimit:
            coupon.maxUsageLimit ?? null,
          usageCount:
            Number(
              coupon.usageCount || 0
            ),
        },

        eligibleSubtotal,
        discountAmount,
      }
    } catch (error) {
      console.error(
        'Error validating coupon:',
        error
      )

      throw error
    }
  },
  // Delete coupon
  async deleteCoupon(couponId) {
    try {
      await deleteDoc(doc(db, 'coupons', couponId))
      return true
    } catch (error) {
      console.error('Error deleting coupon:', error)
      throw error
    }
  },

  // Increment usage count after a successful order
  async incrementUsage(couponId) {
    try {
      const docRef = doc(
        db,
        'coupons',
        couponId
      )

      await updateDoc(docRef, {
        usageCount: increment(1),
        updatedAt: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error(
        'Error incrementing usage:',
        error
      )

      throw error
    }
  },
}

export default couponsService
