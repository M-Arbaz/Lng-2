'use client'

import { useNavigate } from '@/lib/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react'

export default function CartPage({
  cart,
  cartItemsCount,
  cartTotal,
  handleRemoveFromCart,
  handleUpdateCartQuantity,
  onCheckout,
  theme = 'light',
}) {
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const formatPrice = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '0.00'

    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Preserve current cart shipping behaviour.
  const shippingFee =
    cartTotal >= 15000 || cartTotal === 0 ? 0 : 12

  const grandTotal = cartTotal + shippingFee

  return (
    <main
      className={
        isDark
          ? 'min-h-screen bg-[#1F1F1F] text-white'
          : 'min-h-screen bg-[#F7F4EF] text-[#281912]'
      }
    >
      {/* ═══════════════ HERO ═══════════════ */}
      <section
        className={
          isDark
            ? 'border-b border-white/10 bg-[#241A15]'
            : 'border-b border-[#3A2117]/10 bg-[#FFFEFC]'
        }
      >
        <div className="mx-auto max-w-[1400px] px-4 pb-8 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:px-10 lg:pt-16">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className={
              isDark
                ? 'inline-flex items-center gap-2 text-xs font-medium text-stone-400 transition-colors hover:text-white'
                : 'inline-flex items-center gap-2 text-xs font-medium text-[#7A6559] transition-colors hover:text-[#3A2117]'
            }
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
            Continue Shopping
          </button>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
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
                    isDark ? 'text-[#D7A987]' : 'text-[#6B4228]'
                  }
                />

                <span
                  className={
                    isDark
                      ? 'text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-300'
                      : 'text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A5945]'
                  }
                >
                  Your Selection
                </span>
              </div>

              <h1
                className={
                  isDark
                    ? 'mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl'
                    : 'mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#281912] sm:text-4xl'
                }
              >
                Shopping Cart
              </h1>

              <p
                className={
                  isDark
                    ? 'mt-2 max-w-xl text-sm leading-6 text-stone-400'
                    : 'mt-2 max-w-xl text-sm leading-6 text-[#7A6A60]'
                }
              >
                Review your selected pieces, adjust quantities and continue
                when everything feels just right.
              </p>
            </div>

            {cartItemsCount > 0 && (
              <div
                className={
                  isDark
                    ? 'w-fit rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3'
                    : 'w-fit rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] px-5 py-3'
                }
              >
                <p
                  className={
                    isDark
                      ? 'text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'
                      : 'text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]'
                  }
                >
                  Cart Items
                </p>

                <p
                  className={
                    isDark
                      ? 'mt-0.5 text-xl font-semibold text-white'
                      : 'mt-0.5 text-xl font-semibold text-[#281912]'
                  }
                >
                  {cartItemsCount}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ CONTENT ═══════════════ */}
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        {cart.length === 0 ? (
          /* ═══════════════ EMPTY CART ═══════════════ */
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
                  ? 'border-b border-white/10 bg-white/[0.03] px-6 py-12 text-center sm:px-10'
                  : 'border-b border-[#3A2117]/10 bg-[#F2ECE5] px-6 py-12 text-center sm:px-10'
              }
            >
              <div
                className={
                  isDark
                    ? 'mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[#D7A987]'
                    : 'mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#3A2117]/10 bg-[#FFFEFC] text-[#6B4228] shadow-sm'
                }
              >
                <ShoppingBag size={27} strokeWidth={1.5} />
              </div>

              <h2
                className={
                  isDark
                    ? 'mt-5 text-2xl font-semibold tracking-[-0.03em] text-white'
                    : 'mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]'
                }
              >
                Your cart is empty
              </h2>

              <p
                className={
                  isDark
                    ? 'mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400'
                    : 'mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6A60]'
                }
              >
                Discover lighting and décor pieces designed to bring warmth,
                character and atmosphere into your space.
              </p>
            </div>

            <div className="flex flex-col gap-3 px-6 py-7 sm:flex-row sm:justify-center sm:px-10 sm:py-8">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="
                  inline-flex min-h-[48px] items-center justify-center
                  gap-2 rounded-full bg-[#3A2117]
                  px-7 py-3 text-sm font-semibold text-white
                  shadow-[0_10px_28px_rgba(58,33,23,0.18)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#4A2B1F]
                "
              >
                Browse Products
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/collections')}
                className={
                  isDark
                    ? 'inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.05]'
                    : 'inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#3A2117]/15 bg-[#FFFEFC] px-7 py-3 text-sm font-semibold text-[#3A2117] transition-colors hover:bg-[#F2ECE5]'
                }
              >
                Browse Collections
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-10">

              {/* ═══════════════ LEFT — CART ITEMS ═══════════════ */}
              <div>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p
                      className={
                        isDark
                          ? 'text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D7A987]'
                          : 'text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]'
                      }
                    >
                      Selected Pieces
                    </p>

                    <h2
                      className={
                        isDark
                          ? 'mt-1 text-xl font-semibold text-white'
                          : 'mt-1 text-xl font-semibold text-[#281912]'
                      }
                    >
                      Your Items
                    </h2>
                  </div>

                  <p
                    className={
                      isDark
                        ? 'text-xs text-stone-500'
                        : 'text-xs text-[#8A7569]'
                    }
                  >
                    {cartItemsCount} item
                    {cartItemsCount === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="space-y-4">
                  {cart.map((item) => {
                    const unitPrice =
                      item.unitPrice ?? item.product?.price ?? 0

                    const lineTotal =
                      unitPrice * (Number(item.quantity) || 1)

                    return (
                      <article
                        key={item.id}
                        className={
                          isDark
                            ? 'group overflow-hidden rounded-[24px] border border-white/10 bg-[#29221E] transition-all duration-300 hover:border-white/20'
                            : 'group overflow-hidden rounded-[24px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_8px_30px_rgba(58,33,23,0.04)] transition-all duration-300 hover:border-[#6B4228]/20 hover:shadow-[0_14px_40px_rgba(58,33,23,0.07)]'
                        }
                      >
                        <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">

                          {/* IMAGE */}
                          <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#EFE9E3] sm:h-36 sm:w-32">
                            <img
                              src={item.product?.image}
                              alt={item.product?.name || 'Cart product'}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          </div>

                          {/* INFO */}
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {item.product?.category && (
                                  <p
                                    className={
                                      isDark
                                        ? 'text-[9px] font-semibold uppercase tracking-[0.18em] text-[#D7A987]'
                                        : 'text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]'
                                    }
                                  >
                                    {item.product.category}
                                  </p>
                                )}

                                <h3
                                  className={
                                    isDark
                                      ? 'mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white sm:text-[15px]'
                                      : 'mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#281912] sm:text-[15px]'
                                  }
                                >
                                  {item.product?.name}
                                </h3>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveFromCart(item.id)
                                }
                                aria-label={`Remove ${item.product?.name || 'item'} from cart`}
                                className={
                                  isDark
                                    ? 'grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-stone-500 transition-colors hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-300'
                                    : 'grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#3A2117]/10 text-[#9A8171] transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
                                }
                              >
                                <Trash2 size={15} strokeWidth={1.7} />
                              </button>
                            </div>

                            {/* VARIANT DETAILS */}
                            {(item.bulbOption || item.colorVariant || item.shadeColor) && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.colorVariant && (
                                  <span
                                    className={
                                      isDark
                                        ? 'rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-stone-300'
                                        : 'rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] px-2.5 py-1 text-[10px] text-[#6B5A50]'
                                    }
                                  >
                                    Color: {item.colorVariant}
                                  </span>
                                )}
                                {item.shadeColor && (
                                  <span
                                    className={
                                      isDark
                                        ? 'rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-stone-300'
                                        : 'rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] px-2.5 py-1 text-[10px] text-[#6B5A50]'
                                    }
                                  >
                                    Shade: {item.shadeColor}
                                  </span>
                                )}
                                {item.bulbOption && (
                                  <span
                                    className={
                                      isDark
                                        ? 'rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] capitalize text-stone-300'
                                        : 'rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] px-2.5 py-1 text-[10px] capitalize text-[#6B5A50]'
                                    }
                                  >
                                    Bulb: {item.bulbOption}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
                              {/* QUANTITY */}
                              <div>
                                <p
                                  className={
                                    isDark
                                      ? 'mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500'
                                      : 'mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9A8171]'
                                  }
                                >
                                  Quantity
                                </p>

                                <div
                                  className={
                                    isDark
                                      ? 'inline-flex h-10 items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04]'
                                      : 'inline-flex h-10 items-center overflow-hidden rounded-full border border-[#3A2117]/10 bg-[#F7F4EF]'
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateCartQuantity(
                                        item.id,
                                        Math.max(1, item.quantity - 1)
                                      )
                                    }
                                    disabled={item.quantity <= 1}
                                    className={
                                      isDark
                                        ? 'grid h-full w-10 place-items-center text-stone-300 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30'
                                        : 'grid h-full w-10 place-items-center text-[#3A2117] transition-colors hover:bg-[#ECE3DB] disabled:cursor-not-allowed disabled:opacity-30'
                                    }
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={14} />
                                  </button>

                                  <input
                                    id={`qty-${item.id}`}
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleUpdateCartQuantity(
                                        item.id,
                                        Number(e.target.value) || 1
                                      )
                                    }
                                    aria-label="Quantity"
                                    className={
                                      isDark
                                        ? 'h-full w-10 border-x border-white/10 bg-transparent text-center text-xs font-semibold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                                        : 'h-full w-10 border-x border-[#3A2117]/10 bg-transparent text-center text-xs font-semibold text-[#281912] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                                    }
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateCartQuantity(
                                        item.id,
                                        item.quantity + 1
                                      )
                                    }
                                    className={
                                      isDark
                                        ? 'grid h-full w-10 place-items-center text-stone-300 transition-colors hover:bg-white/[0.06]'
                                        : 'grid h-full w-10 place-items-center text-[#3A2117] transition-colors hover:bg-[#ECE3DB]'
                                    }
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* PRICE */}
                              <div className="text-right">
                                <p
                                  className={
                                    isDark
                                      ? 'text-[10px] text-stone-500'
                                      : 'text-[10px] text-[#9A8171]'
                                  }
                                >
                                  Rs.{formatPrice(unitPrice)} each
                                </p>

                                <p
                                  className={
                                    isDark
                                      ? 'mt-0.5 text-base font-semibold text-white'
                                      : 'mt-0.5 text-base font-semibold text-[#281912]'
                                  }
                                >
                                  Rs.{formatPrice(lineTotal)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>

              {/* ═══════════════ RIGHT — SUMMARY ═══════════════ */}
              <aside className="self-start lg:sticky lg:top-28">
                <div
                  className={
                    isDark
                      ? 'overflow-hidden rounded-[26px] border border-white/10 bg-[#29221E] shadow-2xl'
                      : 'overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_18px_55px_rgba(58,33,23,0.08)]'
                  }
                >
                  <div
                    className={
                      isDark
                        ? 'border-b border-white/10 bg-[#241A15] px-6 py-5'
                        : 'border-b border-[#3A2117]/10 bg-[#F2ECE5] px-6 py-5'
                    }
                  >
                    <p
                      className={
                        isDark
                          ? 'text-[9px] font-semibold uppercase tracking-[0.18em] text-[#D7A987]'
                          : 'text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]'
                      }
                    >
                      Your Order
                    </p>

                    <h2
                      className={
                        isDark
                          ? 'mt-1 text-xl font-semibold text-white'
                          : 'mt-1 text-xl font-semibold text-[#281912]'
                      }
                    >
                      Order Summary
                    </h2>
                  </div>

                  <div className="px-6 py-6">
                    <div
                      className={
                        isDark
                          ? 'space-y-4 text-sm text-stone-300'
                          : 'space-y-4 text-sm text-[#6B5A50]'
                      }
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span>Subtotal</span>

                        <span
                          className={
                            isDark
                              ? 'font-medium text-white'
                              : 'font-medium text-[#281912]'
                          }
                        >
                          Rs.{formatPrice(cartTotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span>Estimated shipping</span>

                        <span
                          className={
                            shippingFee === 0
                              ? 'font-semibold text-emerald-700'
                              : isDark
                                ? 'font-medium text-white'
                                : 'font-medium text-[#281912]'
                          }
                        >
                          {shippingFee === 0
                            ? 'Free'
                            : `Rs.${formatPrice(shippingFee)}`}
                        </span>
                      </div>

                      <div
                        className={
                          isDark
                            ? 'my-2 border-t border-white/10'
                            : 'my-2 border-t border-[#3A2117]/10'
                        }
                      />

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p
                            className={
                              isDark
                                ? 'font-semibold text-white'
                                : 'font-semibold text-[#281912]'
                            }
                          >
                            Total
                          </p>

                          <p
                            className={
                              isDark
                                ? 'mt-0.5 text-[10px] text-stone-500'
                                : 'mt-0.5 text-[10px] text-[#9A8171]'
                            }
                          >
                            Shipping may update at checkout
                          </p>
                        </div>

                        <span
                          className={
                            isDark
                              ? 'text-xl font-semibold tracking-[-0.02em] text-white'
                              : 'text-xl font-semibold tracking-[-0.02em] text-[#281912]'
                          }
                        >
                          Rs.{formatPrice(grandTotal)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onCheckout?.()}
                      className="
                        group mt-6 inline-flex min-h-[50px] w-full
                        items-center justify-center gap-2
                        rounded-full bg-[#3A2117]
                        px-6 py-3 text-sm font-semibold text-white
                        shadow-[0_12px_30px_rgba(58,33,23,0.20)]
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:bg-[#4A2B1F]
                        hover:shadow-[0_16px_34px_rgba(58,33,23,0.25)]
                      "
                    >
                      Proceed to Checkout

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/products')}
                      className={
                        isDark
                          ? 'mt-3 inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-white/10 px-6 py-3 text-xs font-semibold text-stone-300 transition-colors hover:bg-white/[0.05] hover:text-white'
                          : 'mt-3 inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-[#3A2117]/15 px-6 py-3 text-xs font-semibold text-[#3A2117] transition-colors hover:bg-[#F7F4EF]'
                      }
                    >
                      Continue Shopping
                    </button>

                    {/* TRUST */}
                    <div
                      className={
                        isDark
                          ? 'mt-6 space-y-3 border-t border-white/10 pt-5'
                          : 'mt-6 space-y-3 border-t border-[#3A2117]/10 pt-5'
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Truck
                          size={16}
                          strokeWidth={1.6}
                          className={
                            isDark
                              ? 'text-[#D7A987]'
                              : 'text-[#6B4228]'
                          }
                        />

                        <p
                          className={
                            isDark
                              ? 'text-[11px] text-stone-400'
                              : 'text-[11px] text-[#7A6A60]'
                          }
                        >
                          Carefully packed & delivered across Pakistan
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <RotateCcw
                          size={16}
                          strokeWidth={1.6}
                          className={
                            isDark
                              ? 'text-[#D7A987]'
                              : 'text-[#6B4228]'
                          }
                        />

                        <p
                          className={
                            isDark
                              ? 'text-[11px] text-stone-400'
                              : 'text-[11px] text-[#7A6A60]'
                          }
                        >
                          7-day return support
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <ShieldCheck
                          size={16}
                          strokeWidth={1.6}
                          className={
                            isDark
                              ? 'text-[#D7A987]'
                              : 'text-[#6B4228]'
                          }
                        />

                        <p
                          className={
                            isDark
                              ? 'text-[11px] text-stone-400'
                              : 'text-[11px] text-[#7A6A60]'
                          }
                        >
                          Secure checkout & order processing
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  )
}