'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, Loader2, Image,
  X, Upload, ChevronUp, ChevronDown, Eye, EyeOff,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import collectionSlidesService from '../utils/collectionSlidesService.js'

const ACTION_TYPES = [
  { value: 'section', label: 'Navigate to Section' },
  { value: 'url', label: 'External URL' },
]

const SECTION_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'products', label: 'Products' },
  { value: 'categories', label: 'Categories' },
  { value: 'blogs', label: 'Blog' },
  { value: 'reels', label: 'Reels' },
  { value: 'about', label: 'About' },
  { value: 'contact', label: 'Contact' },
  { value: 'cart', label: 'Cart' },
]

const emptyForm = {
  title: '', eyebrow: 'Handpick Collection', description: '', image: '', alt: '',
  imageSide: 'left', buttonLabel: '', buttonActionType: 'section', buttonActionValue: 'products',
  displayOrder: 0, isActive: true,
}

export default function AdminCollectionSlidesPage() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    const loadSlides = async () => {
      try {
        setLoading(true)
        const data = await collectionSlidesService.getAllSlides()
        setSlides(data)
      } catch {
        setMessage({ type: 'error', text: 'Failed to load collection slides from Firebase' })
      } finally { setLoading(false) }
    }
    loadSlides()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
    setUploadingImage(true)
    try {
      const url = await collectionSlidesService.uploadSlideImage(file)
      setFormData((prev) => ({ ...prev, image: url }))
      setMessage({ type: 'success', text: 'Image uploaded!' })
    } catch {
      setMessage({ type: 'error', text: 'Image upload failed.' })
    } finally { setUploadingImage(false) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }))
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.image) { setMessage({ type: 'error', text: 'Please upload a slide image' }); return }
    if (!formData.title.trim()) { setMessage({ type: 'error', text: 'Please enter a collection name' }); return }

    setSaving(true)
    try {
      const payload = {
        title: formData.title.trim(),
        eyebrow: formData.eyebrow.trim(),
        description: formData.description.trim(),
        image: formData.image,
        alt: formData.alt.trim() || formData.title.trim(),
        imageSide: formData.imageSide,
        buttonLabel: formData.buttonLabel.trim(),
        buttonAction: formData.buttonLabel.trim()
          ? { type: formData.buttonActionType, value: formData.buttonActionValue }
          : null,
        displayOrder: Number(formData.displayOrder) || 0,
        isActive: formData.isActive,
      }
      if (editingId) {
        await collectionSlidesService.updateSlide(editingId, payload)
        setSlides((prev) => prev.map((s) => s.id === editingId ? { ...s, ...payload } : s).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
        setMessage({ type: 'success', text: 'Slide updated!' })
        setEditingId(null)
      } else {
        const newSlide = await collectionSlidesService.createSlide(payload)
        setSlides((prev) => [...prev, newSlide].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
        setMessage({ type: 'success', text: 'Slide created!' })
      }
      resetForm()
    } catch { setMessage({ type: 'error', text: 'Failed to save slide.' }) }
    finally { setSaving(false) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const resetForm = () => {
    setFormData(emptyForm)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (slide) => {
    setFormData({
      title: slide.title || '', eyebrow: slide.eyebrow || '', description: slide.description || '',
      image: slide.image || '', alt: slide.alt || '', imageSide: slide.imageSide || 'left',
      buttonLabel: slide.buttonLabel || '',
      buttonActionType: slide.buttonAction?.type || 'section',
      buttonActionValue: slide.buttonAction?.value || 'products',
      displayOrder: slide.displayOrder || 0, isActive: slide.isActive !== false,
    })
    setImagePreview(slide.image || '')
    setEditingId(slide.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await collectionSlidesService.deleteSlide(id)
        setSlides((prev) => prev.filter((s) => s.id !== id))
        setMessage({ type: 'success', text: 'Slide deleted!' })
      } catch { setMessage({ type: 'error', text: 'Delete failed.' }) }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleToggleActive = async (slide) => {
    try {
      const updated = { ...slide, isActive: !slide.isActive }
      await collectionSlidesService.updateSlide(slide.id, updated)
      setSlides((prev) => prev.map((s) => s.id === slide.id ? { ...s, isActive: !s.isActive } : s))
      setMessage({ type: 'success', text: `Slide ${updated.isActive ? 'activated' : 'deactivated'}!` })
    } catch { setMessage({ type: 'error', text: 'Failed to toggle.' }) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const moveSlide = async (index, direction) => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === slides.length - 1) return
    const newSlides = [...slides]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const o1 = newSlides[index].displayOrder || 0
    const o2 = newSlides[swapIndex].displayOrder || 0
    try {
      await collectionSlidesService.updateSlide(newSlides[index].id, { ...newSlides[index], displayOrder: o2 })
      await collectionSlidesService.updateSlide(newSlides[swapIndex].id, { ...newSlides[swapIndex], displayOrder: o1 })
      newSlides[index] = { ...newSlides[index], displayOrder: o2 }
      newSlides[swapIndex] = { ...newSlides[swapIndex], displayOrder: o1 }
      setSlides(newSlides.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
      setMessage({ type: 'success', text: 'Order updated!' })
    } catch { setMessage({ type: 'error', text: 'Reorder failed.' }) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const filteredSlides = slides.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.eyebrow?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getActionLabel = (action) => {
    if (!action) return 'None'
    if (action.type === 'section') {
      const s = SECTION_OPTIONS.find((o) => o.value === action.value)
      return s ? `Section: ${s.label}` : `Section: ${action.value}`
    }
    return `URL: ${action.value}`
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Collection Slider</h2>
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105">
            <Plus className="w-5 h-5" /> Add Slide
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-[#E53935] flex-shrink-0" />}
            <p className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search slides..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white" />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-600">Loading slides...</span>
            </div>
          ) : filteredSlides.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No slides found</p>
              <p className="text-gray-400 text-sm mt-1">{searchQuery ? 'Try adjusting your search.' : 'Create your first collection slide.'}</p>
            </div>
          ) : (
            filteredSlides.map((slide, index) => (
              <div key={slide.id} className={`bg-white rounded-xl shadow-md border overflow-hidden transition hover:shadow-lg ${slide.isActive !== false ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0 bg-gray-100 overflow-hidden">
                    {slide.image ? (
                      <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Image className="w-8 h-8" /></div>
                    )}
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {slide.eyebrow && <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{slide.eyebrow}</span>}
                          <span className="text-xs text-gray-400 font-mono">#{slide.displayOrder || 0}</span>
                          <span className="text-xs text-gray-400 font-mono">Image: {slide.imageSide === 'right' ? 'Right' : 'Left'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveSlide(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition"><ChevronUp className="w-4 h-4" /></button>
                          <button onClick={() => moveSlide(index, 'down')} disabled={index === filteredSlides.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition"><ChevronDown className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{slide.title || <span className="text-gray-400 italic">(No title)</span>}</h3>
                      {slide.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{slide.description}</p>}
                      {slide.buttonLabel && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><span className="font-semibold">Btn:</span> {slide.buttonLabel} &middot; {getActionLabel(slide.buttonAction)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <button onClick={() => handleToggleActive(slide)} className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition ${slide.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {slide.isActive !== false ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Inactive</>}
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(slide)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(slide.id)} className="p-2 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Slide' : 'Create Slide'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slide Image *</label>
                <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                  {formData.image || imagePreview ? (
                    <div className="relative">
                      <img src={formData.image || imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm text-red-500 transition"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center py-8 cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Click to upload slide image</p>
                      <p className="text-xs text-gray-400 mt-1">Recommended 4:3 landscape photo, no baked-in text</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploadingImage && <div className="flex items-center justify-center mt-3 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</div>}
                </div>
              </div>

              {/* Order + Toggles + Image Side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleInputChange} min={0}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image Side (desktop)</label>
                  <select name="imageSide" value={formData.imageSide} onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300" />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (show on homepage)</label>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Label</label>
                  <input type="text" name="eyebrow" value={formData.eyebrow} onChange={handleInputChange} placeholder="e.g., Handpick Collection"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Collection Name *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., New Collection"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Content / Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Short description shown under the collection name..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white resize-none" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Alt Text (SEO)</label>
                  <input type="text" name="alt" value={formData.alt} onChange={handleInputChange} placeholder="Image description..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
              </div>

              {/* Button */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-3">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Button (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Button Text</label>
                    <input type="text" name="buttonLabel" value={formData.buttonLabel} onChange={handleInputChange} placeholder="e.g., Shop Now"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Action Type</label>
                    <select name="buttonActionType" value={formData.buttonActionType} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm">
                      {ACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">{formData.buttonActionType === 'section' ? 'Select Section' : 'Enter URL'}</label>
                    {formData.buttonActionType === 'section' ? (
                      <select name="buttonActionValue" value={formData.buttonActionValue} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm">
                        {SECTION_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    ) : (
                      <input type="text" name="buttonActionValue" value={formData.buttonActionValue} onChange={handleInputChange} placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm" />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving || uploadingImage} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : editingId ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
