import { db, storage } from './firebase';
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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const COLLECTION_NAME = 'customOrders';

export const customOrdersService = {
  getAllOrders: async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
      return orders;
    } catch (error) {
      console.error('Error getting custom orders:', error);
      throw error;
    }
  },

  getOrderById: async (id) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Custom order not found');
    } catch (error) {
      console.error('Error getting custom order:', error);
      throw error;
    }
  },

  createOrder: async (data) => {
    try {
      const payload = {
        ...data,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error('Error creating custom order:', error);
      throw error;
    }
  },

  updateOrder: async (id, data) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating custom order:', error);
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    return customOrdersService.updateOrder(id, { status });
  },

  deleteOrder: async (id) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { id };
    } catch (error) {
      console.error('Error deleting custom order:', error);
      throw error;
    }
  },

  uploadOrderImage: async (file) => {
    try {
      const storageRef = ref(storage, `customOrders/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading custom order file:', error);
      throw error;
    }
  },
};

export default customOrdersService;
