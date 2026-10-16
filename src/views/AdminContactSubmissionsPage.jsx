'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  CheckCheck,
  CheckCircle,
  Clock,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Trash2,
  User,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'

import contactSubmissionsService from '../utils/contactSubmissionsService.js'

const STATUS_OPTIONS = [
  {
    value: 'new',
    label: 'New',
    description:
      'Not reviewed yet.',
    className:
      'border-[#D7C6B8] bg-[#F5ECE5] text-[#6B4228]',
  },
  {
    value: 'read',
    label: 'Read',
    description:
      'Message has been reviewed.',
    className:
      'border-[#D9D4C5] bg-[#F7F5EC] text-[#766543]',
  },
  {
    value: 'replied',
    label: 'Replied',
    description:
      'Customer has been answered.',
    className:
      'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]',
  },
]

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

function getStatusMeta(status) {
  return (
    STATUS_OPTIONS.find(
      (item) =>
        item.value === status
    ) ||
    STATUS_OPTIONS[0]
  )
}

function parseDate(value) {
  if (!value) {
    return null
  }

  if (
    typeof value?.toDate ===
    'function'
  ) {
    return value.toDate()
  }

  const date =
    new Date(value)

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date
}

function formatDate(value) {
  const date =
    parseDate(value)

  if (!date) {
    return '—'
  }

  return date.toLocaleString(
    'en-PK',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  )
}

function getMessage(
  submission
) {
  return (
    submission?.comment ||
    submission?.message ||
    ''
  )
}

