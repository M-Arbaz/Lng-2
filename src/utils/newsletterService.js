import { db } from './firebase';
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

const COLLECTION_NAME = 'newsletterSubscribers';

export const newsletterService = {
  getAllSubscribers: async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const subscribers = [];
      querySnapshot.forEach((docSnap) => {
        subscribers.push({ id: docSnap.id, ...docSnap.data() });
      });
      return subscribers;
    } catch (error) {
      console.error('Error getting subscribers:', error);
      throw error;
    }
  },

  subscribe: async (email) => {
    try {
      const payload = {
        email,
        status: 'active',
        createdAt: new Date().toISOString(),
        source: 'footer',
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error('Error subscribing:', error);
      throw error;
    }
  },

  updateSubscriber: async (id, data) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating subscriber:', error);
      throw error;
    }
  },

  deleteSubscriber: async (id) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { id };
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      throw error;
    }
  },
};

export default newsletterService;