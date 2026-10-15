'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import ordersService from '../utils/ordersService.js'

const STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Order Placed',
  },
  {
    value: 'confirmed',
    label: 'Order Confirmed',
  },
  {
    value: 'approved',
    label: 'Order Approved',
  },
  {
    value: 'processing',
    label: 'Order Processing',
  },
  {
    value: 'in_production',
    label: 'Order in Production',
  },
  {
    value: 'ready',
    label: 'Order Ready',
  },
  {
    value: 'dispatched',
    label: 'Order Dispatched',
  },
  {
    value: 'shipped',
    label: 'Shipped',
  },
  {
    value: 'out_for_delivery',
    label: 'Out for Delivery',
  },
  {
    value: 'delivered',
    label: 'Delivered',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
  {
    value: 'returned',
    label: 'Returned',
  },
]

function normalizeStatus(value) {
  return String(value || 'pending')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function getStatusLabel(status) {
  const normalized = normalizeStatus(status)

  const match = STATUS_OPTIONS.find(
    (item) => item.value === normalized
  )

  if (match) {
    return match.label
  }

  return normalized
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
}

function getStatusClasses(status) {
  switch (normalizeStatus(status)) {
    case 'pending':
      return 'border-[#E5D2A3] bg-[#FFF8E5] text-[#80621C]'

    case 'confirmed':
    case 'approved':
      return 'border-[#C8D9E8] bg-[#F0F6FB] text-[#426983]'

    case 'processing':
    case 'in_production':
    case 'production':
      return 'border-[#DDD0E8] bg-[#F8F3FB] text-[#705180]'

    case 'ready':
      return 'border-[#D5D6B1] bg-[#F8F8E8] text-[#68692C]'

    case 'dispatched':
    case 'shipped':
      return 'border-[#BED7DF] bg-[#EEF7F8] text-[#3F6E79]'

    case 'out_for_delivery':
      return 'border-[#C8D8C1] bg-[#F3F8F0] text-[#507344]'

    case 'delivered':
      return 'border-[#BED7C2] bg-[#EFF8F0] text-[#417048]'

    case 'cancelled':
    case 'canceled':
    case 'returned':
      return 'border-[#E3C3BC] bg-[#FFF1EE] text-[#944E42]'

    default:
      return 'border-[#DDD4CE] bg-[#F8F5F2] text-[#6F5D53]'
  }
}

function getStatusIcon(status) {
  const normalized = normalizeStatus(status)

  if (
    normalized === 'delivered'
  ) {
    return CheckCircle2
  }

  if (
    [
      'dispatched',
      'shipped',
      'out_for_delivery',
    ].includes(normalized)
  ) {
    return Truck
  }

  if (
    [
      'processing',
      'in_production',
      'production',
      'ready',
    ].includes(normalized)
  ) {
    return PackageCheck
  }

  if (
    [
      'cancelled',
      'canceled',
      'returned',
    ].includes(normalized)
  ) {
    return XCircle
  }

  return Clock3
}

function getOrderDate(order) {
  const value =
    order?.createdAt || order?.date

  if (!value) return null

  if (
    typeof value?.toDate === 'function'
  ) {
    return value.toDate()
  }

  if (
    typeof value?.seconds === 'number'
  ) {
    return new Date(
      value.seconds * 1000
    )
  }

  const parsed = new Date(value)

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed
}

function formatDate(value) {
  if (!value) return '—'

  let date

  if (
    typeof value?.toDate === 'function'
  ) {
    date = value.toDate()
  } else if (
    typeof value?.seconds === 'number'
  ) {
    date = new Date(
      value.seconds * 1000
    )
  } else {
    date = new Date(value)
  }

  if (
    Number.isNaN(date.getTime())
  ) {
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

function formatDateTime(value) {
  if (!value) return '—'

  const date =
    typeof value?.toDate === 'function'
      ? value.toDate()
      : typeof value?.seconds ===
        'number'
        ? new Date(
          value.seconds * 1000
        )
        : new Date(value)

  if (
    Number.isNaN(date.getTime())
  ) {
    return '—'
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
  const amount = Number(value || 0)

  return `Rs. ${amount.toLocaleString(
    'en-PK',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  )}`
}

function formatPaymentMethod(method) {
  const value = String(
    method || ''
  ).toLowerCase()

  if (
    [
      'cod',
      'cash_on_delivery',
      'cash on delivery',
    ].includes(value)
  ) {
    return 'Cash on Delivery'
  }

  if (
    [
      'bank',
      'bank_transfer',
      'bank deposit',
      'bank_deposit',
    ].includes(value)
  ) {
    return 'Bank Deposit'
  }

  if (!value) {
    return 'Not specified'
  }

  return String(method)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
}

function formatVariantValue(value) {
  if (!value) return ''

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value)
  }

  if (typeof value === 'object') {
    return (
      value.name ||
      value.label ||
      value.value ||
      ''
    )
  }

  return String(value)
}

function formatBulbOption(value) {
  if (!value) return ''

  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')

  if (
    [
      'with',
      'withbulb',
      'yes',
      'included',
    ].includes(normalized)
  ) {
    return 'With Bulb'
  }

  if (
    [
      'without',
      'withoutbulb',
      'no',
      'notincluded',
    ].includes(normalized)
  ) {
    return 'Without Bulb'
  }

  return String(value)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
}

function AddressBlock({
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
}) {
  return (
    <div className="space-y-1 text-sm leading-6 text-[#5E4A3F]">
      <p className="font-semibold text-[#34241C]">
        {addressLine1 || 'Address not provided'}
      </p>

      {addressLine2 && (
        <p>{addressLine2}</p>
      )}

      <p>
        {[city, state, postalCode]
          .filter(Boolean)
          .join(', ')}
      </p>
    </div>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [searchQuery, setSearchQuery] =
    useState('')

  const [filterStatus, setFilterStatus] =
    useState('all')

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState(null)

  const [
    showTrackingForm,
    setShowTrackingForm,
  ] = useState(false)

  const [
    customStatus,
    setCustomStatus,
  ] = useState('')

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const [
    trackingData,
    setTrackingData,
  ] = useState({
    trackingNumber: '',
    carrier: '',
    trackingUrl: '',
    dispatchDate: '',
    expectedDeliveryDate: '',
    deliveryStatus: '',
    customerUpdate: '',
  })

  const loadAllOrders =
    async () => {
      try {
        setLoading(true)
        setMessage({
          type: '',
          text: '',
        })

        const allOrders =
          await ordersService.getAllOrders()

        const sorted = [
          ...(Array.isArray(allOrders)
            ? allOrders
            : []),
        ].sort((a, b) => {
          const dateA =
            getOrderDate(a)?.getTime() ||
            0

          const dateB =
            getOrderDate(b)?.getTime() ||
            0

          return dateB - dateA
        })

        setOrders(sorted)
      } catch (error) {
        console.error(
          'Error loading orders:',
          error
        )

        setMessage({
          type: 'error',
          text:
            error?.message ||
            'Unable to load orders.',
        })
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadAllOrders()
  }, [])

  const closeOrderModal = () => {
    setSelectedOrder(null)
    setShowTrackingForm(false)
    setCustomStatus('')

    setTrackingData({
      trackingNumber: '',
      carrier: '',
      trackingUrl: '',
      dispatchDate: '',
      expectedDeliveryDate: '',
      deliveryStatus: '',
      customerUpdate: '',
    })
  }

  const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    if (!orderId || !newStatus) {
      return
    }

    try {
      setSaving(true)

      const result =
        await ordersService.updateOrderStatus(
          orderId,
          newStatus
        )

      const normalized =
        result?.status ||
        normalizeStatus(newStatus)

      const statusEvent =
        result?.statusEvent || {
          status: normalized,
          label:
            getStatusLabel(normalized),
          at: new Date().toISOString(),
          source: 'admin',
        }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
              ...order,
              status: normalized,
              statusHistory: [
                ...(Array.isArray(
                  order.statusHistory
                )
                  ? order.statusHistory
                  : []),
                statusEvent,
              ],
            }
            : order
        )
      )

      setSelectedOrder((prev) =>
        prev?.id === orderId
          ? {
            ...prev,
            status: normalized,
            statusHistory: [
              ...(Array.isArray(
                prev.statusHistory
              )
                ? prev.statusHistory
                : []),
              statusEvent,
            ],
          }
          : prev
      )

      setMessage({
        type: 'success',
        text: `Order status updated to ${getStatusLabel(
          normalized
        )}.`,
      })

      setCustomStatus('')
    } catch (error) {
      console.error(
        'Error updating order status:',
        error
      )

      setMessage({
        type: 'error',
        text:
          error?.message ||
          'Unable to update order status.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCustomStatus = () => {
    const status = customStatus
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_')

    if (!status || !selectedOrder) {
      return
    }

    updateOrderStatus(
      selectedOrder.id,
      status
    )
  }

  const openTrackingForm = () => {
    if (!selectedOrder) return

    const tracking =
      selectedOrder.tracking || {}

    setTrackingData({
      trackingNumber:
        tracking.trackingNumber ||
        '',

      carrier:
        tracking.carrier ||
        tracking.courier ||
        '',

      trackingUrl:
        tracking.trackingUrl ||
        tracking.trackingLink ||
        tracking.url ||
        '',

      dispatchDate:
        tracking.dispatchDate || '',

      expectedDeliveryDate:
        tracking.expectedDeliveryDate ||
        tracking.estimatedDelivery ||
        '',

      deliveryStatus:
        tracking.deliveryStatus || '',

      customerUpdate:
        tracking.customerUpdate ||
        tracking.notes ||
        '',
    })

    setShowTrackingForm(true)
  }

  const handleSaveTracking =
    async () => {
      if (!selectedOrder) {
        return
      }

      if (
        !trackingData.trackingNumber.trim() ||
        !trackingData.carrier.trim()
      ) {
        setMessage({
          type: 'error',
          text:
            'Tracking number and courier are required.',
        })

        return
      }

      const trackingPayload = {
        trackingNumber:
          trackingData.trackingNumber.trim(),

        carrier:
          trackingData.carrier.trim(),

        // Backward / frontend compatibility
        courier:
          trackingData.carrier.trim(),

        trackingUrl:
          trackingData.trackingUrl.trim(),

        trackingLink:
          trackingData.trackingUrl.trim(),

        dispatchDate:
          trackingData.dispatchDate,

        expectedDeliveryDate:
          trackingData.expectedDeliveryDate,

        // Existing customer UI also understands this
        estimatedDelivery:
          trackingData.expectedDeliveryDate,

        deliveryStatus:
          trackingData.deliveryStatus.trim(),

        customerUpdate:
          trackingData.customerUpdate.trim(),
      }

      try {
        setSaving(true)

        await ordersService.updateOrderTracking(
          selectedOrder.id,
          trackingPayload
        )

        const updatedTracking = {
          ...trackingPayload,
          addedAt:
            new Date().toISOString(),
        }

        setOrders((prev) =>
          prev.map((order) =>
            order.id ===
              selectedOrder.id
              ? {
                ...order,
                tracking:
                  updatedTracking,
              }
              : order
          )
        )

        setSelectedOrder((prev) =>
          prev
            ? {
              ...prev,
              tracking:
                updatedTracking,
            }
            : prev
        )

        setShowTrackingForm(false)

        setMessage({
          type: 'success',
          text:
            'Tracking information saved successfully.',
        })
      } catch (error) {
        console.error(
          'Error saving tracking:',
          error
        )

        setMessage({
          type: 'error',
          text:
            error?.message ||
            'Unable to save tracking information.',
        })
      } finally {
        setSaving(false)
      }
    }

  const filteredOrders =
    useMemo(() => {
      const search =
        searchQuery
          .trim()
          .toLowerCase()

      return orders.filter(
        (order) => {
          const matchesSearch =
            !search ||
            order.id
              ?.toLowerCase()
              .includes(search) ||
            order.fullName
              ?.toLowerCase()
              .includes(search) ||
            order.email
              ?.toLowerCase()
              .includes(search) ||
            order.phone
              ?.toLowerCase()
              .includes(search) ||
            order.city
              ?.toLowerCase()
              .includes(search)

          const currentStatus =
            normalizeStatus(
              order.status
            )

          let matchesStatus = true

          if (
            filterStatus !== 'all'
          ) {
            if (
              filterStatus === 'active'
            ) {
              matchesStatus =
                ![
                  'delivered',
                  'cancelled',
                  'canceled',
                  'returned',
                ].includes(
                  currentStatus
                )
            } else {
              matchesStatus =
                currentStatus ===
                filterStatus
            }
          }

          return (
            matchesSearch &&
            matchesStatus
          )
        }
      )
    }, [
      orders,
      searchQuery,
      filterStatus,
    ])

  const stats = useMemo(() => {
    const total = orders.length

    const delivered =
      orders.filter(
        (order) =>
          normalizeStatus(
            order.status
          ) === 'delivered'
      ).length

    const pending =
      orders.filter((order) =>
        [
          'pending',
          'confirmed',
          'approved',
        ].includes(
          normalizeStatus(
            order.status
          )
        )
      ).length

    const cancelled =
      orders.filter((order) =>
        [
          'cancelled',
          'canceled',
          'returned',
        ].includes(
          normalizeStatus(
            order.status
          )
        )
      ).length

    const revenue =
      orders.reduce(
        (sum, order) =>
          sum +
          Number(order.total || 0),
        0
      )

    return {
      total,
      pending,
      delivered,
      cancelled,
      revenue,
    }
  }, [orders])

  const copyOrderId = async (
    orderId
  ) => {
    try {
      await navigator.clipboard.writeText(
        orderId
      )

      setMessage({
        type: 'success',
        text: 'Order ID copied.',
      })
    } catch {
      // Clipboard may be blocked by browser permissions.
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* PAGE HEADER */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#E6DDD6] bg-[#FFFEFC] px-5 py-6 shadow-[0_10px_35px_rgba(58,33,23,0.05)] sm:px-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#DCC8BA]/25 blur-3xl"
          />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-[#E5D8CF] bg-[#F7F4EF] px-3 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#795D4D]">
                  Order Management
                </span>
              </div>

              <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#281912] sm:text-3xl">
                Orders
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#806C61]">
                Review customer orders,
                selected product options,
                fulfilment status and
                delivery tracking.
              </p>
            </div>

            <button
              type="button"
              onClick={loadAllOrders}
              disabled={loading}
              className="inline-flex min-h-[44px] w-fit items-center justify-center gap-2 rounded-xl border border-[#DCCFC6] bg-white px-4 text-sm font-semibold text-[#3A2117] shadow-sm transition hover:border-[#BDA99C] hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading
                    ? 'animate-spin'
                    : ''
                  }`}
              />

              Refresh Orders
            </button>
          </div>
        </section>

        {/* MESSAGE */}
        {message.text && (
          <div
            className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${message.type ===
                'success'
                ? 'border-[#C8DEC9] bg-[#F2F9F2]'
                : 'border-[#E5C3BB] bg-[#FFF3F0]'
              }`}
          >
            <div className="flex items-start gap-3">
              {message.type ===
                'success' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#4B7453]" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#A24F43]" />
              )}

              <p
                className={`text-sm ${message.type ===
                    'success'
                    ? 'text-[#476D4E]'
                    : 'text-[#8B463C]'
                  }`}
              >
                {message.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMessage({
                  type: '',
                  text: '',
                })
              }
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[#8A756A] hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STATS */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          {[
            {
              label: 'Total Orders',
              value: stats.total,
              icon: ShoppingBag,
            },
            {
              label: 'Pending / New',
              value: stats.pending,
              icon: Clock3,
            },
            {
              label: 'Delivered',
              value: stats.delivered,
              icon: CheckCircle2,
            },
            {
              label: 'Cancelled',
              value: stats.cancelled,
              icon: XCircle,
            },
            {
              label: 'Order Revenue',
              value: formatPKR(
                stats.revenue
              ),
              icon: CircleDollarSign,
              wide: true,
            },
          ].map(
            ({
              label,
              value,
              icon: Icon,
              wide,
            }) => (
              <article
                key={label}
                className={`rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC] p-5 shadow-[0_8px_28px_rgba(58,33,23,0.04)] ${wide
                    ? 'col-span-2 xl:col-span-1'
                    : ''
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#927E72]">
                      {label}
                    </p>

                    <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#281912] sm:text-2xl">
                      {value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#F1E8E2] text-[#6B4228]">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
              </article>
            )
          )}
        </section>

        {/* SEARCH & FILTER */}
        <section className="rounded-[22px] border border-[#E7DED7] bg-[#FFFEFC] p-4 shadow-[0_8px_28px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9A877B]" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Search order ID, customer, email, phone or city..."
                className="h-12 w-full rounded-xl border border-[#DDD2CA] bg-[#FCFAF8] pl-11 pr-10 text-sm text-[#34241C] outline-none transition placeholder:text-[#AE9B90] focus:border-[#8B6855] focus:bg-white focus:ring-4 focus:ring-[#6B4228]/10"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery('')
                  }
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#9A877B] hover:bg-[#EEE6E0]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value
                )
              }
              className="h-12 rounded-xl border border-[#DDD2CA] bg-[#FCFAF8] px-4 text-sm font-medium text-[#49362C] outline-none focus:border-[#8B6855] focus:ring-4 focus:ring-[#6B4228]/10"
            >
              <option value="all">
                All Order Statuses
              </option>

              <option value="active">
                All Active Orders
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
        </section>

        {/* ORDERS */}
        <section className="overflow-hidden rounded-[24px] border border-[#E7DED7] bg-[#FFFEFC] shadow-[0_8px_30px_rgba(58,33,23,0.04)]">
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm text-[#8C786D]">
                Loading orders...
              </p>
            </div>
          ) : filteredOrders.length ===
            0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EBE6] text-[#80685A]">
                <ShoppingBag className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#34241C]">
                No orders found
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-6 text-[#958176]">
                Try changing the search or
                status filter.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#EDE5DF] bg-[#FAF7F4]">
                      {[
                        'Order',
                        'Customer',
                        'Amount',
                        'Status',
                        'Date',
                        'Action',
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.11em] text-[#88756A]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map(
                      (order) => {
                        const StatusIcon =
                          getStatusIcon(
                            order.status
                          )

                        const date =
                          getOrderDate(
                            order
                          )

                        return (
                          <tr
                            key={order.id}
                            className="border-b border-[#F0E9E4] transition last:border-b-0 hover:bg-[#FCFAF8]"
                          >
                            <td className="px-5 py-4">
                              <p className="font-mono text-xs font-semibold text-[#6B4228]">
                                #
                                {order.id?.slice(
                                  0,
                                  10
                                )}
                              </p>

                              <p className="mt-1 text-[10px] text-[#A08E83]">
                                {
                                  order.items
                                    ?.length ||
                                  0
                                }{' '}
                                item(s)
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[200px] truncate text-sm font-semibold text-[#34241C]">
                                {order.fullName ||
                                  'Customer'}
                              </p>

                              <p className="mt-0.5 max-w-[200px] truncate text-xs text-[#927F74]">
                                {order.email ||
                                  order.phone ||
                                  '—'}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-[#34241C]">
                                {formatPKR(
                                  order.total
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
                                  order.status
                                )}`}
                              >
                                <StatusIcon className="h-3 w-3" />

                                {getStatusLabel(
                                  order.status
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-xs text-[#79675C]">
                              {date
                                ? date.toLocaleDateString(
                                  'en-PK',
                                  {
                                    day: '2-digit',
                                    month:
                                      'short',
                                    year: 'numeric',
                                  }
                                )
                                : '—'}
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedOrder(
                                    order
                                  )
                                }
                                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#3A2117] px-3.5 text-xs font-semibold text-white transition hover:bg-[#4C2D21]"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>
                            </td>
                          </tr>
                        )
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="divide-y divide-[#EEE6E0] md:hidden">
                {filteredOrders.map(
                  (order) => {
                    const StatusIcon =
                      getStatusIcon(
                        order.status
                      )

                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() =>
                          setSelectedOrder(
                            order
                          )
                        }
                        className="block w-full p-5 text-left transition hover:bg-[#FBF8F5]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-semibold text-[#6B4228]">
                              #
                              {order.id?.slice(
                                0,
                                10
                              )}
                            </p>

                            <p className="mt-2 truncate text-sm font-semibold text-[#34241C]">
                              {order.fullName ||
                                'Customer'}
                            </p>
                          </div>

                          <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#A28D81]" />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
                              order.status
                            )}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {getStatusLabel(
                              order.status
                            )}
                          </span>

                          <span className="text-xs font-semibold text-[#34241C]">
                            {formatPKR(
                              order.total
                            )}
                          </span>

                          <span className="text-xs text-[#928075]">
                            {formatDate(
                              order.createdAt
                            )}
                          </span>
                        </div>
                      </button>
                    )
                  }
                )}
              </div>
            </>
          )}
        </section>

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#281912]/55 p-3 backdrop-blur-[2px] sm:p-5">
            <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-[26px] border border-[#E6DCD4] bg-[#FFFEFC] shadow-[0_30px_90px_rgba(40,25,18,0.32)]">
              {/* FIXED HEADER */}
              <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#3A2117] px-5 py-4 text-white sm:px-7 sm:py-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#CEBBAF]">
                    Order Details
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h3 className="break-all text-lg font-semibold sm:text-xl">
                      #
                      {selectedOrder.id}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        copyOrderId(
                          selectedOrder.id
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeOrderModal}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <div className="space-y-6 p-5 sm:p-7">
                  {/* ORDER SUMMARY HEADER */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-[#E6DDD6] bg-[#F8F5F2] p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#907B70]">
                        Order Date
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[#34241C]">
                        {formatDateTime(
                          selectedOrder.createdAt
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E6DDD6] bg-[#F8F5F2] p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#907B70]">
                        Current Status
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[#34241C]">
                        {getStatusLabel(
                          selectedOrder.status
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E6DDD6] bg-[#F8F5F2] p-4">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#907B70]">
                        Payment
                      </p>

                      <p className="mt-2 text-sm font-semibold text-[#34241C]">
                        {formatPaymentMethod(
                          selectedOrder.paymentMethod
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#D9C9BE] bg-[#3A2117] p-4 text-white">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#CEBBAF]">
                        Order Total
                      </p>

                      <p className="mt-2 text-lg font-semibold">
                        {formatPKR(
                          selectedOrder.total
                        )}
                      </p>
                    </div>
                  </div>

                  {/* CUSTOMER + ADDRESS */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-[22px] border border-[#E6DDD6] bg-[#FFFEFC] p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1E8E2] text-[#6B4228]">
                          <User className="h-4.5 w-4.5" />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#927E72]">
                            Customer
                          </p>

                          <h4 className="text-sm font-semibold text-[#34241C]">
                            Customer Information
                          </h4>
                        </div>
                      </div>

                      <div className="mt-5 space-y-4">
                        <div>
                          <p className="text-[10px] text-[#927E72]">
                            Full Name
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#34241C]">
                            {selectedOrder.fullName ||
                              '—'}
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-[10px] text-[#927E72]">
                              Phone
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#49362C]">
                              <Phone className="h-3.5 w-3.5 text-[#80685A]" />

                              {selectedOrder.phone ||
                                '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-[#927E72]">
                              Email
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 break-all text-sm font-medium text-[#49362C]">
                              <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[#80685A]" />

                              {selectedOrder.email ||
                                '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-[22px] border border-[#E6DDD6] bg-[#FFFEFC] p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1E8E2] text-[#6B4228]">
                          <MapPin className="h-4.5 w-4.5" />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#927E72]">
                            Delivery
                          </p>

                          <h4 className="text-sm font-semibold text-[#34241C]">
                            Shipping Address
                          </h4>
                        </div>
                      </div>

                      <div className="mt-5">
                        <AddressBlock
                          addressLine1={
                            selectedOrder.addressLine1
                          }
                          addressLine2={
                            selectedOrder.addressLine2
                          }
                          city={
                            selectedOrder.city
                          }
                          state={
                            selectedOrder.state
                          }
                          postalCode={
                            selectedOrder.postalCode
                          }
                        />
                      </div>

                      {selectedOrder.shippingMethod && (
                        <div className="mt-4 border-t border-[#EEE6E0] pt-4">
                          <p className="text-[10px] text-[#927E72]">
                            Shipping Method
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#49362C]">
                            {selectedOrder
                              .shippingMethod
                              ?.name ||
                              'Standard Delivery'}
                          </p>
                        </div>
                      )}
                    </section>
                  </div>

                  {/* BILLING */}
                  {selectedOrder.billingAddress && (
                    <section className="rounded-[22px] border border-[#E6DDD6] bg-[#F8F5F2] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#927E72]">
                            Billing Address
                          </p>

                          <p className="mt-1 text-xs text-[#846F64]">
                            {selectedOrder.billingSameAsShipping
                              ? 'Same as shipping address'
                              : 'Separate billing address'}
                          </p>
                        </div>

                        <CreditCard className="h-5 w-5 text-[#80685A]" />
                      </div>

                      <div className="mt-4">
                        <AddressBlock
                          {...selectedOrder.billingAddress}
                        />
                      </div>
                    </section>
                  )}

                  {/* ORDER ITEMS */}
                  <section>
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#927E72]">
                        Products
                      </p>

                      <h4 className="mt-1 text-lg font-semibold text-[#281912]">
                        Order Items
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {Array.isArray(
                        selectedOrder.items
                      ) &&
                        selectedOrder.items
                          .length > 0 ? (
                        selectedOrder.items.map(
                          (
                            item,
                            index
                          ) => {
                            const unitPrice =
                              Number(
                                item.unitPrice ??
                                item
                                  .product
                                  ?.price ??
                                0
                              )

                            const quantity =
                              Number(
                                item.quantity ||
                                1
                              )

                            const color =
                              formatVariantValue(
                                item.colorVariant
                              )

                            const shade =
                              formatVariantValue(
                                item.shadeColor
                              )

                            const bulb =
                              formatBulbOption(
                                item.bulbOption
                              )

                            const image =
                              item.image ||
                              item.product
                                ?.image

                            return (
                              <article
                                key={
                                  item.id ||
                                  `${item.productId}-${index}`
                                }
                                className="rounded-[20px] border border-[#E7DED7] bg-[#FFFEFC] p-4 sm:p-5"
                              >
                                <div className="flex gap-4">
                                  <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#F1EBE6]">
                                    {image ? (
                                      <img
                                        src={
                                          image
                                        }
                                        alt={
                                          item.name ||
                                          item
                                            .product
                                            ?.name ||
                                          'Product'
                                        }
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center">
                                        <Package className="h-5 w-5 text-[#9B877B]" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <h5 className="text-sm font-semibold leading-5 text-[#34241C]">
                                          {item.name ||
                                            item
                                              .product
                                              ?.name ||
                                            'Product'}
                                        </h5>

                                        <p className="mt-1 text-xs text-[#907C70]">
                                          Qty:{' '}
                                          {
                                            quantity
                                          }{' '}
                                          ×{' '}
                                          {formatPKR(
                                            unitPrice
                                          )}
                                        </p>
                                      </div>

                                      <p className="text-sm font-semibold text-[#3A2117]">
                                        {formatPKR(
                                          unitPrice *
                                          quantity
                                        )}
                                      </p>
                                    </div>

                                    {(color ||
                                      shade ||
                                      bulb) && (
                                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                          {color && (
                                            <div className="rounded-xl border border-[#E6DDD6] bg-[#F8F5F2] px-3 py-2.5">
                                              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#948075]">
                                                Base
                                                Color
                                              </p>

                                              <p className="mt-1 text-xs font-semibold text-[#49362C]">
                                                {
                                                  color
                                                }
                                              </p>
                                            </div>
                                          )}

                                          {shade && (
                                            <div className="rounded-xl border border-[#E6DDD6] bg-[#F8F5F2] px-3 py-2.5">
                                              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#948075]">
                                                Shade
                                                Color
                                              </p>

                                              <p className="mt-1 text-xs font-semibold text-[#49362C]">
                                                {
                                                  shade
                                                }
                                              </p>
                                            </div>
                                          )}

                                          {bulb && (
                                            <div className="rounded-xl border border-[#E6DDD6] bg-[#F8F5F2] px-3 py-2.5">
                                              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#948075]">
                                                Bulb
                                                Option
                                              </p>

                                              <p className="mt-1 text-xs font-semibold text-[#49362C]">
                                                {
                                                  bulb
                                                }
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </article>
                            )
                          }
                        )
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[#D9CBC2] bg-[#FAF7F4] p-8 text-center text-sm text-[#8D796E]">
                          No products found in this
                          order.
                        </div>
                      )}
                    </div>
                  </section>

                  {/* TOTALS */}
                  <section className="rounded-[22px] border border-[#DCCFC6] bg-[#F2ECE5] p-5">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#725F54]">
                          Subtotal
                        </span>

                        <span className="font-semibold text-[#34241C]">
                          {formatPKR(
                            selectedOrder.subtotal
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[#725F54]">
                          Shipping
                        </span>

                        <span className="font-semibold text-[#34241C]">
                          {Number(
                            selectedOrder.shipping ||
                            0
                          ) === 0
                            ? 'Free'
                            : formatPKR(
                              selectedOrder.shipping
                            )}
                        </span>
                      </div>

                      <div className="flex items-end justify-between gap-4 border-t border-[#D8CAC0] pt-4">
                        <div>
                          <p className="font-semibold text-[#281912]">
                            Total
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#927E72]">
                            Final order amount
                          </p>
                        </div>

                        <p className="text-2xl font-semibold tracking-[-0.03em] text-[#3A2117]">
                          {formatPKR(
                            selectedOrder.total
                          )}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* TRACKING */}
                  <section className="rounded-[22px] border border-[#E6DDD6] bg-[#FFFEFC] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2F4] text-[#537984]">
                          <Truck className="h-4.5 w-4.5" />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#927E72]">
                            Fulfilment
                          </p>

                          <h4 className="text-sm font-semibold text-[#34241C]">
                            Courier & Tracking
                          </h4>
                        </div>
                      </div>

                      {!showTrackingForm && (
                        <button
                          type="button"
                          onClick={
                            openTrackingForm
                          }
                          className="inline-flex min-h-[40px] w-fit items-center gap-2 rounded-xl border border-[#D7CBC3] bg-[#F8F5F2] px-4 text-xs font-semibold text-[#5E493D] transition hover:border-[#BFA99C]"
                        >
                          <Edit3 className="h-3.5 w-3.5" />

                          {selectedOrder.tracking
                            ? 'Edit Tracking'
                            : 'Add Tracking'}
                        </button>
                      )}
                    </div>

                    {!showTrackingForm ? (
                      selectedOrder.tracking ? (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="rounded-xl bg-[#F8F5F2] p-3.5">
                            <p className="text-[9px] uppercase tracking-[0.1em] text-[#948075]">
                              Courier
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#34241C]">
                              {selectedOrder
                                .tracking
                                .carrier ||
                                selectedOrder
                                  .tracking
                                  .courier ||
                                '—'}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#F8F5F2] p-3.5">
                            <p className="text-[9px] uppercase tracking-[0.1em] text-[#948075]">
                              Tracking ID
                            </p>

                            <p className="mt-1 break-all font-mono text-xs font-semibold text-[#34241C]">
                              {selectedOrder
                                .tracking
                                .trackingNumber ||
                                '—'}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#F8F5F2] p-3.5">
                            <p className="text-[9px] uppercase tracking-[0.1em] text-[#948075]">
                              Expected
                              Delivery
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#34241C]">
                              {formatDate(
                                selectedOrder
                                  .tracking
                                  .expectedDeliveryDate ||
                                selectedOrder
                                  .tracking
                                  .estimatedDelivery
                              )}
                            </p>
                          </div>

                          {selectedOrder
                            .tracking
                            .dispatchDate && (
                              <div className="rounded-xl bg-[#F8F5F2] p-3.5">
                                <p className="text-[9px] uppercase tracking-[0.1em] text-[#948075]">
                                  Dispatch Date
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#34241C]">
                                  {formatDate(
                                    selectedOrder
                                      .tracking
                                      .dispatchDate
                                  )}
                                </p>
                              </div>
                            )}

                          {selectedOrder
                            .tracking
                            .deliveryStatus && (
                              <div className="rounded-xl bg-[#F8F5F2] p-3.5">
                                <p className="text-[9px] uppercase tracking-[0.1em] text-[#948075]">
                                  Delivery
                                  Status
                                </p>

                                <p className="mt-1 text-sm font-semibold text-[#34241C]">
                                  {
                                    selectedOrder
                                      .tracking
                                      .deliveryStatus
                                  }
                                </p>
                              </div>
                            )}

                          {(selectedOrder
                            .tracking
                            .trackingUrl ||
                            selectedOrder
                              .tracking
                              .trackingLink) && (
                              <div className="rounded-xl bg-[#F8F5F2] p-3.5">
                                <p className="text-[9px] uppercase tracking-[0.1em] text-[#948075]">
                                  Tracking Link
                                </p>

                                <a
                                  href={
                                    selectedOrder
                                      .tracking
                                      .trackingUrl ||
                                    selectedOrder
                                      .tracking
                                      .trackingLink
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#6B4228] hover:underline"
                                >
                                  Open Tracking
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-dashed border-[#D9CBC2] bg-[#FAF7F4] p-5 text-center text-xs text-[#8B786D]">
                          Tracking information has
                          not been added yet.
                        </div>
                      )
                    ) : (
                      <div className="mt-5 rounded-2xl border border-[#DCCFC6] bg-[#F8F5F2] p-4 sm:p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-[11px] font-semibold text-[#49362C]">
                              Tracking Number *
                            </label>

                            <input
                              type="text"
                              value={
                                trackingData.trackingNumber
                              }
                              onChange={(e) =>
                                setTrackingData(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    trackingNumber:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              placeholder="e.g. TCS123456789"
                              className="h-11 w-full rounded-xl border border-[#D7CBC3] bg-white px-4 text-sm outline-none focus:border-[#8C6650] focus:ring-4 focus:ring-[#6B4228]/10"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-[11px] font-semibold text-[#49362C]">
                              Courier /
                              Delivery Company *
                            </label>

                            <input
                              type="text"
                              value={
                                trackingData.carrier
                              }
                              onChange={(e) =>
                                setTrackingData(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    carrier:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              placeholder="TCS, Leopards, M&P..."
                              className="h-11 w-full rounded-xl border border-[#D7CBC3] bg-white px-4 text-sm outline-none focus:border-[#8C6650] focus:ring-4 focus:ring-[#6B4228]/10"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-2 block text-[11px] font-semibold text-[#49362C]">
                              Tracking URL
                            </label>

                            <div className="relative">
                              <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99857A]" />

                              <input
                                type="url"
                                value={
                                  trackingData.trackingUrl
                                }
                                onChange={(e) =>
                                  setTrackingData(
                                    (
                                      prev
                                    ) => ({
                                      ...prev,
                                      trackingUrl:
                                        e
                                          .target
                                          .value,
                                    })
                                  )
                                }
                                placeholder="https://courier.com/track/..."
                                className="h-11 w-full rounded-xl border border-[#D7CBC3] bg-white pl-11 pr-4 text-sm outline-none focus:border-[#8C6650] focus:ring-4 focus:ring-[#6B4228]/10"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-[11px] font-semibold text-[#49362C]">
                              Dispatch Date
                            </label>

                            <input
                              type="date"
                              value={
                                trackingData.dispatchDate
                              }
                              onChange={(e) =>
                                setTrackingData(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    dispatchDate:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              className="h-11 w-full rounded-xl border border-[#D7CBC3] bg-white px-4 text-sm outline-none focus:border-[#8C6650]"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-[11px] font-semibold text-[#49362C]">
                              Expected Delivery
                            </label>

                            <input
                              type="date"
                              value={
                                trackingData.expectedDeliveryDate
                              }
                              onChange={(e) =>
                                setTrackingData(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    expectedDeliveryDate:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              className="h-11 w-full rounded-xl border border-[#D7CBC3] bg-white px-4 text-sm outline-none focus:border-[#8C6650]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-2 block text-[11px] font-semibold text-[#49362C]">
                              Delivery Status /
                              Note
                            </label>

                            <input
                              type="text"
                              value={
                                trackingData.deliveryStatus
                              }
                              onChange={(e) =>
                                setTrackingData(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    deliveryStatus:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              placeholder="e.g. Handed over to courier"
                              className="h-11 w-full rounded-xl border border-[#D7CBC3] bg-white px-4 text-sm outline-none focus:border-[#8C6650]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-2 block text-[11px] font-semibold text-[#49362C]">
                              Customer Update
                            </label>

                            <textarea
                              rows={3}
                              value={
                                trackingData.customerUpdate
                              }
                              onChange={(e) =>
                                setTrackingData(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    customerUpdate:
                                      e
                                        .target
                                        .value,
                                  })
                                )
                              }
                              placeholder="Optional internal/customer delivery update..."
                              className="w-full resize-none rounded-xl border border-[#D7CBC3] bg-white px-4 py-3 text-sm outline-none focus:border-[#8C6650]"
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setShowTrackingForm(
                                false
                              )
                            }
                            disabled={saving}
                            className="min-h-[42px] rounded-xl border border-[#D7CBC3] bg-white px-5 text-xs font-semibold text-[#5C493E]"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleSaveTracking
                            }
                            disabled={saving}
                            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 text-xs font-semibold text-white hover:bg-[#4C2D21] disabled:opacity-50"
                          >
                            {saving && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            Save Tracking
                          </button>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* STATUS MANAGEMENT */}
                  <section className="rounded-[22px] border border-[#E6DDD6] bg-[#FFFEFC] p-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#927E72]">
                        Order Progress
                      </p>

                      <h4 className="mt-1 text-base font-semibold text-[#281912]">
                        Update Order Status
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-[#887469]">
                        Status updates are saved to
                        the order history and appear
                        in the customer&apos;s order
                        tracking.
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {STATUS_OPTIONS.map(
                        (status) => {
                          const active =
                            normalizeStatus(
                              selectedOrder.status
                            ) ===
                            status.value

                          return (
                            <button
                              key={
                                status.value
                              }
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                updateOrderStatus(
                                  selectedOrder.id,
                                  status.value
                                )
                              }
                              className={`min-h-[42px] rounded-xl border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${active
                                  ? 'border-[#3A2117] bg-[#3A2117] text-white shadow-sm'
                                  : 'border-[#DDD2CA] bg-[#F8F5F2] text-[#5D493E] hover:border-[#BAA496] hover:bg-[#F2EBE6]'
                                }`}
                            >
                              {status.label}
                            </button>
                          )
                        }
                      )}
                    </div>

                    {/* CUSTOM STATUS */}
                    <div className="mt-5 border-t border-[#EEE6E0] pt-5">
                      <p className="text-[11px] font-semibold text-[#49362C]">
                        Custom Status
                      </p>

                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={
                            customStatus
                          }
                          onChange={(e) =>
                            setCustomStatus(
                              e.target.value
                            )
                          }
                          placeholder="e.g. Quality Check"
                          className="h-11 flex-1 rounded-xl border border-[#D7CBC3] bg-white px-4 text-sm outline-none focus:border-[#8C6650]"
                        />

                        <button
                          type="button"
                          disabled={
                            saving ||
                            !customStatus.trim()
                          }
                          onClick={
                            handleCustomStatus
                          }
                          className="min-h-[44px] rounded-xl border border-[#BDAA9D] bg-[#F2EBE6] px-5 text-xs font-semibold text-[#3A2117] transition hover:bg-[#E8DED7] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Apply Custom Status
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* STATUS HISTORY */}
                  {Array.isArray(
                    selectedOrder.statusHistory
                  ) &&
                    selectedOrder
                      .statusHistory.length >
                    0 && (
                      <section className="rounded-[22px] border border-[#E6DDD6] bg-[#F8F5F2] p-5">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#6B4228]" />

                          <h4 className="text-sm font-semibold text-[#34241C]">
                            Status History
                          </h4>
                        </div>

                        <div className="mt-4 space-y-3">
                          {[
                            ...selectedOrder.statusHistory,
                          ]
                            .reverse()
                            .map(
                              (
                                event,
                                index
                              ) => (
                                <div
                                  key={`${event.status}-${event.at}-${index}`}
                                  className="flex items-start gap-3"
                                >
                                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#6B4228]" />

                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#49362C]">
                                      {event.label ||
                                        getStatusLabel(
                                          event.status
                                        )}
                                    </p>

                                    <p className="mt-0.5 text-[10px] text-[#948075]">
                                      {formatDateTime(
                                        event.at
                                      )}

                                      {event.source
                                        ? ` • ${event.source}`
                                        : ''}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                        </div>
                      </section>
                    )}

                  {/* CUSTOMER NOTE */}
                  {selectedOrder.note && (
                    <section className="rounded-[22px] border border-[#E0D2C8] bg-[#F2ECE5] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#856B5B]">
                        Customer Delivery Notes
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#523F34]">
                        {selectedOrder.note}
                      </p>
                    </section>
                  )}
                </div>
              </div>

              {/* FIXED FOOTER */}
              <div className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-[#E5DAD2] bg-[#FFFEFC] px-5 py-4 shadow-[0_-10px_30px_rgba(58,33,23,0.06)] sm:px-7">
                <div className="hidden text-xs text-[#907C70] sm:block">
                  Current status:{' '}
                  <span className="font-semibold text-[#49362C]">
                    {getStatusLabel(
                      selectedOrder.status
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={closeOrderModal}
                  disabled={saving}
                  className="ml-auto min-h-[42px] rounded-xl bg-[#3A2117] px-6 text-sm font-semibold text-white transition hover:bg-[#4C2D21] disabled:opacity-50"
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