'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  ImagePlus,
  Loader2,
  FolderOpen,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import RichTextEditor from '../components/RichTextEditor.jsx'
import categoriesService from '../utils/categoriesService.js'

// Default suggested categories for home décor
const SUGGESTED_CATEGORIES = [
  'Home Décor',
  'Decorative Lighting',
  'Wooden Crafts',
  'Modern Décor',
  'Rustic Décor',
  'Handmade Décor',
  'Bedroom Décor',
  'Living Room Décor',
  'Office Décor',
  'Decorative Accessories',
  'Gift Items',
  'Luxury Décor',
  'Minimalist Décor',
  'Indoor Decoration',
  'Customized Décor',
  'Coffee Table',
  'Candle',
  'Table Lamps',
  'Floor Lamps',
  'Wall Lamps',
  'Hanging Lamps',
  'Ceiling Lamps',
  'Bedside Lamps',
]
const htmlToPlainText = (value = '') => {
  return String(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

const formatCategoryDate = (value) => {
  if (!value) return ''

  const date =
    typeof value?.toDate === 'function'
      ? value.toDate()
      : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [imageUploading, setImageUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: 0,
    isActive: true,
  })

  // Load categories from Firebase
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const data = await categoriesService.getAllCategories()
        setCategories(data)
      } catch (e) {
        console.error('Error loading categories:', e)
        setMessage({ type: 'error', text: 'Failed to load categories from Firebase' })
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Upload category image to XCDN
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageUploading(true)
    try {
      const url = await categoriesService.uploadCategoryImage(file)
      setFormData((prev) => ({
        ...prev,
        image: url,
      }))
    } catch (err) {
      console.error('Error uploading image:', err)
      setMessage({ type: 'error', text: `Image upload failed: ${err.message}` })
    } finally {
      setImageUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a category name' })
      return
    }

    setSaving(true)

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
        isActive: formData.isActive,
      }

      if (editingId) {
        // Update existing category
        await categoriesService.updateCategory(editingId, payload)
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, ...payload, updatedAt: new Date().toISOString() }
              : c
          )
        )
        setMessage({ type: 'success', text: 'Category updated successfully!' })
        setEditingId(null)
      } else {
        // Add new category
        const newCategory = await categoriesService.createCategory(payload)
        setCategories((prev) => [...prev, newCategory])
        setMessage({ type: 'success', text: 'Category added successfully!' })
      }

      resetForm()
    } catch (error) {
      console.error('Error saving category:', error)
      setMessage({ type: 'error', text: 'Failed to save category. Please try again.' })
    } finally {
      setSaving(false)
    }

    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      displayOrder: 0,
      isActive: true,
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (category) => {
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image || '',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false,
    })
    setEditingId(category.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesService.deleteCategory(id)
        setCategories((prev) => prev.filter((c) => c.id !== id))
        setMessage({ type: 'success', text: 'Category deleted successfully!' })
      } catch (error) {
        console.error('Error deleting category:', error)
        setMessage({ type: 'error', text: 'Failed to delete category. Please try again.' })
      }
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    }
  }

  const handleAddSuggested = (categoryName) => {
    setFormData((prev) => ({
      ...prev,
      name: categoryName,
    }))
    setShowForm(true)
  }

  const filteredCategories = categories.filter((c) => {
    const query = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    )
  })

  // Sort categories by display order
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const orderA = a.displayOrder || 0
    const orderB = b.displayOrder || 0
    return orderA - orderB
  })

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Page Header */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#E6DDD6] bg-[#FFFEFC] px-5 py-6 shadow-[0_10px_35px_rgba(58,33,23,0.05)] sm:px-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#DCC8BA]/25 blur-3xl"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-[#E5D8CF] bg-[#F7F4EF] px-3 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#795D4D]">
                  Catalogue Structure
                </span>
              </div>

              <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#281912] sm:text-3xl">
                Categories
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#806C61]">
                Organize your Lamp & Glow catalogue and control how
                product categories appear across the storefront.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#E3D8D0] bg-white px-3 py-1 text-xs font-medium text-[#6D584C]">
                  {categories.length} Total
                </span>

                <span className="rounded-full border border-[#CFE0D1] bg-[#F1F8F2] px-3 py-1 text-xs font-medium text-[#4D7155]">
                  {
                    categories.filter(
                      (category) => category.isActive !== false
                    ).length
                  }{' '}
                  Active
                </span>

                <span className="rounded-full border border-[#E5CCC5] bg-[#FFF3F0] px-3 py-1 text-xs font-medium text-[#915246]">
                  {
                    categories.filter(
                      (category) => category.isActive === false
                    ).length
                  }{' '}
                  Inactive
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="inline-flex min-h-[46px] flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(58,33,23,0.20)] transition hover:bg-[#4C2D21] hover:shadow-[0_14px_30px_rgba(58,33,23,0.25)]"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </section>

        {/* Message */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${message.type === 'success'
                ? 'border-[#C8DEC9] bg-[#F2F9F2]'
                : 'border-[#E5C3BB] bg-[#FFF3F0]'
              }`}
          >
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${message.type === 'success'
                  ? 'bg-[#DCEEDD]'
                  : 'bg-[#F7DDD8]'
                }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-[#4B7453]" />
              ) : (
                <AlertCircle className="h-4 w-4 text-[#A24F43]" />
              )}
            </div>

            <div>
              <p
                className={`text-sm font-semibold ${message.type === 'success'
                    ? 'text-[#3F6747]'
                    : 'text-[#874239]'
                  }`}
              >
                {message.type === 'success'
                  ? 'Success'
                  : 'Something needs attention'}
              </p>

              <p
                className={`mt-0.5 text-xs leading-5 ${message.type === 'success'
                    ? 'text-[#628069]'
                    : 'text-[#9B6259]'
                  }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Suggested Categories */}
        {!showForm && (
          <section className="rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC] p-5 shadow-[0_8px_28px_rgba(58,33,23,0.04)] sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#F0E7E1]">
                <FolderOpen className="h-4.5 w-4.5 text-[#6B4228]" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#302119]">
                  Quick Add Suggested Categories
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#907C70]">
                  Select a suggested category to pre-fill its name, then
                  customize the details before saving.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {SUGGESTED_CATEGORIES.map((categoryName) => {
                const alreadyExists = categories.some(
                  (category) =>
                    category.name?.toLowerCase() ===
                    categoryName.toLowerCase()
                )

                return (
                  <button
                    key={categoryName}
                    type="button"
                    onClick={() => handleAddSuggested(categoryName)}
                    disabled={alreadyExists}
                    title={
                      alreadyExists
                        ? 'Category already exists'
                        : `Add ${categoryName}`
                    }
                    className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${alreadyExists
                        ? 'cursor-not-allowed border-[#E5DFDA] bg-[#F5F2EF] text-[#B0A29A]'
                        : 'border-[#DDD0C7] bg-[#FAF6F2] text-[#654C3F] hover:border-[#BDA697] hover:bg-[#F2E9E3]'
                      }`}
                  >
                    {alreadyExists && (
                      <CheckCircle className="h-3 w-3" />
                    )}

                    {categoryName}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Add / Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/55 p-3 backdrop-blur-[2px] sm:p-5">
            <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[26px] border border-[#E6DCD4] bg-[#FFFEFC] shadow-[0_30px_90px_rgba(40,25,18,0.30)]">
              {/* Fixed Header */}
              <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#3A2117] px-5 py-4 text-white sm:px-7 sm:py-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#CEBBAF]">
                    Category Management
                  </p>

                  <h3 className="mt-1 truncate text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                    {editingId ? 'Edit Category' : 'Add New Category'}
                  </h3>

                  <p className="mt-1 hidden text-xs text-[#CEBBAF] sm:block">
                    {editingId
                      ? 'Update category content, image, order and storefront visibility.'
                      : 'Create and configure a new storefront category.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  aria-label="Close category form"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* Scrollable Content */}
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7 sm:py-7">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Name */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#49362C]">
                        Category Name *
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter category name"
                        required
                        className="h-11 w-full rounded-xl border border-[#DCCFC6] bg-white px-4 text-sm text-[#34241C] outline-none transition placeholder:text-[#B29F93] focus:border-[#8C6650] focus:ring-4 focus:ring-[#6B4228]/10"
                      />
                    </div>

                    {/* Display Order */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#49362C]">
                        Display Order
                      </label>

                      <input
                        type="number"
                        name="displayOrder"
                        value={formData.displayOrder}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        className="h-11 w-full rounded-xl border border-[#DCCFC6] bg-white px-4 text-sm text-[#34241C] outline-none transition placeholder:text-[#B29F93] focus:border-[#8C6650] focus:ring-4 focus:ring-[#6B4228]/10"
                      />

                      <p className="mt-1.5 text-[11px] text-[#9A877C]">
                        Lower numbers appear first on the storefront.
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#49362C]">
                      Description
                    </label>

                    <div className="overflow-hidden rounded-xl border border-[#DED2CA] bg-white">
                      <RichTextEditor
                        value={formData.description}
                        onChange={(html) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: html,
                          }))
                        }
                        placeholder="Enter category description..."
                        minHeight={160}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="rounded-2xl border border-[#E6DDD6] bg-[#FAF7F4] p-4">
                    <label
                      htmlFor="isActive"
                      className="flex cursor-pointer items-start gap-3"
                    >
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="mt-0.5 h-5 w-5 rounded border-[#CDBDB3] accent-[#3A2117]"
                      />

                      <div>
                        <p className="text-sm font-semibold text-[#49362C]">
                          Active Category
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-[#907C70]">
                          When active, this category can be displayed on the
                          customer-facing website.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-[#49362C]">
                      Category Image
                    </label>

                    <div className="flex flex-col gap-4 sm:flex-row">
                      <label
                        className={`flex min-h-[160px] flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition ${imageUploading
                            ? 'cursor-not-allowed border-[#C9B6AA] bg-[#F6F0EB]'
                            : 'cursor-pointer border-[#D7CAC2] bg-[#FCFAF8] hover:border-[#6B4228] hover:bg-[#F8F3EF]'
                          }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={imageUploading}
                        />

                        {imageUploading ? (
                          <>
                            <Loader2 className="mb-2 h-7 w-7 animate-spin text-[#6B4228]" />

                            <span className="text-sm font-semibold text-[#6B4228]">
                              Uploading to XCDN...
                            </span>

                            <span className="mt-1 text-[11px] text-[#99867A]">
                              Please wait
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E7E1]">
                              <ImagePlus className="h-5 w-5 text-[#745747]" />
                            </div>

                            <span className="mt-3 text-sm font-semibold text-[#49362C]">
                              Upload Category Image
                            </span>

                            <span className="mt-1 text-[11px] text-[#99867A]">
                              Click to select an image
                            </span>
                          </>
                        )}
                      </label>

                      {formData.image && (
                        <div className="relative min-h-[160px] overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#F4EFEB] sm:w-[220px]">
                          <img
                            src={formData.image}
                            alt="Category preview"
                            className="h-full min-h-[160px] w-full object-cover"
                          />

                          <div className="absolute bottom-2 left-2 rounded-lg bg-[#3A2117]/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                            Preview
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={imageUploading}
                            aria-label="Remove category image"
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#281912]/85 text-white shadow-sm backdrop-blur transition hover:bg-[#8C4238] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-[#9A877C]">
                      Recommended size: 800 × 600px. Uploaded images are stored
                      through Lamp & Glow XCDN.
                    </p>
                  </div>
                </div>

                {/* Fixed Action Footer */}
                <div className="flex flex-shrink-0 flex-col-reverse gap-2.5 border-t border-[#E5DAD2] bg-[#FFFEFC] px-5 py-4 shadow-[0_-12px_30px_rgba(58,33,23,0.07)] sm:flex-row sm:justify-end sm:px-7">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#DCCFC6] bg-white px-5 text-sm font-semibold text-[#5A4438] transition hover:border-[#BDA99C] hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || imageUploading}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(58,33,23,0.20)] transition hover:bg-[#4C2D21] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {editingId ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search */}
        <section className="rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC] p-4 shadow-[0_8px_28px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9A877B]" />

            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#DDD2CA] bg-[#FCFAF8] pl-11 pr-10 text-sm text-[#34241C] outline-none transition placeholder:text-[#AE9B90] focus:border-[#8B6855] focus:bg-white focus:ring-4 focus:ring-[#6B4228]/10"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear category search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#9A877B] transition hover:bg-[#EEE6E0] hover:text-[#3A2117]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC]"
              >
                <div className="h-48 animate-pulse bg-[#EEE7E1]" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#EEE7E1]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#F3EEEA]" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[#F3EEEA]" />
                  <div className="h-10 animate-pulse rounded-xl bg-[#EEE7E1]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Cards */}
        {!loading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedCategories.length === 0 ? (
              <div className="col-span-full flex min-h-[330px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#D7C9C0] bg-[#FFFEFC] px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2EBE6]">
                  <FolderOpen className="h-7 w-7 text-[#80685A]" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[#34241C]">
                  No categories found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#958176]">
                  {searchQuery
                    ? 'No categories match your search. Try another keyword or clear the search.'
                    : 'Add your first category to begin organizing the Lamp & Glow catalogue.'}
                </p>

                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-5 min-h-[42px] rounded-xl border border-[#D6C9C0] bg-white px-5 text-sm font-semibold text-[#523C31] transition hover:bg-[#F7F4EF]"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm()
                      setShowForm(true)
                    }}
                    className="mt-5 inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#3A2117] px-5 text-sm font-semibold text-white transition hover:bg-[#4C2D21]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </button>
                )}
              </div>
            ) : (
              sortedCategories.map((category) => (
                <article
                  key={category.id}
                  className={`group overflow-hidden rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC] shadow-[0_8px_28px_rgba(58,33,23,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-[#D3C1B5] hover:shadow-[0_16px_42px_rgba(58,33,23,0.09)] ${category.isActive === false ? 'opacity-75' : ''
                    }`}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-[#F2ECE7]">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-[#F3ECE7]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                          <FolderOpen className="h-5 w-5 text-[#80685A]" />
                        </div>

                        <span className="mt-3 text-xs font-medium text-[#99857A]">
                          No category image
                        </span>
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] shadow-sm backdrop-blur ${category.isActive !== false
                            ? 'border-[#C7DDC9] bg-[#F2F9F2]/95 text-[#47704F]'
                            : 'border-[#E3C0B9] bg-[#FFF1EE]/95 text-[#934D42]'
                          }`}
                      >
                        {category.isActive !== false
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#917C70]">
                          Category
                        </p>

                        <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-6 text-[#2F2019]">
                          {category.name}
                        </h3>
                      </div>

                      <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-[#F1E9E4] px-2 text-xs font-bold text-[#6B4228]">
                        #{category.displayOrder || 0}
                      </div>
                    </div>

                    {category.description && (
                      <p className="mt-3 line-clamp-2 min-h-[40px] text-xs leading-5 text-[#867267]">
                        {htmlToPlainText(category.description)}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-[#EFE7E1] pt-4 text-[11px] text-[#978378]">
                      <span>
                        Display order: {category.displayOrder || 0}
                      </span>

                      <span>
                        {formatCategoryDate(category.createdAt)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#4C2D21]"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
                        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-[#DEC0B9] bg-[#FFF7F5] px-3 text-xs font-semibold text-[#924C41] transition hover:border-[#CFA69D] hover:bg-[#FDECE8]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Summary */}
        {!loading && sortedCategories.length > 0 && (
          <section className="rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC] p-5 shadow-[0_8px_28px_rgba(58,33,23,0.04)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#927E72]">
                  Current View
                </p>

                <p className="mt-1 text-sm text-[#675347]">
                  Showing{' '}
                  <span className="font-semibold text-[#281912]">
                    {sortedCategories.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-[#281912]">
                    {categories.length}
                  </span>{' '}
                  categories
                </p>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#968276]">
                    Active
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#486C50]">
                    {
                      categories.filter(
                        (category) => category.isActive !== false
                      ).length
                    }
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#968276]">
                    Inactive
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#934E43]">
                    {
                      categories.filter(
                        (category) => category.isActive === false
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  )
}