export default function AdminContactSubmissionsPage() {
  const [
    submissions,
    setSubmissions,
  ] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] = useState(null)

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null)

  const [
    deletingId,
    setDeletingId,
  ] = useState(null)

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const messageTimerRef =
    useRef(null)

  const showMessage = (
    type,
    text
  ) => {
    if (
      messageTimerRef.current
    ) {
      window.clearTimeout(
        messageTimerRef.current
      )
    }

    setMessage({
      type,
      text,
    })

    messageTimerRef.current =
      window.setTimeout(() => {
        setMessage({
          type: '',
          text: '',
        })
      }, 3500)
  }

  useEffect(() => {
    return () => {
      if (
        messageTimerRef.current
      ) {
        window.clearTimeout(
          messageTimerRef.current
        )
      }
    }
  }, [])

  const loadSubmissions =
    async () => {
      try {
        setLoading(true)

        const data =
          await contactSubmissionsService.getAllSubmissions()

        setSubmissions(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (error) {
        console.error(
          'Failed to load contact submissions:',
          error
        )

        showMessage(
          'error',
          'Failed to load contact submissions.'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const stats = useMemo(
    () => ({
      total:
        submissions.length,

      new:
        submissions.filter(
          (submission) =>
            !submission.status ||
            submission.status ===
            'new'
        ).length,

      read:
        submissions.filter(
          (submission) =>
            submission.status ===
            'read'
        ).length,

      replied:
        submissions.filter(
          (submission) =>
            submission.status ===
            'replied'
        ).length,
    }),
    [submissions]
  )

  const filteredSubmissions =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      return submissions.filter(
        (submission) => {
          const status =
            submission.status ||
            'new'

          const matchesStatus =
            statusFilter ===
            'all' ||
            status ===
            statusFilter

          const matchesSearch =
            !query ||
            [
              submission.name,
              submission.email,
              submission.phone,
              getMessage(
                submission
              ),
              submission.source,
            ].some((value) =>
              String(value || '')
                .toLowerCase()
                .includes(query)
            )

          return (
            matchesStatus &&
            matchesSearch
          )
        }
      )
    }, [
      submissions,
      searchQuery,
      statusFilter,
    ])

  const updateStatus =
    async (
      submission,
      status,
      {
        silent = false,
      } = {}
    ) => {
      if (
        submission.status ===
        status
      ) {
        return true
      }

      try {
        setUpdatingId(
          submission.id
        )

        const updated =
          await contactSubmissionsService.updateStatus(
            submission.id,
            status
          )

        setSubmissions(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                  submission.id
                  ? {
                    ...item,
                    ...updated,
                  }
                  : item
            )
        )

        setSelectedSubmission(
          (prev) =>
            prev?.id ===
              submission.id
              ? {
                ...prev,
                ...updated,
              }
              : prev
        )

        if (!silent) {
          showMessage(
            'success',
            `Submission marked as ${getStatusMeta(status).label}.`
          )
        }

        return true
      } catch (error) {
        console.error(
          'Contact submission status update failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to update submission status.'
        )

        return false
      } finally {
        setUpdatingId(null)
      }
    }

  const openSubmission =
    async (submission) => {
      setSelectedSubmission(
        submission
      )

      /*
       * Viewing a new submission
       * automatically marks it as Read.
       */
      if (
        !submission.status ||
        submission.status ===
        'new'
      ) {
        await updateStatus(
          submission,
          'read',
          {
            silent: true,
          }
        )
      }
    }

  const handleDelete =
    async (submission) => {
      const confirmed =
        window.confirm(
          `Delete ${submission.name
            ? `${submission.name}'s`
            : 'this'
          } contact submission? This action cannot be undone.`
        )

      if (!confirmed) {
        return
      }

      try {
        setDeletingId(
          submission.id
        )

        await contactSubmissionsService.deleteSubmission(
          submission.id
        )

        setSubmissions(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                submission.id
            )
        )

        if (
          selectedSubmission?.id ===
          submission.id
        ) {
          setSelectedSubmission(
            null
          )
        }

        showMessage(
          'success',
          'Contact submission deleted.'
        )
      } catch (error) {
        console.error(
          'Contact submission delete failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to delete submission.'
        )
      } finally {
        setDeletingId(null)
      }
    }

  const replyHref = (
    submission
  ) => {
    const email =
      String(
        submission?.email || ''
      ).trim()

    if (!email) {
      return '#'
    }

    const subject =
      encodeURIComponent(
        'Re: Your Lamp & Glow enquiry'
      )

    return `mailto:${email}?subject=${subject}`
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-[#FFFEFC]">
                <Inbox className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Communication
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Contact Submissions
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Review customer
                  enquiries, manage their
                  status and quickly
                  respond by email or
                  phone.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                loadSubmissions
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-4 py-3 text-sm font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading
                    ? 'animate-spin'
                    : ''
                  }`}
              />

              Refresh
            </button>
          </div>
        </section>

        {/* Message */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${message.type ===
                'success'
                ? 'border-[#CFE1D1] bg-[#F3F9F3] text-[#426649]'
                : 'border-[#E8C9C3] bg-[#FFF4F1] text-[#93483C]'
              }`}
          >
            {message.type ===
              'success' ? (
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="text-sm font-medium">
              {message.text}
            </p>
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Inbox}
            label="Total"
            value={stats.total}
            text="All enquiries"
          />

          <StatCard
            icon={Mail}
            label="New"
            value={stats.new}
            text="Waiting to be reviewed"
          />

          <StatCard
            icon={Eye}
            label="Read"
            value={stats.read}
            text="Reviewed messages"
          />

          <StatCard
            icon={CheckCheck}
            label="Replied"
            value={stats.replied}
            text="Customer answered"
          />
        </section>

        {/* Search + filter */}
        <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

              <input
                type="text"
                value={
                  searchQuery
                }
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search name, email, phone or message..."
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="all">
                All Statuses
              </option>

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={
                      status.value
                    }
                    value={
                      status.value
                    }
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="mt-4 border-t border-[#EEE5DF] pt-4">
            <p className="text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {
                  filteredSubmissions.length
                }
              </span>{' '}
              of {submissions.length}{' '}
              submissions
            </p>
          </div>
        </section>

        {/* List */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading contact
                submissions...
              </p>
            </div>
          </section>
        ) : filteredSubmissions.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <Mail className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No submissions found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
              {searchQuery ||
                statusFilter !==
                'all'
                ? 'Try adjusting your search or status filter.'
                : 'New customer enquiries will appear here.'}
            </p>
          </section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {filteredSubmissions.map(
              (submission) => {
                const status =
                  getStatusMeta(
                    submission.status ||
                    'new'
                  )

                const text =
                  getMessage(
                    submission
                  )

                return (
                  <article
                    key={
                      submission.id
                    }
                    className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_10px_30px_rgba(58,33,23,0.05)]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openSubmission(
                          submission
                        )
                      }
                      className="block w-full p-5 text-left sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0E8E1] text-[#6B4228]">
                            <User className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-[#281912]">
                              {submission.name ||
                                'Anonymous'}
                            </h3>

                            <p className="mt-1 truncate text-xs text-[#8A7467]">
                              {submission.email ||
                                'No email'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-[#5F4C42]">
                        {text ||
                          'No message provided.'}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#9A8478]">
                          <Clock className="h-3.5 w-3.5" />

                          {formatDate(
                            submission.createdAt
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B4228]">
                          View Details
                          <MessageSquare className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center justify-end gap-1 border-t border-[#EEE5DF] px-4 py-2.5">
                      {submission.email && (
                        <a
                          href={replyHref(
                            submission
                          )}
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                          title="Reply by email"
                        >
                          <Send className="h-4 w-4" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            submission
                          )
                        }
                        disabled={
                          deletingId ===
                          submission.id
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId ===
                          submission.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </article>
                )
              }
            )}
          </section>
        )}
      </div>

      {/* Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Customer Enquiry
                    </p>

                    <h3 className="truncate text-lg font-semibold text-[#281912]">
                      {selectedSubmission.name ||
                        'Anonymous'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedSubmission(
                      null
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
              {/* Status */}
              <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                  Status
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {STATUS_OPTIONS.map(
                    (status) => {
                      const active =
                        (selectedSubmission.status ||
                          'new') ===
                        status.value

                      return (
                        <button
                          key={
                            status.value
                          }
                          type="button"
                          onClick={() =>
                            updateStatus(
                              selectedSubmission,
                              status.value
                            )
                          }
                          disabled={
                            updatingId ===
                            selectedSubmission.id
                          }
                          className={`rounded-xl border p-3 text-left transition ${active
                              ? 'border-[#9E765B] bg-[#F3E9E1]'
                              : 'border-[#E6DCD5] bg-[#FAF7F4] hover:border-[#C9B5A7]'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            {updatingId ===
                              selectedSubmission.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6B4228]" />
                            ) : status.value ===
                              'new' ? (
                              <Mail className="h-3.5 w-3.5 text-[#6B4228]" />
                            ) : status.value ===
                              'read' ? (
                              <Eye className="h-3.5 w-3.5 text-[#6B4228]" />
                            ) : (
                              <CheckCheck className="h-3.5 w-3.5 text-[#44704B]" />
                            )}

                            <span className="text-xs font-semibold text-[#3A2117]">
                              {
                                status.label
                              }
                            </span>
                          </div>

                          <p className="mt-1.5 text-[10px] leading-4 text-[#8A7467]">
                            {
                              status.description
                            }
                          </p>
                        </button>
                      )
                    }
                  )}
                </div>
              </section>

              {/* Customer */}
              <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                  Customer Details
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DetailCard
                    icon={User}
                    label="Name"
                    value={
                      selectedSubmission.name ||
                      '—'
                    }
                  />

                  <DetailCard
                    icon={Mail}
                    label="Email"
                    value={
                      selectedSubmission.email ||
                      '—'
                    }
                  />

                  <DetailCard
                    icon={Phone}
                    label="Phone"
                    value={
                      selectedSubmission.phone ||
                      '—'
                    }
                  />

                  <DetailCard
                    icon={Clock}
                    label="Submitted"
                    value={formatDate(
                      selectedSubmission.createdAt
                    )}
                  />
                </div>
              </section>

              {/* Message */}
              <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#6B4228]" />

                  <p className="text-sm font-semibold text-[#3A2117]">
                    Customer Message
                  </p>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#5F4C42]">
                  {getMessage(
                    selectedSubmission
                  ) ||
                    'No message provided.'}
                </p>
              </section>

              {selectedSubmission.source && (
                <p className="text-center text-[10px] uppercase tracking-[0.12em] text-[#9A8478]">
                  Source:{' '}
                  {
                    selectedSubmission.source
                  }
                </p>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedSubmission
                    )
                  }
                  disabled={
                    deletingId ===
                    selectedSubmission.id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E6CFCB] bg-[#FFF8F6] px-4 py-2.5 text-sm font-semibold text-[#954B42] transition hover:bg-[#FFF1EE] disabled:opacity-50"
                >
                  {deletingId ===
                    selectedSubmission.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  Delete
                </button>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {selectedSubmission.phone && (
                    <a
                      href={`tel:${selectedSubmission.phone}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCCFC6] px-4 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF]"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  )}

                  {selectedSubmission.email && (
                    <a
                      href={replyHref(
                        selectedSubmission
                      )}
                      onClick={() => {
                        updateStatus(
                          selectedSubmission,
                          'replied',
                          {
                            silent:
                              true,
                          }
                        )
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#281912]"
                    >
                      <Send className="h-4 w-4" />
                      Reply by Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  text,
}) {
  return (
    <div className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8A7467]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
            {value}
          </p>

          <p className="mt-1 text-xs text-[#9A8478]">
            {text}
          </p>
        </div>

        <div className="rounded-xl bg-[#F0E8E1] p-2.5 text-[#6B4228]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function DetailCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#E9E0DA] bg-[#FAF7F4] p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDE4DC] text-[#6B4228]">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9A8478]">
            {label}
          </p>

          <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#4E3D34]">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}