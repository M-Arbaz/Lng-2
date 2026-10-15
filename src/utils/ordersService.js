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
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
const PAYMENT_STATUS_LABELS = {
  pending: 'Payment Pending',
  partial: 'Partially Paid',
  paid: 'Payment Paid',
  failed: 'Payment Failed',
  refunded: 'Payment Refunded',
  cancelled: 'Payment Cancelled',
};

const normalizePaymentStatus = (value) => {
  const normalized = String(value || 'pending')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  return PAYMENT_STATUS_LABELS[normalized]
    ? normalized
    : 'pending';
};
export const ordersService = {
  // Create a new order
  createOrder: async (userId, orderData) => {
    try {
      const createdAtIso = new Date().toISOString();

      const initialPaymentStatus = normalizePaymentStatus(
        orderData?.paymentStatus
      );

      const orderRef = await addDoc(collection(db, 'orders'), {
        userId,
        ...orderData,

        status: 'pending',

        statusHistory: [
          {
            status: 'pending',
            label: 'Order Placed',
            at: createdAtIso,
            source: 'system',
          },
        ],

        paymentStatus: initialPaymentStatus,

        paymentStatusHistory: [
          {
            status: initialPaymentStatus,
            label:
              PAYMENT_STATUS_LABELS[
              initialPaymentStatus
              ],
            at: createdAtIso,
            source: 'system',
          },
        ],

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return {
        id: orderRef.id,
        userId,
        ...orderData,
        status: 'pending',
        paymentStatus: initialPaymentStatus,
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
  // Listen to user's orders in real time
  subscribeToUserOrders: (userId, onChange, onError) => {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const orders = querySnapshot.docs.map((orderDoc) => ({
          id: orderDoc.id,
          ...orderDoc.data(),
        }));

        onChange(orders);
      },
      (error) => {
        console.error('Error listening to user orders:', error);

        if (onError) {
          onError(error);
        }
      }
    );
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

      const statusLabels = {
        pending: 'Order Placed',
        confirmed: 'Order Confirmed',
        approved: 'Order Approved',
        processing: 'Order Processing',
        in_production: 'Order in Production',
        production: 'Order in Production',
        ready: 'Order Ready',
        dispatched: 'Order Dispatched',
        shipped: 'Order Shipped',
        out_for_delivery: 'Out for Delivery',
        delivered: 'Order Delivered',
        cancelled: 'Order Cancelled',
        canceled: 'Order Cancelled',
        returned: 'Order Returned',
      };

      const normalizedStatus = String(status || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');

      const label =
        statusLabels[normalizedStatus] ||
        normalizedStatus
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());

      const statusEvent = {
        status: normalizedStatus,
        label,
        at: new Date().toISOString(),
        source: 'admin',
      };

      await updateDoc(docRef, {
        status: normalizedStatus,
        statusHistory: arrayUnion(statusEvent),
        updatedAt: serverTimestamp(),
      });

      return {
        id: orderId,
        status: normalizedStatus,
        statusEvent,
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
  // Update payment status
  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      const docRef = doc(db, 'orders', orderId);

      const normalizedStatus =
        normalizePaymentStatus(paymentStatus);

      const paymentStatusEvent = {
        status: normalizedStatus,
        label:
          PAYMENT_STATUS_LABELS[
          normalizedStatus
          ],
        at: new Date().toISOString(),
        source: 'admin',
      };

      await updateDoc(docRef, {
        paymentStatus: normalizedStatus,

        paymentStatusHistory: arrayUnion(
          paymentStatusEvent
        ),

        updatedAt: serverTimestamp(),
      });

      return {
        id: orderId,
        paymentStatus: normalizedStatus,
        paymentStatusEvent,
      };
    } catch (error) {
      console.error(
        'Error updating payment status:',
        error
      );

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

      const statusEvent = {
        status: 'cancelled',
        label: 'Order Cancelled',
        at: new Date().toISOString(),
        source: 'system',
      };

      await updateDoc(docRef, {
        status: 'cancelled',
        statusHistory: arrayUnion(statusEvent),
        updatedAt: serverTimestamp(),
      });

      return {
        id: orderId,
        status: 'cancelled',
        statusEvent,
      };
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },
};

export default ordersService;
