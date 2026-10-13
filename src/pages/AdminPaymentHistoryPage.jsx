'use client'

import { useState, useEffect } from 'react'
import { Search, Download, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

export default function AdminPaymentHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  // Load orders from localStorage
  useEffect(() => {
    const loadAllOrders = async () => {
      try {
        const allOrders = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes('user-orders-')) {
            try {
              const data = JSON.parse(localStorage.getItem(key))
              if (Array.isArray(data)) {
                allOrders.push(...data)
              }
            } catch {
              // Skip invalid data
            }
          }
        }
        // Sort by creation date (newest first)
        allOrders.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        setOrders(allOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPaymentStatus =
      filterPaymentStatus === 'all' ||
      (filterPaymentStatus === 'paid' && order.status === 'delivered') ||
      (filterPaymentStatus === 'pending' && order.status !== 'delivered')

    const matchesPaymentMethod =
      filterPaymentMethod === 'all' ||
      (filterPaymentMethod === 'cod' && (order.paymentMethod === 'cod' || order.paymentMethod === 'cash_on_delivery')) ||
      (filterPaymentMethod === 'bank' && (order.paymentMethod === 'bank' || order.paymentMethod === 'bank_transfer')) ||
      order.paymentMethod === filterPaymentMethod

    const orderDate = new Date(order.createdAt || new Date())
    const fromDate = dateRange.from ? new Date(dateRange.from) : null
    const toDate = dateRange.to ? new Date(dateRange.to) : null

    const matchesDateRange =
      (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate)

    return matchesSearch && matchesPaymentStatus && matchesPaymentMethod && matchesDateRange
  })

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
    paidOrders: orders.filter((o) => o.status === 'delivered').length,
    pendingOrders: orders.filter((o) => o.status !== 'delivered').length,
  }

  const paymentMethodStats = {
    cod: orders.filter((o) => o.paymentMethod === 'cod' || o.paymentMethod === 'cash_on_delivery').length,
    card: orders.filter((o) => o.paymentMethod === 'card').length,
    bank: orders.filter((o) => o.paymentMethod === 'bank' || o.paymentMethod === 'bank_transfer').length,
    other: orders.filter((o) => !['cod', 'cash_on_delivery', 'card', 'bank', 'bank_transfer'].includes(o.paymentMethod)).length,
  }

  const downloadReport = () => {
    const csvContent = [
      ['Payment History Report', new Date().toLocaleDateString()],
      [],
      ['Order ID', 'Customer', 'Email', 'Amount', 'Payment Method', 'Status', 'Date'],
      ...filteredOrders.map((order) => [
        order.id?.substring(0, 8),
        order.fullName,
        order.email,
        `Rs.${order.total?.toLocaleString()}`,
        order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : order.paymentMethod,
        order.status,
        new Date(order.createdAt).toLocaleDateString(),
      ]),
      [],
      ['Total Revenue', `Rs.${filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}`],
      ['Total Orders', filteredOrders.length],
    ]

    const csvString = csvContent.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Payment History</h2>
          <button
            onClick={downloadReport}
            className="bg-green-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-600 transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm font-semibold">Total Revenue</p>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
            <p className="text-3xl font-bold">Rs.{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-blue-100 text-xs mt-2">From {stats.totalOrders} orders</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100 text-sm font-semibold">Paid Orders</p>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
            <p className="text-3xl font-bold">{stats.paidOrders}</p>
            <p className="text-green-100 text-xs mt-2">
              {((stats.paidOrders / stats.totalOrders) * 100).toFixed(0)}% of total
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-orange-100 text-sm font-semibold">Pending Payment</p>
              <AlertCircle className="w-8 h-8 text-orange-200" />
            </div>
            <p className="text-3xl font-bold">{stats.pendingOrders}</p>
            <p className="text-orange-100 text-xs mt-2">
              Awaiting payment or delivery
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100 text-sm font-semibold">Avg Order Value</p>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
            <p className="text-3xl font-bold">
              Rs.{Math.round(stats.totalRevenue / (stats.totalOrders || 1)).toLocaleString()}
            </p>
            <p className="text-purple-100 text-xs mt-2">Average per order</p>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Cash on Delivery</p>
            <p className="text-2xl font-bold text-gray-900">{paymentMethodStats.cod}</p>
            <p className="text-xs text-gray-500 mt-1">{((paymentMethodStats.cod / stats.totalOrders) * 100 || 0).toFixed(1)}% of orders</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Card Payments</p>
            <p className="text-2xl font-bold text-gray-900">{paymentMethodStats.card}</p>
            <p className="text-xs text-gray-500 mt-1">{((paymentMethodStats.card / stats.totalOrders) * 100 || 0).toFixed(1)}% of orders</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Bank Transfer</p>
            <p className="text-2xl font-bold text-gray-900">{paymentMethodStats.bank}</p>
            <p className="text-xs text-gray-500 mt-1">{((paymentMethodStats.bank / stats.totalOrders) * 100 || 0).toFixed(1)}% of orders</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Other Methods</p>
            <p className="text-2xl font-bold text-gray-900">{paymentMethodStats.other}</p>
            <p className="text-xs text-gray-500 mt-1">{((paymentMethodStats.other / stats.totalOrders) * 100 || 0).toFixed(1)}% of orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Payment Status */}
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>

            {/* Payment Method */}
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Payment Methods</option>
              <option value="cod">Cash on Delivery</option>
              <option value="bank">Bank Deposit</option>
            </select>

            {/* Date Range Filter */}
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Payment Transactions Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="mt-2 text-gray-500">Loading payment history...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No transactions found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Method</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const paymentStatus =
                        order.status === 'delivered' ? 'Paid' : 'Pending'
                      const isPaid = order.status === 'delivered'

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-700">
                            #{order.id?.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {order.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-lg font-bold text-blue-600">
                              Rs.{(order.total || 0).toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              {order.paymentMethod === 'cod' || order.paymentMethod === 'cash_on_delivery'
                                ? 'COD'
                                : order.paymentMethod === 'bank' || order.paymentMethod === 'bank_transfer'
                                  ? 'Bank'
                                  : 'Card'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                isPaid
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {isPaid ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
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

        {/* Summary */}
        {!loading && filteredOrders.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredOrders.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rs.{filteredOrders
                    .reduce((sum, o) => sum + (o.total || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs.{Math.round(
                    filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0) /
                      filteredOrders.length
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
