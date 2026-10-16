import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const COLLECTION_NAME = 'bankDetails'
const DEFAULT_DOC_ID = 'default'

const emptyBankDetails = {
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  branchCode: '',
  bankTransferInstructions: '',
  codInstructions: '',
  codAdvancePercent: 0,
  isActive: false,
}

function normalizeBankDetails(data = {}) {
  const rawAdvancePercent = Number(data.codAdvancePercent)
  const codAdvancePercent = Number.isFinite(rawAdvancePercent)
    ? Math.min(100, Math.max(0, rawAdvancePercent))
    : 0

  return {
    ...emptyBankDetails,
    ...data,
    bankName: String(data.bankName || '').trim(),
    accountTitle: String(data.accountTitle || '').trim(),
    accountNumber: String(data.accountNumber || '').trim(),
    iban: String(data.iban || '').trim(),
    branchCode: String(data.branchCode || '').trim(),
    bankTransferInstructions: String(
      data.bankTransferInstructions || ''
    ).trim(),
    codInstructions: String(data.codInstructions || '').trim(),
    codAdvancePercent,
    isActive: data.isActive === true,
  }
}

export const bankDetailsService = {
  // Singleton bank-details configuration.
  getBankDetails: async () => {
    try {
      const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return {
          id: DEFAULT_DOC_ID,
          ...emptyBankDetails,
        }
      }

      return {
        id: docSnap.id,
        ...normalizeBankDetails(docSnap.data()),
      }
    } catch (error) {
      console.error('Error getting bank details:', error)

      // Do not expose fake/sample bank information when Firestore fails.
      throw error
    }
  },

  saveBankDetails: async (data) => {
    try {
      const normalizedData = normalizeBankDetails(data)
      const docRef = doc(db, COLLECTION_NAME, DEFAULT_DOC_ID)

      await setDoc(
        docRef,
        {
          ...normalizedData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )

      return {
        id: DEFAULT_DOC_ID,
        ...normalizedData,
      }
    } catch (error) {
      console.error('Error saving bank details:', error)
      throw error
    }
  },
}

export default bankDetailsService

