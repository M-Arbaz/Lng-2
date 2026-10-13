import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DOC_ID = 'default';

export const shippingPolicyService = {
  getPolicy: async () => {
    try {
      const docRef = doc(db, 'shippingPolicies', DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting shipping policy:', error);
      throw error;
    }
  },

  savePolicy: async (data) => {
    try {
      const docRef = doc(db, 'shippingPolicies', DOC_ID);
      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, payload, { merge: true });
      return { id: DOC_ID, ...payload };
    } catch (error) {
      console.error('Error saving shipping policy:', error);
      throw error;
    }
  },
};

export default shippingPolicyService;
