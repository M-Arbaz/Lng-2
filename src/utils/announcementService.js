import { db } from './firebase'

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore'

const COLLECTION_NAME =
  'announcements'

const SETTINGS_COLLECTION =
  'settings'

const SETTINGS_DOC =
  'announcementBar'

export const ANNOUNCEMENT_DEFAULTS = {
  message: '',
  isActive: true,
  displayStyle: 'marquee',
  bgColor: '#3A2117',
  textColor: '#FFFEFC',
  scrollSpeed: 20,
  startDate: null,
  endDate: null,
  displayOrder: 0,
}

function validateId(id) {
  if (
    typeof id !== 'string' ||
    !id.trim()
  ) {
    throw new Error(
      'Valid announcement ID is required'
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

export function normalizeAnnouncement(
  data = {}
) {
  return {
    ...ANNOUNCEMENT_DEFAULTS,
    ...data,

    isActive:
      data.isActive !== false,

    displayStyle:
      data.displayStyle ===
        'static'
        ? 'static'
        : 'marquee',

    bgColor:
      data.bgColor ||
      ANNOUNCEMENT_DEFAULTS.bgColor,

    textColor:
      data.textColor ||
      ANNOUNCEMENT_DEFAULTS.textColor,

    scrollSpeed:
      Math.min(
        60,
        Math.max(
          5,
          Number(
            data.scrollSpeed
          ) || 20
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

    displayOrder:
      Number.isFinite(
        Number(
          data.displayOrder
        )
      )
        ? Number(
          data.displayOrder
        )
        : 0,
  }
}

function normalizeSnapshot(
  docSnap
) {
  return {
    ...normalizeAnnouncement(
      docSnap.data()
    ),

    /*
     * Firestore document ID
     * must always win.
     */
    id: docSnap.id,
  }
}

function getTime(value) {
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

export function getAnnouncementState(
  announcement,
  nowValue = Date.now()
) {
  const announcementData =
    normalizeAnnouncement(
      announcement
    )

  if (
    announcementData.isActive ===
    false
  ) {
    return {
      key: 'inactive',
      label: 'Inactive',
    }
  }

  const start =
    getTime(
      announcementData.startDate
    )

  const end =
    getTime(
      announcementData.endDate
    )

  if (
    start &&
    nowValue < start
  ) {
    return {
      key: 'scheduled',
      label: 'Scheduled',
    }
  }

  if (
    end &&
    nowValue > end
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

export function isAnnouncementActive(
  announcement,
  nowValue = Date.now()
) {
  return (
    getAnnouncementState(
      announcement,
      nowValue
    ).key === 'live'
  )
}

function sortAnnouncements(
  announcements
) {
  return [
    ...announcements,
  ].sort((a, b) => {
    const orderA =
      Number(
        a.displayOrder
      ) || 0

    const orderB =
      Number(
        b.displayOrder
      ) || 0

    if (
      orderA !== orderB
    ) {
      return (
        orderA -
        orderB
      )
    }

    const createdA =
      getTime(
        a.createdAt
      ) || 0

    const createdB =
      getTime(
        b.createdAt
      ) || 0

    return (
      createdA -
      createdB
    )
  })
}

export const announcementService = {
  getAllAnnouncements:
    async () => {
      try {
        const snapshot =
          await getDocs(
            collection(
              db,
              COLLECTION_NAME
            )
          )

        const announcements =
          snapshot.docs.map(
            normalizeSnapshot
          )

        return sortAnnouncements(
          announcements
        )
      } catch (error) {
        console.error(
          'Error getting announcements:',
          error
        )

        throw error
      }
    },

  getActiveAnnouncements:
    async () => {
      try {
        const announcements =
          await announcementService.getAllAnnouncements()

        const now =
          Date.now()

        return announcements.filter(
          (announcement) =>
            isAnnouncementActive(
              announcement,
              now
            )
        )
      } catch (error) {
        console.error(
          'Error getting active announcements:',
          error
        )

        throw error
      }
    },

  getActiveAnnouncement:
    async () => {
      const announcements =
        await announcementService.getActiveAnnouncements()

      return (
        announcements[0] ||
        null
      )
    },

  getAnnouncementBarEnabled:
    async () => {
      try {
        const docRef =
          doc(
            db,
            SETTINGS_COLLECTION,
            SETTINGS_DOC
          )

        const docSnap =
          await getDoc(docRef)

        if (
          !docSnap.exists()
        ) {
          return true
        }

        return (
          docSnap.data()
            .enabled !== false
        )
      } catch (error) {
        console.error(
          'Error getting announcement bar setting:',
          error
        )

        /*
         * Keep storefront usable if
         * settings read fails.
         */
        return true
      }
    },

  setAnnouncementBarEnabled:
    async (enabled) => {
      try {
        const value =
          Boolean(enabled)

        const updatedAt =
          new Date().toISOString()

        await setDoc(
          doc(
            db,
            SETTINGS_COLLECTION,
            SETTINGS_DOC
          ),
          {
            enabled: value,
            updatedAt,
          },
          {
            merge: true,
          }
        )

        return {
          enabled: value,
          updatedAt,
        }
      } catch (error) {
        console.error(
          'Error setting announcement bar:',
          error
        )

        throw error
      }
    },

  getAnnouncementById:
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
            'Announcement not found'
          )
        }

        return normalizeSnapshot(
          docSnap
        )
      } catch (error) {
        console.error(
          'Error getting announcement:',
          error
        )

        throw error
      }
    },

  createAnnouncement:
    async (data) => {
      try {
        const message =
          String(
            data?.message || ''
          ).trim()

        if (!message) {
          throw new Error(
            'Announcement message is required'
          )
        }

        const startDate =
          normalizeDate(
            data?.startDate
          )

        const endDate =
          normalizeDate(
            data?.endDate
          )

        if (
          startDate &&
          endDate &&
          new Date(
            startDate
          ).getTime() >=
          new Date(
            endDate
          ).getTime()
        ) {
          throw new Error(
            'End date must be after start date'
          )
        }

        const existing =
          await announcementService.getAllAnnouncements()

        const nextOrder =
          existing.length === 0
            ? 0
            : Math.max(
              ...existing.map(
                (item) =>
                  Number(
                    item.displayOrder
                  ) || 0
              )
            ) + 1

        const now =
          new Date().toISOString()

        const payload =
          normalizeAnnouncement({
            ...data,

            message,

            startDate,

            endDate,

            displayOrder:
              nextOrder,
          })

        const finalPayload = {
          ...payload,
          createdAt: now,
          updatedAt: now,
        }

        const docRef =
          await addDoc(
            collection(
              db,
              COLLECTION_NAME
            ),
            finalPayload
          )

        return {
          ...finalPayload,
          id: docRef.id,
        }
      } catch (error) {
        console.error(
          'Error creating announcement:',
          error
        )

        throw error
      }
    },

  updateAnnouncement:
    async (
      id,
      data
    ) => {
      try {
        const cleanId =
          validateId(id)

        const message =
          String(
            data?.message || ''
          ).trim()

        if (!message) {
          throw new Error(
            'Announcement message is required'
          )
        }

        const startDate =
          normalizeDate(
            data?.startDate
          )

        const endDate =
          normalizeDate(
            data?.endDate
          )

        if (
          startDate &&
          endDate &&
          new Date(
            startDate
          ).getTime() >=
          new Date(
            endDate
          ).getTime()
        ) {
          throw new Error(
            'End date must be after start date'
          )
        }

        const payload =
          normalizeAnnouncement({
            ...data,
            message,
            startDate,
            endDate,
          })

        /*
         * id must never be written
         * inside the Firestore document.
         */
        const {
          id: ignoredId,
          createdAt,
          ...editablePayload
        } = payload

        const updatedAt =
          new Date().toISOString()

        await updateDoc(
          doc(
            db,
            COLLECTION_NAME,
            cleanId
          ),
          {
            ...editablePayload,
            updatedAt,
          }
        )

        return {
          ...editablePayload,
          id: cleanId,
          updatedAt,
        }
      } catch (error) {
        console.error(
          'Error updating announcement:',
          error
        )

        throw error
      }
    },

  updateDisplayOrders:
    async (orderedIds) => {
      try {
        if (
          !Array.isArray(
            orderedIds
          )
        ) {
          throw new Error(
            'Announcement order is invalid'
          )
        }

        const batch =
          writeBatch(db)

        const updatedAt =
          new Date().toISOString()

        orderedIds.forEach(
          (id, index) => {
            const cleanId =
              validateId(id)

            batch.update(
              doc(
                db,
                COLLECTION_NAME,
                cleanId
              ),
              {
                displayOrder:
                  index,

                updatedAt,
              }
            )
          }
        )

        await batch.commit()

        return true
      } catch (error) {
        console.error(
          'Error updating announcement order:',
          error
        )

        throw error
      }
    },

  deleteAnnouncement:
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
          'Error deleting announcement:',
          error
        )

        throw error
      }
    },
}

export default announcementService