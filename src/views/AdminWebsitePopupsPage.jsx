'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image,
  Eye,
  Clock,
  Calendar,
  X,
  Upload,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import websitePopupsService from '../utils/websitePopupsService.js'

export default function AdminWebsitePopupsPage() {
  const [popups, setPopups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bannerImage: '',
    buttonText: 'Learn More',
    buttonUrl: '',
    isActive: true,
    displayDelay: 2,
    startDate: '',
    endDate: '',
    showOncePerSession: true,
  })

  useEffect(() => {
    const loadPopups = async () => {
      try {
        setLoading(true)
        const data = await websitePopupsService.getAllPopups()
        setPopups(data)
      } catch (e) {
        console.error('Error loading popups:', e)
        setMessage({ type: 'error', text: 'Failed to load website popups from Firebase' })
      } finally {
        setLoading(false)
      }
    }
    loadPopups()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)

    setUploadingImage(true)
    try {
      const url = await websitePopupsService.uploadPopupImage(file)
      setFormData((prev) => ({ ...prev, bannerImage: url }))
      setMessage({ type: 'success', text: 'Image uploaded successfully!' })
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' })
    } finally {
      setUploadingImage(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, bannerImage: '' }))
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a popup title' })
      return
    }

    setSaving(true)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        bannerImage: formData.bannerImage,
        buttonText: formData.buttonText.trim(),
        buttonUrl: formData.buttonUrl.trim(),
        isActive: formData.isActive,
        displayDelay: Number(formData.displayDelay) || 0,
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        showOncePerSession: formData.showOncePerSession,
      }

      if (editingId) {
        await websitePopupsService.updatePopup(editingId, payload)
        setPopups((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...payload, updatedAt: new Date().toISOString() }
              : p
          )
        )
        setMessage({ type: 'success', text: 'Popup updated successfully!' })
        setEditingId(null)
      } else {
        const newPopup = await websitePopupsService.createPopup(payload)
        setPopups((prev) => [newPopup, ...prev])
        setMessage({ type: 'success', text: 'Popup created successfully!' })
      }

      resetForm()
    } catch (error) {
      console.error('Error saving popup:', error)
      setMessage({ type: 'error', text: 'Failed to save popup. Please try again.' })
    } finally {
      setSaving(false)
    }

    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      bannerImage: '',
      buttonText: 'Learn More',
      buttonUrl: '',
      isActive: true,
      displayDelay: 2,
      startDate: '',
      endDate: '',
      showOncePerSession: true,
    })
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (popup) => {
    setFormData({
      title: popup.title || '',
      description: popup.description || '',
      bannerImage: popup.bannerImage || '',
      buttonText: popup.buttonText || 'Learn More',
      buttonUrl: popup.buttonUrl || '',
      isActive: popup.isActive !== false,
      displayDelay: popup.displayDelay || 2,
      startDate: popup.startDate ? popup.startDate.slice(0, 16) : '',
      endDate: popup.endDate ? popup.endDate.slice(0, 16) : '',
      showOncePerSession: popup.showOncePerSession !== false,
    })
    setImagePreview(popup.bannerImage || '')
    setEditingId(popup.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this popup?')) {
      try {
        await websitePopupsService.deletePopup(id)
        setPopups((prev) => prev.filter((p) => p.id !== id))
        setMessage({ type: 'success', text: 'Popup deleted successfully!' })
      } catch (error) {
        console.error('Error deleting popup:', error)
        setMessage({ type: 'error', text: 'Failed to delete popup. Please try again.' })
      }
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    }
  }

  const handleToggleActive = async (popup) => {
    try {
      const updated = { ...popup, isActive: !popup.isActive }
      await websitePopupsService.updatePopup(popup.id, updated)
      setPopups((prev) =>
        prev.map((p) => (p.id === popup.id ? { ...p, isActive: !p.isActive } : p))
      )
      setMessage({
        type: 'success',
        text: `Popup ${updated.isActive ? 'activated' : 'deactivated'} successfully!`,
      })
    } catch (error) {
      console.error('Error toggling popup:', error)
      setMessage({ type: 'error', text: 'Failed to update popup status.' })
    }
    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const isScheduledActive = (popup) => {
    const now = new Date().toISOString()
    if (!popup.isActive) return false
    if (popup.startDate && popup.startDate > now) return false
    if (popup.endDate && popup.endDate < now) return false
    return true
  }

  const filteredPopups = popups.filter((p) => {
    const q = searchQuery.toLowerCase()
    return (
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Website Popups</h2>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Popup
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search popups by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Popups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-600">Loading popups...</span>
            </div>
          ) : filteredPopups.length === 0 ? (
            <div className="col-span-full p-12 text-center">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No popups found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery
                  ? 'Try adjusting your search.'
                  : 'Create your first website popup to get started.'}
              </p>
            </div>
          ) : (
            filteredPopups.map((popup) => {
              const scheduledActive = isScheduledActive(popup)
              return (
                <div
                  key={popup.id}
                  className={`bg-white rounded-xl shadow-md border overflow-hidden transition hover:shadow-lg ${
                    popup.isActive !== false ? 'border-gray-200' : 'border-gray-200 opacity-60'
                  }`}
                >
                  {/* Banner Preview */}
                  <div className="relative h-36 bg-gray-100 overflow-hidden">
                    {popup.bannerImage ? (
                      <img
                        src={popup.bannerImage}
                        alt={popup.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Image className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleEdit(popup)}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm text-gray-600 hover:text-blue-600 transition"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(popup.id)}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm text-gray-600 hover:text-[#E53935] transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {popup.title}
                    </h3>
                    {popup.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {popup.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                      {popup.displayDelay > 0 && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          {popup.displayDelay}s delay
                        </span>
                      )}
                      {(popup.startDate || popup.endDate) && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                          <Calendar className="w-3 h-3" />
                          Scheduled
                        </span>
                      )}
                      {popup.showOncePerSession && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                          <Eye className="w-3 h-3" />
                          Once per session
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleToggleActive(popup)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                          scheduledActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {scheduledActive ? 'Active' : 'Inactive'}
                      </button>
                      {popup.buttonText && (
                        <span className="text-xs text-gray-400 truncate max-w-[120px]">
                          {popup.buttonText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Popup' : 'Create Popup'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Popup Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Sale 50% Off"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the popup content..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                />
              </div>

              {/* Banner Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                  {formData.bannerImage || imagePreview ? (
                    <div className="relative">
                      <img
                        src={formData.bannerImage || imagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm text-red-500 hover:text-red-700 transition"
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
                      <p className="text-sm text-gray-500 font-medium">
                        Click to upload banner image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadingImage && (
                    <div className="flex items-center justify-center mt-3 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading image...
                    </div>
                  )}
                </div>
              </div>

              {/* Button Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    placeholder="e.g., Shop Now"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Button URL
                  </label>
                  <input
                    type="text"
                    name="buttonUrl"
                    value={formData.buttonUrl}
                    onChange={handleInputChange}
                    placeholder="e.g., /products or https://..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {/* Display Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Delay (seconds)
                  </label>
                  <input
                    type="number"
                    name="displayDelay"
                    value={formData.displayDelay}
                    onChange={handleInputChange}
                    min={0}
                    max={60}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-sm"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active (visible to users)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showOncePerSession"
                    name="showOncePerSession"
                    checked={formData.showOncePerSession}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300"
                  />
                  <label htmlFor="showOncePerSession" className="text-sm font-medium text-gray-700">
                    Show once per session
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
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
                  {saving ? 'Saving...' : editingId ? 'Update Popup' : 'Create Popup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
