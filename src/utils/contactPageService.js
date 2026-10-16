import { db } from './firebase'

import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore'

const DOC_ID =
  'contactPage'

const COLLECTION =
  'settings'

export const CONTACT_PAGE_DEFAULTS = {
  pageTitle:
    'Contact Us',

  subtitle:
    'Get in Touch',

  description:
    'Have a question about an order, a product, or a custom request? Send us a message and our team will get back to you as soon as possible.',

  formTitle:
    'Send a Message',

  formSubtitle:
    "Fill in the form and we'll respond as soon as possible.",

  submitButtonText:
    'Send Message',

  formNote:
    'Your message will be sent directly to the Lamp & Glow support team.',

  successMessage:
    'Thank you. Your message has been sent successfully.',

  supportTitle:
    'Lamp & Glow Support',

  supportSubtitle:
    "We're here to help.",

  liveHelpTitle:
    'WhatsApp Support',

  liveHelpText:
    'Need quick help? Chat with our team on WhatsApp for product, order or general support.',

  showLiveHelp: true,

  whatsappButtonText:
    'Message Us',

  whatsappLink:
    'https://wa.me/3020521000',

  phoneText:
    '(302)-052-1000',

  email:
    'support@lampandglow.com',

  address:
    'Hameed Ullah Mokal Colony, Sahiwal',

  showOpeningHours: true,

  openingHours:
    'MON to SAT: 9:00AM - 10:00PM\nSUN: 10:00AM - 6:00PM',
}

export function normalizeContactPage(
  data = {}
) {
  return {
    ...CONTACT_PAGE_DEFAULTS,
    ...data,

    showLiveHelp:
      data.showLiveHelp !== false,

    showOpeningHours:
      data.showOpeningHours !== false,
  }
}

export const contactPageService = {
  getContactPage: async () => {
    try {
      const docRef =
        doc(
          db,
          COLLECTION,
          DOC_ID
        )

      const docSnap =
        await getDoc(docRef)

      if (!docSnap.exists()) {
        return normalizeContactPage()
      }

      return normalizeContactPage(
        docSnap.data()
      )
    } catch (error) {
      console.error(
        'Error getting contact page:',
        error
      )

      throw error
    }
  },

  /*
   * Customer Contact page receives
   * Admin changes in real time.
   */
  subscribeContactPage: (
    callback,
    onError
  ) => {
    const docRef =
      doc(
        db,
        COLLECTION,
        DOC_ID
      )

    return onSnapshot(
      docRef,

      (snapshot) => {
        const data =
          snapshot.exists()
            ? snapshot.data()
            : {}

        callback(
          normalizeContactPage(
            data
          )
        )
      },

      (error) => {
        console.error(
          'Contact page subscription failed:',
          error
        )

        if (onError) {
          onError(error)
        }
      }
    )
  },

  updateContactPage:
    async (data) => {
      try {
        const docRef =
          doc(
            db,
            COLLECTION,
            DOC_ID
          )

        const docSnap =
          await getDoc(docRef)

        /*
         * Never store UI/helper metadata
         * as part of the settings doc.
         */
        const {
          id,
          createdAt,
          updatedAt,
          ...editableData
        } = data || {}

        const normalized =
          normalizeContactPage(
            editableData
          )

        const now =
          new Date().toISOString()

        const payload = {
          ...normalized,
          updatedAt: now,
        }

        if (!docSnap.exists()) {
          payload.createdAt =
            now
        }

        await setDoc(
          docRef,
          payload,
          {
            merge: true,
          }
        )

        return payload
      } catch (error) {
        console.error(
          'Error saving contact page:',
          error
        )

        throw error
      }
    },
}

export default contactPageService