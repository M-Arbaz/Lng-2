import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const COLLECTION_NAME = 'bankDetails';
const DEFAULT_DOC_ID = 'default';

const defaultBankDetails = {
  bankName: 'Bank Alfalah',
  accountTitle: 'Lamp & Glow',
  accountNumber: '0051-1006789012',
  iban: 'PK95ALFH000511006789012',
  branchCode: '',
  codAdvancePercent: 50,
  isActive: true,
};

export const bankDetailsService = {
  // Get bank details (single document - singleton pattern)
  getBankDetails: async () => {
    try {
      const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      }
      // Return defaults if not yet created
      return {
        id: DEFAULT_DOC_ID,
        ...defaultBankDetails,
      };
    } catch (error) {
      console.error('Error getting bank details:', error);
      // Return defaults on error so checkout still works
      return {
        id: DEFAULT_DOC_ID,
        ...defaultBankDetails,
      };
    }
  },

  // Save/Update bank details
  saveBankDetails: async (data) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return {
        id: DEFAULT_DOC_ID,
        ...data,
      };
    } catch (error) {
      console.error('Error saving bank details:', error);
      throw error;
    }
  },
};

export default bankDetailsService;