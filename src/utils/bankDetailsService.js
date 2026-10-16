import { db } from './firebase'
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

const COLLECTION_NAME = 'bankDetails'
const DEFAULT_DOC_ID = 'default'

const DEFAULT_BANK_DETAILS = {
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  branchCode: '',

  bankInstructions: '',
  codInstructions: '',

  codAdvancePercent: 50,

  isActive: false,

  updatedAt: null,
}

function cleanText(value) {
  return String(value ?? '').trim()
}

function normalizePercent(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return 0
  }

  return Math.min(
    100,
    Math.max(0, number)
  )
}

export function normalizeBankDetails(
  data = {}
) {
  return {
    bankName:
      cleanText(data.bankName),

    accountTitle:
      cleanText(data.accountTitle),

    accountNumber:
      cleanText(data.accountNumber),

    iban:
      cleanText(data.iban)
        .toUpperCase(),

    branchCode:
      cleanText(data.branchCode),

    bankInstructions:
      cleanText(
        data.bankInstructions
      ),

    codInstructions:
      cleanText(
        data.codInstructions
      ),

    codAdvancePercent:
      normalizePercent(
        data.codAdvancePercent ??
        DEFAULT_BANK_DETAILS
          .codAdvancePercent
      ),

    isActive:
      data.isActive === true,

    updatedAt:
      data.updatedAt || null,
  }
}

export const bankDetailsService = {
  async getBankDetails() {
    const docRef = doc(
      db,
      COLLECTION_NAME,
      DEFAULT_DOC_ID
    )

    const snapshot =
      await getDoc(docRef)

    if (!snapshot.exists()) {
      return {
        id: DEFAULT_DOC_ID,
        ...DEFAULT_BANK_DETAILS,
      }
    }

    return {
      id: snapshot.id,
      ...normalizeBankDetails(
        snapshot.data()
      ),
    }
  },

  async saveBankDetails(data) {
    const normalized =
      normalizeBankDetails(data)

    const payload = {
      ...normalized,
      updatedAt:
        new Date().toISOString(),
    }

    const docRef = doc(
      db,
      COLLECTION_NAME,
      DEFAULT_DOC_ID
    )

    await setDoc(
      docRef,
      payload,
      {
        merge: true,
      }
    )

    return {
      id: DEFAULT_DOC_ID,
      ...payload,
    }
  },
}

export default bankDetailsService