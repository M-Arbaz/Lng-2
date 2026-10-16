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

import {
  uploadToXcdn,
} from './xcdnUpload'

const COLLECTION_NAME =
  'websitePopups'

export const WEBSITE_POPUP_DEFAULTS = {
  title: '',
  description: '',
  bannerImage: '',
  buttonText: 'Learn More',
  buttonUrl: '',
  isActive: true,
  displayDelay: 2,
  startDate: null,
  endDate: null,
  showOncePerSession: true,
}

function validateId(id) {
  if (
    typeof id !== 'string' ||
    !id.trim()
  ) {
    throw new Error(
      'Valid popup ID is required'
    )
  }

  return id.trim()
}

function normalizeDate(value) {
  if (!value) {
    return null
  }

  if (
    typeof value?.toDate ===
    'function'
  ) {
    return value
      .toDate()
      .toISOString()
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null
  }

  return date.toISOString()
}

export function normalizeWebsitePopup(
  data = {}
) {
  return {
    ...WEBSITE_POPUP_DEFAULTS,
    ...data,

    title:
      String(
        data.title || ''
      ).trim(),

    description:
      String(
        data.description || ''
      ).trim(),

    bannerImage:
      String(
        data.bannerImage || ''
      ).trim(),

    buttonText:
      String(
        data.buttonText ?? 'Learn More'
      ).trim(),

    buttonUrl:
      String(
        data.buttonUrl || ''
      ).trim(),

    isActive:
      data.isActive !== false,

    displayDelay:
      Math.min(
        120,
        Math.max(
          0,
          Number(
            data.displayDelay
          ) || 0
        )
      ),

    startDate:
      normalizeDate(
        data.startDate
      ),

    endDate:
      normalizeDate(
        data.endDate
      ),

    showOncePerSession:
      data.showOncePerSession !==
      false,
  }
}

function normalizeSnapshot(
  docSnap
) {
  return {
    ...normalizeWebsitePopup(
      docSnap.data()
    ),

    /*
     * Actual Firestore document ID
     * must always win over any
     * legacy stored "id" field.
     */
    id: docSnap.id,
  }
}

function getDateTime(value) {
  if (!value) {
    return null
  }

  const date =
    new Date(value)

  const time =
    date.getTime()

  return Number.isNaN(time)
    ? null
    : time
}

export function getWebsitePopupState(
  popup,
  nowValue = Date.now()
) {
  const data =
    normalizeWebsitePopup(
      popup
    )

  if (
    data.isActive === false
  ) {
    return {
      key: 'inactive',
      label: 'Inactive',
    }
  }

  const startTime =
    getDateTime(
      data.startDate
    )

  const endTime =
    getDateTime(
      data.endDate
    )

  if (
    startTime &&
    nowValue < startTime
  ) {
    return {
      key: 'scheduled',
      label: 'Scheduled',
    }
  }

  if (
    endTime &&
    nowValue > endTime
  ) {
    return {
      key: 'expired',
      label: 'Expired',
    }
  }

  return {
    key: 'live',
    label: 'Live',
  }
}

export function isWebsitePopupLive(
  popup,
  nowValue = Date.now()
) {
  return (
    getWebsitePopupState(
      popup,
      nowValue
    ).key === 'live'
  )
}

function sortPopups(
  popups
) {
  return [
    ...popups,
  ].sort((a, b) => {
    const first =
      getDateTime(
        a.createdAt
      ) || 0

    const second =
      getDateTime(
        b.createdAt
      ) || 0

    return (
      second - first
    )
  })
}

export const websitePopupsService = {
  getAllPopups:
    async () => {
      try {
        /*
         * Normal newest-first query.
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
            normalizeSnapshot
          )
        } catch (
        orderedQueryError
        ) {
          /*
           * Legacy popup documents
           * without createdAt should
           * still remain manageable.
           */
          console.warn(
            'Ordered popup query failed. Using fallback:',
            orderedQueryError
          )

          const snapshot =
            await getDocs(
              collection(
                db,
                COLLECTION_NAME
              )
            )

          return sortPopups(
            snapshot.docs.map(
              normalizeSnapshot
            )
          )
        }
      } catch (error) {
        console.error(
          'Error getting website popups:',
          error
        )

        throw error
      }
    },

  getActivePopups:
    async () => {
      try {
        const popups =
          await websitePopupsService.getAllPopups()

        const now =
          Date.now()

        return popups.filter(
          (popup) =>
            isWebsitePopupLive(
              popup,
              now
            )
        )
      } catch (error) {
        console.error(
          'Error getting active website popups:',
          error
        )

        throw error
      }
    },

  getPopupById:
    async (id) => {
      try {
        const cleanId =
          validateId(id)

        const docSnap =
          await getDoc(
            doc(
              db,
              COLLECTION_NAME,
              cleanId
            )
          )

        if (
          !docSnap.exists()
        ) {
          throw new Error(
            'Popup not found'
          )
        }

        return normalizeSnapshot(
          docSnap
        )
      } catch (error) {
        console.error(
          'Error getting website popup:',
          error
        )

        throw error
      }
    },

  createPopup:
    async (popupData) => {
      try {
        const data =
          normalizeWebsitePopup(
            popupData
          )

        if (!data.title) {
          throw new Error(
            'Popup title is required'
          )
        }

        if (
          data.startDate &&
          data.endDate &&
          new Date(
            data.startDate
          ).getTime() >=
          new Date(
            data.endDate
          ).getTime()
        ) {
          throw new Error(
            'End date must be after start date'
          )
        }

        const now =
          new Date().toISOString()

        const payload = {
          ...data,
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
          'Error creating website popup:',
          error
        )

        throw error
      }
    },

  updatePopup:
    async (
      id,
      popupData
    ) => {
      try {
        const cleanId =
          validateId(id)

        const data =
          normalizeWebsitePopup(
            popupData
          )

        if (!data.title) {
          throw new Error(
            'Popup title is required'
          )
        }

        if (
          data.startDate &&
          data.endDate &&
          new Date(
            data.startDate
          ).getTime() >=
          new Date(
            data.endDate
          ).getTime()
        ) {
          throw new Error(
            'End date must be after start date'
          )
        }

        /*
         * Do not write document id or
         * old createdAt back into data.
         */
        const {
          id: ignoredId,
          createdAt,
          updatedAt,
          ...editableData
        } = data

        const newUpdatedAt =
          new Date().toISOString()

        await updateDoc(
          doc(
            db,
            COLLECTION_NAME,
            cleanId
          ),
          {
            ...editableData,
            updatedAt:
              newUpdatedAt,
          }
        )

        return {
          ...editableData,
          id: cleanId,
          updatedAt:
            newUpdatedAt,
        }
      } catch (error) {
        console.error(
          'Error updating website popup:',
          error
        )

        throw error
      }
    },

  deletePopup:
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
          'Error deleting website popup:',
          error
        )

        throw error
      }
    },

  uploadPopupImage:
    async (file) => {
      try {
        if (!file) {
          throw new Error(
            'No image selected'
          )
        }

        if (
          !String(
            file.type || ''
          ).startsWith(
            'image/'
          )
        ) {
          throw new Error(
            'Please select a valid image file'
          )
        }

        return await uploadToXcdn(
          file,
          'websitePopups'
        )
      } catch (error) {
        console.error(
          'Popup image upload failed:',
          error
        )

        throw error
      }
    },
}

export default websitePopupsService