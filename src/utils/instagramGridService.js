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

export const instagramGridService = {
  getAllItems: async () => {
    try {
      const q = query(collection(db, 'instagramGrid'), orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (error) {
      console.error('Error getting Instagram grid items:', error);
      throw error;
    }
  },

  getActiveItems: async () => {
    try {
      const q = query(collection(db, 'instagramGrid'), orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive) {
          items.push({ id: doc.id, ...data });
        }
      });
      return items;
    } catch (error) {
      console.error('Error getting active Instagram grid items:', error);
      throw error;
    }
  },

  getItemById: async (id) => {
    try {
      const docRef = doc(db, 'instagramGrid', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Item not found');
    } catch (error) {
      console.error('Error getting Instagram grid item:', error);
      throw error;
    }
  },

  createItem: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'instagramGrid'), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating Instagram grid item:', error);
      throw error;
    }
  },

  updateItem: async (id, data) => {
    try {
      const docRef = doc(db, 'instagramGrid', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating Instagram grid item:', error);
      throw error;
    }
  },

  deleteItem: async (id) => {
    try {
      await deleteDoc(doc(db, 'instagramGrid', id));
      return { id };
    } catch (error) {
      console.error('Error deleting Instagram grid item:', error);
      throw error;
    }
  },

  uploadItemImage: async (file) => {
    try {
      const storageRef = ref(storage, `instagramGrid/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading Instagram grid image:', error);
      throw error;
    }
  },
};

export default instagramGridService;
