'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Mail, MapPin, Phone, Lock, Unlock, MessageSquare, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import customersService from '../utils/customersService.js'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
  })
  const [saving, setSaving] = useState(false)
  const [customerOrders, setCustomerOrders] = useState([])

  // Load customers from Firebase
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true)
        const data = await customersService.getAllCustomers()
        setCustomers(data)
      } catch (e) {
        console.error('Error loading customers:', e)
        setMessage({ type: 'error', text: 'Failed to load customers' })
      } finally {
        setLoading(false)
      }
    }
    loadCustomers()
  }, [])

  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer)
    try {
      const orders = await customersService.getCustomerOrders(customer.id)
      setCustomerOrders(orders)
    } catch (e) {
      console.error('Error loading customer orders:', e)
      setCustomerOrders([])
    }
    setShowDetailModal(true)
  }

  const handleBlockCustomer = async (customerId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this customer?`)) {
      try {
        setSaving(true)
        await customersService.toggleCustomerStatus(customerId, !currentStatus)
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId
              ? { ...c, isBlocked: !currentStatus }
              : c
          )
        )
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer({ ...selectedCustomer, isBlocked: !currentStatus })
        }
        setMessage({
          type: 'success',
          text: `Customer ${!currentStatus ? 'blocked' : 'unblocked'} successfully!`,
        })
      } catch (error) {
        console.error('Error updating customer status:', error)
        setMessage({ type: 'error', text: 'Failed to update customer status' })
      } finally {
        setSaving(false)
      }

      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    }
  }

  const handleAddTicket = async (e) => {
    e.preventDefault()
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }

    try {
      setSaving(true)
      await customersService.addSupportTicket(selectedCustomer.id, ticketForm)
      
      // Refresh customer details
      const updatedCustomer = await customersService.getCustomerById(selectedCustomer.id)
      setSelectedCustomer(updatedCustomer)
      
      setTicketForm({ subject: '', message: '' })
      setShowTicketModal(false)
      setMessage({ type: 'success', text: 'Support ticket created successfully!' })
    } catch (error) {
      console.error('Error creating ticket:', error)
      setMessage({ type: 'error', text: 'Failed to create support ticket' })
    } finally {
      setSaving(false)
    }

    setTimeout(() => {
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase()
    return (
      c.email?.toLowerCase().includes(query) ||
      c.name?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query)
    )
  })

  const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Customer Management</h2>
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">{customers.length} Customers</span>
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
            <p
              className={`font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="mt-2 text-gray-500">Loading customers...</p>
          </div>
        )}

        {/* Customers Table */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-lg">No customers found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery ? 'Try adjusting your search' : 'Customers will appear here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Orders</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => {
                      const custOrders = customerOrders.filter((o) => o.userId === customer.id)
                      return (
                        <tr key={customer.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{customer.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">
                              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : ''}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{customer.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{customer.phone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                              {custOrders.length} orders
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                customer.isBlocked
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {customer.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(customer)}
                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleBlockCustomer(customer.id, customer.isBlocked)}
                                disabled={saving}
                                className={`px-3 py-1 text-sm rounded-lg transition text-white ${
                                  customer.isBlocked
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-[#E53935]'
                                } disabled:opacity-60`}
                              >
                                {customer.isBlocked ? 'Unblock' : 'Block'}
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
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 flex items-center justify-between text-white">
              <h3 className="text-2xl font-bold">Customer Details</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedCustomer(null)
                  setCustomerOrders([])
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{selectedCustomer.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedCustomer.isBlocked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {selectedCustomer.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedCustomer.address && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Address</h4>
                  <div className="flex gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <p className="text-gray-700">{selectedCustomer.address}</p>
                  </div>
                </div>
              )}

              {/* Orders Summary */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900">Order History</h4>
                  <button
                    onClick={() => setShowTicketModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Add Support Ticket
                  </button>
                </div>

                {customerOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-600">{customerOrders.length}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Spent</p>
                        <p className="text-2xl font-bold text-[#22C55E]">Rs.{totalSpent.toLocaleString()}</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg Order</p>
                        <p className="text-2xl font-bold text-orange-600">
                          Rs.{Math.round(totalSpent / customerOrders.length).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {customerOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">Order #{order.id?.substring(0, 8)}</p>
                          <span
                            className={`px-3 py-1 rounded text-xs font-semibold ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.status || 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{order.items?.length || 0} items</span>
                          <span className="font-semibold text-gray-900">Rs.{(order.total || 0).toLocaleString()}</span>
                          <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Support Tickets */}
              {selectedCustomer.supportTickets && selectedCustomer.supportTickets.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Support Tickets</h4>
                  <div className="space-y-3">
                    {selectedCustomer.supportTickets.map((ticket) => (
                      <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{ticket.subject}</p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              ticket.status === 'resolved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{ticket.message}</p>
                        {ticket.response && (
                          <div className="bg-blue-50 p-3 rounded mt-2">
                            <p className="text-xs text-blue-600 font-semibold mb-1">Admin Response:</p>
                            <p className="text-sm text-gray-700">{ticket.response}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Support Ticket Modal */}
      {showTicketModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-xl font-bold">Add Support Ticket</h3>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="Ticket subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  placeholder="Write message for customer"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-500 text-white font-semibold py-2 rounded-lg hover:bg-purple-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
