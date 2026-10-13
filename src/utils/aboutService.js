import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const DOC_ID = 'aboutPage';
const COLLECTION = 'settings';

export const aboutService = {
  getAboutPage: async () => {
    try {
      const docRef = doc(db, COLLECTION, DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting about page:', error);
      throw error;
    }
  },

  updateAboutPage: async (data) => {
    try {
      const docRef = doc(db, COLLECTION, DOC_ID);
      const docSnap = await getDoc(docRef);
      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      if (docSnap.exists()) {
        await updateDoc(docRef, payload);
      } else {
        await setDoc(docRef, {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }
      return { id: DOC_ID, ...payload };
    } catch (error) {
      console.error('Error saving about page:', error);
      throw error;
    }
  },
};

export default aboutService;