import { db } from './firebase'

import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'

const COLLECTION_NAME =
  'onboardingGuides'

function cleanModulePath(value) {
  let path =
    String(value || '').trim()

  if (!path) {
    return ''
  }

  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  if (
    path.length > 1 &&
    path.endsWith('/')
  ) {
    path = path.slice(0, -1)
  }

  return path
}

function validateId(id) {
  if (
    typeof id !== 'string' ||
    !id.trim()
  ) {
    throw new Error(
      'Valid onboarding guide ID is required'
    )
  }

  return id.trim()
}

function normalizeSteps(
  steps = []
) {
  if (!Array.isArray(steps)) {
    return []
  }

  return steps
    .map((step, index) => ({
      title:
        String(
          step?.title || ''
        ).trim(),

      description:
        String(
          step?.description || ''
        ).trim(),

      order:
        Number.isFinite(
          Number(step?.order)
        )
          ? Number(step.order)
          : index,
    }))
    .sort(
      (a, b) =>
        a.order - b.order
    )
    .map((step, index) => ({
      ...step,
      order: index,
    }))
}

export function normalizeOnboardingGuide(
  data = {}
) {
  return {
    modulePath:
      cleanModulePath(
        data.modulePath
      ),

    title:
      String(
        data.title || ''
      ).trim(),

    description:
      String(
        data.description || ''
      ).trim(),

    isActive:
      data.isActive !== false,

    steps:
      normalizeSteps(
        data.steps
      ),

    createdAt:
      data.createdAt || null,

    updatedAt:
      data.updatedAt || null,
  }
}

function normalizeSnapshot(
  docSnap
) {
  return {
    ...normalizeOnboardingGuide(
      docSnap.data()
    ),

    /*
     * Actual Firestore document ID
     * always wins over legacy data.
     */
    id: docSnap.id,
  }
}

