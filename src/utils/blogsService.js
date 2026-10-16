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
  where,
  orderBy,
  limit,
} from 'firebase/firestore'

import {
  uploadToXcdn,
} from './xcdnUpload'

function isBlogPublic(
  blog,
  now = new Date()
) {
  if (
    ![
      'published',
      'scheduled',
    ].includes(blog?.status)
  ) {
    return false
  }

  if (!blog?.publishedAt) {
    return false
  }

  const publishDate =
    new Date(blog.publishedAt)

  if (
    Number.isNaN(
      publishDate.getTime()
    )
  ) {
    return false
  }

  return publishDate <= now
}

export const blogsService = {
  // All blogs for Admin
  getAllBlogs: async () => {
    try {
      const q = query(
        collection(db, 'blogs'),
        orderBy(
          'createdAt',
          'desc'
        )
      )

      const querySnapshot =
        await getDocs(q)

      const blogs = []

      querySnapshot.forEach(
        (docSnap) => {
          blogs.push({
            id: docSnap.id,
            ...docSnap.data(),
          })
        }
      )

      return blogs
    } catch (error) {
      console.error(
        'Error getting blogs:',
        error
      )

      throw error
    }
  },

  /*
   * Public blog listing.
   *
   * Published blogs are shown normally.
   * Scheduled blogs automatically become
   * public after publishedAt is reached.
   */
  getPublishedBlogs: async (
    maxLimit = 50
  ) => {
    const now =
      new Date()

    const nowIso =
      now.toISOString()

    try {
      const q = query(
        collection(db, 'blogs'),

        where(
          'status',
          'in',
          [
            'published',
            'scheduled',
          ]
        ),

        where(
          'publishedAt',
          '<=',
          nowIso
        ),

        orderBy(
          'publishedAt',
          'desc'
        ),

        limit(maxLimit)
      )

      const querySnapshot =
        await getDocs(q)

      const blogs = []

      querySnapshot.forEach(
        (docSnap) => {
          const blog = {
            id: docSnap.id,
            ...docSnap.data(),
          }

          if (
            isBlogPublic(
              blog,
              now
            )
          ) {
            blogs.push(blog)
          }
        }
      )

      return blogs
    } catch (error) {
      console.warn(
        'Published blog query fallback:',
        error
      )

      /*
       * Firestore may require a composite
       * index for the query above.
       *
       * Keep the feature working even
       * before that index exists.
       */
      const all =
        await blogsService.getAllBlogs()

      return all
        .filter((blog) =>
          isBlogPublic(
            blog,
            now
          )
        )
        .sort(
          (a, b) =>
            new Date(
              b.publishedAt
            ).getTime() -
            new Date(
              a.publishedAt
            ).getTime()
        )
        .slice(
          0,
          maxLimit
        )
    }
  },

  // Homepage blogs
  getHomepageBlogs: async (
    maxLimit = 4
  ) => {
    const now =
      new Date()

    const nowIso =
      now.toISOString()

    try {
      const q = query(
        collection(db, 'blogs'),

        where(
          'status',
          'in',
          [
            'published',
            'scheduled',
          ]
        ),

        where(
          'showOnHomepage',
          '==',
          true
        ),

        where(
          'publishedAt',
          '<=',
          nowIso
        ),

        orderBy(
          'publishedAt',
          'desc'
        ),

        limit(maxLimit)
      )

      const querySnapshot =
        await getDocs(q)

      const blogs = []

      querySnapshot.forEach(
        (docSnap) => {
          const blog = {
            id: docSnap.id,
            ...docSnap.data(),
          }

          if (
            blog.showOnHomepage ===
            true &&
            isBlogPublic(
              blog,
              now
            )
          ) {
            blogs.push(blog)
          }
        }
      )

      return blogs
    } catch (error) {
      console.warn(
        'Homepage blog query fallback:',
        error
      )

      const all =
        await blogsService.getAllBlogs()

      return all
        .filter(
          (blog) =>
            blog.showOnHomepage ===
            true &&
            isBlogPublic(
              blog,
              now
            )
        )
        .sort(
          (a, b) =>
            new Date(
              b.publishedAt
            ).getTime() -
            new Date(
              a.publishedAt
            ).getTime()
        )
        .slice(
          0,
          maxLimit
        )
    }
  },

  getBlogById: async (id) => {
    try {
      if (!id) {
        throw new Error(
          'Blog ID is required'
        )
      }

      const docRef =
        doc(
          db,
          'blogs',
          id
        )

      const docSnap =
        await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error(
          'Blog not found'
        )
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      }
    } catch (error) {
      console.error(
        'Error getting blog:',
        error
      )

      throw error
    }
  },

  getBlogBySlug: async (
    slug
  ) => {
    try {
      const normalizedSlug =
        String(
          slug || ''
        ).trim()

      if (!normalizedSlug) {
        throw new Error(
          'Blog slug is required'
        )
      }

      const q = query(
        collection(db, 'blogs'),

        where(
          'slug',
          '==',
          normalizedSlug
        ),

        limit(1)
      )

      const querySnapshot =
        await getDocs(q)

      if (
        querySnapshot.empty
      ) {
        throw new Error(
          'Blog not found'
        )
      }

      const blogDoc =
        querySnapshot.docs[0]

      return {
        id: blogDoc.id,
        ...blogDoc.data(),
      }
    } catch (error) {
      console.error(
        'Error getting blog by slug:',
        error
      )

      throw error
    }
  },

  createBlog: async (
    blogData
  ) => {
    try {
      const now =
        new Date().toISOString()

      const payload = {
        ...blogData,
        createdAt: now,
        updatedAt: now,
      }

      const docRef =
        await addDoc(
          collection(
            db,
            'blogs'
          ),
          payload
        )

      return {
        id: docRef.id,
        ...payload,
      }
    } catch (error) {
      console.error(
        'Error creating blog:',
        error
      )

      throw error
    }
  },

  updateBlog: async (
    id,
    blogData
  ) => {
    try {
      if (!id) {
        throw new Error(
          'Blog ID is required'
        )
      }

      const updatedAt =
        new Date().toISOString()

      const payload = {
        ...blogData,
        updatedAt,
      }

      await updateDoc(
        doc(
          db,
          'blogs',
          id
        ),
        payload
      )

      return {
        id,
        ...payload,
      }
    } catch (error) {
      console.error(
        'Error updating blog:',
        error
      )

      throw error
    }
  },

  deleteBlog: async (id) => {
    try {
      if (!id) {
        throw new Error(
          'Blog ID is required'
        )
      }

      await deleteDoc(
        doc(
          db,
          'blogs',
          id
        )
      )

      return {
        id,
      }
    } catch (error) {
      console.error(
        'Error deleting blog:',
        error
      )

      throw error
    }
  },

  /*
   * Blog featured images now use XCDN.
   *
   * Important:
   * XCDN proxy currently allows "blogs",
   * not "blogs/featured".
   */
  uploadImage: async (
    file
  ) => {
    if (!file) {
      throw new Error(
        'No blog image selected'
      )
    }

    try {
      const url =
        await uploadToXcdn(
          file,
          'blogs'
        )

      if (!url) {
        throw new Error(
          'XCDN did not return an image URL'
        )
      }

      return url
    } catch (error) {
      console.error(
        'Error uploading blog image to XCDN:',
        error
      )

      throw error
    }
  },

  // Blog categories
  getAllCategories:
    async () => {
      try {
        const q = query(
          collection(
            db,
            'blogCategories'
          ),
          orderBy(
            'name',
            'asc'
          )
        )

        const querySnapshot =
          await getDocs(q)

        const categories = []

        querySnapshot.forEach(
          (docSnap) => {
            categories.push({
              id: docSnap.id,
              ...docSnap.data(),
            })
          }
        )

        return categories
      } catch (error) {
        console.error(
          'Error getting blog categories:',
          error
        )

        throw error
      }
    },

  createCategory: async (
    name
  ) => {
    try {
      const cleanName =
        String(
          name || ''
        ).trim()

      if (!cleanName) {
        throw new Error(
          'Category name is required'
        )
      }

      const payload = {
        name:
          cleanName,

        slug:
          cleanName
            .toLowerCase()
            .replace(
              /\s+/g,
              '-'
            )
            .replace(
              /[^a-z0-9-]/g,
              ''
            ),

        createdAt:
          new Date().toISOString(),
      }

      const docRef =
        await addDoc(
          collection(
            db,
            'blogCategories'
          ),
          payload
        )

      return {
        id: docRef.id,
        ...payload,
      }
    } catch (error) {
      console.error(
        'Error creating blog category:',
        error
      )

      throw error
    }
  },

  updateCategory: async (
    id,
    name
  ) => {
    try {
      const cleanName =
        String(
          name || ''
        ).trim()

      if (
        !id ||
        !cleanName
      ) {
        throw new Error(
          'Category ID and name are required'
        )
      }

      const slug =
        cleanName
          .toLowerCase()
          .replace(
            /\s+/g,
            '-'
          )
          .replace(
            /[^a-z0-9-]/g,
            ''
          )

      await updateDoc(
        doc(
          db,
          'blogCategories',
          id
        ),
        {
          name:
            cleanName,

          slug,

          updatedAt:
            new Date().toISOString(),
        }
      )

      return {
        id,
        name:
          cleanName,
        slug,
      }
    } catch (error) {
      console.error(
        'Error updating blog category:',
        error
      )

      throw error
    }
  },

  deleteCategory: async (
    id
  ) => {
    try {
      if (!id) {
        throw new Error(
          'Category ID is required'
        )
      }

      await deleteDoc(
        doc(
          db,
          'blogCategories',
          id
        )
      )

      return {
        id,
      }
    } catch (error) {
      console.error(
        'Error deleting blog category:',
        error
      )

      throw error
    }
  },
}

export default blogsService