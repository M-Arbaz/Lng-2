'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Eye, MapPin, Phone, Mail, CheckCircle, Clock, Truck, Loader2 } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import ordersService from '../utils/ordersService.js'

function getOrderDate(order) {
  if (!order?.createdAt) return null
  if (typeof order.createdAt.toDate === 'function') return order.createdAt.toDate()
  if (order.createdAt.seconds) return new Date(order.createdAt.seconds * 1000)
  return new Date(order.createdAt)
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showTrackingForm, setShowTrackingForm] = useState(false)
  const [trackingData, setTrackingData] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadAllOrders = async () => {
      try {
        setLoading(true)
        const allOrders = await ordersService.getAllOrders()
        allOrders.sort((a, b) => {
          const dateA = getOrderDate(a)?.getTime() || 0
          const dateB = getOrderDate(b)?.getTime() || 0
          return dateB - dateA
        })
        setOrders(allOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllOrders()
  }, [])

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setSaving(true)
      await ordersService.updateOrderStatus(orderId, newStatus)
      const updatedAt = new Date().toISOString()
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus, updatedAt } : order
        )
      )
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus, updatedAt } : null
      )
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setSaving(false)
    }
  }

  const addTrackingDetails = async (orderId, tracking) => {
    try {
      setSaving(true)
      await ordersService.updateOrderTracking(orderId, tracking)
      const trackingWithDate = {
        ...tracking,
        addedAt: new Date().toISOString(),
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, tracking: trackingWithDate, updatedAt: new Date().toISOString() }
            : order
        )
      )
      setSelectedOrder((prev) =>
        prev ? { ...prev, tracking: trackingWithDate, updatedAt: new Date().toISOString() } : null
      )
    } catch (error) {
      console.error('Error saving tracking details:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTracking = async () => {
    if (!trackingData.trackingNumber.trim() || !trackingData.carrier.trim()) {
      return
    }

    setSaving(true)
    try {
      await addTrackingDetails(selectedOrder.id, trackingData)
      setShowTrackingForm(false)
      setTrackingData({ trackingNumber: '', carrier: '', estimatedDelivery: '' })
    } finally {
      setSaving(false)
    }
  }

  // Filter and search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone?.includes(searchQuery)

      const matchesStatus =
        filterStatus === 'all' || order.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, filterStatus])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Total Orders</p>
            <p className="text-3xl font-bold text-orange-500">{orders.length}</p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
              <p className="text-gray-500 text-sm mt-3">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No orders have been placed yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Order ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Total</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-6 font-mono text-sm font-semibold text-gray-600">
                        #{order.id?.slice(0, 8)}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{order.fullName}</p>
                          <p className="text-sm text-gray-500">{order.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-lg text-orange-500">
                        Rs.{order.total?.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {getOrderDate(order)
                          ? getOrderDate(order).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-orange-500 hover:text-orange-700 font-semibold flex items-center gap-1 transition"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 px-8 py-6 text-white sticky top-0 z-10 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-white/80 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                {/* Order Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="text-2xl font-bold text-gray-900">#{selectedOrder.id?.slice(0, 12)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getOrderDate(selectedOrder)
                        ? getOrderDate(selectedOrder).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {selectedOrder.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {selectedOrder.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Payment Method</p>
                      <p className="font-semibold text-gray-900">
                        {selectedOrder.paymentMethod === 'cash_on_delivery'
                          ? 'Cash on Delivery'
                          : selectedOrder.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    Delivery Address
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 font-medium">{selectedOrder.addressLine1}</p>
                    {selectedOrder.addressLine2 && (
                      <p className="text-gray-700">{selectedOrder.addressLine2}</p>
                    )}
                    <p className="text-gray-700">
                      {selectedOrder.city}, {selectedOrder.state} {selectedOrder.postalCode}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {item.product?.name || item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} x Rs.{(item.product?.price || item.unitPrice)?.toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-orange-500">
                            Rs.{((item.product?.price || item.unitPrice) * item.quantity)?.toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No items in this order</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-orange-50 to-[#F5F1EA] p-6 rounded-lg border border-orange-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        Rs.{selectedOrder.subtotal?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Shipping</span>
                      <span className="font-semibold text-gray-900">
                        Rs.{selectedOrder.shipping?.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-orange-200 pt-3 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-orange-600">
                        Rs.{selectedOrder.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking Details */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-500" />
                      Tracking Details
                    </h4>
                    {!showTrackingForm && (
                      <button
                        onClick={() => {
                          setShowTrackingForm(true)
                          setTrackingData({
                            trackingNumber: selectedOrder.tracking?.trackingNumber || '',
                            carrier: selectedOrder.tracking?.carrier || '',
                            estimatedDelivery: selectedOrder.tracking?.estimatedDelivery || '',
                          })
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                      >
                        {selectedOrder.tracking ? 'Edit' : 'Add'} Tracking
                      </button>
                    )}
                  </div>

                  {!showTrackingForm ? (
                    selectedOrder.tracking ? (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                        <div>
                          <p className="text-xs text-blue-600 font-semibold">Tracking Number</p>
                          <p className="font-mono font-bold text-gray-900">{selectedOrder.tracking.trackingNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 font-semibold">Carrier</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.tracking.carrier}</p>
                        </div>
                        {selectedOrder.tracking.estimatedDelivery && (
                          <div>
                            <p className="text-xs text-blue-600 font-semibold">Estimated Delivery</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(selectedOrder.tracking.estimatedDelivery).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 pt-2">
                          Added: {new Date(selectedOrder.tracking.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm italic">No tracking details added yet</p>
                    )
                  ) : (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-blue-900 mb-1 block">Tracking Number *</label>
                        <input
                          type="text"
                          value={trackingData.trackingNumber}
                          onChange={(e) => setTrackingData({ ...trackingData, trackingNumber: e.target.value })}
                          placeholder="Enter tracking number"
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-blue-900 mb-1 block">Carrier *</label>
                        <select
                          value={trackingData.carrier}
                          onChange={(e) => setTrackingData({ ...trackingData, carrier: e.target.value })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Carrier</option>
                          <option value="TCS">TCS</option>
                          <option value="Daewoo">Daewoo</option>
                          <option value="LEA">LEA</option>
                          <option value="Hundi">Hundi</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-blue-900 mb-1 block">Estimated Delivery</label>
                        <input
                          type="date"
                          value={trackingData.estimatedDelivery}
                          onChange={(e) => setTrackingData({ ...trackingData, estimatedDelivery: e.target.value })}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveTracking}
                          disabled={saving}
                          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-60 font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                          Save
                        </button>
                        <button
                          onClick={() => setShowTrackingForm(false)}
                          className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition font-semibold text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Status Update */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Update Order Status</h4>
                  <div className="flex flex-wrap gap-3">
                    {['pending', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={saving}
                        className={`px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-60 ${
                          selectedOrder.status === status
                            ? 'bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Notes */}
                {selectedOrder.note && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Special Notes</p>
                    <p className="text-blue-800">{selectedOrder.note}</p>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}