import { db, storage } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const blogsService = {
  // Get all blogs (admin)
  getAllBlogs: async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const blogs = [];
      querySnapshot.forEach((doc) => {
        blogs.push({ id: doc.id, ...doc.data() });
      });
      return blogs;
    } catch (error) {
      console.error('Error getting blogs:', error);
      throw error;
    }
  },

  // Get published blogs for public pages
  getPublishedBlogs: async (maxLimit = 50) => {
    try {
      const now = new Date().toISOString();
      const q = query(
        collection(db, 'blogs'),
        where('status', '==', 'published'),
        where('publishedAt', '<=', now),
        orderBy('publishedAt', 'desc'),
        limit(maxLimit)
      );
      const querySnapshot = await getDocs(q);
      const blogs = [];
      querySnapshot.forEach((doc) => {
        blogs.push({ id: doc.id, ...doc.data() });
      });
      return blogs;
    } catch (error) {
      console.error('Error getting published blogs:', error);
      // Fallback without composite index
      try {
        const all = await blogsService.getAllBlogs();
        const now = new Date().toISOString();
        return all
          .filter((b) => b.status === 'published' && b.publishedAt && b.publishedAt <= now)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, maxLimit);
      } catch {
        throw error;
      }
    }
  },

  // Get blogs for homepage
  getHomepageBlogs: async (maxLimit = 4) => {
    try {
      const now = new Date().toISOString();
      const q = query(
        collection(db, 'blogs'),
        where('status', '==', 'published'),
        where('showOnHomepage', '==', true),
        where('publishedAt', '<=', now),
        orderBy('publishedAt', 'desc'),
        limit(maxLimit)
      );
      const querySnapshot = await getDocs(q);
      const blogs = [];
      querySnapshot.forEach((doc) => {
        blogs.push({ id: doc.id, ...doc.data() });
      });
      return blogs;
    } catch (error) {
      console.error('Error getting homepage blogs:', error);
      // Fallback without composite index
      try {
        const all = await blogsService.getAllBlogs();
        const now = new Date().toISOString();
        return all
          .filter((b) => b.status === 'published' && b.showOnHomepage === true && b.publishedAt && b.publishedAt <= now)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, maxLimit);
      } catch {
        throw error;
      }
    }
  },

  // Get blog by ID
  getBlogById: async (id) => {
    try {
      const docRef = doc(db, 'blogs', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Blog not found');
    } catch (error) {
      console.error('Error getting blog:', error);
      throw error;
    }
  },

  // Get blog by slug
  getBlogBySlug: async (slug) => {
    try {
      const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      throw new Error('Blog not found');
    } catch (error) {
      console.error('Error getting blog by slug:', error);
      throw error;
    }
  },

  // Create blog
  createBlog: async (blogData) => {
    try {
      const payload = {
        ...blogData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'blogs'), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    try {
      const docRef = doc(db, 'blogs', id);
      await updateDoc(docRef, {
        ...blogData,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...blogData };
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    try {
      await deleteDoc(doc(db, 'blogs', id));
      return { id };
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  },

  // Upload image to Firebase Storage
  uploadImage: async (file, folder = 'blogs') => {
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // --- Blog Categories ---

  getAllCategories: async () => {
    try {
      const q = query(collection(db, 'blogCategories'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const categories = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      return categories;
    } catch (error) {
      console.error('Error getting blog categories:', error);
      throw error;
    }
  },

  createCategory: async (name) => {
    try {
      const payload = {
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'blogCategories'), payload);
      return { id: docRef.id, ...payload };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id, name) => {
    try {
      const docRef = doc(db, 'blogCategories', id);
      await updateDoc(docRef, {
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        updatedAt: new Date().toISOString(),
      });
      return { id, name: name.trim() };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await deleteDoc(doc(db, 'blogCategories', id));
      return { id };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};

export default blogsService;
