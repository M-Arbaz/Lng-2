'use client'

import { useState, useEffect, useMemo } from 'react'
import { Package, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import { productsService } from '../utils/productsService'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })

  // Load all orders
  useEffect(() => {
    const loadAllOrders = async () => {
      try {
        setOrdersLoading(true)
        // Since we don't have a backend endpoint to get all orders,
        // we'll load from localStorage (orders stored by users)
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
        setOrders(allOrders)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setOrdersLoading(false)
      }
    }

    loadAllOrders()
  }, [])

  // Load products count from Firebase
  useEffect(() => {
    const loadProductsCount = async () => {
      try {
        setProductsLoading(true)
        const products = await productsService.getAllProducts()
        setStats((prev) => ({ ...prev, totalProducts: products.length }))
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setProductsLoading(false)
      }
    }

    loadProductsCount()
  }, [])

  // Calculate statistics
  useEffect(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const pendingOrders = orders.filter((order) => order.status === 'pending').length

    setStats((prev) => ({
      ...prev,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
    }))
  }, [orders])

  const StatCard = ({ icon: IconComponent, label, value, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-lg ${color}`}>
          {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
        </div>
      </div>
    </div>
  )

  const recentOrders = useMemo(() => {
    return orders
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
  }, [orders])

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
            <p className="text-gray-600 mt-1">Here's what's happening with your store today.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            color="bg-blue-500"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={stats.totalOrders}
            color="bg-green-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            color="bg-orange-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Orders"
            value={stats.pendingOrders}
            color="bg-red-500"
          />
        </div>

        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
              <button className="text-orange-500 hover:text-orange-600 font-semibold text-sm">
                View All →
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Order ID</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Customer</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Total</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">
                          #{order.id?.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">{order.fullName}</td>
                        <td className="py-3 px-4 text-gray-900 font-bold">₹{order.total?.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105">
                Add New Product
              </button>
              <button className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105">
                View All Orders
              </button>
              <button className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105">
                Generate Report
              </button>
            </div>

            {/* Order Status Summary */}
            <div className="mt-8 p-4 bg-gradient-to-br from-orange-50 to-[#F5F1EA] rounded-lg border border-orange-200">
              <p className="text-sm font-semibold text-orange-900 mb-4">Order Status Summary</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-800">Pending</span>
                  <span className="font-bold text-orange-900">{stats.pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-800">Shipped</span>
                  <span className="font-bold text-orange-900">
                    {orders.filter((o) => o.status === 'shipped').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-800">Delivered</span>
                  <span className="font-bold text-orange-900">
                    {orders.filter((o) => o.status === 'delivered').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Overview</h3>
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Revenue chart would display here</p>
              <p className="text-sm text-gray-400 mt-1">Total Revenue: ₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
