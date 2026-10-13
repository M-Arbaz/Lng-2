'use client'

import { useState, useEffect } from 'react'
import { Save, AlertCircle, CheckCircle, Loader2, FileText } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import RichTextEditor from '../components/RichTextEditor.jsx'
import aboutService from '../utils/aboutService'

export default function AdminAboutPage() {
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroDescription: '',
    storyTitle: '',
    storyContent: '',
    missionTitle: '',
    missionContent: '',
    valuesTitle: '',
    valuesSubtitle: '',
    teamTitle: '',
    teamSubtitle: '',
    ctaTitle: '',
    ctaDescription: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await aboutService.getAboutPage()
        if (data) {
          setFormData((prev) => ({
            ...prev,
            heroTitle: data.heroTitle || '',
            heroDescription: data.heroDescription || '',
            storyTitle: data.storyTitle || '',
            storyContent: data.storyContent || '',
            missionTitle: data.missionTitle || '',
            missionContent: data.missionContent || '',
            valuesTitle: data.valuesTitle || '',
            valuesSubtitle: data.valuesSubtitle || '',
            teamTitle: data.teamTitle || '',
            teamSubtitle: data.teamSubtitle || '',
            ctaTitle: data.ctaTitle || '',
            ctaDescription: data.ctaDescription || '',
          }))
        }
      } catch (error) {
        console.error('Error loading about page:', error)
        setMessage({ type: 'error', text: 'Failed to load about page data.' })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditorChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      await aboutService.updateAboutPage(formData)
      setMessage({ type: 'success', text: 'About page updated successfully!' })
    } catch (error) {
      console.error('Error saving about page:', error)
      setMessage({ type: 'error', text: 'Failed to save about page.' })
    } finally {
      setSaving(false)
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-orange-500" />
              About Page Editor
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage all content displayed on the About Us page.
            </p>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-[#E53935] flex-shrink-0" />}
            <p className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero Section */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-200 pb-2">Hero Section</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hero Title</label>
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                placeholder="e.g. We Believe Every Home Deserves Warmth"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hero Description</label>
              <RichTextEditor
                value={formData.heroDescription}
                onChange={(html) => handleEditorChange('heroDescription', html)}
                placeholder="Description text for the hero section..."
                minHeight={120}
              />
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-200 pb-2">Story Section</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Story Title</label>
              <input
                type="text"
                name="storyTitle"
                value={formData.storyTitle}
                onChange={handleChange}
                placeholder="e.g. From a Small Workshop to Your Living Room"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Story Content</label>
              <RichTextEditor
                value={formData.storyContent}
                onChange={(html) => handleEditorChange('storyContent', html)}
                placeholder="Tell your brand's story..."
                minHeight={260}
              />
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-200 pb-2">Mission Section</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mission Title</label>
              <input
                type="text"
                name="missionTitle"
                value={formData.missionTitle}
                onChange={handleChange}
                placeholder="e.g. Our Mission"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mission Content</label>
              <RichTextEditor
                value={formData.missionContent}
                onChange={(html) => handleEditorChange('missionContent', html)}
                placeholder="Describe your mission..."
                minHeight={200}
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-200 pb-2">Values Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section Title</label>
                <input
                  type="text"
                  name="valuesTitle"
                  value={formData.valuesTitle}
                  onChange={handleChange}
                  placeholder="e.g. Our Core Values"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section Subtitle</label>
                <input
                  type="text"
                  name="valuesSubtitle"
                  value={formData.valuesSubtitle}
                  onChange={handleChange}
                  placeholder="e.g. Every decision we make is guided by these principles."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-200 pb-2">Team Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section Title</label>
                <input
                  type="text"
                  name="teamTitle"
                  value={formData.teamTitle}
                  onChange={handleChange}
                  placeholder="e.g. Meet the Team"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section Subtitle</label>
                <input
                  type="text"
                  name="teamSubtitle"
                  value={formData.teamSubtitle}
                  onChange={handleChange}
                  placeholder="e.g. A small, passionate team behind every piece."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-200 pb-2">Call to Action Section</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">CTA Title</label>
              <input
                type="text"
                name="ctaTitle"
                value={formData.ctaTitle}
                onChange={handleChange}
                placeholder="e.g. Ready to Bring Warmth Into Your Home?"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">CTA Description</label>
              <RichTextEditor
                value={formData.ctaDescription}
                onChange={(html) => handleEditorChange('ctaDescription', html)}
                placeholder="Description for the call to action section..."
                minHeight={100}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}