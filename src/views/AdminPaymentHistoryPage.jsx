'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Download,
  DollarSign,
  CheckCircle,
  AlertCircle,
  History,
  X,
  Loader2,
  Eye,
  CreditCard,
  Banknote,
  Clock,
  RotateCcw,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import ordersService from '../utils/ordersService.js'

const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    description: 'Payment has not been received yet.',
    classes:
      'border-[#E5D2A3] bg-[#FFF8E5] text-[#80621C]',
  },

  partial: {
    label: 'Partial',
    description:
      'Part of the payment has been received.',
    classes:
      'border-[#D9CBE3] bg-[#F8F3FB] text-[#705180]',
  },

  paid: {
    label: 'Paid',
    description:
      'Full payment has been received.',
    classes:
      'border-[#BED7C2] bg-[#EFF8F0] text-[#417048]',
  },

  failed: {
    label: 'Failed',
    description:
      'Payment attempt failed or could not be completed.',
    classes:
      'border-[#E3C3BC] bg-[#FFF1EE] text-[#944E42]',
  },

  refunded: {
    label: 'Refunded',
    description:
      'Payment has been refunded to the customer.',
    classes:
      'border-[#C8D9E8] bg-[#F0F6FB] text-[#426983]',
  },

  cancelled: {
    label: 'Cancelled',
    description:
      'Payment has been cancelled.',
    classes:
      'border-[#DDD4CE] bg-[#F8F5F2] text-[#6F5D53]',
  },
}

const PAYMENT_STATUS_OPTIONS = [
  'pending',
  'partial',
  'paid',
  'failed',
  'refunded',
  'cancelled',
]

