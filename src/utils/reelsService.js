import { db, storage } from './firebase'
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const reelsService = {
  getAllReels: async () => {
    try {
      const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const reels = []
      querySnapshot.forEach((docSnap) => {
        reels.push({ id: docSnap.id, ...docSnap.data() })
      })
      return reels
    } catch (error) {
      console.error('Error getting reels:', error)
      throw error
    }
  },

  getReelById: async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'reels', id))
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting reel:', error)
      throw error
    }
  },

  createReel: async (reelData) => {
    try {
      const newReel = {
        title: reelData.title,
        caption: reelData.caption || '',
        videoUrl: reelData.videoUrl || '',
        poster: reelData.poster || '',
        isActive: reelData.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const docRef = await addDoc(collection(db, 'reels'), newReel)
      return { id: docRef.id, ...newReel }
    } catch (error) {
      console.error('Error creating reel:', error)
      throw error
    }
  },

  updateReel: async (id, reelData) => {
    try {
      const updatedReel = {
        ...reelData,
        updatedAt: new Date().toISOString(),
      }
      await updateDoc(doc(db, 'reels', id), updatedReel)
      return { id, ...updatedReel }
    } catch (error) {
      console.error('Error updating reel:', error)
      throw error
    }
  },

  deleteReel: async (id) => {
    try {
      await deleteDoc(doc(db, 'reels', id))
      return true
    } catch (error) {
      console.error('Error deleting reel:', error)
      throw error
    }
  },

  toggleReelActive: async (id, isActive) => {
    try {
      await updateDoc(doc(db, 'reels', id), {
        isActive,
        updatedAt: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('Error toggling reel active status:', error)
      throw error
    }
  },

  uploadVideo: async (file) => {
    try {
      const storageRef = ref(storage, `reels/videos/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (error) {
      console.error('Error uploading video:', error)
      throw error
    }
  },

  uploadPoster: async (file) => {
    try {
      const storageRef = ref(storage, `reels/posters/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (error) {
      console.error('Error uploading poster:', error)
      throw error
    }
  },
}

export default reelsService
