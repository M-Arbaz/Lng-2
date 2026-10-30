import { db } from './firebase'
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

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
  qrCodeImage: '',
  qrCodeInstructions: '',
  qrCodeEnabled: false,
  isActive: false,
}

function normalizeBankDetails(data = {}) {
  const rawAdvancePercent = Number(
    data.codAdvancePercent
  )

  const codAdvancePercent =
    Number.isFinite(rawAdvancePercent)
      ? Math.min(
        100,
        Math.max(0, rawAdvancePercent)
      )
      : 0

  return {
    bankName: String(
      data.bankName || ''
    ).trim(),

    accountTitle: String(
      data.accountTitle || ''
    ).trim(),

    accountNumber: String(
      data.accountNumber || ''
    ).trim(),

    iban: String(
      data.iban || ''
    ).trim(),

    branchCode: String(
      data.branchCode || ''
    ).trim(),

    // bankInstructions is kept only as
    // backward compatibility for older
    // Firestore data.
    bankTransferInstructions: String(
      data.bankTransferInstructions ||
      data.bankInstructions ||
      ''
    ).trim(),

    codInstructions: String(
      data.codInstructions || ''
    ).trim(),
    qrCodeImage: String(
      data.qrCodeImage || ''
    ).trim(),

    qrCodeInstructions: String(
      data.qrCodeInstructions || ''
    ).trim(),

    qrCodeEnabled:
      data.qrCodeEnabled === true,

    codAdvancePercent,

    isActive:
      data.isActive === true,
  }
}

export const bankDetailsService = {
  getBankDetails: async () => {
    try {
      const docRef = doc(
        db,
        COLLECTION_NAME,
        DEFAULT_DOC_ID
      )

      const docSnap =
        await getDoc(docRef)

      if (!docSnap.exists()) {
        return {
          id: DEFAULT_DOC_ID,
          ...emptyBankDetails,
        }
      }

      return {
        id: docSnap.id,
        ...normalizeBankDetails(
          docSnap.data()
        ),
      }
    } catch (error) {
      console.error(
        'Error getting bank details:',
        error
      )

      // Important:
      // Never expose fake/sample bank
      // information if Firestore fails.
      throw error
    }
  },

  saveBankDetails: async (data) => {
    try {
      const normalizedData =
        normalizeBankDetails(data)

      const docRef = doc(
        db,
        COLLECTION_NAME,
        DEFAULT_DOC_ID
      )

      await setDoc(
        docRef,
        {
          ...normalizedData,
          updatedAt:
            new Date().toISOString(),
        },
        {
          merge: true,
        }
      )

      return {
        id: DEFAULT_DOC_ID,
        ...normalizedData,
      }
    } catch (error) {
      console.error(
        'Error saving bank details:',
        error
      )

      throw error
    }
  },
}

export default bankDetailsService