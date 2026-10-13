import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';

function isAnnouncementActive(ann) {
  if (!ann.isActive) return false;
  const now = new Date();
  if (ann.startDate) {
    const start = new Date(ann.startDate);
    if (now < start) return false;
  }
  if (ann.endDate) {
    const end = new Date(ann.endDate);
    if (now > end) return false;
  }
  return true;
}

export const announcementService = {
  getAllAnnouncements: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'announcements'));
      const announcements = [];
      querySnapshot.forEach((doc) => {
        announcements.push({ id: doc.id, ...doc.data() });
      });
      announcements.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      return announcements;
    } catch (error) {
      console.error('Error getting announcements:', error);
      throw error;
    }
  },

  getActiveAnnouncements: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'announcements'));
      const announcements = [];
      querySnapshot.forEach((doc) => {
        announcements.push({ id: doc.id, ...doc.data() });
      });
      return announcements.filter(isAnnouncementActive).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    } catch (error) {
      console.error('Error getting active announcements:', error);
      throw error;
    }
  },

  getActiveAnnouncement: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'announcements'));
      const announcements = [];
      querySnapshot.forEach((doc) => {
        announcements.push({ id: doc.id, ...doc.data() });
      });
      const active = announcements.filter(isAnnouncementActive).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      return active.length > 0 ? active[0] : null;
    } catch (error) {
      console.error('Error getting active announcement:', error);
      throw error;
    }
  },

  getAnnouncementBarEnabled: async () => {
    try {
      const docRef = doc(db, 'settings', 'announcementBar');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().enabled !== false;
      }
      return true;
    } catch (error) {
      console.error('Error getting announcement bar setting:', error);
      return true;
    }
  },

  setAnnouncementBarEnabled: async (enabled) => {
    try {
      const docRef = doc(db, 'settings', 'announcementBar');
      await setDoc(docRef, { enabled, updatedAt: new Date().toISOString() }, { merge: true });
      return { enabled };
    } catch (error) {
      console.error('Error setting announcement bar setting:', error);
      throw error;
    }
  },

  getAnnouncementById: async (id) => {
    try {
      const docRef = doc(db, 'announcements', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Announcement not found');
    } catch (error) {
      console.error('Error getting announcement:', error);
      throw error;
    }
  },

  createAnnouncement: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'announcements'), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  updateAnnouncement: async (id, data) => {
    try {
      const docRef = doc(db, 'announcements', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  deleteAnnouncement: async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      return { id };
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },
};

export default announcementService;
