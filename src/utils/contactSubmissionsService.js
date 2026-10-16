import { db } from './firebase'

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
} from 'firebase/firestore'

const COLLECTION_NAME =
  'contactSubmissions'

const VALID_STATUSES = [
  'new',
  'read',
  'replied',
]

function normalizeSubmission(
  docSnap
) {
  return {
    ...docSnap.data(),

    /*
     * Actual Firestore document ID
     * must always win over any legacy
     * stored id field.
     */
    id: docSnap.id,
  }
}

function validateId(id) {
  if (
    typeof id !== 'string' ||
    !id.trim()
  ) {
    throw new Error(
      'Valid contact submission ID is required'
    )
  }

  return id.trim()
}

export const contactSubmissionsService = {
  getAllSubmissions:
    async () => {
      try {
        const q = query(
          collection(
            db,
            COLLECTION_NAME
          ),

          orderBy(
            'createdAt',
            'desc'
          )
        )

        const querySnapshot =
          await getDocs(q)

        return querySnapshot.docs.map(
          normalizeSubmission
        )
      } catch (error) {
        console.error(
          'Error getting contact submissions:',
          error
        )

        throw error
      }
    },

  getSubmissionById:
    async (id) => {
      try {
        const cleanId =
          validateId(id)

        const docRef = doc(
          db,
          COLLECTION_NAME,
          cleanId
        )

        const docSnap =
          await getDoc(docRef)

        if (!docSnap.exists()) {
          throw new Error(
            'Contact submission not found'
          )
        }

        return normalizeSubmission(
          docSnap
        )
      } catch (error) {
        console.error(
          'Error getting contact submission:',
          error
        )

        throw error
      }
    },

  createSubmission:
    async (data) => {
      try {
        const name =
          String(
            data?.name || ''
          ).trim()

        const email =
          String(
            data?.email || ''
          )
            .trim()
            .toLowerCase()

        const phone =
          String(
            data?.phone || ''
          ).trim()

        /*
         * Support both old "comment"
         * schema and a possible
         * "message" field.
         */
        const comment =
          String(
            data?.comment ||
            data?.message ||
            ''
          ).trim()

        if (!name) {
          throw new Error(
            'Name is required'
          )
        }

        if (!email) {
          throw new Error(
            'Email is required'
          )
        }

        if (!comment) {
          throw new Error(
            'Message is required'
          )
        }

        const now =
          new Date().toISOString()

        const payload = {
          name,
          email,
          phone,
          comment,

          status: 'new',

          source:
            String(
              data?.source ||
              'contact-page'
            ).trim(),

          createdAt: now,
          updatedAt: now,
        }

        const docRef =
          await addDoc(
            collection(
              db,
              COLLECTION_NAME
            ),
            payload
          )

        return {
          ...payload,
          id: docRef.id,
        }
      } catch (error) {
        console.error(
          'Error creating contact submission:',
          error
        )

        throw error
      }
    },

  updateSubmission:
    async (
      id,
      data
    ) => {
      try {
        const cleanId =
          validateId(id)

        const payload = {
          ...data,

          updatedAt:
            new Date().toISOString(),
        }

        if (
          payload.status &&
          !VALID_STATUSES.includes(
            payload.status
          )
        ) {
          throw new Error(
            'Invalid contact submission status'
          )
        }

        await updateDoc(
          doc(
            db,
            COLLECTION_NAME,
            cleanId
          ),
          payload
        )

        return {
          id: cleanId,
          ...payload,
        }
      } catch (error) {
        console.error(
          'Error updating contact submission:',
          error
        )

        throw error
      }
    },

  updateStatus: async (
    id,
    status
  ) => {
    if (
      !VALID_STATUSES.includes(
        status
      )
    ) {
      throw new Error(
        'Invalid contact submission status'
      )
    }

    return contactSubmissionsService.updateSubmission(
      id,
      {
        status,
      }
    )
  },

  deleteSubmission:
    async (id) => {
      try {
        const cleanId =
          validateId(id)

        await deleteDoc(
          doc(
            db,
            COLLECTION_NAME,
            cleanId
          )
        )

        return {
          id: cleanId,
        }
      } catch (error) {
        console.error(
          'Error deleting contact submission:',
          error
        )

        throw error
      }
    },
}

export default contactSubmissionsService