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

const COLLECTION_NAME = 'contactSubmissions';

export const contactSubmissionsService = {
  getAllSubmissions: async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const submissions = [];
      querySnapshot.forEach((docSnap) => {
        submissions.push({ id: docSnap.id, ...docSnap.data() });
      });
      return submissions;
    } catch (error) {
      console.error('Error getting contact submissions:', error);
      throw error;
    }
  },

  getSubmissionById: async (id) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Submission not found');
    } catch (error) {
      console.error('Error getting submission:', error);
      throw error;
    }
  },

  createSubmission: async (data) => {
    try {
      const payload = {
        ...data,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  updateSubmission: async (id, data) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  },

  deleteSubmission: async (id) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { id };
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  },
};

export default contactSubmissionsService;
