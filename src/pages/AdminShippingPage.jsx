'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Truck, MapPin, CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import shippingService from '../utils/shippingService.js'

export default function AdminShippingPage() {
  const [cities, setCities] = useState([])
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('15000')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [newCityName, setNewCityName] = useState('')
  const [newCityFee, setNewCityFee] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const data = await shippingService.getShippingSettings()
        setCities(data.cities || [])
        setFreeShippingThreshold(String(data.freeShippingThreshold ?? 15000))
      } catch (err) {
        console.error('Error loading shipping settings:', err)
        setMessage({ type: 'error', text: 'Failed to load shipping settings' })
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleAddCity = () => {
    const name = newCityName.trim()
    const fee = parseFloat(newCityFee)

    if (!name) {
      showMessage('error', 'Please enter a city name')
      return
    }
    if (Number.isNaN(fee) || fee < 0) {
      showMessage('error', 'Please enter a valid shipping fee')
      return
    }
    if (cities.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      showMessage('error', 'This city has already been added')
      return
    }

    setCities((prev) => [...prev, { id: `city-${Date.now()}`, name, fee }])
    setNewCityName('')
    setNewCityFee('')
  }

  const handleRemoveCity = (id) => {
    setCities((prev) => prev.filter((c) => c.id !== id))
  }

  const handleFeeChange = (id, value) => {
    setCities((prev) => prev.map((c) => (c.id === id ? { ...c, fee: value } : c)))
  }

  const handleSave = async () => {
    const threshold = parseFloat(freeShippingThreshold)
    if (Number.isNaN(threshold) || threshold < 0) {
      showMessage('error', 'Please enter a valid free shipping threshold')
      return
    }

    const normalizedCities = cities.map((c) => ({
      id: c.id,
      name: c.name,
      fee: parseFloat(c.fee),
    }))

    if (normalizedCities.some((c) => Number.isNaN(c.fee) || c.fee < 0)) {
      showMessage('error', 'One or more city fees are invalid')
      return
    }

    setSaving(true)
    try {
      const saved = await shippingService.saveShippingSettings({
        cities: normalizedCities,
        freeShippingThreshold: threshold,
      })
      setCities(saved.cities)
      setFreeShippingThreshold(String(saved.freeShippingThreshold))
      showMessage('success', 'Shipping settings saved successfully!')
    } catch (err) {
      console.error('Error saving shipping settings:', err)
      showMessage('error', 'Failed to save shipping settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Shipping Settings</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage delivery cities, their shipping fees, and the free shipping threshold.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition flex items-center gap-2 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
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
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="mt-2 text-gray-500">Loading shipping settings...</p>
          </div>
        ) : (
          <>
            {/* Free Shipping Threshold */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-gray-900">Free Shipping Threshold</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Orders with a subtotal at or above this amount get free shipping, regardless of city.
              </p>
              <div className="flex items-center gap-2 max-w-xs">
                <span className="text-gray-500 font-semibold">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="15000"
                />
              </div>
            </div>

            {/* City Shipping Fees */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-gray-900">City Shipping Fees</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Cities added here will appear in the checkout city dropdown, each with its own shipping fee.
              </p>

              {/* Existing Cities */}
              {cities.length > 0 ? (
                <div className="space-y-2 mb-5">
                  {cities.map((city) => (
                    <div
                      key={city.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{city.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Rs.</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={city.fee}
                          onChange={(e) => handleFeeChange(city.id, e.target.value)}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Remove city"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-5">No cities added yet. Add your first city below.</p>
              )}

              {/* Add New City */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Add New City</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    placeholder="e.g. Lahore"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={newCityFee}
                      onChange={(e) => setNewCityFee(e.target.value)}
                      placeholder="Fee"
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCity}
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add City
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Remember to click <span className="font-semibold">Save Changes</span> after adding, editing, or removing cities.
            </p>
          </>
        )}
      </div>
    </AdminLayout>
  )
}