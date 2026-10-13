'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Mail,
  Clock,
  X,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import newsletterService from '../utils/newsletterService.js'

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const loadSubscribers = async () => {
      try {
        setLoading(true)
        const data = await newsletterService.getAllSubscribers()
        setSubscribers(data)
      } catch (e) {
        setMessage({ type: 'error', text: 'Failed to load subscribers from Firebase' })
      } finally {
        setLoading(false)
      }
    }
    loadSubscribers()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this subscriber?')) {
      try {
        await newsletterService.deleteSubscriber(id)
        setSubscribers((prev) => prev.filter((s) => s.id !== id))
        setMessage({ type: 'success', text: 'Subscriber removed!' })
      } catch {
        setMessage({ type: 'error', text: 'Delete failed.' })
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const filteredSubscribers = subscribers.filter((s) => {
    const q = searchQuery.toLowerCase()
    return s.email?.toLowerCase().includes(q)
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h2>
          <span className="text-sm text-gray-500">
            {subscribers.length} total
          </span>
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          />
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">Loading subscribers...</span>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No subscribers found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery ? 'Try adjusting your search.' : 'Newsletter signups will appear here.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-orange-500" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {sub.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{sub.source || 'footer'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {sub.createdAt
                            ? new Date(sub.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-2 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}