'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, AlertCircle, CheckCircle, ImagePlus, Loader2, FolderOpen } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import AdminLayout from '../components/AdminLayout'
import RichTextEditor from '../components/RichTextEditor.jsx'
import categoriesService from '../utils/categoriesService.js'
import { storage } from '../utils/firebase.js'

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

  // Upload image to Firebase Storage
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Categories Management</h2>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#E53935] flex-shrink-0" />
            )}
            <p
              className={`font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Suggested Categories */}
        {!showForm && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-orange-500" />
              Quick Add Suggested Categories
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Click on any category below to quickly add it. You can customize the details before saving.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_CATEGORIES.map((categoryName) => {
                const alreadyExists = categories.some(
                  (c) => c.name.toLowerCase() === categoryName.toLowerCase()
                )
                return (
                  <button
                    key={categoryName}
                    onClick={() => handleAddSuggested(categoryName)}
                    disabled={alreadyExists}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      alreadyExists
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                    }`}
                    title={alreadyExists ? 'Category already exists' : `Add ${categoryName}`}
                  >
                    {alreadyExists && <CheckCircle className="w-3 h-3 inline mr-1" />}
                    {categoryName}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Add/Edit Category Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 px-8 py-6 flex items-center justify-between text-white">
                <h3 className="text-2xl font-bold">
                  {editingId ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter category name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
                    placeholder="Enter category description..."
                    minHeight={160}
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                    Active (visible on website)
                  </label>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category Image
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {/* Upload Button */}
                    <label
                      className={`w-40 h-40 border-2 border-dashed rounded-lg transition flex flex-col items-center justify-center text-center cursor-pointer ${
                        imageUploading
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-500'
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
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                      ) : (
                        <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                      )}
                      <span className="text-sm text-gray-500">
                        {imageUploading ? 'Uploading...' : 'Add Image'}
                      </span>
                    </label>

                    {/* Image Preview */}
                    {formData.image && (
                      <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-orange-500">
                        <img
                          src={formData.image}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-[#E53935] transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended size: 800x600px. Image will be displayed on the category card.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saving || imageUploading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Update Category' : 'Add Category'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="mt-2 text-gray-500">Loading categories...</p>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCategories.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No categories found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'Add your first category to get started'}
                </p>
              </div>
            ) : (
              sortedCategories.map((category) => (
                <div
                  key={category.id}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden ${
                    !category.isActive ? 'opacity-70' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="h-40 overflow-hidden bg-gray-100">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                        <FolderOpen className="w-12 h-12 text-orange-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          category.isActive !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <span>Order: {category.displayOrder || 0}</span>
                      <span>
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString()
                          : ''}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="flex-1 bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="flex-1 bg-red-500 text-white font-semibold py-2 rounded-lg hover:bg-[#E53935] transition flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && sortedCategories.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-bold text-gray-900">{sortedCategories.length}</span> of{' '}
              <span className="font-bold text-gray-900">{categories.length}</span> categories
            </p>
            <div className="text-right">
              <p className="text-sm text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-orange-500">
                {categories.filter((c) => c.isActive !== false).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
