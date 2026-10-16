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

export const reelsService = {
  getAllReels: async () => {
    try {
      const q = query(
        collection(db, 'reels'),
        orderBy(
          'createdAt',
          'desc'
        )
      )

      const querySnapshot =
        await getDocs(q)

      const reels = []

      querySnapshot.forEach(
        (docSnap) => {
          reels.push({
            id: docSnap.id,
            ...docSnap.data(),
          })
        }
      )

      return reels
    } catch (error) {
      console.error(
        'Error getting reels:',
        error
      )

      throw error
    }
  },

  getReelById: async (id) => {
    try {
      if (!id) {
        throw new Error(
          'Reel ID is required'
        )
      }

      const docSnap =
        await getDoc(
          doc(
            db,
            'reels',
            id
          )
        )

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        }
      }

      return null
    } catch (error) {
      console.error(
        'Error getting reel:',
        error
      )

      throw error
    }
  },

  createReel: async (
    reelData
  ) => {
    try {
      const now =
        new Date().toISOString()

      const newReel = {
        title:
          reelData.title || '',

        caption:
          reelData.caption || '',

        videoUrl:
          reelData.videoUrl || '',

        poster:
          reelData.poster || '',

        isActive:
          reelData.isActive !== false,

        createdAt: now,
        updatedAt: now,
      }

      const docRef =
        await addDoc(
          collection(
            db,
            'reels'
          ),
          newReel
        )

      return {
        id: docRef.id,
        ...newReel,
      }
    } catch (error) {
      console.error(
        'Error creating reel:',
        error
      )

      throw error
    }
  },

  updateReel: async (
    id,
    reelData
  ) => {
    try {
      if (!id) {
        throw new Error(
          'Reel ID is required'
        )
      }

      const updatedReel = {
        ...reelData,

        updatedAt:
          new Date().toISOString(),
      }

      await updateDoc(
        doc(
          db,
          'reels',
          id
        ),
        updatedReel
      )

      return {
        id,
        ...updatedReel,
      }
    } catch (error) {
      console.error(
        'Error updating reel:',
        error
      )

      throw error
    }
  },

  deleteReel: async (id) => {
    try {
      if (!id) {
        throw new Error(
          'Reel ID is required'
        )
      }

      await deleteDoc(
        doc(
          db,
          'reels',
          id
        )
      )

      return true
    } catch (error) {
      console.error(
        'Error deleting reel:',
        error
      )

      throw error
    }
  },

  toggleReelActive: async (
    id,
    isActive
  ) => {
    try {
      if (!id) {
        throw new Error(
          'Reel ID is required'
        )
      }

      await updateDoc(
        doc(
          db,
          'reels',
          id
        ),
        {
          isActive,

          updatedAt:
            new Date().toISOString(),
        }
      )

      return true
    } catch (error) {
      console.error(
        'Error toggling reel active status:',
        error
      )

      throw error
    }
  },

  uploadVideo: async (file) => {
    if (!file) {
      throw new Error(
        'No reel video selected'
      )
    }

    try {
      const url =
        await uploadToXcdn(
          file,
          'reels/videos'
        )

      if (!url) {
        throw new Error(
          'XCDN did not return a video URL'
        )
      }

      return url
    } catch (error) {
      console.error(
        'Error uploading reel video to XCDN:',
        error
      )

      throw error
    }
  },

  uploadPoster: async (file) => {
    if (!file) {
      throw new Error(
        'No reel poster selected'
      )
    }

    try {
      const url =
        await uploadToXcdn(
          file,
          'reels/posters'
        )

      if (!url) {
        throw new Error(
          'XCDN did not return a poster URL'
        )
      }

      return url
    } catch (error) {
      console.error(
        'Error uploading reel poster to XCDN:',
        error
      )

      throw error
    }
  },
}

export default reelsService