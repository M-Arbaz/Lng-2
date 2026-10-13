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

export const websitePopupsService = {
  getAllPopups: async () => {
    try {
      const q = query(collection(db, 'websitePopups'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const popups = [];
      querySnapshot.forEach((doc) => {
        popups.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return popups;
    } catch (error) {
      console.error('Error getting website popups:', error);
      throw error;
    }
  },

  getActivePopups: async () => {
    try {
      const q = query(collection(db, 'websitePopups'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const now = new Date().toISOString();
      const popups = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive) {
          const withinSchedule =
            (!data.startDate || data.startDate <= now) &&
            (!data.endDate || data.endDate >= now);
          if (withinSchedule) {
            popups.push({ id: doc.id, ...data });
          }
        }
      });
      return popups;
    } catch (error) {
      console.error('Error getting active popups:', error);
      throw error;
    }
  },

  getPopupById: async (id) => {
    try {
      const docRef = doc(db, 'websitePopups', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Popup not found');
    } catch (error) {
      console.error('Error getting popup:', error);
      throw error;
    }
  },

  createPopup: async (popupData) => {
    try {
      const docRef = await addDoc(collection(db, 'websitePopups'), {
        ...popupData,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...popupData };
    } catch (error) {
      console.error('Error creating popup:', error);
      throw error;
    }
  },

  updatePopup: async (id, popupData) => {
    try {
      const docRef = doc(db, 'websitePopups', id);
      await updateDoc(docRef, {
        ...popupData,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...popupData };
    } catch (error) {
      console.error('Error updating popup:', error);
      throw error;
    }
  },

  deletePopup: async (id) => {
    try {
      await deleteDoc(doc(db, 'websitePopups', id));
      return { id };
    } catch (error) {
      console.error('Error deleting popup:', error);
      throw error;
    }
  },

  uploadPopupImage: async (file) => {
    try {
      const storageRef = ref(storage, `websitePopups/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading popup image:', error);
      throw error;
    }
  },
};

export default websitePopupsService;
