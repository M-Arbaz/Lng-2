'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, X, AlertCircle, CheckCircle, Loader2, Copy, Tag } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import couponsService from '../utils/couponsService.js'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    applicableTo: 'all',
    minOrderValue: '',
    maxUsageLimit: '',
    expiryDate: '',
    isActive: true,
  })

  // Load coupons from Firebase
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        setLoading(true)
        const data = await couponsService.getAllCoupons()
        setCoupons(data)
      } catch (e) {
        console.error('Error loading coupons:', e)
        setMessage({ type: 'error', text: 'Failed to load coupons' })
      } finally {
        setLoading(false)
      }
    }
    loadCoupons()
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

    if (!formData.code.trim() || !formData.discountValue.trim()) {
      setMessage({ type: 'error', text: 'Please fill all required fields' })
      return
    }

    setSaving(true)

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        applicableTo: formData.applicableTo,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        maxUsageLimit: formData.maxUsageLimit ? parseInt(formData.maxUsageLimit, 10) : null,
        expiryDate: formData.expiryDate || null,
        isActive: formData.isActive,
      }

      if (editingId) {
        await couponsService.updateCoupon(editingId, payload)
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, ...payload, updatedAt: new Date().toISOString() }
              : c
          )
        )
        setMessage({ type: 'success', text: 'Coupon updated successfully!' })
        setEditingId(null)
      } else {
        const newCoupon = await couponsService.createCoupon(payload)
        setCoupons((prev) => [newCoupon, ...prev])
        setMessage({ type: 'success', text: 'Coupon created successfully!' })
      }

      resetForm()
    } catch (error) {
      console.error('Error saving coupon:', error)
      setMessage({ type: 'error', text: 'Failed to save coupon. Please try again.' })
    } finally {
      setSaving(false)
    }

    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      applicableTo: 'all',
      minOrderValue: '',
      maxUsageLimit: '',
      expiryDate: '',
      isActive: true,
    })
    setShowForm(false)
  }

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: String(coupon.discountValue ?? ''),
      applicableTo: coupon.applicableTo || 'all',
      minOrderValue: String(coupon.minOrderValue ?? ''),
      maxUsageLimit: String(coupon.maxUsageLimit ?? ''),
      expiryDate: coupon.expiryDate || '',
      isActive: coupon.isActive !== false,
    })
    setEditingId(coupon.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponsService.deleteCoupon(id)
        setCoupons((prev) => prev.filter((c) => c.id !== id))
        setMessage({ type: 'success', text: 'Coupon deleted successfully!' })
      } catch (error) {
        console.error('Error deleting coupon:', error)
        setMessage({ type: 'error', text: 'Failed to delete coupon. Please try again.' })
      }
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    }
  }

  const handleToggleStatus = async (coupon) => {
    try {
      await couponsService.updateCoupon(coupon.id, { isActive: !coupon.isActive })
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c
        )
      )
      setMessage({
        type: 'success',
        text: `Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}!`,
      })
    } catch (error) {
      console.error('Error toggling coupon status:', error)
      setMessage({ type: 'error', text: 'Failed to update coupon status' })
    }
    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredCoupons = coupons.filter((c) => {
    const query = searchQuery.toLowerCase()
    return (
      c.code.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    )
  })

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Coupon Management</h2>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create Coupon
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

        {/* Add/Edit Coupon Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6 flex items-center justify-between text-white">
                <h3 className="text-2xl font-bold">
                  {editingId ? 'Edit Coupon' : 'Create New Coupon'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="e.g., SUMMER20"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'percentage' ? '20' : '500'}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  {/* Applicable To */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Applicable To
                    </label>
                    <select
                      name="applicableTo"
                      value={formData.applicableTo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Products</option>
                      <option value="products">Specific Products</option>
                      <option value="categories">Specific Categories</option>
                    </select>
                  </div>

                  {/* Min Order Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum Order Value (Rs)
                    </label>
                    <input
                      type="number"
                      name="minOrderValue"
                      value={formData.minOrderValue}
                      onChange={handleInputChange}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Max Usage Limit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Usage Limit
                    </label>
                    <input
                      type="number"
                      name="maxUsageLimit"
                      value={formData.maxUsageLimit}
                      onChange={handleInputChange}
                      placeholder="Unlimited"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the offer"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <label className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Coupon is Active
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by coupon code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
            <p className="mt-2 text-gray-500">Loading coupons...</p>
          </div>
        )}

        {/* Coupons Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-lg">No coupons found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'Create your first coupon to get started'}
                </p>
              </div>
            ) : (
              filteredCoupons.map((coupon) => (
                <div key={coupon.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                  {/* Header */}
                  <div className={`px-6 py-4 ${coupon.isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-400'} text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold font-mono">{coupon.code}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${coupon.isActive ? 'bg-white/20' : 'bg-white/30'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {coupon.description && (
                      <p className="text-sm text-white/90">{coupon.description}</p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Discount */}
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Discount</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : `Rs.${coupon.discountValue}`}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      {coupon.minOrderValue > 0 && (
                        <p className="text-gray-700">
                          Min Order: <span className="font-semibold">Rs.{coupon.minOrderValue}</span>
                        </p>
                      )}
                      {coupon.maxUsageLimit && (
                        <p className="text-gray-700">
                          Usage Limit: <span className="font-semibold">{coupon.maxUsageLimit}</span>
                        </p>
                      )}
                      <p className="text-gray-700">
                        Used: <span className="font-semibold">{coupon.usageCount || 0} times</span>
                      </p>
                      {coupon.expiryDate && (
                        <p className={`${isExpired(coupon.expiryDate) ? 'text-[#E53935] font-semibold' : 'text-gray-700'}`}>
                          Expires: <span className="font-semibold">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                          {isExpired(coupon.expiryDate) && <span className="ml-2 text-xs">(Expired)</span>}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 space-y-2">
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-sm font-semibold ${
                          copiedCode === coupon.code
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Copy className="w-4 h-4" />
                        {copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={`flex-1 px-3 py-2 rounded-lg transition text-sm font-semibold text-white ${
                            coupon.isActive
                              ? 'bg-red-500 hover:bg-[#E53935]'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {coupon.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-[#E53935] transition text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && coupons.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Coupons</p>
              <p className="text-3xl font-bold text-purple-600">{coupons.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Active Coupons</p>
              <p className="text-3xl font-bold text-[#22C55E]">{coupons.filter((c) => c.isActive).length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Usage</p>
              <p className="text-3xl font-bold text-blue-600">{coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Expired</p>
              <p className="text-3xl font-bold text-orange-600">{coupons.filter((c) => isExpired(c.expiryDate)).length}</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
