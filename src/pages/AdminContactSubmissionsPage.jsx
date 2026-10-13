'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Eye,
  Mail,
  Phone,
  User,
  MessageSquare,
  Clock,
  CheckCheck,
  X,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import contactSubmissionsService from '../utils/contactSubmissionsService.js'

const STATUS_STYLES = {
  new: { label: 'New', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  read: { label: 'Read', bg: 'bg-[#F5F1EA] text-[#5A2D0C] border-[#FFD400]/30' },
  replied: { label: 'Replied', bg: 'bg-green-50 text-green-700 border-green-200' },
}

export default function AdminContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true)
        const data = await contactSubmissionsService.getAllSubmissions()
        setSubmissions(data)
      } catch (e) {
        setMessage({ type: 'error', text: 'Failed to load contact submissions from Firebase' })
      } finally {
        setLoading(false)
      }
    }
    loadSubmissions()
  }, [])

  const handleMarkStatus = async (id, status) => {
    try {
      await contactSubmissionsService.updateSubmission(id, { status })
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      )
      setMessage({ type: 'success', text: `Marked as ${status}!` })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update status.' })
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await contactSubmissionsService.deleteSubmission(id)
        setSubmissions((prev) => prev.filter((s) => s.id !== id))
        if (selectedId === id) setSelectedId(null)
        setMessage({ type: 'success', text: 'Submission deleted!' })
      } catch {
        setMessage({ type: 'error', text: 'Delete failed.' })
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const filteredSubmissions = submissions.filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.comment?.toLowerCase().includes(q)
    )
  })

  const selectedSubmission = submissions.find((s) => s.id === selectedId)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Contact Submissions</h2>
          <span className="text-sm text-gray-500">
            {submissions.filter((s) => s.status === 'new').length} new
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
            placeholder="Search by name, email, phone, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-3 text-gray-600">Loading submissions...</span>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No submissions found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery ? 'Try adjusting your search.' : 'Contact form submissions will appear here.'}
                </p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => {
                const statusStyle = STATUS_STYLES[submission.status] || STATUS_STYLES.new
                const isSelected = selectedId === submission.id
                return (
                  <div
                    key={submission.id}
                    onClick={() => setSelectedId(submission.id)}
                    className={`bg-white rounded-xl shadow-md border overflow-hidden transition cursor-pointer ${
                      isSelected ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200 hover:shadow-lg'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">
                              {submission.name || 'Anonymous'}
                            </h3>
                            <p className="text-xs text-gray-500">{submission.email}</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.bg}`}
                        >
                          {statusStyle.label}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {submission.comment}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(submission.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {submission.status !== 'read' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkStatus(submission.id, 'read')
                              }}
                              className="p-2 text-gray-400 hover:text-[#FFD400] hover:bg-[#F5F1EA] rounded-lg transition"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {submission.status !== 'replied' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkStatus(submission.id, 'replied')
                              }}
                              className="p-2 text-gray-400 hover:text-[#22C55E] hover:bg-green-50 rounded-lg transition"
                              title="Mark as replied"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(submission.id)
                            }}
                            className="p-2 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 sticky top-6">
              {selectedSubmission ? (
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Submission Details</h3>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.name || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <a
                          href={`mailto:${selectedSubmission.email}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {selectedSubmission.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.phone || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Message</p>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {selectedSubmission.comment}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(selectedSubmission.createdAt).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition"
                    >
                      <Mail className="w-4 h-4" />
                      Reply via Email
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Mail className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm font-medium">
                    Select a submission to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
