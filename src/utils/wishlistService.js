import { db } from './firebase'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore'

export const wishlistService = {
  async getWishlist(userId) {
    try {
      const q = query(collection(db, 'wishlists'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) return []
      const data = querySnapshot.docs[0].data()
      return data.items || []
    } catch (error) {
      console.error('Error getting wishlist:', error)
      return []
    }
  },

  async saveWishlist(userId, items) {
    try {
      const ref = doc(db, 'wishlists', userId)
      await setDoc(ref, { userId, items, updatedAt: new Date().toISOString() }, { merge: true })
      return true
    } catch (error) {
      console.error('Error saving wishlist:', error)
      return false
    }
  },

  async addToWishlist(userId, product) {
    try {
      const current = await this.getWishlist(userId)
      const exists = current.some((p) => p.id === product.id)
      if (exists) return current
      const updated = [...current, product]
      await this.saveWishlist(userId, updated)
      return updated
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return null
    }
  },

  async removeFromWishlist(userId, productId) {
    try {
      const current = await this.getWishlist(userId)
      const updated = current.filter((p) => p.id !== productId)
      await this.saveWishlist(userId, updated)
      return updated
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return null
    }
  },
}

export default wishlistService