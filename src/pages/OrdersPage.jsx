'use client'

import { useMemo } from 'react'
import { useNavigate } from '@/lib/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  PackageCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'

function formatPrice(value) {
  return Number(value || 0).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function formatOrderDate(value) {
  if (!value) return 'Recently placed'

  try {
    let date

    if (typeof value?.toDate === 'function') {
      date = value.toDate()
    } else if (typeof value?.seconds === 'number') {
      date = new Date(value.seconds * 1000)
    } else {
      date = new Date(value)
    }

    if (Number.isNaN(date.getTime())) {
      return 'Recently placed'
    }

    return date.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return 'Recently placed'
  }
}

function getPaymentLabel(method) {
  const value = String(method || '').toLowerCase()

  if (
    value === 'cod' ||
    value === 'cash_on_delivery' ||
    value === 'cash on delivery'
  ) {
    return 'Cash on Delivery'
  }

  if (
    value === 'bank' ||
    value === 'bank_transfer' ||
    value === 'bank deposit'
  ) {
    return 'Bank Deposit'
  }

  if (!value) return 'Not specified'

  return String(method)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStatusMeta(status) {
  const normalized = String(status || 'pending')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')

  const statuses = {
    pending: {
      label: 'Order Placed',
      className:
        'border-amber-200 bg-amber-50 text-amber-800',
      icon: Clock3,
    },
    confirmed: {
      label: 'Confirmed',
      className:
        'border-blue-200 bg-blue-50 text-blue-700',
      icon: CheckCircle2,
    },
    approved: {
      label: 'Approved',
      className:
        'border-blue-200 bg-blue-50 text-blue-700',
      icon: CheckCircle2,
    },
    processing: {
      label: 'Processing',
      className:
        'border-violet-200 bg-violet-50 text-violet-700',
      icon: Package,
    },
    in_production: {
      label: 'In Production',
      className:
        'border-violet-200 bg-violet-50 text-violet-700',
      icon: Package,
    },
    production: {
      label: 'In Production',
      className:
        'border-violet-200 bg-violet-50 text-violet-700',
      icon: Package,
    },
    ready: {
      label: 'Order Ready',
      className:
        'border-indigo-200 bg-indigo-50 text-indigo-700',
      icon: PackageCheck,
    },
    dispatched: {
      label: 'Dispatched',
      className:
        'border-sky-200 bg-sky-50 text-sky-700',
      icon: Truck,
    },
    shipped: {
      label: 'Shipped',
      className:
        'border-sky-200 bg-sky-50 text-sky-700',
      icon: Truck,
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      className:
        'border-cyan-200 bg-cyan-50 text-cyan-700',
      icon: Truck,
    },
    delivered: {
      label: 'Delivered',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelled',
      className:
        'border-rose-200 bg-rose-50 text-rose-700',
      icon: Package,
    },
    canceled: {
      label: 'Cancelled',
      className:
        'border-rose-200 bg-rose-50 text-rose-700',
      icon: Package,
    },
    returned: {
      label: 'Returned',
      className:
        'border-stone-200 bg-stone-100 text-stone-700',
      icon: Package,
    },
  }

  if (statuses[normalized]) {
    return statuses[normalized]
  }

  return {
    label: normalized
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    className:
      'border-stone-200 bg-stone-100 text-stone-700',
    icon: Package,
  }
}

export default function OrdersPage({
  orders = [],
  theme = 'light',
}) {
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const getTime = (value) => {
        if (!value) return 0
        if (typeof value?.toDate === 'function') {
          return value.toDate().getTime()
        }
        if (typeof value?.seconds === 'number') {
          return value.seconds * 1000
        }

        const parsed = new Date(value).getTime()
        return Number.isNaN(parsed) ? 0 : parsed
      }

      return getTime(b.createdAt) - getTime(a.createdAt)
    })
  }, [orders])

  const deliveredCount = orders.filter(
    (order) =>
      String(order.status || '').toLowerCase() === 'delivered'
  ).length

  const activeCount = orders.filter((order) => {
    const status = String(order.status || '').toLowerCase()

    return ![
      'delivered',
      'cancelled',
      'canceled',
      'returned',
    ].includes(status)
  }).length

  return (
    <main
      className={
        isDark
          ? 'min-h-screen bg-[#1F1F1F]'
          : 'min-h-screen bg-[#F7F4EF]'
      }
    >
      {/* HERO */}
      <section
        className={
          isDark
            ? 'border-b border-white/10 bg-[#241A15]'
            : 'border-b border-[#3A2117]/10 bg-[#FFFEFC]'
        }
      >
        <div className="mx-auto max-w-[1380px] px-4 pb-9 pt-14 sm:px-6 sm:pb-10 sm:pt-16 lg:px-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={
              isDark
                ? 'inline-flex items-center gap-2 text-xs font-medium text-stone-400 transition-colors hover:text-white'
                : 'inline-flex items-center gap-2 text-xs font-medium text-[#7A6559] transition-colors hover:text-[#3A2117]'
            }
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
            Back
          </button>

          <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div
                className={
                  isDark
                    ? 'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5'
                    : 'inline-flex items-center gap-2 rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] px-3 py-1.5'
                }
              >
                <ShoppingBag
                  size={13}
                  strokeWidth={1.8}
                  className={
                    isDark
                      ? 'text-[#D7A987]'
                      : 'text-[#6B4228]'
                  }
                />

                <span
                  className={
                    isDark
                      ? 'text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-300'
                      : 'text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A5945]'
                  }
                >
                  Your Purchases
                </span>
              </div>

              <h1
                className={
                  isDark
                    ? 'mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl'
                    : 'mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#281912] sm:text-4xl'
                }
              >
                My Orders
              </h1>

              <p
                className={
                  isDark
                    ? 'mt-2 max-w-xl text-sm leading-6 text-stone-400'
                    : 'mt-2 max-w-xl text-sm leading-6 text-[#7A6A60]'
                }
              >
                Review your purchases, payment details and latest order
                status in one place.
              </p>
            </div>

            {orders.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="
                  inline-flex min-h-[44px] w-fit items-center
                  justify-center gap-2 rounded-full
                  bg-[#3A2117] px-6
                  text-xs font-semibold text-white
                  shadow-[0_10px_25px_rgba(58,33,23,0.16)]
                  transition-all hover:-translate-y-0.5
                  hover:bg-[#4A2B1F]
                "
              >
                Continue Shopping
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">

        {orders.length === 0 ? (
          /* EMPTY STATE */
          <div
            className={
              isDark
                ? 'mx-auto max-w-2xl overflow-hidden rounded-[30px] border border-white/10 bg-[#29221E]'
                : 'mx-auto max-w-2xl overflow-hidden rounded-[30px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_22px_70px_rgba(58,33,23,0.07)]'
            }
          >
            <div
              className={
                isDark
                  ? 'border-b border-white/10 bg-white/[0.03] px-6 py-12 text-center'
                  : 'border-b border-[#3A2117]/10 bg-[#F2ECE5] px-6 py-12 text-center'
              }
            >
              <div
                className={
                  isDark
                    ? 'mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-[#D7A987]'
                    : 'mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#3A2117]/10 bg-[#FFFEFC] text-[#6B4228]'
                }
              >
                <ShoppingBag size={27} strokeWidth={1.5} />
              </div>

              <h2
                className={
                  isDark
                    ? 'mt-5 text-2xl font-semibold text-white'
                    : 'mt-5 text-2xl font-semibold text-[#281912]'
                }
              >
                No orders yet
              </h2>

              <p
                className={
                  isDark
                    ? 'mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400'
                    : 'mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6A60]'
                }
              >
                Once you place your first Lamp & Glow order, its details
                and status will appear here.
              </p>
            </div>

            <div className="px-6 py-7 text-center">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="
                  inline-flex min-h-[48px] items-center
                  justify-center gap-2 rounded-full
                  bg-[#3A2117] px-7
                  text-sm font-semibold text-white
                  transition-all hover:-translate-y-0.5
                  hover:bg-[#4A2B1F]
                "
              >
                Explore Products
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* STATS */}
            <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  label: 'Total Orders',
                  value: orders.length,
                  icon: ShoppingBag,
                },
                {
                  label: 'Active',
                  value: activeCount,
                  icon: Truck,
                },
                {
                  label: 'Delivered',
                  value: deliveredCount,
                  icon: PackageCheck,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className={
                    isDark
                      ? 'rounded-[20px] border border-white/10 bg-[#29221E] p-4 sm:p-5'
                      : 'rounded-[20px] border border-[#3A2117]/10 bg-[#FFFEFC] p-4 shadow-[0_8px_28px_rgba(58,33,23,0.04)] sm:p-5'
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={
                          isDark
                            ? 'text-2xl font-semibold text-white'
                            : 'text-2xl font-semibold tracking-[-0.03em] text-[#281912]'
                        }
                      >
                        {value}
                      </p>

                      <p
                        className={
                          isDark
                            ? 'mt-1 text-[10px] text-stone-500'
                            : 'mt-1 text-[10px] font-medium text-[#8A7569]'
                        }
                      >
                        {label}
                      </p>
                    </div>

                    <div
                      className={
                        isDark
                          ? 'grid h-9 w-9 place-items-center rounded-full bg-white/[0.05] text-[#D7A987]'
                          : 'grid h-9 w-9 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]'
                      }
                    >
                      <Icon size={15} strokeWidth={1.7} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* HEADING */}
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
                Order History
              </p>

              <h2
                className={
                  isDark
                    ? 'mt-1 text-xl font-semibold text-white'
                    : 'mt-1 text-xl font-semibold text-[#281912]'
                }
              >
                Recent Orders
              </h2>
            </div>

            {/* ORDERS */}
            <div className="space-y-5">
              {sortedOrders.map((order) => {
                const status = getStatusMeta(order.status)
                const StatusIcon = status.icon
                const items = Array.isArray(order.items)
                  ? order.items
                  : []

                return (
                  <article
                    key={order.id}
                    className={
                      isDark
                        ? 'overflow-hidden rounded-[26px] border border-white/10 bg-[#29221E]'
                        : 'overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_12px_38px_rgba(58,33,23,0.05)]'
                    }
                  >
                    {/* ORDER HEADER */}
                    <div
                      className={
                        isDark
                          ? 'border-b border-white/10 bg-[#241A15] px-5 py-5 sm:px-6'
                          : 'border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-6'
                      }
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#8A654D]">
                            Order Number
                          </p>

                          <p
                            className={
                              isDark
                                ? 'mt-1 break-all text-sm font-semibold text-white'
                                : 'mt-1 break-all text-sm font-semibold text-[#281912]'
                            }
                          >
                            #{order.id}
                          </p>

                          <p
                            className={
                              isDark
                                ? 'mt-1 text-[11px] text-stone-500'
                                : 'mt-1 text-[11px] text-[#8A7569]'
                            }
                          >
                            {formatOrderDate(
                              order.createdAt || order.date
                            )}
                          </p>
                        </div>

                        <div
                          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${status.className}`}
                        >
                          <StatusIcon size={12} strokeWidth={1.8} />
                          {status.label}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">

                      {/* ORDER INFO */}
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div
                          className={
                            isDark
                              ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4'
                              : 'rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-4'
                          }
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard
                              size={14}
                              className="text-[#6B4228]"
                            />

                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8A7569]">
                              Payment
                            </p>
                          </div>

                          <p
                            className={
                              isDark
                                ? 'mt-2 text-xs font-semibold text-white'
                                : 'mt-2 text-xs font-semibold text-[#281912]'
                            }
                          >
                            {getPaymentLabel(order.paymentMethod)}
                          </p>
                        </div>

                        <div
                          className={
                            isDark
                              ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4'
                              : 'rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-4'
                          }
                        >
                          <div className="flex items-center gap-2">
                            <MapPin
                              size={14}
                              className="text-[#6B4228]"
                            />

                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8A7569]">
                              Delivery
                            </p>
                          </div>

                          <p
                            className={
                              isDark
                                ? 'mt-2 line-clamp-2 text-xs font-semibold text-white'
                                : 'mt-2 line-clamp-2 text-xs font-semibold text-[#281912]'
                            }
                          >
                            {[
                              order.city,
                              order.addressLine1 || order.address,
                            ]
                              .filter(Boolean)
                              .join(', ') || 'Address unavailable'}
                          </p>
                        </div>

                        <div
                          className={
                            isDark
                              ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4'
                              : 'rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-4'
                          }
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag
                              size={14}
                              className="text-[#6B4228]"
                            />

                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8A7569]">
                              Order Total
                            </p>
                          </div>

                          <p
                            className={
                              isDark
                                ? 'mt-2 text-sm font-semibold text-white'
                                : 'mt-2 text-sm font-semibold text-[#281912]'
                            }
                          >
                            Rs.{formatPrice(order.total)}
                          </p>
                        </div>
                      </div>

                      {/* PRODUCTS */}
                      {items.length > 0 && (
                        <div className="mt-5">
                          <p
                            className={
                              isDark
                                ? 'mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'
                                : 'mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7569]'
                            }
                          >
                            Products
                          </p>

                          <div className="space-y-3">
                            {items.map((item, index) => {
                              const isObject =
                                item &&
                                typeof item === 'object'

                              const name = isObject
                                ? item.name ||
                                item.productName ||
                                'Product'
                                : String(item)

                              const quantity = isObject
                                ? Number(item.quantity || 1)
                                : 1

                              const unitPrice = isObject
                                ? Number(item.unitPrice || item.price || 0)
                                : 0

                              return (
                                <div
                                  key={
                                    isObject
                                      ? item.id ||
                                      item.productId ||
                                      `${name}-${index}`
                                      : `${item}-${index}`
                                  }
                                  className={
                                    isDark
                                      ? 'flex gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3'
                                      : 'flex gap-3 rounded-2xl border border-[#3A2117]/10 bg-[#FFFEFC] p-3'
                                  }
                                >
                                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-[#EEE7E1]">
                                    {isObject && item.image ? (
                                      <img
                                        src={item.image}
                                        alt={name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="grid h-full w-full place-items-center text-[#9A8171]">
                                        <Package
                                          size={18}
                                          strokeWidth={1.5}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p
                                          className={
                                            isDark
                                              ? 'line-clamp-2 text-xs font-semibold leading-5 text-white'
                                              : 'line-clamp-2 text-xs font-semibold leading-5 text-[#281912]'
                                          }
                                        >
                                          {name}
                                        </p>

                                        <p
                                          className={
                                            isDark
                                              ? 'mt-1 text-[10px] text-stone-500'
                                              : 'mt-1 text-[10px] text-[#8A7569]'
                                          }
                                        >
                                          Qty: {quantity}
                                        </p>
                                      </div>

                                      {unitPrice > 0 && (
                                        <p
                                          className={
                                            isDark
                                              ? 'shrink-0 text-xs font-semibold text-white'
                                              : 'shrink-0 text-xs font-semibold text-[#3A2117]'
                                          }
                                        >
                                          Rs.
                                          {formatPrice(
                                            unitPrice * quantity
                                          )}
                                        </p>
                                      )}
                                    </div>

                                    {isObject &&
                                      (item.colorVariant ||
                                        item.shadeColor ||
                                        item.bulbOption) && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                          {item.colorVariant && (
                                            <span className="rounded-full bg-[#F2ECE5] px-2 py-1 text-[9px] text-[#6B5A50]">
                                              Color: {item.colorVariant}
                                            </span>
                                          )}

                                          {item.shadeColor && (
                                            <span className="rounded-full bg-[#F2ECE5] px-2 py-1 text-[9px] text-[#6B5A50]">
                                              Shade: {item.shadeColor}
                                            </span>
                                          )}

                                          {item.bulbOption && (
                                            <span className="rounded-full bg-[#F2ECE5] px-2 py-1 text-[9px] capitalize text-[#6B5A50]">
                                              Bulb: {item.bulbOption}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* TRACKING */}
                      {order.tracking &&
                        (order.tracking.trackingNumber ||
                          order.tracking.courier ||
                          order.tracking.expectedDeliveryDate) && (
                          <div className="mt-5 rounded-2xl border border-[#6B4228]/10 bg-[#EEE5DC] p-4">
                            <div className="flex items-start gap-3">
                              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#3A2117] text-white">
                                <Truck size={15} strokeWidth={1.7} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#281912]">
                                  Tracking Information
                                </p>

                                {order.tracking.courier && (
                                  <p className="mt-1 text-[10px] text-[#7A6559]">
                                    Courier: {order.tracking.courier}
                                  </p>
                                )}

                                {order.tracking.trackingNumber && (
                                  <p className="mt-1 break-all text-[10px] text-[#7A6559]">
                                    Tracking ID:{' '}
                                    <span className="font-semibold text-[#3A2117]">
                                      {order.tracking.trackingNumber}
                                    </span>
                                  </p>
                                )}

                                {order.tracking.expectedDeliveryDate && (
                                  <p className="mt-1 text-[10px] text-[#7A6559]">
                                    Expected delivery:{' '}
                                    {formatOrderDate(
                                      order.tracking
                                        .expectedDeliveryDate
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>
    </main>
  )
}