function getTime(value) {
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

function matchesModulePath(
  currentPath,
  modulePath
) {
  const current =
    cleanModulePath(
      currentPath
    )

  const module =
    cleanModulePath(
      modulePath
    )

  if (
    !current ||
    !module
  ) {
    return false
  }

  return (
    current === module ||
    current.startsWith(
      `${module}/`
    )
  )
}

function validateGuide(
  guide
) {
  if (!guide.modulePath) {
    throw new Error(
      'Please select a module'
    )
  }

  if (
    !guide.modulePath.startsWith(
      '/admin/'
    ) &&
    guide.modulePath !==
    '/admin'
  ) {
    throw new Error(
      'Invalid admin module path'
    )
  }

  if (!guide.title) {
    throw new Error(
      'Guide title is required'
    )
  }

  if (
    !guide.steps.length
  ) {
    throw new Error(
      'Please add at least one onboarding step'
    )
  }

  if (
    guide.steps.some(
      (step) =>
        !step.title ||
        !step.description
    )
  ) {
    throw new Error(
      'Every onboarding step needs a title and description'
    )
  }
}

export const onboardingService = {
  getAllGuides:
    async () => {
      try {
        const snapshot =
          await getDocs(
            collection(
              db,
              COLLECTION_NAME
            )
          )

        return snapshot.docs
          .map(
            normalizeSnapshot
          )
          .sort(
            (a, b) =>
              getTime(
                b.updatedAt ||
                b.createdAt
              ) -
              getTime(
                a.updatedAt ||
                a.createdAt
              )
          )
      } catch (error) {
        console.error(
          'Error getting onboarding guides:',
          error
        )

        throw error
      }
    },

  /*
   * Finds the most specific active
   * guide for the current Admin route.
   *
   * Example:
   * /admin/products guide also works on
   * /admin/products/abc/edit.
   */
  getGuideByPath:
    async (currentPath) => {
      try {
        const guides =
          await onboardingService.getAllGuides()

        const matches =
          guides
            .filter(
              (guide) =>
                guide.isActive !==
                false &&
                matchesModulePath(
                  currentPath,
                  guide.modulePath
                )
            )
            .sort(
              (a, b) => {
                /*
                 * More specific module
                 * path wins.
                 */
                const pathDifference =
                  b.modulePath.length -
                  a.modulePath.length

                if (
                  pathDifference !== 0
                ) {
                  return pathDifference
                }

                return (
                  getTime(
                    b.updatedAt ||
                    b.createdAt
                  ) -
                  getTime(
                    a.updatedAt ||
                    a.createdAt
                  )
                )
              }
            )

        return (
          matches[0] ||
          null
        )
      } catch (error) {
        console.error(
          'Error getting onboarding guide by path:',
          error
        )

        throw error
      }
    },

  getGuideById:
    async (id) => {
      try {
        const cleanId =
          validateId(id)

        const snapshot =
          await getDoc(
            doc(
              db,
              COLLECTION_NAME,
              cleanId
            )
          )

        if (
          !snapshot.exists()
        ) {
          throw new Error(
            'Onboarding guide not found'
          )
        }

        return normalizeSnapshot(
          snapshot
        )
      } catch (error) {
        console.error(
          'Error getting onboarding guide:',
          error
        )

        throw error
      }
    },

  /*
   * Only one ACTIVE guide is allowed
   * for one module.
   *
   * Creating a new active guide
   * automatically deactivates any
   * previous active guide for the
   * same module.
   */
  createGuide:
    async (guideData) => {
      try {
        const guide =
          normalizeOnboardingGuide(
            guideData
          )

        validateGuide(
          guide
        )

        const now =
          new Date().toISOString()

        const snapshot =
          await getDocs(
            collection(
              db,
              COLLECTION_NAME
            )
          )

        const batch =
          writeBatch(db)

        if (
          guide.isActive
        ) {
          snapshot.docs.forEach(
            (existingDoc) => {
              const existing =
                normalizeSnapshot(
                  existingDoc
                )

              if (
                existing.isActive !==
                false &&
                existing.modulePath ===
                guide.modulePath
              ) {
                batch.update(
                  existingDoc.ref,
                  {
                    isActive:
                      false,

                    updatedAt:
                      now,
                  }
                )
              }
            }
          )
        }

        const newRef =
          doc(
            collection(
              db,
              COLLECTION_NAME
            )
          )

        const payload = {
          ...guide,
          createdAt: now,
          updatedAt: now,
        }

        batch.set(
          newRef,
          payload
        )

        await batch.commit()

        return {
          ...payload,
          id: newRef.id,
        }
      } catch (error) {
        console.error(
          'Error creating onboarding guide:',
          error
        )

        throw error
      }
    },

  updateGuide:
    async (
      id,
      guideData
    ) => {
      try {
        const cleanId =
          validateId(id)

        const targetRef =
          doc(
            db,
            COLLECTION_NAME,
            cleanId
          )

        const targetSnapshot =
          await getDoc(
            targetRef
          )

        if (
          !targetSnapshot.exists()
        ) {
          throw new Error(
            'Onboarding guide not found'
          )
        }

        const existing =
          normalizeSnapshot(
            targetSnapshot
          )

        const guide =
          normalizeOnboardingGuide({
            ...existing,
            ...guideData,

            createdAt:
              existing.createdAt,
          })

        validateGuide(
          guide
        )

        const now =
          new Date().toISOString()

        const allSnapshot =
          await getDocs(
            collection(
              db,
              COLLECTION_NAME
            )
          )

        const batch =
          writeBatch(db)

        /*
         * If this guide is being
         * activated, disable other
         * guides for the same module.
         */
        if (
          guide.isActive
        ) {
          allSnapshot.docs.forEach(
            (existingDoc) => {
              if (
                existingDoc.id ===
                cleanId
              ) {
                return
              }

              const otherGuide =
                normalizeSnapshot(
                  existingDoc
                )

              if (
                otherGuide.isActive !==
                false &&
                otherGuide.modulePath ===
                guide.modulePath
              ) {
                batch.update(
                  existingDoc.ref,
                  {
                    isActive:
                      false,

                    updatedAt:
                      now,
                  }
                )
              }
            }
          )
        }

        const payload = {
          modulePath:
            guide.modulePath,

          title:
            guide.title,

          description:
            guide.description,

          isActive:
            guide.isActive,

          steps:
            guide.steps,

          updatedAt:
            now,
        }

        batch.update(
          targetRef,
          payload
        )

        await batch.commit()

        return {
          ...existing,
          ...payload,
          id: cleanId,
        }
      } catch (error) {
        console.error(
          'Error updating onboarding guide:',
          error
        )

        throw error
      }
    },

  deleteGuide:
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
          'Error deleting onboarding guide:',
          error
        )

        throw error
      }
    },
}

export {
  cleanModulePath,
  matchesModulePath,
}

export default onboardingService