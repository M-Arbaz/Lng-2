import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'
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

  // Increment usage count
  async incrementUsage(couponId, currentUsage = 0) {
    try {
      const docRef = doc(db, 'coupons', couponId)
      await updateDoc(docRef, {
        usageCount: currentUsage + 1,
      })
      return true
    } catch (error) {
      console.error('Error incrementing usage:', error)
      throw error
    }
  },
}

export default couponsService
