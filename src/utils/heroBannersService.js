import { db } from './firebase';

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
} from 'firebase/firestore';

import { uploadToXcdn } from './xcdnUpload';

const COLLECTION_NAME = 'heroBanners';

export const heroBannersService = {
  getAllBanners: async () => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('displayOrder', 'asc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
    } catch (error) {
      console.error('Error getting hero banners:', error);
      throw error;
    }
  },

  getActiveBanners: async () => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('displayOrder', 'asc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter((banner) => banner.isActive);
    } catch (error) {
      console.error('Error getting active hero banners:', error);
      throw error;
    }
  },

  getBannerById: async (id) => {
    try {
      const ref = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(ref);

      if (!snapshot.exists()) {
        throw new Error('Banner not found');
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      };
    } catch (error) {
      console.error('Error getting hero banner:', error);
      throw error;
    }
  },

  createBanner: async (data) => {
    try {
      const payload = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const ref = await addDoc(
        collection(db, COLLECTION_NAME),
        payload
      );

      return {
        id: ref.id,
        ...payload,
      };
    } catch (error) {
      console.error('Error creating hero banner:', error);
      throw error;
    }
  },

  updateBanner: async (id, data) => {
    try {
      const ref = doc(db, COLLECTION_NAME, id);

      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(ref, payload);

      return {
        id,
        ...payload,
      };
    } catch (error) {
      console.error('Error updating hero banner:', error);
      throw error;
    }
  },

  deleteBanner: async (id) => {
    try {
      await deleteDoc(
        doc(db, COLLECTION_NAME, id)
      );

      return { id };
    } catch (error) {
      console.error('Error deleting hero banner:', error);
      throw error;
    }
  },

  /**
   * Uploads hero banner images to XCDN.
   * Same uploader is used for both desktop
   * and mobile banner images.
   */
  uploadBannerImage: async (file) => {
    if (!file) {
      throw new Error('No banner image selected');
    }

    try {
      const url = await uploadToXcdn(
        file,
        'heroBanners'
      );

      if (!url) {
        throw new Error(
          'XCDN did not return an image URL'
        );
      }

      return url;
    } catch (error) {
      console.error(
        'Error uploading hero banner to XCDN:',
        error
      );

      throw error;
    }
  },
};

export default heroBannersService;