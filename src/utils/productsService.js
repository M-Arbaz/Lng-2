import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';

export const productsService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const q = query(
        collection(db, 'products'),
        where('featured', '==', true),
        limit(6)
      );
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return products;
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  },

  // Get new arrival products
  getNewArrivals: async () => {
    try {
      const q = query(
        collection(db, 'products'),
        where('isNewArrival', '==', true),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(8)
      );
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return products;
    } catch (error) {
      console.error('Error getting new arrivals:', error);
      // Fallback: return all active products if index not ready
      try {
        const all = await productsService.getAllProducts();
        return all
          .filter((p) => p.isNewArrival === true && p.status === 'active')
          .slice(0, 8);
      } catch {
        throw error;
      }
    }
  },

  // Get discounted products
  getDiscountedProducts: async () => {
    try {
      const q = query(
        collection(db, 'products'),
        where('isDiscounted', '==', true),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(8)
      );
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return products;
    } catch (error) {
      console.error('Error getting discounted products:', error);
      // Fallback: return all active products if index not ready
      try {
        const all = await productsService.getAllProducts();
        return all
          .filter((p) => p.isDiscounted === true && p.status === 'active')
          .slice(0, 8);
      } catch {
        throw error;
      }
    }
  },

  // Toggle new arrival status
  toggleNewArrival: async (id, isNewArrival) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        isNewArrival,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error toggling new arrival status:', error);
      throw error;
    }
  },

  // Toggle discounted status
  toggleDiscounted: async (id, isDiscounted) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        isDiscounted,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error toggling discounted status:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', categoryId)
      );
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return products;
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (searchTerm) => {
    try {
      const allProducts = await productsService.getAllProducts();
      return allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Create product
  createProduct: async (productData) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: new Date().toISOString(),
      });
      return {
        id: docRef.id,
        ...productData,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: new Date().toISOString(),
      });
      return {
        id,
        ...productData,
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      return { id };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};

export default productsService;
