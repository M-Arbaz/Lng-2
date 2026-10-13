'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, Loader2, Image,
  X, Upload, Eye, EyeOff, Calendar, Tag, FolderOpen, Home, ChevronLeft,
  ChevronRight, Clock, FileText, Save, GripVertical,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import blogsService from '../utils/blogsService.js'
import RichTextEditor from '../components/RichTextEditor.jsx'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-700' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
]

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100)
}

function formatDateTimeLocal(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    imageAltText: '',
    status: 'draft',
    publishedAt: '',
    category: '',
    tags: [],
    showOnHomepage: false,
  })

  const [tagInput, setTagInput] = useState('')

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await blogsService.getAllBlogs()
      setBlogs(data)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load blogs from Firebase' })
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const data = await blogsService.getAllCategories()
      setCategories(data)
    } catch (e) {
      console.error('Failed to load categories', e)
    }
  }, [])

  useEffect(() => {
    loadBlogs()
    loadCategories()
  }, [loadBlogs, loadCategories])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value }
      if (name === 'title' && !editingId) {
        next.slug = generateSlug(value)
      }
      return next
    })
  }

  const handleContentChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const url = await blogsService.uploadImage(file, 'blogs/featured')
      setFormData((prev) => ({ ...prev, featuredImage: url }))
      setMessage({ type: 'success', text: 'Image uploaded!' })
    } catch {
      setMessage({ type: 'error', text: 'Image upload failed.' })
    } finally {
      setUploadingImage(false)
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, featuredImage: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().replace(/,/g, '')
      if (tag && !formData.tags.includes(tag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' })
      return
    }
    if (!formData.slug.trim()) {
      setMessage({ type: 'error', text: 'Slug is required' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        featuredImage: formData.featuredImage,
        slug: formData.slug.trim(),
        metaTitle: formData.metaTitle.trim(),
        metaDescription: formData.metaDescription.trim(),
        imageAltText: formData.imageAltText.trim(),
        status: formData.status,
        publishedAt: formData.status === 'published' && !formData.publishedAt
          ? new Date().toISOString()
          : formData.publishedAt || null,
        category: formData.category,
        tags: formData.tags,
        showOnHomepage: formData.showOnHomepage,
      }

      if (editingId) {
        await blogsService.updateBlog(editingId, payload)
        setBlogs((prev) =>
          prev.map((b) => (b.id === editingId ? { ...b, ...payload } : b))
        )
        setMessage({ type: 'success', text: 'Blog updated!' })
        setEditingId(null)
      } else {
        const newBlog = await blogsService.createBlog(payload)
        setBlogs((prev) => [newBlog, ...prev])
        setMessage({ type: 'success', text: 'Blog created!' })
      }
      resetForm()
    } catch {
      setMessage({ type: 'error', text: 'Failed to save blog.' })
    } finally {
      setSaving(false)
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      slug: '',
      metaTitle: '',
      metaDescription: '',
      imageAltText: '',
      status: 'draft',
      publishedAt: '',
      category: '',
      tags: [],
      showOnHomepage: false,
    })
    setTagInput('')
    setActiveTab('content')
    setShowForm(false)
    setEditingId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleEdit = (blog) => {
    setFormData({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      featuredImage: blog.featuredImage || '',
      slug: blog.slug || '',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      imageAltText: blog.imageAltText || '',
      status: blog.status || 'draft',
      publishedAt: formatDateTimeLocal(blog.publishedAt),
      category: blog.category || '',
      tags: blog.tags || [],
      showOnHomepage: blog.showOnHomepage === true,
    })
    setEditingId(blog.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogsService.deleteBlog(id)
        setBlogs((prev) => prev.filter((b) => b.id !== id))
        setMessage({ type: 'success', text: 'Blog deleted!' })
      } catch {
        setMessage({ type: 'error', text: 'Delete failed.' })
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleToggleStatus = async (blog) => {
    const nextStatus = blog.status === 'published' ? 'draft' : 'published'
    try {
      await blogsService.updateBlog(blog.id, {
        status: nextStatus,
        publishedAt: nextStatus === 'published' ? new Date().toISOString() : blog.publishedAt,
      })
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blog.id
            ? { ...b, status: nextStatus, publishedAt: nextStatus === 'published' ? new Date().toISOString() : b.publishedAt }
            : b
        )
      )
      setMessage({ type: 'success', text: `Blog ${nextStatus === 'published' ? 'published' : 'unpublished'}!` })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update status.' })
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    try {
      await blogsService.createCategory(newCategoryName.trim())
      setNewCategoryName('')
      await loadCategories()
      setMessage({ type: 'success', text: 'Category created!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to create category.' })
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await blogsService.deleteCategory(id)
        await loadCategories()
        setMessage({ type: 'success', text: 'Category deleted!' })
      } catch {
        setMessage({ type: 'error', text: 'Failed to delete category.' })
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (status) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status)
    return opt ? (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${opt.color}`}>
        {status === 'published' ? <Eye className="w-3 h-3" /> : status === 'scheduled' ? <Clock className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
        {opt.label}
      </span>
    ) : null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Blog Management</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCategoryManager(true)}
              className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" /> Categories
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true) }}
              className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" /> Add Blog
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: blogs.length, color: 'bg-gray-100 text-gray-700' },
            { label: 'Published', value: blogs.filter((b) => b.status === 'published').length, color: 'bg-green-100 text-green-700' },
            { label: 'Drafts', value: blogs.filter((b) => b.status === 'draft').length, color: 'bg-gray-100 text-gray-600' },
            { label: 'Homepage', value: blogs.filter((b) => b.showOnHomepage && b.status === 'published').length, color: 'bg-orange-100 text-orange-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-[#E53935] flex-shrink-0" />}
            <p className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blogs by title, excerpt, or tag..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Blog List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-600">Loading blogs...</span>
            </div>
          ) : paginatedBlogs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No blogs found</p>
              <p className="text-gray-400 text-sm mt-1">{searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first blog post.'}</p>
            </div>
          ) : (
            paginatedBlogs.map((blog) => (
              <div
                key={blog.id}
                className={`bg-white rounded-xl shadow-md border overflow-hidden transition hover:shadow-lg ${blog.status === 'published' ? 'border-gray-200' : 'border-gray-200 opacity-80'}`}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-44 h-32 sm:h-auto flex-shrink-0 bg-gray-100 overflow-hidden">
                    {blog.featuredImage ? (
                      <img src={blog.featuredImage} alt={blog.imageAltText || blog.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(blog.status)}
                          {blog.showOnHomepage && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                              <Home className="w-3 h-3" /> Homepage
                            </span>
                          )}
                          {blog.category && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              <FolderOpen className="w-3 h-3" /> {blog.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{blog.title || <span className="text-gray-400 italic">(No title)</span>}</h3>
                      {blog.excerpt && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.excerpt}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                        {blog.tags?.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Tag className="w-3 h-3" /> {tag}
                          </span>
                        ))}
                      </div>
                      {blog.publishedAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {blog.status === 'scheduled' ? 'Scheduled: ' : 'Published: '}
                          {new Date(blog.publishedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleToggleStatus(blog)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {blog.status === 'published' ? <><EyeOff className="w-3 h-3" /> Unpublish</> : <><Eye className="w-3 h-3" /> Publish</>}
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Blog Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Blog' : 'Create Blog'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex gap-1 border-b border-gray-100">
              {[
                { key: 'content', label: 'Content' },
                { key: 'seo', label: 'SEO' },
                { key: 'settings', label: 'Settings' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
                    activeTab === tab.key
                      ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog title..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
                    <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                      {formData.featuredImage ? (
                        <div className="relative">
                          <img src={formData.featuredImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm text-red-500 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center py-8 cursor-pointer"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 font-medium">Click to upload featured image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      {uploadingImage && (
                        <div className="flex items-center justify-center mt-3 text-sm text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description / Excerpt</label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Brief summary displayed on blog cards..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white resize-none"
                    />
                  </div>

                  {/* Rich Text Editor */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Content</label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      placeholder="Write your blog content here..."
                      minHeight={320}
                    />
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">SEO-Friendly URL (Slug) *</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">/blog/</span>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="your-blog-url-slug"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Title</label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      placeholder="Title for search engines..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
                    <textarea
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Description shown in search results..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image Alt Text</label>
                    <input
                      type="text"
                      name="imageAltText"
                      value={formData.imageAltText}
                      onChange={handleInputChange}
                      placeholder="Describe the featured image for accessibility..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-5">
                  {/* Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        <option value="">-- No Category --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Schedule */}
                  {formData.status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Publish Date & Time</label>
                      <input
                        type="datetime-local"
                        name="publishedAt"
                        value={formData.publishedAt}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      />
                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                    <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 rounded-xl bg-white min-h-[50px]">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-sm px-2.5 py-1 rounded-full"
                        >
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-orange-900">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder={formData.tags.length ? '' : 'Type tag and press Enter...'}
                        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add a tag</p>
                  </div>

                  {/* Show on Homepage */}
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <input
                      type="checkbox"
                      id="showOnHomepage"
                      name="showOnHomepage"
                      checked={formData.showOnHomepage}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300"
                    />
                    <label htmlFor="showOnHomepage" className="text-sm font-medium text-gray-700">
                      Show this blog on the homepage
                    </label>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : editingId ? (
                    <><Save className="w-4 h-4" /> Update Blog</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Create Blog</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Manage Categories</h3>
              <button onClick={() => setShowCategoryManager(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition text-sm"
                >
                  Add
                </button>
              </form>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No categories yet</p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-300" />
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
