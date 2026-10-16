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
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Link2,
  ExternalLink,
  Globe,
  Save,
  LayoutTemplate,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import footerService from '../utils/footerService.js'

const LINK_SECTIONS = [
  { value: 'quickLinks', label: 'Quick Links' },
  { value: 'collections', label: 'Collections' },
  { value: 'policies', label: 'Policies' },
  { value: 'other', label: 'Other' },
]

export default function AdminFooterPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Footer config state
  const [config, setConfig] = useState({
    phone: '',
    email: '',
    whatsapp: '',
    showWhatsAppInFooter: true,
    address: '',
    city: '',
  })

  // Footer links state
  const [links, setLinks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState(null)
  const [linkFormData, setLinkFormData] = useState({
    label: '',
    url: '',
    section: 'quickLinks',
    displayOrder: 0,
    isActive: true,
  })

  // Load footer data
  useEffect(() => {
    const loadFooterData = async () => {
      try {
        setLoading(true)
        const [configData, linksData] = await Promise.all([
          footerService.getFooterConfig(),
          footerService.getAllFooterLinks(),
        ])
        if (configData) {
          setConfig({
            phone: configData.phone || '',
            email: configData.email || '',
            whatsapp: configData.whatsapp || '',
            showWhatsAppInFooter: configData.showWhatsAppInFooter !== false,
            address: configData.address || '',
            city: configData.city || '',
          })
        }
        setLinks(linksData || [])
      } catch (e) {
        console.error('Error loading footer data:', e)
        setMessage({ type: 'error', text: 'Failed to load footer data from Firebase' })
      } finally {
        setLoading(false)
      }
    }
    loadFooterData()
  }, [])

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfig((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSaveConfig = async () => {
    setSaving(true)
    try {
      await footerService.saveFooterConfig(config)
      setMessage({ type: 'success', text: 'Footer contact info saved successfully!' })
    } catch (error) {
      console.error('Error saving footer config:', error)
      setMessage({ type: 'error', text: 'Failed to save footer contact info.' })
    } finally {
      setSaving(false)
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleLinkInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setLinkFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleLinkSubmit = async (e) => {
    e.preventDefault()
    if (!linkFormData.label.trim() || !linkFormData.url.trim()) {
      setMessage({ type: 'error', text: 'Please enter both label and URL' })
      return
    }

    let url = linkFormData.url.trim()
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/') && !url.startsWith('#')) {
      url = 'https://' + url
    }

    setSaving(true)
    try {
      const payload = {
        label: linkFormData.label.trim(),
        url,
        section: linkFormData.section,
        displayOrder: parseInt(linkFormData.displayOrder, 10) || 0,
        isActive: linkFormData.isActive,
      }

      if (editingLinkId) {
        await footerService.updateFooterLink(editingLinkId, payload)
        setLinks((prev) =>
          prev.map((l) => (l.id === editingLinkId ? { ...l, ...payload, updatedAt: new Date().toISOString() } : l))
        )
        setMessage({ type: 'success', text: 'Footer link updated successfully!' })
        setEditingLinkId(null)
      } else {
        const newLink = await footerService.createFooterLink(payload)
        setLinks((prev) => [...prev, newLink])
        setMessage({ type: 'success', text: 'Footer link added successfully!' })
      }
      resetLinkForm()
    } catch (error) {
      console.error('Error saving footer link:', error)
      setMessage({ type: 'error', text: 'Failed to save footer link. Please try again.' })
    } finally {
      setSaving(false)
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const resetLinkForm = () => {
    setLinkFormData({
      label: '',
      url: '',
      section: 'quickLinks',
      displayOrder: 0,
      isActive: true,
    })
    setShowLinkForm(false)
    setEditingLinkId(null)
  }

  const handleEditLink = (link) => {
    setLinkFormData({
      label: link.label || '',
      url: link.url || '',
      section: link.section || 'quickLinks',
      displayOrder: link.displayOrder || 0,
      isActive: link.isActive !== false,
    })
    setEditingLinkId(link.id)
    setShowLinkForm(true)
  }

  const handleDeleteLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this footer link?')) {
      try {
        await footerService.deleteFooterLink(id)
        setLinks((prev) => prev.filter((l) => l.id !== id))
        setMessage({ type: 'success', text: 'Footer link deleted successfully!' })
      } catch (error) {
        console.error('Error deleting footer link:', error)
        setMessage({ type: 'error', text: 'Failed to delete footer link. Please try again.' })
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleToggleLinkActive = async (link) => {
    try {
      const updated = { ...link, isActive: !link.isActive }
      await footerService.updateFooterLink(link.id, updated)
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, isActive: !l.isActive } : l)))
      setMessage({
        type: 'success',
        text: `Footer link ${updated.isActive ? 'activated' : 'deactivated'} successfully!`,
      })
    } catch (error) {
      console.error('Error toggling footer link:', error)
      setMessage({ type: 'error', text: 'Failed to update footer link status.' })
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const filteredLinks = links.filter((l) => {
    const query = searchQuery.toLowerCase()
    return (
      l.label?.toLowerCase().includes(query) ||
      l.url?.toLowerCase().includes(query) ||
      l.section?.toLowerCase().includes(query)
    )
  })

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    const sectionOrder = { quickLinks: 0, collections: 1, policies: 2, other: 3 }
    const secDiff = (sectionOrder[a.section] || 99) - (sectionOrder[b.section] || 99)
    if (secDiff !== 0) return secDiff
    return (a.displayOrder || 0) - (b.displayOrder || 0)
  })

  const groupedLinks = sortedLinks.reduce((acc, link) => {
    const section = link.section || 'other'
    if (!acc[section]) acc[section] = []
    acc[section].push(link)
    return acc
  }, {})

  const getSectionLabel = (value) =>
    LINK_SECTIONS.find((s) => s.value === value)?.label || value

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutTemplate className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-900">Footer Management</h2>
          </div>
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
            <p className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">Loading footer data...</span>
          </div>
        ) : (
          <>
            {/* Contact Information Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-500" />
                  Contact Information & Location
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage the phone, email, WhatsApp, and address displayed in the footer.
                </p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={config.phone}
                    onChange={handleConfigChange}
                    placeholder="e.g. 03134371467"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={config.email}
                    onChange={handleConfigChange}
                    placeholder="e.g. contact@lampandglow.pk"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-orange-500" />
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={config.whatsapp}
                    onChange={handleConfigChange}
                    placeholder="e.g. 923134371467"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <input
                      type="checkbox"
                      id="showWhatsAppInFooter"
                      name="showWhatsAppInFooter"
                      checked={config.showWhatsAppInFooter}
                      onChange={handleConfigChange}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300"
                    />
                    <label htmlFor="showWhatsAppInFooter" className="text-sm font-medium text-gray-700">
                      Show WhatsApp number in footer
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-8">
                    When unchecked, the number stays hidden in the footer but the floating chat button remains active.
                  </p>
                </div>
                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={config.city}
                    onChange={handleConfigChange}
                    placeholder="e.g. Sahiwal"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
                {/* Address - full width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    value={config.address}
                    onChange={handleConfigChange}
                    placeholder="e.g. Main Bazaar, Sahiwal, Punjab, Pakistan"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Contact Info'}
                </button>
              </div>
            </div>

            {/* Footer Links Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-orange-500" />
                    Footer Links & Pages
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage all footer links organized by section.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetLinkForm()
                    setShowLinkForm(true)
                  }}
                  className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Add Link
                </button>
              </div>

              {/* Search */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by label, URL, or section..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {/* Links Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Label
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Section
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
                    {sortedLinks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg font-medium">No footer links found</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {searchQuery ? 'Try adjusting your search.' : 'Add your first footer link to get started.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      sortedLinks.map((link) => (
                        <tr key={link.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">{link.label}</span>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              {link.url}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700">
                              {getSectionLabel(link.section)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 font-medium">{link.displayOrder || 0}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleLinkActive(link)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                link.isActive !== false ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  link.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditLink(link)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                className="p-2 text-[#E53935] hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Preview */}
              {Object.keys(groupedLinks).length > 0 && (
                <div className="px-6 py-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Footer Preview — Active Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {LINK_SECTIONS.map((section) => {
                      const sectionLinks = groupedLinks[section.value]?.filter((l) => l.isActive !== false)
                      if (!sectionLinks || sectionLinks.length === 0) return null
                      return (
                        <div key={section.value}>
                          <h4 className="text-sm font-bold text-gray-900 mb-2">{section.label}</h4>
                          <ul className="space-y-1">
                            {sectionLinks
                              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                              .map((link) => (
                                <li key={link.id}>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {link.label}
                                  </a>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Add/Edit Link Form Modal */}
        {showLinkForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingLinkId ? 'Edit Footer Link' : 'Add Footer Link'}
                </h3>
                <button onClick={resetLinkForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleLinkSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Label *</label>
                  <input
                    type="text"
                    name="label"
                    value={linkFormData.label}
                    onChange={handleLinkInputChange}
                    placeholder="e.g. Privacy Policy"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">URL *</label>
                  <input
                    type="text"
                    name="url"
                    value={linkFormData.url}
                    onChange={handleLinkInputChange}
                    placeholder="/privacy-policy or https://example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use a full URL (https://...) or an internal path (/page-name)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                  <select
                    name="section"
                    value={linkFormData.section}
                    onChange={handleLinkInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  >
                    {LINK_SECTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={linkFormData.displayOrder}
                    onChange={handleLinkInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">Lower numbers appear first within the section.</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="linkIsActive"
                    name="isActive"
                    checked={linkFormData.isActive}
                    onChange={handleLinkInputChange}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300"
                  />
                  <label htmlFor="linkIsActive" className="text-sm font-medium text-gray-700">
                    Active (visible in footer)
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetLinkForm}
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
                    {saving ? 'Saving...' : editingLinkId ? 'Update Link' : 'Add Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
