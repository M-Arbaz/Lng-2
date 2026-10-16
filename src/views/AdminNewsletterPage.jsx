'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  CheckCircle,
  Copy,
  Mail,
  MailCheck,
  MailX,
  Loader2,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Users,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'

import newsletterService from '../utils/newsletterService.js'

const STATUS_OPTIONS = [
  {
    value: 'all',
    label: 'All Subscribers',
  },
  {
    value: 'active',
    label: 'Active',
  },
  {
    value: 'inactive',
    label: 'Inactive',
  },
]

function getStatus(
  subscriber
) {
  return subscriber?.status ===
    'inactive'
    ? 'inactive'
    : 'active'
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

function formatSource(value) {
  if (!value) {
    return 'Website'
  }

  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    )
}

export default function AdminNewsletterPage() {
  const [
    subscribers,
    setSubscribers,
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
    updatingId,
    setUpdatingId,
  ] = useState(null)

  const [
    deletingId,
    setDeletingId,
  ] = useState(null)

  const [
    copyingId,
    setCopyingId,
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

  const loadSubscribers =
    async () => {
      try {
        setLoading(true)

        const data =
          await newsletterService.getAllSubscribers()

        setSubscribers(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (error) {
        console.error(
          'Newsletter subscribers load failed:',
          error
        )

        showMessage(
          'error',
          'Failed to load newsletter subscribers.'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadSubscribers()
  }, [])

  const stats = useMemo(
    () => {
      const active =
        subscribers.filter(
          (subscriber) =>
            getStatus(
              subscriber
            ) ===
            'active'
        ).length

      const inactive =
        subscribers.filter(
          (subscriber) =>
            getStatus(
              subscriber
            ) ===
            'inactive'
        ).length

      return {
        total:
          subscribers.length,

        active,

        inactive,
      }
    },
    [subscribers]
  )

  const filteredSubscribers =
    useMemo(() => {
      const queryValue =
        searchQuery
          .trim()
          .toLowerCase()

      return subscribers.filter(
        (subscriber) => {
          const status =
            getStatus(
              subscriber
            )

          const matchesStatus =
            statusFilter ===
            'all' ||
            status ===
            statusFilter

          const matchesSearch =
            !queryValue ||
            [
              subscriber.email,
              subscriber.source,
              subscriber.lastSource,
            ].some((value) =>
              String(value || '')
                .toLowerCase()
                .includes(
                  queryValue
                )
            )

          return (
            matchesStatus &&
            matchesSearch
          )
        }
      )
    }, [
      subscribers,
      searchQuery,
      statusFilter,
    ])

  const handleStatusToggle =
    async (subscriber) => {
      const currentStatus =
        getStatus(
          subscriber
        )

      const nextStatus =
        currentStatus ===
          'active'
          ? 'inactive'
          : 'active'

      try {
        setUpdatingId(
          subscriber.id
        )

        const updated =
          await newsletterService.updateStatus(
            subscriber.id,
            nextStatus
          )

        setSubscribers(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                  subscriber.id
                  ? {
                    ...item,
                    ...updated,
                  }
                  : item
            )
        )

        showMessage(
          'success',
          nextStatus ===
            'active'
            ? 'Subscriber activated.'
            : 'Subscriber deactivated.'
        )
      } catch (error) {
        console.error(
          'Subscriber status update failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to update subscriber.'
        )
      } finally {
        setUpdatingId(null)
      }
    }

  const handleDelete =
    async (subscriber) => {
      const confirmed =
        window.confirm(
          `Permanently remove ${subscriber.email || 'this subscriber'} from the newsletter list?`
        )

      if (!confirmed) {
        return
      }

      try {
        setDeletingId(
          subscriber.id
        )

        await newsletterService.deleteSubscriber(
          subscriber.id
        )

        setSubscribers(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                subscriber.id
            )
        )

        showMessage(
          'success',
          'Subscriber removed successfully.'
        )
      } catch (error) {
        console.error(
          'Newsletter subscriber delete failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to remove subscriber.'
        )
      } finally {
        setDeletingId(null)
      }
    }

  const copyEmail =
    async (subscriber) => {
      try {
        if (
          !subscriber.email
        ) {
          return
        }

        setCopyingId(
          subscriber.id
        )

        await navigator.clipboard.writeText(
          subscriber.email
        )

        showMessage(
          'success',
          'Email address copied.'
        )
      } catch (error) {
        console.error(
          'Copy email failed:',
          error
        )

        showMessage(
          'error',
          'Could not copy email address.'
        )
      } finally {
        setCopyingId(null)
      }
    }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-[#FFFEFC]">
                <Mail className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Communication
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Newsletter
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Manage customers who
                  joined the Lamp &amp;
                  Glow mailing list,
                  review signup sources
                  and control subscriber
                  status.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                loadSubscribers
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

        {/* Feedback */}
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
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Users}
            label="Total Subscribers"
            value={stats.total}
            text="All newsletter records"
          />

          <StatCard
            icon={MailCheck}
            label="Active"
            value={stats.active}
            text="Currently subscribed"
          />

          <StatCard
            icon={MailX}
            label="Inactive"
            value={stats.inactive}
            text="Newsletter disabled"
          />
        </section>

        {/* Search + Filter */}
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
                placeholder="Search email or signup source..."
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
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
                  filteredSubscribers.length
                }
              </span>{' '}
              of{' '}
              {subscribers.length}{' '}
              subscribers
            </p>
          </div>
        </section>

        {/* Content */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading subscribers...
              </p>
            </div>
          </section>
        ) : filteredSubscribers.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <Mail className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No subscribers found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
              {searchQuery ||
                statusFilter !==
                'all'
                ? 'Try adjusting your search or status filter.'
                : 'Newsletter signups from the website will appear here.'}
            </p>
          </section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {filteredSubscribers.map(
              (subscriber) => {
                const status =
                  getStatus(
                    subscriber
                  )

                const active =
                  status ===
                  'active'

                const source =
                  subscriber.lastSource ||
                  subscriber.source ||
                  'website'

                return (
                  <article
                    key={
                      subscriber.id
                    }
                    className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_10px_30px_rgba(58,33,23,0.05)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active
                              ? 'bg-[#EEF7EF] text-[#4E7855]'
                              : 'bg-[#F3ECE7] text-[#806D62]'
                            }`}
                        >
                          {active ? (
                            <MailCheck className="h-5 w-5" />
                          ) : (
                            <MailX className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="break-all text-sm font-semibold leading-6 text-[#281912]">
                            {
                              subscriber.email
                            }
                          </p>

                          <p className="mt-1 text-xs text-[#8A7467]">
                            Joined via{' '}
                            <span className="font-medium text-[#6B4228]">
                              {formatSource(
                                source
                              )}
                            </span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${active
                            ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                            : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                          }`}
                      >
                        {active
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <InfoBox
                        label="Subscribed"
                        value={formatDate(
                          subscriber.createdAt
                        )}
                      />

                      <InfoBox
                        label="Last Activity"
                        value={formatDate(
                          subscriber.lastSubscribedAt ||
                          subscriber.updatedAt ||
                          subscriber.createdAt
                        )}
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-[#EEE5DF] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusToggle(
                            subscriber
                          )
                        }
                        disabled={
                          updatingId ===
                          subscriber.id
                        }
                        className={`inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${active
                            ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B] hover:bg-[#E6F3E8]'
                            : 'border-[#D8C8BC] bg-[#F7F4EF] text-[#6B4228] hover:bg-[#EFE7E1]'
                          }`}
                      >
                        {updatingId ===
                          subscriber.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : active ? (
                          <MailCheck className="h-3.5 w-3.5" />
                        ) : (
                          <MailX className="h-3.5 w-3.5" />
                        )}

                        {active
                          ? 'Active'
                          : 'Inactive'}
                      </button>

                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            copyEmail(
                              subscriber
                            )
                          }
                          disabled={
                            copyingId ===
                            subscriber.id
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-50"
                          title="Copy email"
                        >
                          {copyingId ===
                            subscriber.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>

                        {subscriber.email && (
                          <a
                            href={`mailto:${subscriber.email}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                            title="Send email"
                          >
                            <Send className="h-4 w-4" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              subscriber
                            )
                          }
                          disabled={
                            deletingId ===
                            subscriber.id
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                          title="Delete subscriber"
                        >
                          {deletingId ===
                            subscriber.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              }
            )}
          </section>
        )}
      </div>
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

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#E9E0DA] bg-[#FAF7F4] p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9A8478]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-xs font-semibold leading-5 text-[#4E3D34]">
        {value}
      </p>
    </div>
  )
}