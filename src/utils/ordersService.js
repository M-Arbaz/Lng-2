import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const ordersService = {
  // Create a new order
  createOrder: async (userId, orderData) => {
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId,
        ...orderData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return {
        id: orderRef.id,
        userId,
        ...orderData,
        status: 'pending',
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  // Get user's orders
  getUserOrders: async (userId) => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  },

  // Get all orders (for admin)
  getAllOrders: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return orders;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      return { id: orderId, status };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Update order tracking details
  updateOrderTracking: async (orderId, tracking) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        tracking: {
          ...tracking,
          addedAt: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      });
      return { id: orderId, tracking };
    } catch (error) {
      console.error('Error updating order tracking:', error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      return { id: orderId, status: 'cancelled' };
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },
};

export default ordersService;
