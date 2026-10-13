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
  where,
} from 'firebase/firestore';

export const onboardingService = {
  // Get all onboarding guides
  getAllGuides: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'onboardingGuides'));
      const guides = [];
      querySnapshot.forEach((doc) => {
        guides.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return guides.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    } catch (error) {
      console.error('Error getting onboarding guides:', error);
      throw error;
    }
  },

  // Get active guide for a specific module path
  getGuideByPath: async (modulePath) => {
    try {
      const q = query(
        collection(db, 'onboardingGuides'),
        where('modulePath', '==', modulePath),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting guide by path:', error);
      throw error;
    }
  },

  // Get guide by ID
  getGuideById: async (id) => {
    try {
      const docRef = doc(db, 'onboardingGuides', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Guide not found');
      }
    } catch (error) {
      console.error('Error getting guide:', error);
      throw error;
    }
  },

  // Create onboarding guide
  createGuide: async (guideData) => {
    try {
      const docRef = await addDoc(collection(db, 'onboardingGuides'), {
        ...guideData,
        createdAt: new Date().toISOString(),
      });
      return {
        id: docRef.id,
        ...guideData,
      };
    } catch (error) {
      console.error('Error creating onboarding guide:', error);
      throw error;
    }
  },

  // Update onboarding guide
  updateGuide: async (id, guideData) => {
    try {
      const docRef = doc(db, 'onboardingGuides', id);
      await updateDoc(docRef, {
        ...guideData,
        updatedAt: new Date().toISOString(),
      });
      return {
        id,
        ...guideData,
      };
    } catch (error) {
      console.error('Error updating onboarding guide:', error);
      throw error;
    }
  },

  // Delete onboarding guide
  deleteGuide: async (id) => {
    try {
      await deleteDoc(doc(db, 'onboardingGuides', id));
      return { id };
    } catch (error) {
      console.error('Error deleting onboarding guide:', error);
      throw error;
    }
  },
};

export default onboardingService;
