import { db } from './firebase'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore'

import { uploadToXcdn } from './xcdnUpload'

export const categoriesService = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const categories = [];
      querySnapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (id) => {
    try {
      const docRef = doc(db, 'categories', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Category not found');
      }
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  },

  // Create category
  createCategory: async (categoryData) => {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: new Date().toISOString(),
      });
      return {
        id: docRef.id,
        ...categoryData,
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, {
        ...categoryData,
        updatedAt: new Date().toISOString(),
      });
      return {
        id,
        ...categoryData,
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return { id };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Upload category image
  // Upload category image to XCDN
  uploadCategoryImage: async (file) => {
    try {
      if (!file) {
        throw new Error('No category image selected')
      }

      return await uploadToXcdn(
        file,
        'categories'
      )
    } catch (error) {
      console.error(
        'Error uploading category image to XCDN:',
        error
      )

      throw error
    }
  },
};

export default categoriesService;
