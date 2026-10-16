import { db } from './firebase'

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'

import {
  uploadToXcdn,
} from './xcdnUpload'

export const reviewsService = {
  // Admin: get every review
  getAllReviews: async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        orderBy(
          'createdAt',
          'desc'
        )
      )

      const querySnapshot =
        await getDocs(q)

      const reviews = []

      querySnapshot.forEach(
        (docSnap) => {
          reviews.push({
            id: docSnap.id,
            ...docSnap.data(),
          })
        }
      )

      return reviews
    } catch (error) {
      console.error(
        'Error getting reviews:',
        error
      )

      throw error
    }
  },

  // Product-specific reviews
  getReviewsByProductId:
    async (productId) => {
      try {
        const q = query(
          collection(
            db,
            'reviews'
          ),

          where(
            'productId',
            '==',
            productId
          ),

          orderBy(
            'createdAt',
            'desc'
          )
        )

        const querySnapshot =
          await getDocs(q)

        const reviews = []

        querySnapshot.forEach(
          (docSnap) => {
            reviews.push({
              id: docSnap.id,
              ...docSnap.data(),
            })
          }
        )

        return reviews
      } catch (error) {
        console.error(
          'Error getting reviews by product:',
          error
        )

        throw error
      }
    },

  // Customer review history
  getReviewsByUserId:
    async (userId) => {
      try {
        const q = query(
          collection(
            db,
            'reviews'
          ),

          where(
            'userId',
            '==',
            userId
          ),

          orderBy(
            'createdAt',
            'desc'
          )
        )

        const querySnapshot =
          await getDocs(q)

        const reviews = []

        querySnapshot.forEach(
          (docSnap) => {
            reviews.push({
              id: docSnap.id,
              ...docSnap.data(),
            })
          }
        )

        return reviews
      } catch (error) {
        console.error(
          'Error getting reviews by user:',
          error
        )

        throw error
      }
    },

  // Add review
  addReview: async (
    reviewData
  ) => {
    try {
      const now =
        new Date().toISOString()

      const payload = {
        ...reviewData,

        /*
         * Legacy behavior treated a
         * missing isActive as visible.
         */
        isActive:
          reviewData?.isActive !==
          false,

        createdAt:
          reviewData?.createdAt ||
          now,

        updatedAt: now,
      }

      const docRef =
        await addDoc(
          collection(
            db,
            'reviews'
          ),
          payload
        )

      return {
        id: docRef.id,
        ...payload,
      }
    } catch (error) {
      console.error(
        'Error adding review:',
        error
      )

      throw error
    }
  },

  // Update review
  updateReview: async (
    reviewId,
    reviewData
  ) => {
    try {
      if (!reviewId) {
        throw new Error(
          'Review ID is required'
        )
      }

      const payload = {
        ...reviewData,

        updatedAt:
          new Date().toISOString(),
      }

      await updateDoc(
        doc(
          db,
          'reviews',
          reviewId
        ),
        payload
      )

      return {
        id: reviewId,
        ...payload,
      }
    } catch (error) {
      console.error(
        'Error updating review:',
        error
      )

      throw error
    }
  },

  /*
   * Review screenshot or manual
   * product image.
   *
   * Existing Firebase URLs continue
   * working. New uploads go to XCDN.
   */
  uploadReviewImage:
    async (file) => {
      if (!file) {
        throw new Error(
          'No review image selected'
        )
      }

      try {
        const url =
          await uploadToXcdn(
            file,
            'reviews'
          )

        if (!url) {
          throw new Error(
            'XCDN did not return an image URL'
          )
        }

        return url
      } catch (error) {
        console.error(
          'Error uploading review image to XCDN:',
          error
        )

        throw error
      }
    },

  deleteReview: async (
    reviewId
  ) => {
    try {
      if (!reviewId) {
        throw new Error(
          'Review ID is required'
        )
      }

      await deleteDoc(
        doc(
          db,
          'reviews',
          reviewId
        )
      )

      return true
    } catch (error) {
      console.error(
        'Error deleting review:',
        error
      )

      throw error
    }
  },

  /*
   * Same method handles both:
   * - first reply
   * - editing an existing reply
   */
  addReply: async (
    reviewId,
    replyText
  ) => {
    try {
      const cleanReply =
        String(
          replyText || ''
        ).trim()

      if (!reviewId) {
        throw new Error(
          'Review ID is required'
        )
      }

      if (!cleanReply) {
        throw new Error(
          'Reply text is required'
        )
      }

      const now =
        new Date().toISOString()

      await updateDoc(
        doc(
          db,
          'reviews',
          reviewId
        ),
        {
          adminReply:
            cleanReply,

          adminReplyAt:
            now,

        }
      )

      return {
        id: reviewId,

        adminReply:
          cleanReply,

        adminReplyAt:
          now,
      }
    } catch (error) {
      console.error(
        'Error saving review reply:',
        error
      )

      throw error
    }
  },

  removeReply: async (
    reviewId
  ) => {
    try {
      if (!reviewId) {
        throw new Error(
          'Review ID is required'
        )
      }

      const now =
        new Date().toISOString()

      await updateDoc(
        doc(
          db,
          'reviews',
          reviewId
        ),
        {
          adminReply: null,
          adminReplyAt: null,
        }
      )

      return true
    } catch (error) {
      console.error(
        'Error removing review reply:',
        error
      )

      throw error
    }
  },
}

export default reviewsService