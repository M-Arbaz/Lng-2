'use client'

import {
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    Check,
    ShoppingBag,
    X,
} from 'lucide-react'
import { useNavigate } from '@/lib/navigation'

function formatPrice(value) {
    const price = Number(value)

    if (!Number.isFinite(price)) {
        return ''
    }

    return new Intl.NumberFormat('en-PK', {
        maximumFractionDigits: 0,
    }).format(price)
}

function formatBulb(value) {
    const normalized = String(
        value || ''
    ).toLowerCase()

    if (normalized === 'with') {
        return 'With Bulb'
    }

    if (normalized === 'without') {
        return 'Without Bulb'
    }

    return value
}

export default function CartAddedToast({
    notification,
    onClose,
    theme = 'light',
    headerHeight = 80,
}) {
    const navigate = useNavigate()
    const [visible, setVisible] =
        useState(false)

    const onCloseRef = useRef(onClose)

    useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])

    useEffect(() => {
        if (!notification) return

        const frame =
            window.requestAnimationFrame(
                () => {
                    setVisible(true)
                }
            )

        const exitTimer =
            window.setTimeout(() => {
                setVisible(false)
            }, 2500)

        const removeTimer =
            window.setTimeout(() => {
                onCloseRef.current?.()
            }, 2850)

        return () => {
            window.cancelAnimationFrame(
                frame
            )

            window.clearTimeout(
                exitTimer
            )

            window.clearTimeout(
                removeTimer
            )
        }
    }, [notification?.key])

    if (!notification) {
        return null
    }

    const isDark =
        theme === 'dark'

    const variants = [
        notification.colorVariant
            ? `Color: ${notification.colorVariant}`
            : '',
        notification.shadeColor
            ? `Shade: ${notification.shadeColor}`
            : '',
        notification.bulbOption
            ? formatBulb(
                notification.bulbOption
            )
            : '',
    ].filter(Boolean)

    const top =
        Math.max(
            Number(headerHeight) || 80,
            70
        ) + 42

    const handleViewCart = () => {
        setVisible(false)

        window.setTimeout(() => {
            onCloseRef.current?.()
            navigate('/cart')
        }, 180)
    }

    const handleClose = () => {
        setVisible(false)

        window.setTimeout(() => {
            onCloseRef.current?.()
        }, 180)
    }

    return (
        <div
            role="status"
            aria-live="polite"
            style={{ top }}
            className={`fixed right-3 z-[90] w-[calc(100vw-24px)] max-w-[380px] transform transition-all duration-500 ease-out sm:right-6 ${visible
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-[115%] opacity-0'
                }`}
        >
            <div
                className={`relative overflow-hidden rounded-[22px] border shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl ${isDark
                        ? 'border-white/10 bg-[#211A17]/95 text-white'
                        : 'border-[#3A2117]/10 bg-[#FFFEFC]/95 text-[#281912]'
                    }`}
            >
                {/* TOP STATUS */}
                <div
                    className={`flex items-center justify-between gap-3 border-b px-4 py-3.5 ${isDark
                            ? 'border-white/10'
                            : 'border-[#3A2117]/10'
                        }`}
                >
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isDark
                                    ? 'bg-[#EEE5DC] text-[#3A2117]'
                                    : 'bg-[#3A2117] text-white'
                                }`}
                        >
                            <Check
                                size={15}
                                strokeWidth={2.2}
                            />
                        </div>

                        <div className="min-w-0">
                            <p
                                className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${isDark
                                        ? 'text-[#D8AD87]'
                                        : 'text-[#8A654D]'
                                    }`}
                            >
                                Added to Cart
                            </p>

                            {notification.quantityAdded >
                                1 && (
                                    <p
                                        className={`mt-0.5 text-[9px] ${isDark
                                                ? 'text-stone-400'
                                                : 'text-[#8A7569]'
                                            }`}
                                    >
                                        {
                                            notification.quantityAdded
                                        }{' '}
                                        items added
                                    </p>
                                )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close notification"
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${isDark
                                ? 'text-stone-400 hover:bg-white/10 hover:text-white'
                                : 'text-[#8A7569] hover:bg-[#EEE5DC] hover:text-[#3A2117]'
                            }`}
                    >
                        <X
                            size={15}
                            strokeWidth={1.8}
                        />
                    </button>
                </div>

                {/* PRODUCT */}
                <div className="flex gap-3 p-4">
                    <div
                        className={`h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[14px] ${isDark
                                ? 'bg-[#302620]'
                                : 'bg-[#F2ECE6]'
                            }`}
                    >
                        {notification.image ? (
                            <img
                                src={
                                    notification.image
                                }
                                alt={
                                    notification.name
                                }
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div
                                className={`grid h-full w-full place-items-center ${isDark
                                        ? 'text-stone-500'
                                        : 'text-[#A58F80]'
                                    }`}
                            >
                                <ShoppingBag
                                    size={22}
                                    strokeWidth={1.5}
                                />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p
                            className={`line-clamp-2 text-[13px] font-semibold leading-5 ${isDark
                                    ? 'text-[#FFF8F1]'
                                    : 'text-[#281912]'
                                }`}
                        >
                            {notification.name}
                        </p>

                        {variants.length >
                            0 && (
                                <p
                                    className={`mt-1 line-clamp-2 text-[9px] leading-4 ${isDark
                                            ? 'text-stone-400'
                                            : 'text-[#8A7569]'
                                        }`}
                                >
                                    {variants.join(
                                        ' • '
                                    )}
                                </p>
                            )}

                        {Number.isFinite(
                            Number(
                                notification.unitPrice
                            )
                        ) && (
                                <p
                                    className={`mt-2 text-[11px] font-semibold ${isDark
                                            ? 'text-[#D8AD87]'
                                            : 'text-[#6B4228]'
                                        }`}
                                >
                                    PKR{' '}
                                    {formatPrice(
                                        notification.unitPrice
                                    )}
                                </p>
                            )}
                    </div>
                </div>

                {/* ACTION */}
                <div className="px-4 pb-4">
                    <button
                        type="button"
                        onClick={
                            handleViewCart
                        }
                        className={`flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] transition-all active:scale-[0.98] ${isDark
                                ? 'bg-[#EEE5DC] text-[#3A2117] hover:bg-white'
                                : 'bg-[#3A2117] text-white hover:bg-[#4A2B1F]'
                            }`}
                    >
                        <ShoppingBag
                            size={14}
                            strokeWidth={1.8}
                        />

                        View Cart
                    </button>
                </div>
            </div>
        </div>
    )
}