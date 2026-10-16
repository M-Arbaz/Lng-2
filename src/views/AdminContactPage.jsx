'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import contactPageService from '../utils/contactPageService.js'

const DEFAULT_DATA = {
  pageTitle: 'CONTACT US',
  subtitle: 'GET IN TOUCH',
  description:
    "We love to hear from our valuable customers. Contact us today and let us show you how our incredible pieces of art helping you out to lighten up your homes.",
  formTitle: 'Send us an email',
  formSubtitle: "Ask us anything! We're here to help.",
  liveHelpTitle: 'Live Help',
  liveHelpText:
    "If you have an issue or question that requires immediate assistance, you can click the button below to chat live with a Customer Service representative. If we aren't available, drop us an email to the left and we will get back to you within 20-36 hours!",
  whatsappLink: 'https://wa.me/3020521000',
  phoneText: 'TEXT: 302-052-1000',
  email: 'support@lampandglow.com',
  address: '45 West Road\nNewcastle Upon Tyne, NE4 9PX\nUnited Kingdom',
  showOpeningHours: true,
  openingHours: 'MON to SAT: 9:00AM - 10:00PM\nSUN: 10:00AM - 6:00PM',
  whatsappButtonText: 'Message Us',
  submitButtonText: 'Submit Comment!',
}

export default function AdminContactPage() {
  const [form, setForm] = useState(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await contactPageService.getContactPage()
        if (data) {
          setForm((prev) => ({ ...prev, ...data }))
        }
      } catch (e) {
        setMessage({ type: 'error', text: 'Failed to load contact page settings.' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      await contactPageService.updateContactPage(form)
      setMessage({ type: 'success', text: 'Contact page settings saved successfully!' })
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save contact page settings.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-sm'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Contact Us Page</h2>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

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
            <p className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">Loading settings...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Header Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Page Title</label>
                  <input
                    name="pageTitle"
                    value={form.pageTitle}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Subtitle</label>
                  <input
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-500" />
                Form Section
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Form Title</label>
                  <input
                    name="formTitle"
                    value={form.formTitle}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Form Subtitle</label>
                  <input
                    name="formSubtitle"
                    value={form.formSubtitle}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Submit Button Text</label>
                <input
                  name="submitButtonText"
                  value={form.submitButtonText}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Live Help Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                Live Help Card
              </h3>
              <div>
                <label className={labelClass}>Live Help Title</label>
                <input
                  name="liveHelpTitle"
                  value={form.liveHelpTitle}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Live Help Text</label>
                <textarea
                  name="liveHelpText"
                  value={form.liveHelpText}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>WhatsApp Button Text</label>
                  <input
                    name="whatsappButtonText"
                    value={form.whatsappButtonText}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>WhatsApp Link</label>
                  <input
                    name="whatsappLink"
                    value={form.whatsappLink}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-orange-500" />
                Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone Text</label>
                  <input
                    name="phoneText"
                    value={form.phoneText}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray-400">Use line breaks for multiple lines.</p>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Opening Hours
              </h3>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="showOpeningHours"
                  checked={form.showOpeningHours}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                Show opening hours section
              </label>
              {form.showOpeningHours && (
                <div>
                  <label className={labelClass}>Opening Hours Text</label>
                  <textarea
                    name="openingHours"
                    value={form.openingHours}
                    onChange={handleChange}
                    rows={3}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-gray-400">Use line breaks for each line.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
