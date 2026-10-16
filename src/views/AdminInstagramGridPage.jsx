'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, Loader2, Image,
  X, Upload, ChevronUp, ChevronDown, Eye, EyeOff,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import instagramGridService from '../utils/instagramGridService.js'

const emptyForm = { image: '', url: '', alt: '', displayOrder: 0, isActive: true }

export default function AdminInstagramGridPage() {
  const [items, setItems] = useState([])
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
    const loadItems = async () => {
      try {
        setLoading(true)
        const data = await instagramGridService.getAllItems()
        setItems(data)
      } catch {
        setMessage({ type: 'error', text: 'Failed to load Instagram images from Firebase' })
      } finally { setLoading(false) }
    }
    loadItems()
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
      const url = await instagramGridService.uploadItemImage(file)
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
    if (!formData.image) { setMessage({ type: 'error', text: 'Please upload an image' }); return }

    setSaving(true)
    try {
      const payload = {
        image: formData.image,
        url: formData.url.trim(),
        alt: formData.alt.trim(),
        displayOrder: Number(formData.displayOrder) || 0,
        isActive: formData.isActive,
      }
      if (editingId) {
        await instagramGridService.updateItem(editingId, payload)
        setItems((prev) => prev.map((i) => i.id === editingId ? { ...i, ...payload } : i).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
        setMessage({ type: 'success', text: 'Image updated!' })
      } else {
        const created = await instagramGridService.createItem(payload)
        setItems((prev) => [...prev, created].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
        setMessage({ type: 'success', text: 'Image added!' })
      }
      resetForm()
    } catch { setMessage({ type: 'error', text: 'Failed to save image.' }) }
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

  const handleEdit = (item) => {
    setFormData({
      image: item.image || '', url: item.url || '', alt: item.alt || '',
      displayOrder: item.displayOrder || 0, isActive: item.isActive !== false,
    })
    setImagePreview(item.image || '')
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await instagramGridService.deleteItem(id)
        setItems((prev) => prev.filter((i) => i.id !== id))
        setMessage({ type: 'success', text: 'Image deleted!' })
      } catch { setMessage({ type: 'error', text: 'Delete failed.' }) }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleToggleActive = async (item) => {
    try {
      const updated = { ...item, isActive: !item.isActive }
      await instagramGridService.updateItem(item.id, updated)
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isActive: !i.isActive } : i))
      setMessage({ type: 'success', text: `Image ${updated.isActive ? 'activated' : 'deactivated'}!` })
    } catch { setMessage({ type: 'error', text: 'Failed to toggle.' }) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const moveItem = async (index, direction) => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === items.length - 1) return
    const newItems = [...items]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const o1 = newItems[index].displayOrder || 0
    const o2 = newItems[swapIndex].displayOrder || 0
    try {
      await instagramGridService.updateItem(newItems[index].id, { ...newItems[index], displayOrder: o2 })
      await instagramGridService.updateItem(newItems[swapIndex].id, { ...newItems[swapIndex], displayOrder: o1 })
      newItems[index] = { ...newItems[index], displayOrder: o2 }
      newItems[swapIndex] = { ...newItems[swapIndex], displayOrder: o1 }
      setItems(newItems.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
      setMessage({ type: 'success', text: 'Order updated!' })
    } catch { setMessage({ type: 'error', text: 'Reorder failed.' }) }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const filteredItems = items.filter((i) =>
    i.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.alt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Instagram Grid</h2>
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105">
            <Plus className="w-5 h-5" /> Add Image
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
          <input type="text" placeholder="Search by URL or alt text..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white" />
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">Loading images...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No images found</p>
            <p className="text-gray-400 text-sm mt-1">{searchQuery ? 'Try adjusting your search.' : 'Add your first Instagram grid image.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, index) => (
              <div key={item.id} className={`bg-white rounded-xl shadow-md border overflow-hidden transition hover:shadow-lg ${item.isActive !== false ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.alt} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Image className="w-8 h-8" /></div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-mono">#{item.displayOrder || 0}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => moveItem(index, 'down')} disabled={index === filteredItems.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 truncate" title={item.url}>
                    {item.url || <span className="text-gray-400 italic">(No link)</span>}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => handleToggleActive(item)} className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition ${item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive !== false ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Inactive</>}
                    </button>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Image' : 'Add Image'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
                <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                  {formData.image || imagePreview ? (
                    <div className="relative">
                      <img src={formData.image || imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm text-red-500 transition"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center py-8 cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Click to upload an image</p>
                      <p className="text-xs text-gray-400 mt-1">Square photo recommended</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploadingImage && <div className="flex items-center justify-center mt-3 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</div>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Post URL</label>
                <input type="url" name="url" value={formData.url} onChange={handleInputChange} placeholder="https://www.instagram.com/p/..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                <p className="text-xs text-gray-400 mt-1">Where clicking this photo should take visitors — e.g. the real Instagram post.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alt Text (SEO)</label>
                <input type="text" name="alt" value={formData.alt} onChange={handleInputChange} placeholder="Image description..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleInputChange} min={0}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white" />
                </div>
                <div className="flex items-end pb-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="igIsActive" name="isActive" checked={formData.isActive} onChange={handleInputChange}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300" />
                    <label htmlFor="igIsActive" className="text-sm font-medium text-gray-700">Active (show on homepage)</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving || uploadingImage} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : editingId ? 'Update Image' : 'Add Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
