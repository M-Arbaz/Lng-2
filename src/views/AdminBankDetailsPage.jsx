'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader2, Building2 } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import bankDetailsService from '../utils/bankDetailsService'

export default function AdminBankDetailsPage() {
  const [formData, setFormData] = useState({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    branchCode: '',
    codAdvancePercent: 50,
    isActive: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        setLoading(true)
        const data = await bankDetailsService.getBankDetails()
        setFormData({
          bankName: data.bankName || '',
          accountTitle: data.accountTitle || '',
          accountNumber: data.accountNumber || '',
          iban: data.iban || '',
          branchCode: data.branchCode || '',
          codAdvancePercent: data.codAdvancePercent ?? 50,
          isActive: data.isActive !== false,
        })
      } catch (error) {
        console.error('Error loading bank details:', error)
        setMessage({ type: 'error', text: 'Failed to load bank details.' })
      } finally {
        setLoading(false)
      }
    }
    loadBankDetails()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'codAdvancePercent' ? Number(value) : value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.bankName.trim() || !formData.accountTitle.trim() || !formData.accountNumber.trim() || !formData.iban.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }

    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      await bankDetailsService.saveBankDetails(formData)
      setMessage({ type: 'success', text: 'Bank details updated successfully!' })
    } catch (error) {
      console.error('Error saving bank details:', error)
      setMessage({ type: 'error', text: 'Failed to save bank details.' })
    } finally {
      setSaving(false)
    }
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
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-orange-500" />
              Bank Details
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage bank account information shown at checkout for bank deposits.
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
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Bank Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. Bank Alfalah"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Account Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Account Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountTitle"
                value={formData.accountTitle}
                onChange={handleChange}
                placeholder="e.g. Lamp & Glow"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="e.g. 0051-1006789012"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* IBAN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                IBAN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="iban"
                value={formData.iban}
                onChange={handleChange}
                placeholder="e.g. PK95ALFH000511006789012"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Branch Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Branch Code
              </label>
              <input
                type="text"
                name="branchCode"
                value={formData.branchCode}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* COD Advance Percent */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                COD Advance Payment (%)
              </label>
              <input
                type="number"
                name="codAdvancePercent"
                value={formData.codAdvancePercent}
                onChange={handleChange}
                min={0}
                max={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentage of total required as advance for COD orders.
              </p>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {formData.isActive ? 'Active' : 'Inactive'} — Show bank details at checkout
            </span>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Bank Details'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}