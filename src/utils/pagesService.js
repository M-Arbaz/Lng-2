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
  where,
  limit,
} from 'firebase/firestore'

function normalizeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const pagesService = {
  // Admin: get every page
  getAllPages: async () => {
    try {
      const q = query(
        collection(db, 'pages'),
        orderBy(
          'createdAt',
          'desc'
        )
      )

      const querySnapshot =
        await getDocs(q)

      const pages = []

      querySnapshot.forEach(
        (docSnap) => {
          pages.push({
            ...docSnap.data(),

            /*
             * Actual Firestore document
             * ID must always win over
             * any legacy stored id field.
             */
            id: docSnap.id,
          })
        }
      )

      return pages
    } catch (error) {
      console.error(
        'Error getting pages:',
        error
      )

      throw error
    }
  },

  // Get one page by document ID
  getPageById: async (id) => {
    try {
      if (
        typeof id !== 'string' ||
        !id.trim()
      ) {
        throw new Error(
          'Valid page ID is required'
        )
      }

      const docSnap =
        await getDoc(
          doc(
            db,
            'pages',
            id.trim()
          )
        )

      if (!docSnap.exists()) {
        return null
      }

      return {
        ...docSnap.data(),
        id: docSnap.id,
      }
    } catch (error) {
      console.error(
        'Error getting page:',
        error
      )

      throw error
    }
  },

  // Public: published page by slug
  getPageBySlug: async (
    slug
  ) => {
    try {
      const cleanSlug =
        normalizeSlug(slug)

      if (!cleanSlug) {
        return null
      }

      const q = query(
        collection(db, 'pages'),

        where(
          'slug',
          '==',
          cleanSlug
        ),

        where(
          'isPublished',
          '==',
          true
        ),

        limit(1)
      )

      const querySnapshot =
        await getDocs(q)

      if (
        querySnapshot.empty
      ) {
        return null
      }

      const docSnap =
        querySnapshot.docs[0]

      return {
        ...docSnap.data(),
        id: docSnap.id,
      }
    } catch (error) {
      console.error(
        'Error getting page by slug:',
        error
      )

      throw error
    }
  },

  // Public: all published pages
  getPublishedPages: async () => {
    try {
      const q = query(
        collection(db, 'pages'),

        where(
          'isPublished',
          '==',
          true
        ),

        orderBy(
          'createdAt',
          'desc'
        )
      )

      const querySnapshot =
        await getDocs(q)

      const pages = []

      querySnapshot.forEach(
        (docSnap) => {
          pages.push({
            ...docSnap.data(),
            id: docSnap.id,
          })
        }
      )

      return pages
    } catch (error) {
      console.error(
        'Error getting published pages:',
        error
      )

      throw error
    }
  },

  /*
   * Used before create/update so two
   * pages can never accidentally share
   * the same public URL.
   */
  isSlugAvailable: async (
    slug,
    excludeId = null
  ) => {
    try {
      const cleanSlug =
        normalizeSlug(slug)

      if (!cleanSlug) {
        return false
      }

      const q = query(
        collection(db, 'pages'),

        where(
          'slug',
          '==',
          cleanSlug
        )
      )

      const querySnapshot =
        await getDocs(q)

      return querySnapshot.docs.every(
        (docSnap) =>
          docSnap.id ===
          excludeId
      )
    } catch (error) {
      console.error(
        'Error checking page slug:',
        error
      )

      throw error
    }
  },

  // Create page
  createPage: async (
    pageData
  ) => {
    try {
      const title =
        String(
          pageData?.title || ''
        ).trim()

      const slug =
        normalizeSlug(
          pageData?.slug ||
          title
        )

      const content =
        String(
          pageData?.content || ''
        ).trim()

      if (!title) {
        throw new Error(
          'Page title is required'
        )
      }

      if (!slug) {
        throw new Error(
          'Page slug is required'
        )
      }

      if (!content) {
        throw new Error(
          'Page content is required'
        )
      }

      const available =
        await pagesService.isSlugAvailable(
          slug
        )

      if (!available) {
        throw new Error(
          `The URL /${slug} is already used by another page.`
        )
      }

      const now =
        new Date().toISOString()

      const newPage = {
        title,

        slug,

        description:
          String(
            pageData?.description ||
            ''
          ).trim(),

        content,

        isPublished:
          pageData?.isPublished ===
          true,

        createdAt: now,
        updatedAt: now,

        createdBy:
          pageData?.createdBy ||
          'admin',
      }

      const docRef =
        await addDoc(
          collection(
            db,
            'pages'
          ),
          newPage
        )

      return {
        ...newPage,
        id: docRef.id,
      }
    } catch (error) {
      console.error(
        'Error creating page:',
        error
      )

      throw error
    }
  },

  // Update page
  updatePage: async (
    id,
    pageData
  ) => {
    try {
      if (
        typeof id !== 'string' ||
        !id.trim()
      ) {
        throw new Error(
          'Valid page ID is required'
        )
      }

      const cleanId =
        id.trim()

      const title =
        String(
          pageData?.title || ''
        ).trim()

      const slug =
        normalizeSlug(
          pageData?.slug ||
          title
        )

      const content =
        String(
          pageData?.content || ''
        ).trim()

      if (!title) {
        throw new Error(
          'Page title is required'
        )
      }

      if (!slug) {
        throw new Error(
          'Page slug is required'
        )
      }

      if (!content) {
        throw new Error(
          'Page content is required'
        )
      }

      const available =
        await pagesService.isSlugAvailable(
          slug,
          cleanId
        )

      if (!available) {
        throw new Error(
          `The URL /${slug} is already used by another page.`
        )
      }

      const updatedPage = {
        title,

        slug,

        description:
          String(
            pageData?.description ||
            ''
          ).trim(),

        content,

        isPublished:
          pageData?.isPublished ===
          true,

        updatedAt:
          new Date().toISOString(),
      }

      await updateDoc(
        doc(
          db,
          'pages',
          cleanId
        ),
        updatedPage
      )

      return {
        ...updatedPage,
        id: cleanId,
      }
    } catch (error) {
      console.error(
        'Error updating page:',
        error
      )

      throw error
    }
  },

  // Delete page
  deletePage: async (id) => {
    try {
      if (
        typeof id !== 'string' ||
        !id.trim()
      ) {
        throw new Error(
          'Valid page ID is required'
        )
      }

      await deleteDoc(
        doc(
          db,
          'pages',
          id.trim()
        )
      )

      return true
    } catch (error) {
      console.error(
        'Error deleting page:',
        error
      )

      throw error
    }
  },

  // Publish / unpublish
  togglePagePublish: async (
    id,
    isPublished
  ) => {
    try {
      if (
        typeof id !== 'string' ||
        !id.trim()
      ) {
        throw new Error(
          'Valid page ID is required'
        )
      }

      const updatedAt =
        new Date().toISOString()

      await updateDoc(
        doc(
          db,
          'pages',
          id.trim()
        ),
        {
          isPublished:
            Boolean(
              isPublished
            ),

          updatedAt,
        }
      )

      return {
        id: id.trim(),

        isPublished:
          Boolean(
            isPublished
          ),

        updatedAt,
      }
    } catch (error) {
      console.error(
        'Error toggling page publish status:',
        error
      )

      throw error
    }
  },
}

export {
  normalizeSlug,
}

export default pagesService