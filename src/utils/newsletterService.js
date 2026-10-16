import { db } from './firebase'

import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore'

const COLLECTION_NAME =
  'newsletterSubscribers'

const VALID_STATUSES = [
  'active',
  'inactive',
]

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  )
}

function validateId(id) {
  if (
    typeof id !== 'string' ||
    !id.trim()
  ) {
    throw new Error(
      'Valid subscriber ID is required'
    )
  }

  return id.trim()
}

function normalizeSubscriber(
  docSnap
) {
  return {
    ...docSnap.data(),

    /*
     * Firestore document ID
     * always wins over any
     * legacy stored id field.
     */
    id: docSnap.id,
  }
}

function getDateValue(value) {
  if (!value) {
    return 0
  }

  if (
    typeof value?.toDate ===
    'function'
  ) {
    return value
      .toDate()
      .getTime()
  }

  const time =
    new Date(value).getTime()

  return Number.isNaN(time)
    ? 0
    : time
}

export const newsletterService = {
  getAllSubscribers:
    async () => {
      try {
        /*
         * Primary query:
         * newest subscriber first.
         */
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

          const snapshot =
            await getDocs(q)

          return snapshot.docs.map(
            normalizeSubscriber
          )
        } catch (
        orderedQueryError
        ) {
          /*
           * Legacy records may not
           * contain createdAt.
           *
           * Fall back to loading all
           * subscribers and sort them
           * safely on the client.
           */
          console.warn(
            'Newsletter ordered query failed. Using fallback:',
            orderedQueryError
          )

          const snapshot =
            await getDocs(
              collection(
                db,
                COLLECTION_NAME
              )
            )

          return snapshot.docs
            .map(
              normalizeSubscriber
            )
            .sort(
              (a, b) =>
                getDateValue(
                  b.createdAt
                ) -
                getDateValue(
                  a.createdAt
                )
            )
        }
      } catch (error) {
        console.error(
          'Error getting newsletter subscribers:',
          error
        )

        throw error
      }
    },

  /*
   * Subscribe customer.
   *
   * Same email will NOT create
   * duplicate Firestore documents.
   *
   * If an inactive subscriber
   * subscribes again, they are
   * reactivated.
   */
  subscribe: async (
    email,
    source = 'footer'
  ) => {
    try {
      const cleanEmail =
        normalizeEmail(email)

      if (!cleanEmail) {
        throw new Error(
          'Email address is required'
        )
      }

      if (
        !isValidEmail(
          cleanEmail
        )
      ) {
        throw new Error(
          'Please enter a valid email address'
        )
      }

      const subscribersRef =
        collection(
          db,
          COLLECTION_NAME
        )

      const existingQuery =
        query(
          subscribersRef,

          where(
            'email',
            '==',
            cleanEmail
          ),

          limit(1)
        )

      const existingSnapshot =
        await getDocs(
          existingQuery
        )

      const now =
        new Date().toISOString()

      /*
       * Existing subscriber found.
       */
      if (
        !existingSnapshot.empty
      ) {
        const existingDoc =
          existingSnapshot.docs[0]

        const existingData =
          existingDoc.data()

        const alreadyActive =
          existingData.status !==
          'inactive'

        const payload = {
          email: cleanEmail,

          status: 'active',

          updatedAt: now,

          lastSubscribedAt: now,

          lastSource:
            String(
              source ||
              'footer'
            ).trim(),
        }

        await updateDoc(
          doc(
            db,
            COLLECTION_NAME,
            existingDoc.id
          ),
          payload
        )

        return {
          ...existingData,
          ...payload,

          id:
            existingDoc.id,

          alreadySubscribed:
            alreadyActive,

          reactivated:
            !alreadyActive,
        }
      }

      /*
       * Brand new subscriber.
       */
      const payload = {
        email: cleanEmail,

        status: 'active',

        source:
          String(
            source ||
            'footer'
          ).trim(),

        createdAt: now,

        updatedAt: now,

        lastSubscribedAt: now,
      }

      const docRef =
        await addDoc(
          subscribersRef,
          payload
        )

      return {
        ...payload,

        id: docRef.id,

        alreadySubscribed:
          false,

        reactivated:
          false,
      }
    } catch (error) {
      console.error(
        'Newsletter subscription failed:',
        error
      )

      throw error
    }
  },

  updateSubscriber:
    async (
      id,
      data
    ) => {
      try {
        const cleanId =
          validateId(id)

        const payload = {
          ...data,
        }

        if (
          payload.email !==
          undefined
        ) {
          const email =
            normalizeEmail(
              payload.email
            )

          if (
            !isValidEmail(
              email
            )
          ) {
            throw new Error(
              'Please enter a valid email address'
            )
          }

          payload.email =
            email
        }

        if (
          payload.status !==
          undefined &&
          !VALID_STATUSES.includes(
            payload.status
          )
        ) {
          throw new Error(
            'Invalid subscriber status'
          )
        }

        payload.updatedAt =
          new Date().toISOString()

        await updateDoc(
          doc(
            db,
            COLLECTION_NAME,
            cleanId
          ),
          payload
        )

        return {
          ...payload,
          id: cleanId,
        }
      } catch (error) {
        console.error(
          'Error updating newsletter subscriber:',
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
        'Invalid subscriber status'
      )
    }

    return newsletterService.updateSubscriber(
      id,
      {
        status,
      }
    )
  },

  deleteSubscriber:
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
          'Error deleting newsletter subscriber:',
          error
        )

        throw error
      }
    },
}

export {
  normalizeEmail,
}

export default newsletterService