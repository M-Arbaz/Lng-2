'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Truck,
  XCircle,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import { useNavigate } from '@/lib/navigation'
import { productsService } from '../utils/productsService'
import ordersService from '../utils/ordersService.js'

function safeNumber(value) {
  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : 0
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-PK').format(
    safeNumber(value)
  )
}

function formatPKR(value) {
  return `Rs. ${formatNumber(value)}`
}

function getOrderDate(order) {
  if (!order?.createdAt) {
    return null
  }

  if (
    typeof order.createdAt?.toDate === 'function'
  ) {
    return order.createdAt.toDate()
  }

  if (order.createdAt?.seconds) {
    return new Date(
      order.createdAt.seconds * 1000
    )
  }

  const parsedDate = new Date(
    order.createdAt
  )

  return Number.isNaN(
    parsedDate.getTime()
  )
    ? null
    : parsedDate
}

function normalizeStatus(status) {
  return String(status || 'pending')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function formatStatus(status) {
  const normalized =
    normalizeStatus(status)

  return normalized
    .split('_')
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ')
}

function getStatusClasses(status) {
  switch (normalizeStatus(status)) {
    case 'pending':
    case 'order_placed':
      return 'border-[#E9D5A8] bg-[#FFF8E7] text-[#85651C]'

    case 'confirmed':
    case 'approved':
      return 'border-[#C8D9E8] bg-[#F0F6FB] text-[#3E6583]'

    case 'processing':
    case 'order_processing':
    case 'in_production':
    case 'order_in_production':
      return 'border-[#DDD0E8] bg-[#F8F3FB] text-[#705180]'

    case 'ready':
    case 'order_ready':
      return 'border-[#D7D7B7] bg-[#F8F8E9] text-[#6A692C]'

    case 'dispatched':
    case 'order_dispatched':
    case 'shipped':
      return 'border-[#BFD8DF] bg-[#EEF7F8] text-[#3F6F7A]'

    case 'out_for_delivery':
      return 'border-[#C8D8C1] bg-[#F3F8F0] text-[#4F7343]'

    case 'delivered':
    case 'completed':
      return 'border-[#BFD7C3] bg-[#EFF8F0] text-[#3F7048]'

    case 'cancelled':
    case 'canceled':
    case 'returned':
      return 'border-[#E2C4BD] bg-[#FFF1EE] text-[#944F42]'

    default:
      return 'border-[#DED5CF] bg-[#F8F5F2] text-[#6F5E54]'
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [orders, setOrders] =
    useState([])

  const [
    totalProducts,
    setTotalProducts,
  ] = useState(0)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null)

  const loadDashboardData =
    useCallback(async () => {
      setLoading(true)
      setError('')

      const [
        productsResult,
        ordersResult,
      ] = await Promise.allSettled([
        productsService.getAllProducts(),
        ordersService.getAllOrders(),
      ])

      let hasError = false

      if (
        productsResult.status ===
        'fulfilled'
      ) {
        const products =
          Array.isArray(
            productsResult.value
          )
            ? productsResult.value
            : []

        setTotalProducts(
          products.length
        )
      } else {
        hasError = true

        console.error(
          'Dashboard products load error:',
          productsResult.reason
        )
      }

      if (
        ordersResult.status ===
        'fulfilled'
      ) {
        const allOrders =
          Array.isArray(
            ordersResult.value
          )
            ? ordersResult.value
            : []

        setOrders(allOrders)
      } else {
        hasError = true

        console.error(
          'Dashboard orders load error:',
          ordersResult.reason
        )
      }

      if (hasError) {
        setError(
          'Some dashboard information could not be loaded. Please refresh and try again.'
        )
      }

      setLastUpdated(new Date())
      setLoading(false)
    }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const dashboardStats =
    useMemo(() => {
      const totalOrders =
        orders.length

      const totalRevenue =
        orders.reduce(
          (sum, order) =>
            sum +
            safeNumber(
              order?.total
            ),
          0
        )

      const pendingOrders =
        orders.filter(
          (order) => {
            const status =
              normalizeStatus(
                order?.status
              )

            return (
              status ===
              'pending' ||
              status ===
              'order_placed'
            )
          }
        ).length

      const deliveredOrders =
        orders.filter(
          (order) => {
            const status =
              normalizeStatus(
                order?.status
              )

            return (
              status ===
              'delivered' ||
              status ===
              'completed'
            )
          }
        ).length

      const shippedOrders =
        orders.filter(
          (order) => {
            const status =
              normalizeStatus(
                order?.status
              )

            return [
              'shipped',
              'dispatched',
              'order_dispatched',
              'out_for_delivery',
            ].includes(status)
          }
        ).length

      const cancelledOrders =
        orders.filter(
          (order) => {
            const status =
              normalizeStatus(
                order?.status
              )

            return [
              'cancelled',
              'canceled',
              'returned',
            ].includes(status)
          }
        ).length

      const averageOrderValue =
        totalOrders > 0
          ? totalRevenue /
          totalOrders
          : 0

      const completionRate =
        totalOrders > 0
          ? Math.round(
            (deliveredOrders /
              totalOrders) *
            100
          )
          : 0

      const openOrders =
        Math.max(
          totalOrders -
          deliveredOrders -
          cancelledOrders,
          0
        )

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        shippedOrders,
        cancelledOrders,
        averageOrderValue,
        completionRate,
        openOrders,
      }
    }, [orders])

  const recentOrders =
    useMemo(() => {
      return [...orders]
        .sort((a, b) => {
          const dateA =
            getOrderDate(a)?.getTime() ||
            0

          const dateB =
            getOrderDate(b)?.getTime() ||
            0

          return dateB - dateA
        })
        .slice(0, 5)
    }, [orders])

  const statCards = [
    {
      label: 'Total Products',
      value: formatNumber(
        totalProducts
      ),
      icon: Package,
      iconWrapper:
        'bg-[#EFE5DE] text-[#6B4228]',
      detail:
        'Products in catalogue',
    },
    {
      label: 'Total Orders',
      value: formatNumber(
        dashboardStats.totalOrders
      ),
      icon: ShoppingCart,
      iconWrapper:
        'bg-[#E9F0EB] text-[#4D7155]',
      detail:
        'Orders received',
    },
    {
      label: 'Total Revenue',
      value: formatPKR(
        dashboardStats.totalRevenue
      ),
      icon: TrendingUp,
      iconWrapper:
        'bg-[#EAEDEF] text-[#506673]',
      detail:
        'Recorded order value',
    },
    {
      label: 'Pending Orders',
      value: formatNumber(
        dashboardStats.pendingOrders
      ),
      icon: Clock,
      iconWrapper:
        'bg-[#F4E8E4] text-[#955B4E]',
      detail:
        'Require attention',
    },
  ]

  const orderStatuses = [
    {
      label: 'Pending',
      value:
        dashboardStats.pendingOrders,
      icon: Clock,
      iconClass:
        'text-[#8D6C31]',
      barClass:
        'bg-[#CDAA62]',
    },
    {
      label: 'In Transit',
      value:
        dashboardStats.shippedOrders,
      icon: Truck,
      iconClass:
        'text-[#537984]',
      barClass:
        'bg-[#7098A3]',
    },
    {
      label: 'Delivered',
      value:
        dashboardStats.deliveredOrders,
      icon: CheckCircle2,
      iconClass:
        'text-[#53785A]',
      barClass:
        'bg-[#72927A]',
    },
    {
      label: 'Cancelled',
      value:
        dashboardStats.cancelledOrders,
      icon: XCircle,
      iconClass:
        'text-[#96584B]',
      barClass:
        'bg-[#B77264]',
    },
  ]

  const quickActions = [
    {
      title: 'Manage Products',
      description:
        'Add, edit and manage catalogue items.',
      icon: Package,
      route: '/admin/products',
    },
    {
      title: 'Manage Orders',
      description:
        'Review orders, status and tracking.',
      icon: ShoppingCart,
      route: '/admin/orders',
    },
    {
      title: 'Custom Orders',
      description:
        'Review custom design submissions.',
      icon: Plus,
      route: '/admin/custom-orders',
    },
  ]

  const formatLastUpdated =
    () => {
      if (!lastUpdated) {
        return 'Loading...'
      }

      return lastUpdated.toLocaleString(
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

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Welcome / Dashboard Header */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#E6DDD6] bg-[#FFFEFC] px-5 py-6 shadow-[0_10px_35px_rgba(58,33,23,0.06)] sm:px-7 sm:py-7 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#D9C1B2]/20 blur-3xl"
          />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-[#E5D7CD] bg-[#F7F4EF] px-3 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#745747]">
                  Store Overview
                </span>
              </div>

              <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#281912] sm:text-3xl">
                Welcome back
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#806D62]">
                Here&apos;s a quick overview of
                Lamp & Glow products, orders and
                store performance.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B877B]">
                  Last updated
                </p>

                <p className="mt-1 text-sm font-medium text-[#513B30]">
                  {formatLastUpdated()}
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboardData}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DCCFC6] bg-white px-4 text-sm font-semibold text-[#3A2117] shadow-sm transition hover:border-[#BDAA9D] hover:bg-[#F8F4F0] disabled:cursor-not-allowed disabled:opacity-60"
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
          </div>
        </section>

        {/* Error Notice */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-[#E5C5BD] bg-[#FFF4F1] p-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8DEDA]">
              <AlertCircle className="h-4 w-4 text-[#A05245]" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#7F4037]">
                Dashboard data warning
              </p>

              <p className="mt-0.5 text-xs leading-5 text-[#986157]">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(
            ({
              label,
              value,
              icon: Icon,
              iconWrapper,
              detail,
            }) => (
              <article
                key={label}
                className="group rounded-[22px] border border-[#E8DFD9] bg-[#FFFEFC] p-5 shadow-[0_8px_28px_rgba(58,33,23,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-[#D8C7BC] hover:shadow-[0_12px_35px_rgba(58,33,23,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#806C61]">
                      {label}
                    </p>

                    {loading ? (
                      <div className="mt-3 h-9 w-28 animate-pulse rounded-lg bg-[#EEE7E1]" />
                    ) : (
                      <p className="mt-2 break-words text-[28px] font-semibold tracking-[-0.035em] text-[#281912]">
                        {value}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-[#A08D82]">
                      {detail}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${iconWrapper}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </article>
            )
          )}
        </section>

        {/* Main Dashboard Grid */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.7fr)]">
          {/* Recent Orders */}
          <div className="overflow-hidden rounded-[24px] border border-[#E7DED7] bg-[#FFFEFC] shadow-[0_8px_30px_rgba(58,33,23,0.045)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#EEE6E0] px-5 py-5 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-[#281912]">
                  Recent Orders
                </h3>

                <p className="mt-1 text-xs text-[#968276]">
                  Latest customer orders from
                  Firestore.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/orders'
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F5EFEA]"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3 p-5 sm:p-6">
                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-[72px] animate-pulse rounded-2xl bg-[#F3EEEA]"
                    />
                  )
                )}
              </div>
            ) : recentOrders.length ===
              0 ? (
              <div className="flex min-h-[310px] flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EBE6]">
                  <ShoppingCart className="h-6 w-6 text-[#876D5E]" />
                </div>

                <h4 className="mt-4 text-base font-semibold text-[#37251D]">
                  No orders yet
                </h4>

                <p className="mt-1 max-w-sm text-sm leading-6 text-[#958175]">
                  New customer orders will
                  automatically appear here once
                  they are placed.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="bg-[#FAF7F4]">
                        <th className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#88766B]">
                          Order
                        </th>

                        <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#88766B]">
                          Customer
                        </th>

                        <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#88766B]">
                          Total
                        </th>

                        <th className="px-4 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#88766B]">
                          Status
                        </th>

                        <th className="px-6 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-[#88766B]">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentOrders.map(
                        (order) => {
                          const orderDate =
                            getOrderDate(
                              order
                            )

                          return (
                            <tr
                              key={
                                order.id
                              }
                              className="border-t border-[#F0E8E2] transition hover:bg-[#FCFAF8]"
                            >
                              <td className="px-6 py-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      '/admin/orders'
                                    )
                                  }
                                  className="font-mono text-xs font-semibold text-[#6B4228] hover:underline"
                                >
                                  #
                                  {order.id?.slice(
                                    0,
                                    8
                                  ) ||
                                    'N/A'}
                                </button>
                              </td>

                              <td className="px-4 py-4">
                                <div className="max-w-[190px]">
                                  <p className="truncate text-sm font-semibold text-[#34241C]">
                                    {order.fullName ||
                                      order.customerName ||
                                      'Customer'}
                                  </p>

                                  {order.email && (
                                    <p className="mt-0.5 truncate text-xs text-[#9A887D]">
                                      {
                                        order.email
                                      }
                                    </p>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4 text-sm font-semibold text-[#34241C]">
                                {formatPKR(
                                  order.total
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                                    order.status
                                  )}`}
                                >
                                  {formatStatus(
                                    order.status
                                  )}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right text-xs text-[#836F64]">
                                {orderDate
                                  ? orderDate.toLocaleDateString(
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
                            </tr>
                          )
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Order Cards */}
                <div className="divide-y divide-[#EFE7E1] md:hidden">
                  {recentOrders.map(
                    (order) => {
                      const orderDate =
                        getOrderDate(
                          order
                        )

                      return (
                        <button
                          key={
                            order.id
                          }
                          type="button"
                          onClick={() =>
                            navigate(
                              '/admin/orders'
                            )
                          }
                          className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition hover:bg-[#FBF8F5]"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-mono text-xs font-semibold text-[#6B4228]">
                                #
                                {order.id?.slice(
                                  0,
                                  8
                                ) ||
                                  'N/A'}
                              </p>

                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusClasses(
                                  order.status
                                )}`}
                              >
                                {formatStatus(
                                  order.status
                                )}
                              </span>
                            </div>

                            <p className="mt-2 truncate text-sm font-semibold text-[#34241C]">
                              {order.fullName ||
                                order.customerName ||
                                'Customer'}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#907C70]">
                              <span>
                                {formatPKR(
                                  order.total
                                )}
                              </span>

                              <span>
                                {orderDate
                                  ? orderDate.toLocaleDateString(
                                    'en-PK',
                                    {
                                      day: '2-digit',
                                      month:
                                        'short',
                                      year: 'numeric',
                                    }
                                  )
                                  : '—'}
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#A99589]" />
                        </button>
                      )
                    }
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <aside className="rounded-[24px] border border-[#E7DED7] bg-[#FFFEFC] p-5 shadow-[0_8px_30px_rgba(58,33,23,0.045)] sm:p-6">
            <div>
              <h3 className="text-lg font-semibold text-[#281912]">
                Quick Actions
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#968276]">
                Jump directly to common store
                management tasks.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {quickActions.map(
                ({
                  title,
                  description,
                  icon: Icon,
                  route,
                }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() =>
                      navigate(route)
                    }
                    className="group flex w-full items-center gap-3 rounded-2xl border border-[#EAE1DB] bg-[#FBF8F5] p-3.5 text-left transition hover:border-[#D4C2B6] hover:bg-[#F6F0EB]"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-white shadow-sm">
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#34241C]">
                        {title}
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-[#927E72]">
                        {description}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#A28E82] transition-transform group-hover:translate-x-0.5 group-hover:text-[#6B4228]" />
                  </button>
                )
              )}
            </div>
          </aside>
        </section>

        {/* Bottom Dashboard Grid */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Order Status */}
          <div className="rounded-[24px] border border-[#E7DED7] bg-[#FFFEFC] p-5 shadow-[0_8px_30px_rgba(58,33,23,0.045)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#281912]">
                  Order Status
                </h3>

                <p className="mt-1 text-xs text-[#968276]">
                  Current order distribution.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/orders'
                  )
                }
                className="text-xs font-semibold text-[#6B4228] transition hover:text-[#3A2117]"
              >
                Manage orders
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {orderStatuses.map(
                ({
                  label,
                  value,
                  icon: Icon,
                  iconClass,
                  barClass,
                }) => {
                  const percentage =
                    dashboardStats.totalOrders >
                      0
                      ? Math.round(
                        (value /
                          dashboardStats.totalOrders) *
                        100
                      )
                      : 0

                  return (
                    <div
                      key={label}
                    >
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`h-4 w-4 ${iconClass}`}
                          />

                          <span className="text-sm font-medium text-[#49362C]">
                            {label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#9A877C]">
                            {percentage}%
                          </span>

                          <span className="min-w-[24px] text-right text-sm font-semibold text-[#34241C]">
                            {formatNumber(
                              value
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#F0EAE5]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>

          {/* Performance Snapshot */}
          <div className="rounded-[24px] border border-[#E7DED7] bg-[#3A2117] p-5 text-white shadow-[0_10px_35px_rgba(58,33,23,0.12)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#CDBAAF]">
                  Performance
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  Store Snapshot
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#C9B8AE]">
                  Live summary calculated from
                  current order records.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <TrendingUp className="h-5 w-5 text-[#F6EEE9]" />
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#C9B8AE]">
                  Avg. Order
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  {formatPKR(
                    dashboardStats.averageOrderValue
                  )}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#C9B8AE]">
                  Completion
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  {
                    dashboardStats.completionRate
                  }
                  %
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#C9B8AE]">
                  Open Orders
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  {formatNumber(
                    dashboardStats.openOrders
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5">
              <div>
                <p className="text-xs text-[#C8B6AB]">
                  Total recorded revenue
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {formatPKR(
                    dashboardStats.totalRevenue
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/orders'
                  )
                }
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#F7F4EF] text-[#3A2117] transition hover:bg-white"
                aria-label="Open orders"
              >
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}