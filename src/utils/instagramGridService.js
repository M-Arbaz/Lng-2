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

export const instagramGridService = {
  // Get all Instagram grid items
  getAllItems: async () => {
    try {
      const q = query(
        collection(db, 'instagramGrid'),
        orderBy('displayOrder', 'asc')
      );

      const querySnapshot =
        await getDocs(q);

      const items = [];

      querySnapshot.forEach(
        (document) => {
          items.push({
            id: document.id,
            ...document.data(),
          });
        }
      );

      return items;
    } catch (error) {
      console.error(
        'Error getting Instagram grid items:',
        error
      );

      throw error;
    }
  },

  // Get active Instagram grid items
  getActiveItems: async () => {
    try {
      const q = query(
        collection(db, 'instagramGrid'),
        orderBy('displayOrder', 'asc')
      );

      const querySnapshot =
        await getDocs(q);

      const items = [];

      querySnapshot.forEach(
        (document) => {
          const data =
            document.data();

          if (
            data.isActive !== false
          ) {
            items.push({
              id: document.id,
              ...data,
            });
          }
        }
      );

      return items;
    } catch (error) {
      console.error(
        'Error getting active Instagram grid items:',
        error
      );

      throw error;
    }
  },

  // Get one item
  getItemById: async (id) => {
    try {
      if (!id) {
        throw new Error(
          'Instagram grid item ID is required'
        );
      }

      const docRef = doc(
        db,
        'instagramGrid',
        id
      );

      const docSnap =
        await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      }

      throw new Error(
        'Instagram grid item not found'
      );
    } catch (error) {
      console.error(
        'Error getting Instagram grid item:',
        error
      );

      throw error;
    }
  },

  // Create item
  createItem: async (data) => {
    try {
      const now =
        new Date().toISOString();

      const payload = {
        ...data,

        createdAt:
          data?.createdAt || now,

        updatedAt: now,
      };

      const docRef =
        await addDoc(
          collection(
            db,
            'instagramGrid'
          ),
          payload
        );

      return {
        id: docRef.id,
        ...payload,
      };
    } catch (error) {
      console.error(
        'Error creating Instagram grid item:',
        error
      );

      throw error;
    }
  },

  // Update item
  updateItem: async (
    id,
    data
  ) => {
    try {
      if (!id) {
        throw new Error(
          'Instagram grid item ID is required'
        );
      }

      const docRef = doc(
        db,
        'instagramGrid',
        id
      );

      const payload = {
        ...data,

        updatedAt:
          new Date().toISOString(),
      };

      await updateDoc(
        docRef,
        payload
      );

      return {
        id,
        ...payload,
      };
    } catch (error) {
      console.error(
        'Error updating Instagram grid item:',
        error
      );

      throw error;
    }
  },

  // Delete item
  deleteItem: async (id) => {
    try {
      if (!id) {
        throw new Error(
          'Instagram grid item ID is required'
        );
      }

      await deleteDoc(
        doc(
          db,
          'instagramGrid',
          id
        )
      );

      return {
        id,
      };
    } catch (error) {
      console.error(
        'Error deleting Instagram grid item:',
        error
      );

      throw error;
    }
  },

  // Upload custom image directly to XCDN
  uploadItemImage: async (
    file
  ) => {
    if (!file) {
      throw new Error(
        'No Instagram image selected'
      );
    }

    try {
      const url =
        await uploadToXcdn(
          file,
          'instagramGrid'
        );

      if (!url) {
        throw new Error(
          'XCDN did not return an image URL'
        );
      }

      return url;
    } catch (error) {
      console.error(
        'Error uploading Instagram image to XCDN:',
        error
      );

      throw error;
    }
  },

  // Fetch Instagram post/reel preview
  // Server API fetches the image and stores it on XCDN.
  fetchInstagramPreview:
    async (instagramUrl) => {
      const normalizedUrl =
        String(
          instagramUrl || ''
        ).trim();

      if (!normalizedUrl) {
        throw new Error(
          'Instagram post or reel URL is required'
        );
      }

      try {
        const response =
          await fetch(
            '/api/instagram/preview',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                url: normalizedUrl,
              }),
            }
          );

        let data;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            `Instagram preview server returned HTTP ${response.status}`
          );
        }

        if (
          !response.ok ||
          !data?.success ||
          !data?.imageUrl
        ) {
          throw new Error(
            data?.message ||
            'Could not fetch Instagram preview.'
          );
        }

        return {
          success: true,

          url:
            data.url ||
            normalizedUrl,

          imageUrl:
            data.imageUrl,

          imageSource:
            data.imageSource ||
            'instagram-auto',
        };
      } catch (error) {
        console.error(
          'Error fetching Instagram preview:',
          error
        );

        throw error;
      }
    },
};

export default instagramGridService;