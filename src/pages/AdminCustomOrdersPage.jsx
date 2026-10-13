'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Eye,
  Trash2,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  TreePine,
  Sparkles,
  Palette,
  Ruler,
  Hash,
  Wallet,
  Calendar,
  FileText,
  Image as ImageIcon,
  Clock,
  Wand2,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import customOrdersService from '../utils/customOrdersService.js'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'contacted', label: 'Contacted', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'quotation_sent', label: 'Quotation Sent', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { value: 'approved', label: 'Approved', color: 'bg-lime-100 text-lime-800 border-lime-300' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300' },
]

function getStatusMeta(status) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0]
}

function formatDate(iso) {
  if (!iso) return 'N/A'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'N/A'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const data = await customOrdersService.getAllOrders()
        setOrders(data)
      } catch (error) {
        console.error('Error loading custom orders:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      setSaving(true)
      await customOrdersService.updateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null))
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom order request?')) return
    try {
      await customOrdersService.deleteOrder(id)
      setOrders((prev) => prev.filter((o) => o.id !== id))
      if (selectedOrder?.id === id) setSelectedOrder(null)
    } catch (error) {
      console.error('Error deleting custom order:', error)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        order.fullName?.toLowerCase().includes(q) ||
        order.email?.toLowerCase().includes(q) ||
        order.phone?.toLowerCase().includes(q) ||
        order.city?.toLowerCase().includes(q) ||
        order.productType?.toLowerCase().includes(q)
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, filterStatus])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="w-7 h-7 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-900">Custom Design Requests</h2>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Total Requests</p>
            <p className="text-3xl font-bold text-orange-500">{orders.length}</p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, city, or product type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
              <p className="text-gray-500 text-sm mt-3">Loading custom design requests...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No custom design requests found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Requests submitted from the Custom Order page will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Product Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Budget</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusMeta = getStatusMeta(order.status)
                    return (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{order.fullName || '—'}</p>
                            <p className="text-sm text-gray-500">{order.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">{order.productType || '—'}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{order.budgetRange || '—'}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-orange-500 hover:text-orange-700 font-semibold flex items-center gap-1 transition"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="text-gray-400 hover:text-[#E53935] transition"
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

        {/* Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 px-8 py-6 text-white sticky top-0 z-10 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Custom Design Request</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-white/80 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Submission Date */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                  <div>
                    <p className="text-sm text-gray-600">Request ID</p>
                    <p className="text-lg font-bold text-gray-900 font-mono">#{selectedOrder.id?.slice(0, 12)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5" /> Submitted
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Full Name</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.fullName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</p>
                      <a href={`mailto:${selectedOrder.email}`} className="font-semibold text-blue-600 hover:underline mt-1 block">
                        {selectedOrder.email || '—'}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> City</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.city || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Design Details */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Design Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Product Type</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.productType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><TreePine className="w-3.5 h-3.5" /> Wood Type</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.woodType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Finish</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.finish || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Palette className="w-3.5 h-3.5" /> Color</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.color || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> Size</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.size || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Quantity</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.quantity || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Budget</p>
                      <p className="font-semibold text-gray-900 mt-1">{selectedOrder.budgetRange || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {selectedOrder.deadline ? new Date(selectedOrder.deadline).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedOrder.description && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      Design Description
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{selectedOrder.description}</p>
                    </div>
                  </div>
                )}

                {/* Reference Images */}
                {selectedOrder.images?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-orange-500" />
                      Reference Files ({selectedOrder.images.length})
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {selectedOrder.images.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center hover:opacity-80 transition"
                        >
                          {url.toLowerCase().includes('.pdf') ? (
                            <FileText className="w-6 h-6 text-gray-400" />
                          ) : (
                            <img src={url} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Update Status</h4>
                  <div className="flex flex-wrap gap-3">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => updateStatus(selectedOrder.id, status.value)}
                        disabled={saving}
                        className={`px-5 py-2 rounded-lg font-semibold text-sm transition transform hover:scale-105 disabled:opacity-60 ${
                          selectedOrder.status === status.value
                            ? 'bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

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
