'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Truck } from 'lucide-react'
import shippingPolicyService from '../utils/shippingPolicyService.js'
import RichTextEditor from '../components/RichTextEditor.jsx'

export default function AdminShippingPolicyPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const data = await shippingPolicyService.getPolicy()
        if (data?.content) setContent(data.content)
      } catch (e) {
        setMessage({ type: 'error', text: 'Failed to load shipping policy.' })
      } finally {
        setLoading(false)
      }
    }
    loadPolicy()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await shippingPolicyService.savePolicy({ content: content.trim() })
      setMessage({ type: 'success', text: 'Shipping policy saved!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save shipping policy.' })
    } finally {
      setSaving(false)
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Truck className="w-7 h-7 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Policy</h1>
          <p className="text-sm text-gray-500">Edit the shipping policy content displayed to customers.</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Content</label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Enter your shipping policy here..."
          minHeight={400}
        />

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Policy</>}
          </button>
        </div>
      </div>
    </div>
  )
}
