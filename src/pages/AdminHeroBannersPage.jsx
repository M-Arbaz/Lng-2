'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, Loader2, Image,
  X, Upload, ChevronUp, ChevronDown, Eye, EyeOff, Smartphone,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import heroBannersService from '../utils/heroBannersService.js'

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

export default function AdminHeroBannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingMobileImage, setUploadingMobileImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [mobileImagePreview, setMobileImagePreview] = useState('')
  const fileInputRef = useRef(null)
  const mobileFileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '', subtitle: '', badge: '', image: '', imageMobile: '', alt: '',
    primaryLabel: '', primaryActionType: 'section', primaryActionValue: '',
    secondaryLabel: '', secondaryActionType: 'section', secondaryActionValue: '',
    displayOrder: 0, isActive: true, fitToScreen: true, fullScreen: false,
  })

  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true)
        const data = await heroBannersService.getAllBanners()
        setBanners(data)
      } catch (e) {
        setMessage({ type: 'error', text: 'Failed to load hero banners from Firebase' })
      } finally { setLoading(false) }
    }
    loadBanners()
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
      const url = await heroBannersService.uploadBannerImage(file)
      setFormData((prev) => ({ ...prev, image: url }))
      setMessage({ type: 'success', text: 'Desktop image uploaded!' })
    } catch {
      setMessage({ type: 'error', text: 'Desktop image upload failed.' })
    } finally { setUploadingImage(false) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleMobileImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setMobileImagePreview(reader.result)
    reader.readAsDataURL(file)
    setUploadingMobileImage(true)
    try {
      const url = await heroBannersService.uploadBannerImage(file)
      setFormData((prev) => ({ ...prev, imageMobile: url }))
      setMessage({ type: 'success', text: 'Mobile image uploaded!' })
    } catch {
      setMessage({ type: 'error', text: 'Mobile image upload failed.' })
    } finally { setUploadingMobileImage(false) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }))
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveMobileImage = () => {
    setFormData((prev) => ({ ...prev, imageMobile: '' }))
    setMobileImagePreview('')
    if (mobileFileInputRef.current) mobileFileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.image) { setMessage({ type: 'error', text: 'Please upload a desktop banner image' }); return }

    setSaving(true)
    try {
      const payload = {
        title: formData.title.trim(), subtitle: formData.subtitle.trim(), badge: formData.badge.trim(),
        image: formData.image, imageMobile: formData.imageMobile || '', alt: formData.alt.trim() || formData.title.trim(),
        primaryLabel: formData.primaryLabel.trim(),
        primaryAction: formData.primaryLabel.trim()
          ? { type: formData.primaryActionType, value: formData.primaryActionValue }
          : null,
        secondaryLabel: formData.secondaryLabel.trim(),
        secondaryAction: formData.secondaryLabel.trim() && formData.secondaryActionValue
          ? { type: formData.secondaryActionType, value: formData.secondaryActionValue } : null,
        displayOrder: Number(formData.displayOrder) || 0, isActive: formData.isActive,
        fitToScreen: formData.fitToScreen, fullScreen: formData.fullScreen,
      }
      if (editingId) {
        await heroBannersService.updateBanner(editingId, payload)
        setBanners((prev) => prev.map((b) => b.id === editingId ? { ...b, ...payload } : b).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
        setMessage({ type: 'success', text: 'Banner updated!' })
        setEditingId(null)
      } else {
        const newBanner = await heroBannersService.createBanner(payload)
        setBanners((prev) => [...prev, newBanner].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
        setMessage({ type: 'success', text: 'Banner created!' })
      }
      resetForm()
    } catch { setMessage({ type: 'error', text: 'Failed to save banner.' }) }
    finally { setSaving(false) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const resetForm = () => {
    setFormData({
      title: '', subtitle: '', badge: '', image: '', imageMobile: '', alt: '',
      primaryLabel: '', primaryActionType: 'section', primaryActionValue: '',
      secondaryLabel: '', secondaryActionType: 'section', secondaryActionValue: '',
      displayOrder: 0, isActive: true, fitToScreen: true, fullScreen: false,
    })
    setImagePreview('')
    setMobileImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (mobileFileInputRef.current) mobileFileInputRef.current.value = ''
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title || '', subtitle: banner.subtitle || '', badge: banner.badge || '',
      image: banner.image || '', imageMobile: banner.imageMobile || '', alt: banner.alt || '',
      primaryLabel: banner.primaryLabel || '',
      primaryActionType: banner.primaryAction?.type || 'section',
      primaryActionValue: banner.primaryAction?.value || '',
      fitToScreen: banner.fitToScreen !== false,
      fullScreen: banner.fullScreen === true,
      secondaryLabel: banner.secondaryLabel || '',
      secondaryActionType: banner.secondaryAction?.type || 'section',
      secondaryActionValue: banner.secondaryAction?.value || '',
      displayOrder: banner.displayOrder || 0, isActive: banner.isActive !== false,
    })
    setImagePreview(banner.image || '')
    setMobileImagePreview(banner.imageMobile || '')
    setEditingId(banner.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await heroBannersService.deleteBanner(id)
        setBanners((prev) => prev.filter((b) => b.id !== id))
        setMessage({ type: 'success', text: 'Banner deleted!' })
      } catch { setMessage({ type: 'error', text: 'Delete failed.' }) }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleToggleActive = async (banner) => {
    try {
      const updated = { ...banner, isActive: !banner.isActive }
      await heroBannersService.updateBanner(banner.id, updated)
      setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
      setMessage({ type: 'success', text: `Banner ${updated.isActive ? 'activated' : 'deactivated'}!` })
    } catch { setMessage({ type: 'error', text: 'Failed to toggle.' }) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const moveBanner = async (index, direction) => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === banners.length - 1) return
    const newBanners = [...banners]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const o1 = newBanners[index].displayOrder || 0
    const o2 = newBanners[swapIndex].displayOrder || 0
    try {
      await heroBannersService.updateBanner(newBanners[index].id, { ...newBanners[index], displayOrder: o2 })
      await heroBannersService.updateBanner(newBanners[swapIndex].id, { ...newBanners[swapIndex], displayOrder: o1 })
      newBanners[index] = { ...newBanners[index], displayOrder: o2 }
      newBanners[swapIndex] = { ...newBanners[swapIndex], displayOrder: o1 }
      setBanners(newBanners.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
      setMessage({ type: 'success', text: 'Order updated!' })
    } catch { setMessage({ type: 'error', text: 'Reorder failed.' }) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const filteredBanners = banners.filter((b) =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.badge?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-3xl font-bold text-gray-900">Hero Banners</h2>
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105">
            <Plus className="w-5 h-5" /> Add Banner
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
          <input type="text" placeholder="Search banners..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white" />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-600">Loading banners...</span>
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No banners found</p>
              <p className="text-gray-400 text-sm mt-1">{searchQuery ? 'Try adjusting your search.' : 'Create your first hero banner.'}</p>
            </div>
          ) : (
            filteredBanners.map((banner, index) => (
              <div key={banner.id} className={`bg-white rounded-xl shadow-md border overflow-hidden transition hover:shadow-lg ${banner.isActive !== false ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0 bg-gray-100 overflow-hidden relative">
                    {banner.image ? (
                      <img src={banner.image} alt={banner.alt} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Image className="w-8 h-8" /></div>
                    )}
                    {banner.imageMobile && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> Mobile
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {banner.badge && <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{banner.badge}</span>}
                          <span className="text-xs text-gray-400 font-mono">#{banner.displayOrder || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveBanner(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition"><ChevronUp className="w-4 h-4" /></button>
                          <button onClick={() => moveBanner(index, 'down')} disabled={index === filteredBanners.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition"><ChevronDown className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{banner.title || <span className="text-gray-400 italic">(No title)</span>}</h3>
                      {banner.subtitle && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{banner.subtitle}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                        {banner.primaryLabel && <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><span className="font-semibold">Btn:</span> {banner.primaryLabel} &middot; {getActionLabel(banner.primaryAction)}</span>}
                        {banner.secondaryLabel && <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full"><span className="font-semibold">2nd:</span> {banner.secondaryLabel}</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <button onClick={() => handleToggleActive(banner)} className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition ${banner.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {banner.isActive !== false ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Inactive</>}
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(banner)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(banner.id)} className="p-2 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Banner' : 'Create Banner'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Desktop Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Desktop Banner Image *</label>
                <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                  {formData.image || imagePreview ? (
                    <div className="relative">
                      <img src={formData.image || imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm text-red-500 transition"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center py-8 cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Click to upload desktop banner image</p>
                      <p className="text-xs text-gray-400 mt-1">Recommended 3780 x 1400 (horizontal)</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploadingImage && <div className="flex items-center justify-center mt-3 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</div>}
                </div>
              </div>

              {/* Mobile Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Banner Image <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                  {formData.imageMobile || mobileImagePreview ? (
                    <div className="relative">
                      <img src={formData.imageMobile || mobileImagePreview} alt="Mobile Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button type="button" onClick={handleRemoveMobileImage} className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm text-red-500 transition"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div onClick={() => mobileFileInputRef.current?.click()} className="flex flex-col items-center justify-center py-8 cursor-pointer">
                      <Smartphone className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Click to upload mobile banner image</p>
                      <p className="text-xs text-gray-400 mt-1">Recommended 4:4 square ratio</p>
                    </div>
                  )}
                  <input ref={mobileFileInputRef} type="file" accept="image/*" onChange={handleMobileImageUpload} className="hidden" />
                  {uploadingMobileImage && <div className="flex items-center justify-center mt-3 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</div>}
                </div>
              </div>

              {/* Order + Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleInputChange} min={0}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
                <div className="flex items-end pb-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300" />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (show on homepage)</label>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="fitToScreen" name="fitToScreen" checked={formData.fitToScreen} onChange={handleInputChange}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300" />
                  <label htmlFor="fitToScreen" className="text-sm font-medium text-gray-700">Fit to Screen (cover)</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="fullScreen" name="fullScreen" checked={formData.fullScreen} onChange={handleInputChange}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300" />
                  <label htmlFor="fullScreen" className="text-sm font-medium text-gray-700">Full Screen (100vh)</label>
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Illuminate Your Home"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                  <input type="text" name="subtitle" value={formData.subtitle} onChange={handleInputChange} placeholder="Short description..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Badge</label>
                  <input type="text" name="badge" value={formData.badge} onChange={handleInputChange} placeholder="e.g., New"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Alt Text (SEO)</label>
                  <input type="text" name="alt" value={formData.alt} onChange={handleInputChange} placeholder="Image description..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
              </div>

              {/* Primary Button */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-3">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Primary Button (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Button Text</label>
                    <input type="text" name="primaryLabel" value={formData.primaryLabel} onChange={handleInputChange} placeholder="e.g., Shop Now"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Action Type</label>
                    <select name="primaryActionType" value={formData.primaryActionType} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm">
                      {ACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">{formData.primaryActionType === 'section' ? 'Select Section' : 'Enter URL'}</label>
                    {formData.primaryActionType === 'section' ? (
                      <select name="primaryActionValue" value={formData.primaryActionValue} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm">
                        {SECTION_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    ) : (
                      <input type="text" name="primaryActionValue" value={formData.primaryActionValue} onChange={handleInputChange} placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm" />
                    )}
                  </div>
                </div>
              </div>

              {/* Secondary Button */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-3">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Secondary Button (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Button Text</label>
                    <input type="text" name="secondaryLabel" value={formData.secondaryLabel} onChange={handleInputChange} placeholder="e.g., Learn More"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Action Type</label>
                    <select name="secondaryActionType" value={formData.secondaryActionType} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm">
                      {ACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">{formData.secondaryActionType === 'section' ? 'Select Section' : 'Enter URL'}</label>
                    {formData.secondaryActionType === 'section' ? (
                      <select name="secondaryActionValue" value={formData.secondaryActionValue} onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm">
                        <option value="">-- None --</option>
                        {SECTION_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    ) : (
                      <input type="text" name="secondaryActionValue" value={formData.secondaryActionValue} onChange={handleInputChange} placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm" />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving || uploadingImage || uploadingMobileImage} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
