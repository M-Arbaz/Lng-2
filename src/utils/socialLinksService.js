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

export const socialLinksService = {
  // Get all social links
  getAllSocialLinks: async () => {
    try {
      const q = query(collection(db, 'socialLinks'), orderBy('displayOrder'));
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
      console.error('Error getting social links:', error);
      throw error;
    }
  },

  // Get active social links only (for frontend)
  getActiveSocialLinks: async () => {
    try {
      const q = query(collection(db, 'socialLinks'), orderBy('displayOrder'));
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
      console.error('Error getting active social links:', error);
      throw error;
    }
  },

  // Get social link by ID
  getSocialLinkById: async (id) => {
    try {
      const docRef = doc(db, 'socialLinks', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Social link not found');
      }
    } catch (error) {
      console.error('Error getting social link:', error);
      throw error;
    }
  },

  // Create social link
  createSocialLink: async (linkData) => {
    try {
      const docRef = await addDoc(collection(db, 'socialLinks'), {
        ...linkData,
        createdAt: new Date().toISOString(),
      });
      return {
        id: docRef.id,
        ...linkData,
      };
    } catch (error) {
      console.error('Error creating social link:', error);
      throw error;
    }
  },

  // Update social link
  updateSocialLink: async (id, linkData) => {
    try {
      const docRef = doc(db, 'socialLinks', id);
      await updateDoc(docRef, {
        ...linkData,
        updatedAt: new Date().toISOString(),
      });
      return {
        id,
        ...linkData,
      };
    } catch (error) {
      console.error('Error updating social link:', error);
      throw error;
    }
  },

  // Delete social link
  deleteSocialLink: async (id) => {
    try {
      await deleteDoc(doc(db, 'socialLinks', id));
      return { id };
    } catch (error) {
      console.error('Error deleting social link:', error);
      throw error;
    }
  },
};

export default socialLinksService;
