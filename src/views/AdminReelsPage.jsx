'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Video,
  Upload,
  Link as LinkIcon,
  Play,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import reelsService from '../utils/reelsService'

export default function AdminReelsPage() {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [previewReel, setPreviewReel] = useState(null)
  const [inputMode, setInputMode] = useState({ video: 'url', poster: 'url' })
  const videoFileRef = useRef(null)
  const posterFileRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    videoUrl: '',
    poster: '',
    isActive: true,
  })

  // Load reels from Firebase
  useEffect(() => {
    const loadReels = async () => {
      try {
        setLoading(true)
        const data = await reelsService.getAllReels()
        setReels(data)
      } catch (e) {
        console.error('Error loading reels:', e)
        setMessage({ type: 'error', text: 'Failed to load reels' })
      } finally {
        setLoading(false)
      }
    }
    loadReels()
  }, [])

  const handleOpenForm = (reel = null) => {
    if (reel) {
      setEditingId(reel.id)
      setFormData({
        title: reel.title,
        caption: reel.caption || '',
        videoUrl: reel.videoUrl || '',
        poster: reel.poster || '',
        isActive: reel.isActive !== false,
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        caption: '',
        videoUrl: '',
        poster: '',
        isActive: true,
      })
    }
    setInputMode({ video: 'url', poster: 'url' })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      title: '',
      caption: '',
      videoUrl: '',
      poster: '',
      isActive: true,
    })
    setInputMode({ video: 'url', poster: 'url' })
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Reel title is required' })
      return
    }

    if (!formData.videoUrl.trim()) {
      setMessage({ type: 'error', text: 'Video URL is required' })
      return
    }

    try {
      setSaving(true)
      if (editingId) {
        await reelsService.updateReel(editingId, formData)
        const updated = await reelsService.getAllReels()
        setReels(updated)
        setMessage({ type: 'success', text: 'Reel updated successfully' })
      } else {
        await reelsService.createReel(formData)
        const updated = await reelsService.getAllReels()
        setReels(updated)
        setMessage({ type: 'success', text: 'Reel created successfully' })
      }
      handleCloseForm()
    } catch (error) {
      console.error('Error saving reel:', error)
      setMessage({ type: 'error', text: 'Failed to save reel' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reel?')) return

    try {
      setSaving(true)
      await reelsService.deleteReel(id)
      const updated = await reelsService.getAllReels()
      setReels(updated)
      setMessage({ type: 'success', text: 'Reel deleted successfully' })
    } catch (error) {
      console.error('Error deleting reel:', error)
      setMessage({ type: 'error', text: 'Failed to delete reel' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setSaving(true)
      await reelsService.toggleReelActive(id, !currentStatus)
      const updated = await reelsService.getAllReels()
      setReels(updated)
      setMessage({ type: 'success', text: `Reel ${!currentStatus ? 'activated' : 'deactivated'} successfully` })
    } catch (error) {
      console.error('Error toggling active status:', error)
      setMessage({ type: 'error', text: 'Failed to update active status' })
    } finally {
      setSaving(false)
    }
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingVideo(true)
      const url = await reelsService.uploadVideo(file)
      setFormData((prev) => ({ ...prev, videoUrl: url }))
      setMessage({ type: 'success', text: 'Video uploaded successfully' })
    } catch (error) {
      console.error('Error uploading video:', error)
      setMessage({ type: 'error', text: 'Failed to upload video' })
    } finally {
      setUploadingVideo(false)
    }
  }

  const handlePosterUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingPoster(true)
      const url = await reelsService.uploadPoster(file)
      setFormData((prev) => ({ ...prev, poster: url }))
      setMessage({ type: 'success', text: 'Poster uploaded successfully' })
    } catch (error) {
      console.error('Error uploading poster:', error)
      setMessage({ type: 'error', text: 'Failed to upload poster' })
    } finally {
      setUploadingPoster(false)
    }
  }

  const filteredReels = reels.filter(
    (reel) =>
      reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reel.caption || '').toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reels Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage video reels for your store</p>
          </div>

          {/* Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-[#22C55E]'}`}>
              {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              {message.text}
            </div>
          )}

          {/* Preview Modal */}
          {previewReel && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{previewReel.title}</h3>
                  <button onClick={() => setPreviewReel(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="p-4">
                  <video
                    className="w-full rounded-lg bg-black"
                    src={previewReel.videoUrl}
                    poster={previewReel.poster}
                    controls
                    playsInline
                    preload="metadata"
                  />
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{previewReel.caption}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            {showForm && (
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingId ? 'Edit Reel' : 'Create New Reel'}
                    </h2>
                    <button
                      onClick={handleCloseForm}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <X size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Reel Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Warm Glow Corner Setup"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Caption */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Caption / Description
                      </label>
                      <textarea
                        value={formData.caption}
                        onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                        placeholder="Short description for the reel"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Video Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Video *
                      </label>
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setInputMode((prev) => ({ ...prev, video: 'url' }))}
                          className={`px-3 py-1 rounded text-xs font-medium ${inputMode.video === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                          <LinkIcon size={12} className="inline mr-1" />
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputMode((prev) => ({ ...prev, video: 'upload' }))}
                          className={`px-3 py-1 rounded text-xs font-medium ${inputMode.video === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                          <Upload size={12} className="inline mr-1" />
                          Upload
                        </button>
                      </div>

                      {inputMode.video === 'url' ? (
                        <input
                          type="url"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                          placeholder="https://example.com/video.mp4"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <div className="space-y-2">
                          <input
                            ref={videoFileRef}
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => videoFileRef.current?.click()}
                            disabled={uploadingVideo}
                            className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                          >
                            {uploadingVideo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            {uploadingVideo ? 'Uploading...' : formData.videoUrl ? 'Replace Video' : 'Upload Video'}
                          </button>
                          {formData.videoUrl && (
                            <p className="text-xs text-[#22C55E] dark:text-[#22C55E] truncate">{formData.videoUrl}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Poster Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Poster / Thumbnail
                      </label>
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setInputMode((prev) => ({ ...prev, poster: 'url' }))}
                          className={`px-3 py-1 rounded text-xs font-medium ${inputMode.poster === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                          <LinkIcon size={12} className="inline mr-1" />
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputMode((prev) => ({ ...prev, poster: 'upload' }))}
                          className={`px-3 py-1 rounded text-xs font-medium ${inputMode.poster === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                          <Upload size={12} className="inline mr-1" />
                          Upload
                        </button>
                      </div>

                      {inputMode.poster === 'url' ? (
                        <input
                          type="url"
                          value={formData.poster}
                          onChange={(e) => setFormData((prev) => ({ ...prev, poster: e.target.value }))}
                          placeholder="https://example.com/poster.jpg"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <div className="space-y-2">
                          <input
                            ref={posterFileRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePosterUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => posterFileRef.current?.click()}
                            disabled={uploadingPoster}
                            className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                          >
                            {uploadingPoster ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            {uploadingPoster ? 'Uploading...' : formData.poster ? 'Replace Poster' : 'Upload Poster'}
                          </button>
                          {formData.poster && (
                            <img
                              src={formData.poster}
                              alt="Poster preview"
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active (visible to users)
                      </label>
                    </div>

                    {/* Save Button */}
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      {saving ? 'Saving...' : 'Save Reel'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* List Section */}
            <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search reels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => handleOpenForm()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  New Reel
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Loader2 size={32} className="animate-spin mx-auto text-blue-600 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Loading reels...</p>
                </div>
              ) : filteredReels.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                  <Video size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No reels created yet</p>
                  <button
                    onClick={() => handleOpenForm()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <Plus size={20} />
                    Create First Reel
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredReels.map((reel) => (
                    <div key={reel.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Thumbnail */}
                      <div className="relative bg-black aspect-video">
                        {reel.poster ? (
                          <img
                            src={reel.poster}
                            alt={reel.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <Video size={40} className="text-gray-600" />
                          </div>
                        )}
                        <button
                          onClick={() => setPreviewReel(reel)}
                          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                        >
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                            <Play size={20} className="text-gray-900 ml-1" />
                          </div>
                        </button>
                        <span
                          className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            reel.isActive !== false
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-[#22C55E]'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {reel.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
                          {reel.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                          {reel.caption || 'No caption'}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(reel.id, reel.isActive !== false)}
                            disabled={saving}
                            title={reel.isActive !== false ? 'Deactivate' : 'Activate'}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            {reel.isActive !== false ? (
                              <Eye size={18} className="text-[#22C55E]" />
                            ) : (
                              <EyeOff size={18} className="text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenForm(reel)}
                            disabled={saving}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(reel.id)}
                            disabled={saving}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <Trash2 size={18} className="text-[#E53935]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
