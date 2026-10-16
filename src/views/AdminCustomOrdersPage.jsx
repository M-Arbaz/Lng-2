'use client'

import { useEffect, useMemo, useState } from 'react'
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
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ClipboardList,
  Hourglass,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import customOrdersService from '../utils/customOrdersService.js'

const STATUS_OPTIONS = [
  {
    value: 'new',
    label: 'New',
    description: 'New request awaiting review.',
    classes:
      'border-[#D7C8B9] bg-[#F6F0E9] text-[#6B4228]',
  },
  {
    value: 'contacted',
    label: 'Contacted',
    description: 'Customer has been contacted.',
    classes:
      'border-[#C9D7E3] bg-[#F1F6FA] text-[#4E687D]',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    description: 'Design or costing is in progress.',
    classes:
      'border-[#E4D3A5] bg-[#FFF8E6] text-[#82651E]',
  },
  {
    value: 'quotation_sent',
    label: 'Quotation Sent',
    description: 'Quotation has been shared with customer.',
    classes:
      'border-[#D2C8E4] bg-[#F7F3FB] text-[#705581]',
  },
  {
    value: 'approved',
    label: 'Approved',
    description: 'Customer approved the custom order.',
    classes:
      'border-[#C6DBCA] bg-[#F2F8F3] text-[#4B7351]',
  },
  {
    value: 'completed',
    label: 'Completed',
    description: 'Custom order has been completed.',
    classes:
      'border-[#BBD8C0] bg-[#EDF8EF] text-[#377044]',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    description: 'Request has been cancelled.',
    classes:
      'border-[#E5C9C3] bg-[#FFF2EF] text-[#984C40]',
  },
]

function getStatusMeta(status) {
  return (
    STATUS_OPTIONS.find(
      (item) => item.value === status
    ) || STATUS_OPTIONS[0]
  )
}

function parseDate(value) {
  if (!value) return null

  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }

  if (typeof value?.seconds === 'number') {
    return new Date(value.seconds * 1000)
  }

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed
}

