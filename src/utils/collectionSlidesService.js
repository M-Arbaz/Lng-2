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

export const collectionSlidesService = {
  getAllSlides: async () => {
    try {
      const q = query(collection(db, 'collectionSlides'), orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      const slides = [];
      querySnapshot.forEach((doc) => {
        slides.push({ id: doc.id, ...doc.data() });
      });
      return slides;
    } catch (error) {
      console.error('Error getting collection slides:', error);
      throw error;
    }
  },

  getActiveSlides: async () => {
    try {
      const q = query(collection(db, 'collectionSlides'), orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      const slides = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive) {
          slides.push({ id: doc.id, ...data });
        }
      });
      return slides;
    } catch (error) {
      console.error('Error getting active collection slides:', error);
      throw error;
    }
  },

  getSlideById: async (id) => {
    try {
      const docRef = doc(db, 'collectionSlides', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Slide not found');
    } catch (error) {
      console.error('Error getting collection slide:', error);
      throw error;
    }
  },

  createSlide: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'collectionSlides'), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating collection slide:', error);
      throw error;
    }
  },

  updateSlide: async (id, data) => {
    try {
      const docRef = doc(db, 'collectionSlides', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating collection slide:', error);
      throw error;
    }
  },

  deleteSlide: async (id) => {
    try {
      await deleteDoc(doc(db, 'collectionSlides', id));
      return { id };
    } catch (error) {
      console.error('Error deleting collection slide:', error);
      throw error;
    }
  },

  uploadSlideImage: async (file) => {
    try {
      const storageRef = ref(storage, `collectionSlides/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading collection slide image:', error);
      throw error;
    }
  },
};

export default collectionSlidesService;
