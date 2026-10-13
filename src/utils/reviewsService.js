import { db, storage } from './firebase';
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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const reviewsService = {
  // Get all reviews
  getAllReviews: async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviews = [];
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return reviews;
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  },

  // Get reviews by product ID
  getReviewsByProductId: async (productId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const reviews = [];
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return reviews;
    } catch (error) {
      console.error('Error getting reviews by product:', error);
      throw error;
    }
  },

  // Get reviews by user ID
  getReviewsByUserId: async (userId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const reviews = [];
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return reviews;
    } catch (error) {
      console.error('Error getting reviews by user:', error);
      throw error;
    }
  },

  // Add a new review
  addReview: async (reviewData) => {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: new Date().toISOString(),
      });
      return {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Update an existing review (used for admin-authored review edits)
  updateReview: async (reviewId, reviewData) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId)
      await updateDoc(reviewRef, {
        ...reviewData,
        updatedAt: new Date().toISOString(),
      })
      return { id: reviewId, ...reviewData }
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  },

  // Upload a review screenshot or a manual product image
  uploadReviewImage: async (file) => {
    try {
      const storageRef = ref(storage, `reviews/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading review image:', error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId))
      return true
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  },

  // Add or update admin reply to a review
  addReply: async (reviewId, replyText) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId)
      await updateDoc(reviewRef, {
        adminReply: replyText,
        adminReplyAt: new Date().toISOString(),
      })
      return {
        id: reviewId,
        adminReply: replyText,
        adminReplyAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error adding reply:', error)
      throw error
    }
  },

  // Remove admin reply from a review
  removeReply: async (reviewId) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId)
      await updateDoc(reviewRef, {
        adminReply: null,
        adminReplyAt: null,
      })
      return true
    } catch (error) {
      console.error('Error removing reply:', error)
      throw error
    }
  },
};

export default reviewsService;