function formatDate(value) {
  const date = parseDate(value)

  if (!date) return 'N/A'

  return date.toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDeadline(value) {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatBudget(value) {
  if (!value) return '—'

  return String(value)
    .replace(/\bPKR\b/gi, 'Rs.')
    .replace(/\s+/g, ' ')
    .trim()
}

function isPdfUrl(url) {
  return String(url || '')
    .split('?')[0]
    .toLowerCase()
    .endsWith('.pdf')
}

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] =
    useState('')

  const [filterStatus, setFilterStatus] =
    useState('all')

  const [selectedOrder, setSelectedOrder] =
    useState(null)

  const [selectedStatus, setSelectedStatus] =
    useState('new')

  const [saving, setSaving] = useState(false)

  const [deletingId, setDeletingId] =
    useState(null)

  const [message, setMessage] = useState({
    type: '',
    text: '',
  })

  const loadOrders = async () => {
    try {
      setLoading(true)

      const data =
        await customOrdersService.getAllOrders()

      setOrders(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(
        'Error loading custom orders:',
        error
      )

      setMessage({
        type: 'error',
        text: 'Failed to load custom order requests.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })

    window.setTimeout(() => {
      setMessage({
        type: '',
        text: '',
      })
    }, 3500)
  }

  const openOrder = (order) => {
    setSelectedOrder(order)

    setSelectedStatus(
      getStatusMeta(order.status).value
    )
  }

  const closeOrder = () => {
    if (saving) return

    setSelectedOrder(null)
    setSelectedStatus('new')
  }

  const updateStatus = async () => {
    if (!selectedOrder) return

    const currentStatus =
      getStatusMeta(
        selectedOrder.status
      ).value

    if (
      selectedStatus === currentStatus
    ) {
      return
    }

    try {
      setSaving(true)

      await customOrdersService.updateOrderStatus(
        selectedOrder.id,
        selectedStatus
      )

      const updatedOrder = {
        ...selectedOrder,
        status: selectedStatus,
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? updatedOrder
            : order
        )
      )

      setSelectedOrder(updatedOrder)

      showMessage(
        'success',
        `Custom order status updated to ${getStatusMeta(selectedStatus)
          .label
        }.`
      )
    } catch (error) {
      console.error(
        'Error updating status:',
        error
      )

      showMessage(
        'error',
        'Failed to update custom order status.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (order) => {
    const confirmed = window.confirm(
      `Delete custom order request from ${order.fullName || 'this customer'
      }? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeletingId(order.id)

      await customOrdersService.deleteOrder(
        order.id
      )

      setOrders((prev) =>
        prev.filter(
          (item) => item.id !== order.id
        )
      )

      if (
        selectedOrder?.id === order.id
      ) {
        setSelectedOrder(null)
      }

      showMessage(
        'success',
        'Custom order request deleted.'
      )
    } catch (error) {
      console.error(
        'Error deleting custom order:',
        error
      )

      showMessage(
        'error',
        'Failed to delete custom order request.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const filteredOrders = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase()

    return orders.filter((order) => {
      const searchableValues = [
        order.id,
        order.fullName,
        order.email,
        order.phone,
        order.city,
        order.productType,
        order.woodType,
        order.finish,
        order.color,
        order.budgetRange,
      ]

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value || '')
            .toLowerCase()
            .includes(query)
        )

      const matchesStatus =
        filterStatus === 'all' ||
        order.status === filterStatus

      return (
        matchesSearch &&
        matchesStatus
      )
    })
  }, [
    orders,
    searchQuery,
    filterStatus,
  ])

  const stats = useMemo(() => {
    return {
      total: orders.length,

      new: orders.filter(
        (order) =>
          getStatusMeta(order.status)
            .value === 'new'
      ).length,

      active: orders.filter((order) =>
        [
          'contacted',
          'in_progress',
          'quotation_sent',
          'approved',
        ].includes(
          getStatusMeta(order.status)
            .value
        )
      ).length,

      completed: orders.filter(
        (order) =>
          getStatusMeta(order.status)
            .value === 'completed'
      ).length,
    }
  }, [orders])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-[#FFFEFC] shadow-sm">
                <Wand2 className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Commerce
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Custom Orders
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Review customer design
                  requests, reference images,
                  specifications and progress
                  each request through your
                  custom production workflow.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-5 py-3 text-sm font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${message.type === 'success'
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
          <div className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Total Requests
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {stats.total}
                </p>

                <p className="mt-1 text-xs text-[#9A8478]">
                  All custom enquiries
                </p>
              </div>

              <div className="rounded-xl bg-[#F0E8E1] p-2.5 text-[#6B4228]">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  New Requests
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {stats.new}
                </p>

                <p className="mt-1 text-xs text-[#6B4228]">
                  Awaiting review
                </p>
              </div>

              <div className="rounded-xl border border-[#DCCDBF] bg-[#F7F1EB] p-2.5 text-[#6B4228]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Active
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {stats.active}
                </p>

                <p className="mt-1 text-xs text-[#80621C]">
                  Currently progressing
                </p>
              </div>

              <div className="rounded-xl border border-[#E6D9B7] bg-[#FFF8E8] p-2.5 text-[#80621C]">
                <Hourglass className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Completed
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {stats.completed}
                </p>

                <p className="mt-1 text-xs text-[#4D7553]">
                  Finished requests
                </p>
              </div>

              <div className="rounded-xl border border-[#CFE0D1] bg-[#F3F8F3] p-2.5 text-[#4D7553]">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Search + Filter */}
        <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search customer, email, phone, city, product or request ID..."
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(
                  event.target.value
                )
              }
              className="rounded-xl border border-[#DED1C8] bg-[#FDFBF8] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
            >
              <option value="all">
                All Statuses
              </option>

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status.value}
                    value={status.value}
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
                {filteredOrders.length}
              </span>{' '}
              of {orders.length} requests
            </p>
          </div>
        </section>

        {/* Orders */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12">
              <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading custom order
                requests...
              </p>
            </div>
          ) : filteredOrders.length ===
            0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EBE5] text-[#8A654D]">
                <Wand2 className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-[#281912]">
                No custom orders found
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-[#8A7467]">
                {searchQuery ||
                  filterStatus !== 'all'
                  ? 'Try adjusting your search or status filter.'
                  : 'Customer requests submitted from the Custom Order page will appear here.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="border-b border-[#E8DDD5] bg-[#F7F4EF]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Product
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Budget
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Submitted
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EEE5DF]">
                    {filteredOrders.map(
                      (order) => {
                        const status =
                          getStatusMeta(
                            order.status
                          )

                        return (
                          <tr
                            key={order.id}
                            className="transition-colors hover:bg-[#FBF8F4]"
                          >
                            <td className="px-5 py-4">
                              <div className="max-w-[240px]">
                                <p className="truncate text-sm font-semibold text-[#281912]">
                                  {order.fullName ||
                                    'Customer'}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-[#8A7467]">
                                  {order.email ||
                                    order.phone ||
                                    '—'}
                                </p>

                                <p className="mt-1 font-mono text-[10px] text-[#A08D82]">
                                  #
                                  {order.id?.slice(
                                    0,
                                    10
                                  )}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-[#3A2117]">
                                {order.productType ||
                                  '—'}
                              </p>

                              {(order.woodType ||
                                order.finish) && (
                                  <p className="mt-1 text-xs text-[#8A7467]">
                                    {[
                                      order.woodType,
                                      order.finish,
                                    ]
                                      .filter(Boolean)
                                      .join(' • ')}
                                  </p>
                                )}
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[190px] text-sm font-medium text-[#5D4A40]">
                                {formatBudget(
                                  order.budgetRange
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${status.classes}`}
                              >
                                {status.label}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[150px] text-xs leading-5 text-[#7B685D]">
                                {formatDate(
                                  order.createdAt
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openOrder(
                                      order
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D7C7BC] bg-[#FFFEFC] px-3.5 py-2 text-xs font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF]"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      order
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    order.id
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4D6CF] text-[#9C5D55] transition hover:border-[#C98E85] hover:bg-[#FFF3F1] hover:text-[#8B3F37] disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label="Delete custom order"
                                >
                                  {deletingId ===
                                    order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet */}
              <div className="divide-y divide-[#EEE5DF] lg:hidden">
                {filteredOrders.map(
                  (order) => {
                    const status =
                      getStatusMeta(
                        order.status
                      )

                    return (
                      <article
                        key={order.id}
                        className="p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#281912]">
                              {order.fullName ||
                                'Customer'}
                            </p>

                            <p className="mt-1 truncate text-xs text-[#8A7467]">
                              {order.email ||
                                order.phone ||
                                '—'}
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-[#A08D82]">
                              #
                              {order.id?.slice(
                                0,
                                12
                              )}
                            </p>
                          </div>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${status.classes}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-[#F7F4EF] p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A8478]">
                              Product
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#3A2117]">
                              {order.productType ||
                                '—'}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#F7F4EF] p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A8478]">
                              Quantity
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#3A2117]">
                              {order.quantity ||
                                '—'}
                            </p>
                          </div>

                          <div className="col-span-2 rounded-xl bg-[#F7F4EF] p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A8478]">
                              Budget
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#3A2117]">
                              {formatBudget(
                                order.budgetRange
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#8A7467]">
                          <span>
                            {order.city || '—'}
                          </span>

                          <span>
                            {formatDate(
                              order.createdAt
                            )}
                          </span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openOrder(order)
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-4 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912]"
                          >
                            <Eye className="h-4 w-4" />
                            View Request
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(order)
                            }
                            disabled={
                              deletingId ===
                              order.id
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E4D6CF] text-[#9C5D55] transition hover:bg-[#FFF3F1] disabled:opacity-50"
                          >
                            {deletingId ===
                              order.id ? (
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
              </div>
            </>
          )}
        </section>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-[#FFFEFC]">
                    <Wand2 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-[#281912] sm:text-xl">
                      Custom Design Request
                    </h3>

                    <p className="mt-0.5 truncate font-mono text-xs text-[#8A7467]">
                      #{selectedOrder.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeOrder}
                  disabled={saving}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7] hover:text-[#3A2117] disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
              <div className="space-y-5">
                {/* Overview */}
                <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                        Request Overview
                      </p>

                      <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                        {selectedOrder.productType ||
                          'Custom Product'}
                      </h4>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#8A7467]">
                        <Clock className="h-3.5 w-3.5" />
                        Submitted{' '}
                        {formatDate(
                          selectedOrder.createdAt
                        )}
                      </p>
                    </div>

                    <span
                      className={`inline-flex self-start rounded-full border px-3 py-1 text-xs font-semibold ${getStatusMeta(
                        selectedOrder.status
                      ).classes
                        }`}
                    >
                      {
                        getStatusMeta(
                          selectedOrder.status
                        ).label
                      }
                    </span>
                  </div>
                </section>

                {/* Customer */}
                <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Customer
                    </p>

                    <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                      Customer Information
                    </h4>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoCard
                      icon={User}
                      label="Full Name"
                      value={
                        selectedOrder.fullName
                      }
                    />

                    <InfoCard
                      icon={Phone}
                      label="Phone"
                      value={
                        selectedOrder.phone
                      }
                    />

                    <InfoCard
                      icon={Mail}
                      label="Email"
                      value={
                        selectedOrder.email
                      }
                      href={
                        selectedOrder.email
                          ? `mailto:${selectedOrder.email}`
                          : ''
                      }
                    />

                    <InfoCard
                      icon={MapPin}
                      label="City"
                      value={
                        selectedOrder.city
                      }
                    />
                  </div>
                </section>

                {/* Design */}
                <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Specification
                    </p>

                    <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                      Design Details
                    </h4>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoCard
                      icon={Package}
                      label="Product Type"
                      value={
                        selectedOrder.productType
                      }
                    />

                    <InfoCard
                      icon={TreePine}
                      label="Wood Type"
                      value={
                        selectedOrder.woodType
                      }
                    />

                    <InfoCard
                      icon={Sparkles}
                      label="Finish"
                      value={
                        selectedOrder.finish
                      }
                    />

                    <InfoCard
                      icon={Palette}
                      label="Colour"
                      value={
                        selectedOrder.color
                      }
                    />

                    <InfoCard
                      icon={Ruler}
                      label="Size"
                      value={
                        selectedOrder.size
                      }
                    />

                    <InfoCard
                      icon={Hash}
                      label="Quantity"
                      value={
                        selectedOrder.quantity
                      }
                    />

                    <InfoCard
                      icon={Wallet}
                      label="Budget"
                      value={formatBudget(
                        selectedOrder.budgetRange
                      )}
                    />

                    <InfoCard
                      icon={Calendar}
                      label="Deadline"
                      value={formatDeadline(
                        selectedOrder.deadline
                      )}
                    />
                  </div>
                </section>

                {/* Description */}
                {selectedOrder.description && (
                  <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0E8E1] text-[#6B4228]">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                          Brief
                        </p>

                        <h4 className="text-base font-semibold text-[#281912]">
                          Design Description
                        </h4>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E6DCD5] bg-[#FAF7F4] p-4">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-[#5F5048]">
                        {
                          selectedOrder.description
                        }
                      </p>
                    </div>
                  </section>
                )}

                {/* References */}
                {Array.isArray(
                  selectedOrder.images
                ) &&
                  selectedOrder.images
                    .length > 0 && (
                    <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                            Inspiration
                          </p>

                          <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                            Reference Files
                          </h4>
                        </div>

                        <span className="rounded-full bg-[#F0E8E1] px-3 py-1 text-xs font-semibold text-[#6B4228]">
                          {
                            selectedOrder
                              .images.length
                          }{' '}
                          file
                          {selectedOrder
                            .images.length === 1
                            ? ''
                            : 's'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {selectedOrder.images.map(
                          (url, index) => (
                            <a
                              key={`${url}-${index}`}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-square overflow-hidden rounded-xl border border-[#DED2C9] bg-[#F7F4EF]"
                            >
                              {isPdfUrl(
                                url
                              ) ? (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#8A7467]">
                                  <FileText className="h-7 w-7" />

                                  <span className="text-xs font-semibold">
                                    PDF File
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={url}
                                  alt={`Reference ${index + 1
                                    }`}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                />
                              )}

                              <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-[#281912]/35 via-transparent to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-[#3A2117] shadow-sm">
                                  <ExternalLink className="h-4 w-4" />
                                </span>
                              </div>
                            </a>
                          )
                        )}
                      </div>
                    </section>
                  )}

                {/* Status */}
                <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Workflow
                    </p>

                    <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                      Update Request Status
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-[#8A7467]">
                      Track the request from
                      initial enquiry through
                      quotation, approval and
                      completion.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {STATUS_OPTIONS.map(
                      (status) => {
                        const selected =
                          selectedStatus ===
                          status.value

                        return (
                          <button
                            key={
                              status.value
                            }
                            type="button"
                            onClick={() =>
                              setSelectedStatus(
                                status.value
                              )
                            }
                            disabled={saving}
                            className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${selected
                                ? 'border-[#6B4228] bg-[#F4ECE6] shadow-[0_0_0_2px_rgba(107,66,40,0.08)]'
                                : 'border-[#E5DAD2] bg-[#FFFEFC] hover:border-[#CDBCAF] hover:bg-[#FBF8F4]'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.classes}`}
                              >
                                {
                                  status.label
                                }
                              </span>

                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected
                                    ? 'border-[#6B4228] bg-[#6B4228]'
                                    : 'border-[#CFC0B6]'
                                  }`}
                              >
                                {selected && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </span>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-[#7B685D]">
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
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedOrder
                    )
                  }
                  disabled={
                    saving ||
                    deletingId ===
                    selectedOrder.id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E1C8C3] bg-[#FFFEFC] px-5 py-2.5 text-sm font-semibold text-[#954B42] transition hover:bg-[#FFF2EF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId ===
                    selectedOrder.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  Delete Request
                </button>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeOrder}
                    disabled={saving}
                    className="rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={updateStatus}
                    disabled={
                      saving ||
                      selectedStatus ===
                      getStatusMeta(
                        selectedOrder.status
                      ).value
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}

                    {saving
                      ? 'Updating...'
                      : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
  href = '',
}) {
  const content =
    value === undefined ||
      value === null ||
      value === ''
      ? '—'
      : value

  return (
    <div className="rounded-xl border border-[#E9E0DA] bg-[#FAF7F4] p-4">
      <div className="flex items-center gap-2 text-[#927D70]">
        <Icon className="h-3.5 w-3.5" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.1em]">
          {label}
        </p>
      </div>

      {href && content !== '—' ? (
        <a
          href={href}
          className="mt-2 block break-words text-sm font-semibold text-[#6B4228] hover:underline"
        >
          {content}
        </a>
      ) : (
        <p className="mt-2 break-words text-sm font-semibold text-[#281912]">
          {content}
        </p>
      )}
    </div>
  )
}