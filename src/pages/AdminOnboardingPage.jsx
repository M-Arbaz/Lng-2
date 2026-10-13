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
  Lightbulb,
  ChevronRight,
  X,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import onboardingService from '../utils/onboardingService.js'

const MODULE_OPTIONS = [
  { value: '/admin/dashboard', label: 'Dashboard' },
  { value: '/admin/products', label: 'Products' },
  { value: '/admin/categories', label: 'Categories' },
  { value: '/admin/orders', label: 'Orders' },
  { value: '/admin/customers', label: 'Customers' },
  { value: '/admin/coupons', label: 'Coupons' },
  { value: '/admin/payments', label: 'Payments' },
  { value: '/admin/social-links', label: 'Social Links' },
  { value: '/admin/onboarding', label: 'Onboarding' },
]

export default function AdminOnboardingPage() {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [previewGuide, setPreviewGuide] = useState(null)
  const [previewStep, setPreviewStep] = useState(0)

  const [formData, setFormData] = useState({
    modulePath: '/admin/dashboard',
    title: '',
    description: '',
    isActive: true,
    steps: [{ title: '', description: '', order: 0 }],
  })

  // Load guides from Firebase
  useEffect(() => {
    const loadGuides = async () => {
      try {
        setLoading(true)
        const data = await onboardingService.getAllGuides()
        setGuides(data)
      } catch (e) {
        console.error('Error loading guides:', e)
        setMessage({ type: 'error', text: 'Failed to load onboarding guides from Firebase' })
      } finally {
        setLoading(false)
      }
    }
    loadGuides()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleStepChange = (index, field, value) => {
    setFormData((prev) => {
      const newSteps = [...prev.steps]
      newSteps[index] = { ...newSteps[index], [field]: value }
      return { ...prev, steps: newSteps }
    })
  }

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { title: '', description: '', order: prev.steps.length }],
    }))
  }

  const removeStep = (index) => {
    setFormData((prev) => {
      const newSteps = prev.steps.filter((_, i) => i !== index)
      // Re-order remaining steps
      return {
        ...prev,
        steps: newSteps.map((s, i) => ({ ...s, order: i })),
      }
    })
  }

  const moveStep = (index, direction) => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === formData.steps.length - 1) return

    setFormData((prev) => {
      const newSteps = [...prev.steps]
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      ;[newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]]
      return {
        ...prev,
        steps: newSteps.map((s, i) => ({ ...s, order: i })),
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a guide title' })
      return
    }
    if (!formData.modulePath) {
      setMessage({ type: 'error', text: 'Please select a module' })
      return
    }
    if (formData.steps.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one step' })
      return
    }
    if (formData.steps.some((s) => !s.title.trim() || !s.description.trim())) {
      setMessage({ type: 'error', text: 'All steps must have a title and description' })
      return
    }

    setSaving(true)

    try {
      const payload = {
        modulePath: formData.modulePath,
        title: formData.title.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        steps: formData.steps.map((s, i) => ({
          title: s.title.trim(),
          description: s.description.trim(),
          order: i,
        })),
      }

      if (editingId) {
        await onboardingService.updateGuide(editingId, payload)
        setGuides((prev) =>
          prev.map((g) =>
            g.id === editingId
              ? { ...g, ...payload, updatedAt: new Date().toISOString() }
              : g
          )
        )
        setMessage({ type: 'success', text: 'Guide updated successfully!' })
        setEditingId(null)
      } else {
        const newGuide = await onboardingService.createGuide(payload)
        setGuides((prev) => [...prev, newGuide])
        setMessage({ type: 'success', text: 'Guide created successfully!' })
      }

      resetForm()
    } catch (error) {
      console.error('Error saving guide:', error)
      setMessage({ type: 'error', text: 'Failed to save guide. Please try again.' })
    } finally {
      setSaving(false)
    }

    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const resetForm = () => {
    setFormData({
      modulePath: '/admin/dashboard',
      title: '',
      description: '',
      isActive: true,
      steps: [{ title: '', description: '', order: 0 }],
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (guide) => {
    setFormData({
      modulePath: guide.modulePath || '/admin/dashboard',
      title: guide.title || '',
      description: guide.description || '',
      isActive: guide.isActive !== false,
      steps:
        guide.steps?.length > 0
          ? [...guide.steps].sort((a, b) => (a.order || 0) - (b.order || 0))
          : [{ title: '', description: '', order: 0 }],
    })
    setEditingId(guide.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this guide?')) {
      try {
        await onboardingService.deleteGuide(id)
        setGuides((prev) => prev.filter((g) => g.id !== id))
        setMessage({ type: 'success', text: 'Guide deleted successfully!' })
      } catch (error) {
        console.error('Error deleting guide:', error)
        setMessage({ type: 'error', text: 'Failed to delete guide. Please try again.' })
      }
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    }
  }

  const handleToggleActive = async (guide) => {
    try {
      const updated = { ...guide, isActive: !guide.isActive }
      await onboardingService.updateGuide(guide.id, updated)
      setGuides((prev) =>
        prev.map((g) => (g.id === guide.id ? { ...g, isActive: !g.isActive } : g))
      )
      setMessage({
        type: 'success',
        text: `Guide ${updated.isActive ? 'activated' : 'deactivated'} successfully!`,
      })
    } catch (error) {
      console.error('Error toggling guide:', error)
      setMessage({ type: 'error', text: 'Failed to update guide status.' })
    }
    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const openPreview = (guide) => {
    const sortedSteps = [...(guide.steps || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    )
    setPreviewGuide({ ...guide, steps: sortedSteps })
    setPreviewStep(0)
  }

  const filteredGuides = guides.filter((g) => {
    const query = searchQuery.toLowerCase()
    const moduleLabel =
      MODULE_OPTIONS.find((m) => m.value === g.modulePath)?.label || g.modulePath
    return (
      g.title?.toLowerCase().includes(query) ||
      moduleLabel.toLowerCase().includes(query) ||
      g.description?.toLowerCase().includes(query)
    )
  })

  const getModuleLabel = (path) =>
    MODULE_OPTIONS.find((m) => m.value === path)?.label || path

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Onboarding Guides</h2>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Guide
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
            placeholder="Search guides by title or module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-gray-600">Loading guides...</span>
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="col-span-full p-12 text-center">
              <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No guides found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery
                  ? 'Try adjusting your search.'
                  : 'Create your first onboarding guide to get started.'}
              </p>
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className={`bg-white rounded-xl shadow-md border p-5 transition hover:shadow-lg ${
                  guide.isActive !== false
                    ? 'border-gray-200'
                    : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      {getModuleLabel(guide.modulePath)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openPreview(guide)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(guide)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id)}
                      className="p-1.5 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {guide.title}
                </h3>
                {guide.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {guide.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ChevronRight className="w-4 h-4" />
                    <span>{guide.steps?.length || 0} step(s)</span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(guide)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                      guide.isActive !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {guide.isActive !== false ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Guide' : 'Create Guide'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Module */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Module *
                </label>
                <select
                  name="modulePath"
                  value={formData.modulePath}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                >
                  {MODULE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guide Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Welcome to the Dashboard"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Short description of this guide..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                />
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
                  Active (show to users)
                </label>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Steps *
                  </label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.steps.map((step, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50/50"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          Step {index + 1}
                        </span>
                        <div className="ml-auto flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition"
                          >
                            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStep(index, 'down')}
                            disabled={index === formData.steps.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition"
                          >
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </button>
                          {formData.steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStep(index)}
                              className="p-1 text-gray-400 hover:text-[#E53935] rounded transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) =>
                            handleStepChange(index, 'title', e.target.value)
                          }
                          placeholder="Step title"
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm"
                        />
                        <textarea
                          value={step.description}
                          onChange={(e) =>
                            handleStepChange(index, 'description', e.target.value)
                          }
                          placeholder="Describe what this step covers..."
                          rows={2}
                          required
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white text-sm resize-none"
                        />
                      </div>
                    </div>
                  ))}
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
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : editingId ? 'Update Guide' : 'Create Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPreviewGuide(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-white" />
                <h3 className="text-white font-bold text-sm">
                  {previewGuide.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewGuide(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center gap-1.5 mb-4">
                {previewGuide.steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx <= previewStep
                        ? 'bg-orange-500 w-6'
                        : 'bg-gray-200 w-4'
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs text-gray-400 font-medium">
                  {previewStep + 1} / {previewGuide.steps.length}
                </span>
              </div>

              <h4 className="text-lg font-bold text-gray-900 mb-2">
                {previewGuide.steps[previewStep]?.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {previewGuide.steps[previewStep]?.description}
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setPreviewGuide(null)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition"
              >
                Close Preview
              </button>
              <div className="flex items-center gap-2">
                {previewStep > 0 && (
                  <button
                    onClick={() => setPreviewStep((p) => p - 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (previewStep < previewGuide.steps.length - 1) {
                      setPreviewStep((p) => p + 1)
                    } else {
                      setPreviewGuide(null)
                    }
                  }}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white text-sm font-medium hover:shadow-md transition"
                >
                  {previewStep === previewGuide.steps.length - 1
                    ? 'Finish'
                    : 'Next'}
                  {previewStep < previewGuide.steps.length - 1 && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
