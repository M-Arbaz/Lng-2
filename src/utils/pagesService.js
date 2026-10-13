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
} from 'firebase/firestore'

export const pagesService = {
  // Get all pages
  getAllPages: async () => {
    try {
      const q = query(collection(db, 'pages'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const pages = []
      querySnapshot.forEach((docSnap) => {
        pages.push({ id: docSnap.id, ...docSnap.data() })
      })
      return pages
    } catch (error) {
      console.error('Error getting pages:', error)
      throw error
    }
  },

  // Get a single page by ID
  getPageById: async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'pages', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting page:', error)
      throw error
    }
  },

  // Get page by slug (for public viewing)
  getPageBySlug: async (slug) => {
    try {
      const q = query(collection(db, 'pages'), where('slug', '==', slug), where('isPublished', '==', true))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.size > 0) {
        const docSnap = querySnapshot.docs[0]
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting page by slug:', error)
      throw error
    }
  },

  // Get all published pages
  getPublishedPages: async () => {
    try {
      const q = query(collection(db, 'pages'), where('isPublished', '==', true), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const pages = []
      querySnapshot.forEach((docSnap) => {
        pages.push({ id: docSnap.id, ...docSnap.data() })
      })
      return pages
    } catch (error) {
      console.error('Error getting published pages:', error)
      throw error
    }
  },

  // Create a new page
  createPage: async (pageData) => {
    try {
      const newPage = {
        title: pageData.title,
        slug: pageData.slug || pageData.title.toLowerCase().replace(/\s+/g, '-'),
        content: pageData.content,
        isPublished: pageData.isPublished || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: pageData.createdBy || 'admin',
        description: pageData.description || '',
      }
      const docRef = await addDoc(collection(db, 'pages'), newPage)
      return { id: docRef.id, ...newPage }
    } catch (error) {
      console.error('Error creating page:', error)
      throw error
    }
  },

  // Update a page
  updatePage: async (id, pageData) => {
    try {
      const updatedPage = {
        ...pageData,
        updatedAt: new Date().toISOString(),
      }
      await updateDoc(doc(db, 'pages', id), updatedPage)
      return { id, ...updatedPage }
    } catch (error) {
      console.error('Error updating page:', error)
      throw error
    }
  },

  // Delete a page
  deletePage: async (id) => {
    try {
      await deleteDoc(doc(db, 'pages', id))
      return true
    } catch (error) {
      console.error('Error deleting page:', error)
      throw error
    }
  },

  // Publish/unpublish a page
  togglePagePublish: async (id, isPublished) => {
    try {
      await updateDoc(doc(db, 'pages', id), {
        isPublished,
        updatedAt: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('Error toggling page publish status:', error)
      throw error
    }
  },
}

export default pagesService