function normalizePaymentStatus(value) {
  const normalized = String(
    value || 'pending'
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  return PAYMENT_STATUS_CONFIG[
    normalized
  ]
    ? normalized
    : 'pending'
}

function normalizePaymentMethod(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function getPaymentMethodLabel(value) {
  const method =
    normalizePaymentMethod(value)

  if (
    method === 'cod' ||
    method === 'cash_on_delivery'
  ) {
    return 'Cash on Delivery'
  }

  if (
    method === 'bank' ||
    method === 'bank_transfer'
  ) {
    return 'Bank Transfer'
  }

  if (method === 'card') {
    return 'Card'
  }

  if (!method) {
    return 'Not specified'
  }

  return method
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
}

function getOrderDate(order) {
  const value =
    order?.createdAt ||
    order?.date

  if (!value) {
    return null
  }

  if (
    typeof value?.toDate ===
    'function'
  ) {
    return value.toDate()
  }

  if (
    typeof value?.seconds ===
    'number'
  ) {
    return new Date(
      value.seconds * 1000
    )
  }

  const parsed =
    new Date(value)

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed
}

function parseDateValue(value) {
  if (!value) {
    return null
  }

  if (
    typeof value?.toDate ===
    'function'
  ) {
    return value.toDate()
  }

  if (
    typeof value?.seconds ===
    'number'
  ) {
    return new Date(
      value.seconds * 1000
    )
  }

  const parsed =
    new Date(value)

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed
}

function formatOrderDate(order) {
  const date =
    getOrderDate(order)

  if (!date) {
    return '—'
  }

  return date.toLocaleDateString(
    'en-PK',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )
}

function formatHistoryDate(value) {
  const date =
    parseDateValue(value)

  if (!date) {
    return 'Date unavailable'
  }

  return date.toLocaleString(
    'en-PK',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

function formatPKR(value) {
  return `Rs. ${Number(
    value || 0
  ).toLocaleString('en-PK')}`
}

function escapeCsvValue(value) {
  const stringValue =
    String(value ?? '')

  return `"${stringValue.replace(
    /"/g,
    '""'
  )}"`
}

export default function AdminPaymentHistoryPage() {
  const [orders, setOrders] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [searchQuery, setSearchQuery] =
    useState('')

  const [
    filterPaymentStatus,
    setFilterPaymentStatus,
  ] = useState('all')

  const [
    filterPaymentMethod,
    setFilterPaymentMethod,
  ] = useState('all')

  const [dateRange, setDateRange] =
    useState({
      from: '',
      to: '',
    })

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState(null)

  const [
    selectedPaymentStatus,
    setSelectedPaymentStatus,
  ] = useState('pending')

  const [
    showPaymentModal,
    setShowPaymentModal,
  ] = useState(false)

  const [
    updatingPayment,
    setUpdatingPayment,
  ] = useState(false)

  useEffect(() => {
    const loadAllOrders = async () => {
      try {
        setLoading(true)

        const allOrders =
          await ordersService.getAllOrders()

        const sorted = [
          ...(Array.isArray(
            allOrders
          )
            ? allOrders
            : []),
        ].sort((a, b) => {
          const dateA =
            getOrderDate(
              a
            )?.getTime() || 0

          const dateB =
            getOrderDate(
              b
            )?.getTime() || 0

          return dateB - dateA
        })

        setOrders(sorted)
      } catch (error) {
        console.error(
          'Error loading payment orders:',
          error
        )

        setOrders([])

        setMessage({
          type: 'error',
          text: 'Failed to load payment history.',
        })
      } finally {
        setLoading(false)
      }
    }

    loadAllOrders()
  }, [])

  const showTemporaryMessage = (
    type,
    text
  ) => {
    setMessage({
      type,
      text,
    })

    setTimeout(() => {
      setMessage({
        type: '',
        text: '',
      })
    }, 3500)
  }

  const filteredOrders =
    orders.filter((order) => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      const matchesSearch =
        !query ||
        order.id
          ?.toLowerCase()
          .includes(query) ||
        order.fullName
          ?.toLowerCase()
          .includes(query) ||
        order.email
          ?.toLowerCase()
          .includes(query) ||
        order.phone
          ?.toLowerCase()
          .includes(query)

      const paymentStatus =
        normalizePaymentStatus(
          order.paymentStatus
        )

      const matchesPaymentStatus =
        filterPaymentStatus ===
        'all' ||
        paymentStatus ===
        filterPaymentStatus

      const paymentMethod =
        normalizePaymentMethod(
          order.paymentMethod
        )

      let matchesPaymentMethod =
        filterPaymentMethod === 'all'

      if (
        filterPaymentMethod ===
        'cod'
      ) {
        matchesPaymentMethod =
          paymentMethod === 'cod' ||
          paymentMethod ===
          'cash_on_delivery'
      }

      if (
        filterPaymentMethod ===
        'bank'
      ) {
        matchesPaymentMethod =
          paymentMethod === 'bank' ||
          paymentMethod ===
          'bank_transfer'
      }

      if (
        filterPaymentMethod ===
        'card'
      ) {
        matchesPaymentMethod =
          paymentMethod === 'card'
      }

      if (
        filterPaymentMethod ===
        'other'
      ) {
        matchesPaymentMethod =
          ![
            'cod',
            'cash_on_delivery',
            'bank',
            'bank_transfer',
            'card',
          ].includes(
            paymentMethod
          )
      }

      const orderDate =
        getOrderDate(order)

      const fromDate =
        dateRange.from
          ? new Date(
            `${dateRange.from}T00:00:00`
          )
          : null

      const toDate =
        dateRange.to
          ? new Date(
            `${dateRange.to}T23:59:59.999`
          )
          : null

      const matchesDateRange =
        (!fromDate ||
          (orderDate &&
            orderDate >=
            fromDate)) &&
        (!toDate ||
          (orderDate &&
            orderDate <= toDate))

      return (
        matchesSearch &&
        matchesPaymentStatus &&
        matchesPaymentMethod &&
        matchesDateRange
      )
    })

  const stats = {
    totalOrders:
      orders.length,

    totalValue:
      orders.reduce(
        (sum, order) =>
          sum +
          Number(
            order.total || 0
          ),
        0
      ),

    paidOrders:
      orders.filter(
        (order) =>
          normalizePaymentStatus(
            order.paymentStatus
          ) === 'paid'
      ).length,

    partialOrders:
      orders.filter(
        (order) =>
          normalizePaymentStatus(
            order.paymentStatus
          ) === 'partial'
      ).length,

    pendingOrders:
      orders.filter(
        (order) =>
          normalizePaymentStatus(
            order.paymentStatus
          ) === 'pending'
      ).length,
  }

  const paymentMethodStats = {
    cod: orders.filter(
      (order) => {
        const method =
          normalizePaymentMethod(
            order.paymentMethod
          )

        return (
          method === 'cod' ||
          method ===
          'cash_on_delivery'
        )
      }
    ).length,

    card: orders.filter(
      (order) =>
        normalizePaymentMethod(
          order.paymentMethod
        ) === 'card'
    ).length,

    bank: orders.filter(
      (order) => {
        const method =
          normalizePaymentMethod(
            order.paymentMethod
          )

        return (
          method === 'bank' ||
          method ===
          'bank_transfer'
        )
      }
    ).length,

    other: orders.filter(
      (order) =>
        ![
          'cod',
          'cash_on_delivery',
          'card',
          'bank',
          'bank_transfer',
        ].includes(
          normalizePaymentMethod(
            order.paymentMethod
          )
        )
    ).length,
  }

  const openPaymentModal = (
    order
  ) => {
    setSelectedOrder(order)

    setSelectedPaymentStatus(
      normalizePaymentStatus(
        order.paymentStatus
      )
    )

    setShowPaymentModal(true)
  }

  const closePaymentModal = () => {
    if (updatingPayment) {
      return
    }

    setShowPaymentModal(false)
    setSelectedOrder(null)
    setSelectedPaymentStatus(
      'pending'
    )
  }

  const handleUpdatePaymentStatus =
    async () => {
      if (!selectedOrder) {
        return
      }

      const currentStatus =
        normalizePaymentStatus(
          selectedOrder.paymentStatus
        )

      if (
        selectedPaymentStatus ===
        currentStatus
      ) {
        return
      }

      try {
        setUpdatingPayment(true)

        const result =
          await ordersService.updatePaymentStatus(
            selectedOrder.id,
            selectedPaymentStatus
          )

        const updatedStatus =
          normalizePaymentStatus(
            result.paymentStatus
          )

        const updatedOrder = {
          ...selectedOrder,

          paymentStatus:
            updatedStatus,

          paymentStatusHistory: [
            ...(
              Array.isArray(
                selectedOrder.paymentStatusHistory
              )
                ? selectedOrder.paymentStatusHistory
                : []
            ),

            result.paymentStatusEvent,
          ],
        }

        setOrders((prev) =>
          prev.map((order) =>
            order.id ===
              selectedOrder.id
              ? updatedOrder
              : order
          )
        )

        setSelectedOrder(
          updatedOrder
        )

        setSelectedPaymentStatus(
          updatedStatus
        )

        showTemporaryMessage(
          'success',
          `Payment status updated to ${PAYMENT_STATUS_CONFIG[
            updatedStatus
          ].label
          }.`
        )
      } catch (error) {
        console.error(
          'Error updating payment status:',
          error
        )

        showTemporaryMessage(
          'error',
          'Failed to update payment status.'
        )
      } finally {
        setUpdatingPayment(false)
      }
    }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterPaymentStatus(
      'all'
    )
    setFilterPaymentMethod(
      'all'
    )
    setDateRange({
      from: '',
      to: '',
    })
  }

  const downloadReport = () => {
    const reportRows = [
      [
        'Payment History Report',
        new Date().toLocaleDateString(
          'en-PK'
        ),
      ],

      [],

      [
        'Order ID',
        'Customer',
        'Email',
        'Amount',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Date',
      ],

      ...filteredOrders.map(
        (order) => [
          order.id || '',
          order.fullName || '',
          order.email || '',
          Number(
            order.total || 0
          ),
          getPaymentMethodLabel(
            order.paymentMethod
          ),
          PAYMENT_STATUS_CONFIG[
            normalizePaymentStatus(
              order.paymentStatus
            )
          ].label,
          order.status || '',
          formatOrderDate(order),
        ]
      ),

      [],

      [
        'Total Amount',
        filteredOrders.reduce(
          (sum, order) =>
            sum +
            Number(
              order.total || 0
            ),
          0
        ),
      ],

      [
        'Total Orders',
        filteredOrders.length,
      ],
    ]

    const csvString =
      reportRows
        .map((row) =>
          row
            .map(
              escapeCsvValue
            )
            .join(',')
        )
        .join('\n')

    const blob =
      new Blob(
        [
          `\uFEFF${csvString}`,
        ],
        {
          type: 'text/csv;charset=utf-8;',
        }
      )

    const url =
      window.URL.createObjectURL(
        blob
      )

    const anchor =
      document.createElement('a')

    anchor.href = url

    anchor.download = `payment-history-${new Date()
        .toISOString()
        .split('T')[0]
      }.csv`

    document.body.appendChild(
      anchor
    )

    anchor.click()

    window.URL.revokeObjectURL(
      url
    )

    document.body.removeChild(
      anchor
    )
  }

  const filteredTotal =
    filteredOrders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total || 0
        ),
      0
    )

  const filteredAverage =
    filteredOrders.length > 0
      ? Math.round(
        filteredTotal /
        filteredOrders.length
      )
      : 0

  const selectedStatus =
    selectedOrder
      ? normalizePaymentStatus(
        selectedOrder.paymentStatus
      )
      : 'pending'

  const paymentHistory =
    selectedOrder &&
      Array.isArray(
        selectedOrder.paymentStatusHistory
      )
      ? [
        ...selectedOrder.paymentStatusHistory,
      ].reverse()
      : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Premium Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-[#FFFEFC] shadow-sm">
                <DollarSign className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Commerce
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Payment History
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Monitor payment activity,
                  manage independent payment
                  statuses and review complete
                  payment history for every
                  order.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                downloadReport
              }
              disabled={
                filteredOrders.length ===
                0
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-[#FFFEFC] shadow-sm transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Download className="h-4 w-4" />

              Export Report
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
          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Total Order Value
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-tight text-[#281912]">
                  {formatPKR(
                    stats.totalValue
                  )}
                </p>

                <p className="mt-1 text-xs text-[#9A8478]">
                  From{' '}
                  {stats.totalOrders}{' '}
                  orders
                </p>
              </div>

              <div className="rounded-xl bg-[#F0E8E1] p-2.5 text-[#6B4228]">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Paid
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {
                    stats.paidOrders
                  }
                </p>

                <p className="mt-1 text-xs text-[#4D7553]">
                  Fully paid orders
                </p>
              </div>

              <div className="rounded-xl border border-[#CFE0D1] bg-[#F3F8F3] p-2.5 text-[#4D7553]">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Partial
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {
                    stats.partialOrders
                  }
                </p>

                <p className="mt-1 text-xs text-[#705180]">
                  Advance / partial
                  payments
                </p>
              </div>

              <div className="rounded-xl border border-[#DDD0E8] bg-[#F8F3FB] p-2.5 text-[#705180]">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Pending
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {
                    stats.pendingOrders
                  }
                </p>

                <p className="mt-1 text-xs text-[#80621C]">
                  Awaiting payment
                </p>
              </div>

              <div className="rounded-xl border border-[#E5D2A3] bg-[#FFF8E5] p-2.5 text-[#80621C]">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Payment Method Distribution */}
        <section className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
              Overview
            </p>

            <h2 className="mt-1 text-lg font-semibold text-[#281912]">
              Payment Methods
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#E8DDD5] bg-[#F8F5F1] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#EDE4DC] p-2 text-[#6B4228]">
                  <Banknote className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs text-[#8A7467]">
                    Cash on Delivery
                  </p>

                  <p className="mt-0.5 text-xl font-semibold text-[#281912]">
                    {
                      paymentMethodStats.cod
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E8DDD5] bg-[#F8F5F1] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#EDE4DC] p-2 text-[#6B4228]">
                  <CreditCard className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs text-[#8A7467]">
                    Card
                  </p>

                  <p className="mt-0.5 text-xl font-semibold text-[#281912]">
                    {
                      paymentMethodStats.card
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E8DDD5] bg-[#F8F5F1] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#EDE4DC] p-2 text-[#6B4228]">
                  <DollarSign className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs text-[#8A7467]">
                    Bank Transfer
                  </p>

                  <p className="mt-0.5 text-xl font-semibold text-[#281912]">
                    {
                      paymentMethodStats.bank
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E8DDD5] bg-[#F8F5F1] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#EDE4DC] p-2 text-[#6B4228]">
                  <RotateCcw className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs text-[#8A7467]">
                    Other
                  </p>

                  <p className="mt-0.5 text-xl font-semibold text-[#281912]">
                    {
                      paymentMethodStats.other
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

              <input
                type="text"
                placeholder="Search order ID, customer or email..."
                value={
                  searchQuery
                }
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>

            <select
              value={
                filterPaymentStatus
              }
              onChange={(e) =>
                setFilterPaymentStatus(
                  e.target.value
                )
              }
              className="rounded-xl border border-[#DED1C8] bg-[#FDFBF8] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
            >
              <option value="all">
                All Payment Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="partial">
                Partial
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="failed">
                Failed
              </option>

              <option value="refunded">
                Refunded
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

            <select
              value={
                filterPaymentMethod
              }
              onChange={(e) =>
                setFilterPaymentMethod(
                  e.target.value
                )
              }
              className="rounded-xl border border-[#DED1C8] bg-[#FDFBF8] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
            >
              <option value="all">
                All Payment Methods
              </option>

              <option value="cod">
                Cash on Delivery
              </option>

              <option value="bank">
                Bank Transfer
              </option>

              <option value="card">
                Card
              </option>

              <option value="other">
                Other
              </option>
            </select>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-4 py-3 text-sm font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF]"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Filters
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#8A7467]">
                From Date
              </label>

              <input
                type="date"
                value={
                  dateRange.from
                }
                onChange={(e) =>
                  setDateRange(
                    (prev) => ({
                      ...prev,
                      from:
                        e.target.value,
                    })
                  )
                }
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#8A7467]">
                To Date
              </label>

              <input
                type="date"
                value={
                  dateRange.to
                }
                onChange={(e) =>
                  setDateRange(
                    (prev) => ({
                      ...prev,
                      to:
                        e.target.value,
                    })
                  )
                }
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4 text-sm text-[#7B685D]">
            <p>
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {
                  filteredOrders.length
                }
              </span>{' '}
              of {orders.length}{' '}
              orders
            </p>
          </div>
        </section>

        {/* Payments */}
        <section className="overflow-hidden rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12">
              <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading payment
                history...
              </p>
            </div>
          ) : filteredOrders.length ===
            0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EBE5] text-[#9A7A68]">
                <DollarSign className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-[#281912]">
                No payment records
                found
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
                Try adjusting your
                search, status, payment
                method or date filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="border-b border-[#E8DDD5] bg-[#F7F4EF]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Order
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Method
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Payment Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Order Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Date
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EEE5DF]">
                    {filteredOrders.map(
                      (order) => {
                        const paymentStatus =
                          normalizePaymentStatus(
                            order.paymentStatus
                          )

                        const paymentConfig =
                          PAYMENT_STATUS_CONFIG[
                          paymentStatus
                          ]

                        return (
                          <tr
                            key={
                              order.id
                            }
                            className="transition-colors hover:bg-[#FBF8F4]"
                          >
                            <td className="px-5 py-4">
                              <p className="font-mono text-sm font-semibold text-[#3A2117]">
                                #
                                {order.id?.substring(
                                  0,
                                  8
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <div className="max-w-[220px]">
                                <p className="truncate text-sm font-semibold text-[#281912]">
                                  {order.fullName ||
                                    'Customer'}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-[#8A7467]">
                                  {order.email ||
                                    '—'}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="whitespace-nowrap text-sm font-semibold text-[#3A2117]">
                                {formatPKR(
                                  order.total
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex whitespace-nowrap rounded-full border border-[#DDD1C8] bg-[#F7F4EF] px-3 py-1 text-xs font-semibold text-[#6B4228]">
                                {getPaymentMethodLabel(
                                  order.paymentMethod
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${paymentConfig.classes}`}
                              >
                                {
                                  paymentConfig.label
                                }
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex whitespace-nowrap rounded-full border border-[#E1D6CE] bg-[#FAF7F4] px-3 py-1 text-xs font-medium capitalize text-[#705E54]">
                                {String(
                                  order.status ||
                                  'pending'
                                ).replace(
                                  /_/g,
                                  ' '
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm whitespace-nowrap text-[#7B685D]">
                              {formatOrderDate(
                                order
                              )}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  openPaymentModal(
                                    order
                                  )
                                }
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D7C7BC] bg-[#FFFEFC] px-3.5 py-2 text-xs font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF]"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Manage
                              </button>
                            </td>
                          </tr>
                        )
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet */}
              <div className="divide-y divide-[#EEE5DF] lg:hidden">
                {filteredOrders.map(
                  (order) => {
                    const paymentStatus =
                      normalizePaymentStatus(
                        order.paymentStatus
                      )

                    const paymentConfig =
                      PAYMENT_STATUS_CONFIG[
                      paymentStatus
                      ]

                    return (
                      <article
                        key={
                          order.id
                        }
                        className="p-4 sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-sm font-semibold text-[#3A2117]">
                              #
                              {order.id?.substring(
                                0,
                                8
                              )}
                            </p>

                            <p className="mt-1 font-semibold text-[#281912]">
                              {order.fullName ||
                                'Customer'}
                            </p>

                            <p className="mt-0.5 break-all text-xs text-[#8A7467]">
                              {order.email ||
                                '—'}
                            </p>
                          </div>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${paymentConfig.classes}`}
                          >
                            {
                              paymentConfig.label
                            }
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-[#F7F4EF] p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A8478]">
                              Amount
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#3A2117]">
                              {formatPKR(
                                order.total
                              )}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#F7F4EF] p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A8478]">
                              Method
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-[#3A2117]">
                              {getPaymentMethodLabel(
                                order.paymentMethod
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#8A7467]">
                          <span>
                            {formatOrderDate(
                              order
                            )}
                          </span>

                          <span className="capitalize">
                            Order:{' '}
                            {String(
                              order.status ||
                              'pending'
                            ).replace(
                              /_/g,
                              ' '
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openPaymentModal(
                              order
                            )
                          }
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-4 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912]"
                        >
                          <History className="h-4 w-4" />
                          Manage Payment
                        </button>
                      </article>
                    )
                  }
                )}
              </div>
            </>
          )}
        </section>

        {/* Filtered Summary */}
        {!loading &&
          filteredOrders.length >
          0 && (
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
                <p className="text-sm text-[#8A7467]">
                  Visible Transactions
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#281912]">
                  {
                    filteredOrders.length
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
                <p className="text-sm text-[#8A7467]">
                  Visible Order Value
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#281912]">
                  {formatPKR(
                    filteredTotal
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
                <p className="text-sm text-[#8A7467]">
                  Average Order
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#281912]">
                  {formatPKR(
                    filteredAverage
                  )}
                </p>
              </div>
            </section>
          )}
      </div>

      {/* Payment Management Modal */}
      {showPaymentModal &&
        selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.3)]">
              {/* Fixed Header */}
              <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-[#FFFEFC]">
                      <DollarSign className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-[#281912] sm:text-xl">
                        Payment Details
                      </h3>

                      <p className="mt-0.5 truncate font-mono text-xs text-[#8A7467]">
                        Order #
                        {selectedOrder.id}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closePaymentModal
                    }
                    disabled={
                      updatingPayment
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7] hover:text-[#3A2117] disabled:opacity-50"
                    aria-label="Close payment details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
                <div className="space-y-5">
                  {/* Order Summary */}
                  <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                          Order
                        </p>

                        <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                          Payment Summary
                        </h4>
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${PAYMENT_STATUS_CONFIG[
                            selectedStatus
                          ].classes
                          }`}
                      >
                        {
                          PAYMENT_STATUS_CONFIG[
                            selectedStatus
                          ].label
                        }
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-[#F8F5F1] p-4">
                        <p className="text-xs text-[#99867B]">
                          Customer
                        </p>

                        <p className="mt-1.5 font-semibold text-[#281912]">
                          {selectedOrder.fullName ||
                            'Customer'}
                        </p>

                        <p className="mt-1 break-all text-xs text-[#8A7467]">
                          {selectedOrder.email ||
                            '—'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F8F5F1] p-4">
                        <p className="text-xs text-[#99867B]">
                          Order Total
                        </p>

                        <p className="mt-1.5 text-xl font-semibold text-[#3A2117]">
                          {formatPKR(
                            selectedOrder.total
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F8F5F1] p-4">
                        <p className="text-xs text-[#99867B]">
                          Payment Method
                        </p>

                        <p className="mt-1.5 font-semibold text-[#281912]">
                          {getPaymentMethodLabel(
                            selectedOrder.paymentMethod
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F8F5F1] p-4">
                        <p className="text-xs text-[#99867B]">
                          Order Status
                        </p>

                        <p className="mt-1.5 font-semibold capitalize text-[#281912]">
                          {String(
                            selectedOrder.status ||
                            'pending'
                          ).replace(
                            /_/g,
                            ' '
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-[#E2D6CE] bg-[#FAF7F4] px-4 py-3">
                      <p className="text-xs leading-5 text-[#7B685D]">
                        Order status and payment
                        status are independent.
                        For example, an order can
                        be Processing while its
                        payment is Paid or Partial.
                      </p>
                    </div>
                  </section>

                  {/* Update Payment Status */}
                  <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                        Payment Control
                      </p>

                      <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                        Update Payment Status
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-[#8A7467]">
                        Choose the actual payment
                        state independently of the
                        order delivery status.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {PAYMENT_STATUS_OPTIONS.map(
                        (status) => {
                          const config =
                            PAYMENT_STATUS_CONFIG[
                            status
                            ]

                          const selected =
                            selectedPaymentStatus ===
                            status

                          return (
                            <button
                              key={
                                status
                              }
                              type="button"
                              onClick={() =>
                                setSelectedPaymentStatus(
                                  status
                                )
                              }
                              disabled={
                                updatingPayment
                              }
                              className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${selected
                                  ? 'border-[#6B4228] bg-[#F4ECE6] shadow-[0_0_0_2px_rgba(107,66,40,0.08)]'
                                  : 'border-[#E5DAD2] bg-[#FFFEFC] hover:border-[#CDBCAF] hover:bg-[#FBF8F4]'
                                }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${config.classes}`}
                                >
                                  {
                                    config.label
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
                                  config.description
                                }
                              </p>
                            </button>
                          )
                        }
                      )}
                    </div>
                  </section>

                  {/* History */}
                  <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                          Audit Trail
                        </p>

                        <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                          Payment History
                        </h4>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0E8E1] text-[#6B4228]">
                        <History className="h-5 w-5" />
                      </div>
                    </div>

                    {paymentHistory.length ===
                      0 ? (
                      <div className="rounded-xl border border-dashed border-[#DCCFC6] bg-[#FAF7F3] px-4 py-8 text-center">
                        <History className="mx-auto h-6 w-6 text-[#B09C91]" />

                        <p className="mt-3 text-sm font-semibold text-[#5F5048]">
                          No recorded payment
                          history
                        </p>

                        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#8A7467]">
                          This may be a legacy
                          order created before
                          payment history tracking
                          was introduced.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paymentHistory.map(
                          (
                            event,
                            index
                          ) => {
                            const eventStatus =
                              normalizePaymentStatus(
                                event.status
                              )

                            const config =
                              PAYMENT_STATUS_CONFIG[
                              eventStatus
                              ]

                            return (
                              <div
                                key={`${event.status}-${event.at}-${index}`}
                                className="relative rounded-xl border border-[#E7DCD4] bg-[#FAF7F4] p-4"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${config.classes}`}
                                      >
                                        {
                                          config.label
                                        }
                                      </span>

                                      {index ===
                                        0 && (
                                          <span className="rounded-full bg-[#3A2117] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#FFFEFC]">
                                            Latest
                                          </span>
                                        )}
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-[#281912]">
                                      {event.label ||
                                        config.label}
                                    </p>

                                    <p className="mt-1 text-xs text-[#8A7467]">
                                      Updated by:{' '}
                                      <span className="font-semibold capitalize text-[#6B4228]">
                                        {event.source ||
                                          'system'}
                                      </span>
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-xs text-[#8A7467]">
                                    {formatHistoryDate(
                                      event.at
                                    )}
                                  </p>
                                </div>
                              </div>
                            )
                          }
                        )}
                      </div>
                    )}
                  </section>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={
                      closePaymentModal
                    }
                    disabled={
                      updatingPayment
                    }
                    className="rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleUpdatePaymentStatus
                    }
                    disabled={
                      updatingPayment ||
                      selectedPaymentStatus ===
                      selectedStatus
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingPayment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}

                    {updatingPayment
                      ? 'Updating...'
                      : 'Update Payment Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  )
}