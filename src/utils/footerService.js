import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

const FOOTER_CONFIG_DOC = 'footerConfig';
const FOOTER_LINKS_COLLECTION = 'footerLinks';

export const footerService = {
  // Get footer configuration (contact info, location)
  getFooterConfig: async () => {
    try {
      const docRef = doc(db, 'settings', FOOTER_CONFIG_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting footer config:', error);
      throw error;
    }
  },

  // Create or update footer configuration
  saveFooterConfig: async (config) => {
    try {
      const docRef = doc(db, 'settings', FOOTER_CONFIG_DOC);
      const docSnap = await getDoc(docRef);
      const payload = {
        ...config,
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
      return payload;
    } catch (error) {
      console.error('Error saving footer config:', error);
      throw error;
    }
  },

  // Get all footer links
  getAllFooterLinks: async () => {
    try {
      const q = query(collection(db, FOOTER_LINKS_COLLECTION), orderBy('displayOrder'));
      const querySnapshot = await getDocs(q);
      const links = [];
      querySnapshot.forEach((doc) => {
        links.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return links;
    } catch (error) {
      console.error('Error getting footer links:', error);
      throw error;
    }
  },

  // Get active footer links only (for frontend)
  getActiveFooterLinks: async () => {
    try {
      const q = query(collection(db, FOOTER_LINKS_COLLECTION), orderBy('displayOrder'));
      const querySnapshot = await getDocs(q);
      const links = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive !== false) {
          links.push({
            id: doc.id,
            ...data,
          });
        }
      });
      return links;
    } catch (error) {
      console.error('Error getting active footer links:', error);
      throw error;
    }
  },

  // Create footer link
  createFooterLink: async (linkData) => {
    try {
      const docRef = await addDoc(collection(db, FOOTER_LINKS_COLLECTION), {
        ...linkData,
        createdAt: new Date().toISOString(),
      });
      return {
        id: docRef.id,
        ...linkData,
      };
    } catch (error) {
      console.error('Error creating footer link:', error);
      throw error;
    }
  },

  // Update footer link
  updateFooterLink: async (id, linkData) => {
    try {
      const docRef = doc(db, FOOTER_LINKS_COLLECTION, id);
      await updateDoc(docRef, {
        ...linkData,
        updatedAt: new Date().toISOString(),
      });
      return {
        id,
        ...linkData,
      };
    } catch (error) {
      console.error('Error updating footer link:', error);
      throw error;
    }
  },

  // Delete footer link
  deleteFooterLink: async (id) => {
    try {
      await deleteDoc(doc(db, FOOTER_LINKS_COLLECTION, id));
      return { id };
    } catch (error) {
      console.error('Error deleting footer link:', error);
      throw error;
    }
  },
};

export default footerService;
