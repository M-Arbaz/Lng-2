'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  Link2,
  Globe,
  ExternalLink,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import socialLinksService from '../utils/socialLinksService.js'

const PLATFORM_OPTIONS = [
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600 text-white' },
  { value: 'instagram', label: 'Instagram', color: 'bg-pink-600 text-white' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-black text-white' },
  { value: 'youtube', label: 'YouTube', color: 'bg-[#E53935] text-white' },
  { value: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700 text-white' },
  { value: 'x', label: 'X (Twitter)', color: 'bg-gray-900 text-white' },
  { value: 'pinterest', label: 'Pinterest', color: 'bg-red-700 text-white' },
  { value: 'whatsapp', label: 'WhatsApp', color: 'bg-green-600 text-white' },
]

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    platform: 'facebook',
    url: '',
    displayOrder: 0,
    isActive: true,
  })

  // Load social links from Firebase
  useEffect(() => {
    const loadLinks = async () => {
      try {
        setLoading(true)
        const data = await socialLinksService.getAllSocialLinks()
        setLinks(data)
      } catch (e) {
        console.error('Error loading social links:', e)
        setMessage({ type: 'error', text: 'Failed to load social links from Firebase' })
      } finally {
        setLoading(false)
      }
    }
    loadLinks()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.url.trim()) {
      setMessage({ type: 'error', text: 'Please enter a URL' })
      return
    }

    // Basic URL validation
    let url = formData.url.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    setSaving(true)

    try {
      const payload = {
        platform: formData.platform,
        url,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
        isActive: formData.isActive,
      }

      if (editingId) {
        await socialLinksService.updateSocialLink(editingId, payload)
        setLinks((prev) =>
          prev.map((l) =>
            l.id === editingId
              ? { ...l, ...payload, updatedAt: new Date().toISOString() }
              : l
          )
        )
        setMessage({ type: 'success', text: 'Social link updated successfully!' })
        setEditingId(null)
      } else {
        const newLink = await socialLinksService.createSocialLink(payload)
        setLinks((prev) => [...prev, newLink])
        setMessage({ type: 'success', text: 'Social link added successfully!' })
      }

      resetForm()
    } catch (error) {
      console.error('Error saving social link:', error)
      setMessage({ type: 'error', text: 'Failed to save social link. Please try again.' })
    } finally {
      setSaving(false)
    }

    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const resetForm = () => {
    setFormData({
      platform: 'facebook',
      url: '',
      displayOrder: 0,
      isActive: true,
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (link) => {
    setFormData({
      platform: link.platform || 'facebook',
      url: link.url || '',
      displayOrder: link.displayOrder || 0,
      isActive: link.isActive !== false,
    })
    setEditingId(link.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this social link?')) {
      try {
        await socialLinksService.deleteSocialLink(id)
        setLinks((prev) => prev.filter((l) => l.id !== id))
        setMessage({ type: 'success', text: 'Social link deleted successfully!' })
      } catch (error) {
        console.error('Error deleting social link:', error)
        setMessage({ type: 'error', text: 'Failed to delete social link. Please try again.' })
      }
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    }
  }

  const handleToggleActive = async (link) => {
    try {
      const updated = { ...link, isActive: !link.isActive }
      await socialLinksService.updateSocialLink(link.id, updated)
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, isActive: !l.isActive } : l))
      )
      setMessage({
        type: 'success',
        text: `Social link ${updated.isActive ? 'activated' : 'deactivated'} successfully!`,
      })
    } catch (error) {
      console.error('Error toggling social link:', error)
      setMessage({ type: 'error', text: 'Failed to update social link status.' })
    }
    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const filteredLinks = links.filter((l) => {
    const query = searchQuery.toLowerCase()
    const platformLabel =
      PLATFORM_OPTIONS.find((p) => p.value === l.platform)?.label || l.platform
    return (
      platformLabel.toLowerCase().includes(query) ||
      l.url?.toLowerCase().includes(query)
    )
  })

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    const orderA = a.displayOrder || 0
    const orderB = b.displayOrder || 0
    return orderA - orderB
  })

  const getPlatformInfo = (value) =>
    PLATFORM_OPTIONS.find((p) => p.value === value) || {
      label: value,
      color: 'bg-gray-500 text-white',
    }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Social Media Links</h2>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Link
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
            placeholder="Search by platform or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Links Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-600">Loading social links...</span>
            </div>
          ) : sortedLinks.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No social links found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery
                  ? 'Try adjusting your search.'
                  : 'Add your first social media link to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedLinks.map((link) => {
                    const platformInfo = getPlatformInfo(link.platform)
                    return (
                      <tr
                        key={link.id}
                        className="hover:bg-gray-50/50 transition"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${platformInfo.color}`}
                          >
                            {platformInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            {link.url}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 font-medium">
                            {link.displayOrder || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(link)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              link.isActive !== false
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                link.isActive !== false
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(link)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="p-2 text-[#E53935] hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Links Preview */}
        {!loading && sortedLinks.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Footer Preview — Active Links
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              {links
                .filter((l) => l.isActive !== false)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((link) => {
                  const platformInfo = getPlatformInfo(link.platform)
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90 ${platformInfo.color}`}
                    >
                      {platformInfo.label}
                    </a>
                  )
                })}
              {links.filter((l) => l.isActive !== false).length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No active links to display. Toggle a link to active to see it here.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Social Link' : 'Add Social Link'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Platform */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform *
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  {PLATFORM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourpage"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Full URL including https://
                </p>
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
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first in the footer.
                </p>
              </div>

              {/* Active Toggle */}
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
                  Active (visible in footer)
                </label>
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
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving
                    ? 'Saving...'
                    : editingId
                    ? 'Update Link'
                    : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
