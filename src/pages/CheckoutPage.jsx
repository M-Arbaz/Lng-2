'use client'

import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from '@/lib/navigation'
import { useAuth } from '../context/AuthContext'
import classNames from '../utils/classNames.js'
import bankDetailsService from '../utils/bankDetailsService'
import shippingService from '../utils/shippingService'

export default function CheckoutPage({ cart, cartTotal, onPlaceOrder }) {
  const navigate = useNavigate()
  const { user, isLoggedIn, updateProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [placedOrderId, setPlacedOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  // No default payment method - user must explicitly choose one
  const [paymentMethod, setPaymentMethod] = useState('')
  const [bankDetails, setBankDetails] = useState(null)
  const [shippingSettings, setShippingSettings] = useState({ cities: [], freeShippingThreshold: 15000 })
  const [shippingLoading, setShippingLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [billingAddressLine1, setBillingAddressLine1] = useState('')
  const [billingAddressLine2, setBillingAddressLine2] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingState, setBillingState] = useState('')
  const [billingPostalCode, setBillingPostalCode] = useState('')
  const checkoutSteps = [
    { id: 1, label: 'Customer' },
    { id: 2, label: 'Address' },
    { id: 3, label: 'Shipping' },
    { id: 4, label: 'Payment' },
    { id: 5, label: 'Review' },
  ]

  const goToStep = (step) => {
    setError('')
    setCurrentStep(Math.min(5, Math.max(1, step)))

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    })
  }

  useEffect(() => {
    const loadBankDetails = async () => {
      const data = await bankDetailsService.getBankDetails()
      setBankDetails(data)
    }
    loadBankDetails()
  }, [])

  useEffect(() => {
    const loadShippingSettings = async () => {
      try {
        setShippingLoading(true)
        const data = await shippingService.getShippingSettings()
        setShippingSettings(data)
      } catch (err) {
        console.error('Error loading shipping settings:', err)
      } finally {
        setShippingLoading(false)
      }
    }
    loadShippingSettings()
  }, [])
  // Pre-fill checkout fields from logged-in customer profile.
  // Existing typed values are preserved, so the customer can still edit anything.
  useEffect(() => {
    if (!user) return

    const profileFullName =
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.displayName ||
      ''

    setFullName((prev) => prev || profileFullName)
    setPhone((prev) => prev || user.mobile || '')
    setEmail((prev) => prev || user.email || '')
    setAddressLine1((prev) => prev || user.addressLine1 || '')
    setAddressLine2((prev) => prev || user.addressLine2 || '')
    setState((prev) => prev || user.state || '')
    setPostalCode((prev) => prev || user.postalCode || '')

    setCity((prev) => {
      if (prev) return prev

      const savedCity = String(user.city || '').trim()
      if (!savedCity) return ''

      const matchedCity = shippingSettings.cities.find(
        (item) =>
          String(item.name || '').trim().toLowerCase() ===
          savedCity.toLowerCase()
      )

      return matchedCity?.name || ''
    })
  }, [user, shippingSettings.cities])
  const formatPKR = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return '0'
    return value.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  const parseNumericTotal = (val) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return 0
    return val
  }

  const numericTotal = parseNumericTotal(cartTotal)
  const freeShippingThreshold = shippingSettings.freeShippingThreshold ?? 15000
  const qualifiesForFreeShipping = numericTotal === 0 || numericTotal >= freeShippingThreshold
  const selectedCityRate = shippingSettings.cities.find((c) => c.name === city)
  const cityShippingFee = selectedCityRate ? Number(selectedCityRate.fee) || 0 : 0

  // shipping is:
  //  - 0 if the order qualifies for free shipping (regardless of city)
  //  - null if a city hasn't been chosen yet and the order doesn't qualify for free shipping
  //  - the selected city's fee otherwise
  const shipping = qualifiesForFreeShipping ? 0 : city ? cityShippingFee : null
  const grandTotal = numericTotal + (shipping || 0)
  const validateCustomerStep = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return false
    }

    const cleanPhone = phone.replace(/\D/g, '')

    if (!phone.trim() || cleanPhone.length < 10) {
      setError('Please enter a valid phone number.')
      return false
    }

    if (
      email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setError('Please enter a valid email address.')
      return false
    }

    return true
  }

  const validateAddressStep = () => {
    if (!addressLine1.trim()) {
      setError('Please enter your delivery address.')
      return false
    }

    if (!city) {
      setError('Please select your delivery city.')
      return false
    }

    if (!billingSameAsShipping) {
      if (!billingAddressLine1.trim()) {
        setError('Please enter your billing address.')
        return false
      }

      if (!billingCity.trim()) {
        setError('Please enter your billing city.')
        return false
      }
    }

    return true
  }

  const validateShippingStep = () => {
    if (!city) {
      setError('Please select your delivery city first.')
      return false
    }

    if (
      !qualifiesForFreeShipping &&
      shipping === null
    ) {
      setError('Shipping charges could not be calculated.')
      return false
    }

    return true
  }

  const validatePaymentStep = () => {
    if (!paymentMethod) {
      setError('Please select a payment method.')
      return false
    }

    return true
  }

  const handleNextStep = () => {
    setError('')

    if (
      currentStep === 1 &&
      !validateCustomerStep()
    ) {
      return
    }

    if (
      currentStep === 2 &&
      !validateAddressStep()
    ) {
      return
    }

    if (
      currentStep === 3 &&
      !validateShippingStep()
    ) {
      return
    }

    if (
      currentStep === 4 &&
      !validatePaymentStep()
    ) {
      return
    }

    goToStep(currentStep + 1)
  }

  const handlePreviousStep = () => {
    goToStep(currentStep - 1)
  }
  const handleSubmit = async () => {
    if (!isLoggedIn()) {
      setError('Please login to place an order.')
      navigate('/login')
      return
    }

    if (cart.length === 0) {
      setError('Your cart is empty.')
      return
    }

    const required = [fullName, phone, addressLine1, city]
    if (required.some((v) => !String(v).trim())) {
      setError('Please fill in required address details.')
      return
    }

    if (!paymentMethod) {
      setError('Please select a payment method.')
      return
    }

    setError('')
    setLoading(true)

    const order = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      note: note.trim(),
      paymentMethod,

      shippingMethod: {
        id: 'standard',
        name: 'Standard Delivery',
        city: city.trim(),
        fee: shipping || 0,
      },

      billingSameAsShipping,

      billingAddress: billingSameAsShipping
        ? {
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
        }
        : {
          addressLine1: billingAddressLine1.trim(),
          addressLine2: billingAddressLine2.trim(),
          city: billingCity.trim(),
          state: billingState.trim(),
          postalCode: billingPostalCode.trim(),
        },

      items: cart.map((item) => ({
        id: item.id,
        productId: item.product?.id,
        name: item.product?.name,
        image: item.product?.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? item.product?.price,
        colorVariant: item.colorVariant || null,
        shadeColor: item.shadeColor || null,
        bulbOption: item.bulbOption || null,
      })),
      subtotal: numericTotal,
      shipping: shipping || 0,
      total: grandTotal,
    }

    try {
      const orderId = await onPlaceOrder(order)

      if (orderId) {
        // Save only the profile information that the logged-in user
        // does not already have.
        if (user) {
          const trimmedFullName = fullName.trim()
          const nameParts = trimmedFullName.split(/\s+/).filter(Boolean)

          const checkoutFirstName = nameParts[0] || ''
          const checkoutLastName = nameParts.slice(1).join(' ')

          const profileUpdates = {}

          if (!String(user.firstName || '').trim() && checkoutFirstName) {
            profileUpdates.firstName = checkoutFirstName
          }

          if (!String(user.lastName || '').trim() && checkoutLastName) {
            profileUpdates.lastName = checkoutLastName
          }

          if (!String(user.displayName || '').trim() && trimmedFullName) {
            profileUpdates.displayName = trimmedFullName
          }

          if (!String(user.mobile || '').trim() && phone.trim()) {
            profileUpdates.mobile = phone.trim()
          }

          if (!String(user.addressLine1 || '').trim() && addressLine1.trim()) {
            profileUpdates.addressLine1 = addressLine1.trim()
          }

          if (!String(user.addressLine2 || '').trim() && addressLine2.trim()) {
            profileUpdates.addressLine2 = addressLine2.trim()
          }

          if (!String(user.city || '').trim() && city.trim()) {
            profileUpdates.city = city.trim()
          }

          if (!String(user.state || '').trim() && state.trim()) {
            profileUpdates.state = state.trim()
          }

          if (!String(user.postalCode || '').trim() && postalCode.trim()) {
            profileUpdates.postalCode = postalCode.trim()
          }

          if (Object.keys(profileUpdates).length > 0) {
            try {
              await updateProfile(profileUpdates)
            } catch (profileError) {
              // Profile save failure should never cancel an already placed order.
              console.error(
                'Checkout profile auto-save failed:',
                profileError
              )
            }
          }
        }

        setPlacedOrderId(String(orderId))
      } else {
        setError('Failed to place order. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (placedOrderId || (placedOrderId === '' && cart.length === 0)) {
    return (
      <main className="min-h-screen bg-[#F7F4EF] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">

          {/* SUCCESS CARD */}
          <div className="overflow-hidden rounded-[32px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_24px_80px_rgba(58,33,23,0.10)]">

            {/* TOP SUCCESS AREA */}
            <div className="relative overflow-hidden bg-[#3A2117] px-6 py-10 text-center text-white sm:px-10 sm:py-12">
              <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/[0.04]" />
              <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/[0.03]" />

              <div className="relative">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/15 bg-white/[0.08] shadow-[0_14px_35px_rgba(0,0,0,0.16)]">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-[#FFFEFC] text-[#3A2117]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                </div>

                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D9BFAE]">
                  Order Confirmed
                </p>

                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  Thank You{fullName ? `, ${fullName.split(' ')[0]}` : ''}!
                </h1>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70">
                  Your order has been successfully placed. Our team will review
                  your order and contact you shortly to confirm the details.
                </p>
              </div>
            </div>

            {/* ORDER NUMBER */}
            <div className="border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                    Order Number
                  </p>

                  <p className="mt-1 text-base font-semibold text-[#281912]">
                    {placedOrderId ? `#${placedOrderId}` : 'Order confirmed'}
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />

                  <span className="text-[10px] font-semibold text-emerald-800">
                    Successfully submitted
                  </span>
                </div>
              </div>
            </div>

            {/* DETAILS */}
            <div className="p-5 sm:p-8">

              <div className="grid gap-4 sm:grid-cols-2">

                {/* PAYMENT */}
                <div className="rounded-[22px] border border-[#3A2117]/10 bg-[#F7F4EF] p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#3A2117] text-white">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </div>

                  <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8A654D]">
                    Payment Method
                  </p>

                  <h3 className="mt-1 text-sm font-semibold text-[#281912]">
                    {paymentMethod === 'cod'
                      ? 'Cash on Delivery'
                      : 'Bank Deposit'}
                  </h3>

                  {paymentMethod === 'cod' ? (
                    <p className="mt-2 text-xs leading-5 text-[#7A6A60]">
                      {bankDetails
                        ? `${bankDetails.codAdvancePercent || 50}% advance payment is required. The remaining balance will be collected on delivery.`
                        : 'The remaining payment will be collected when your order is delivered.'}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-[#7A6A60]">
                      Please complete the bank transfer and share your payment
                      receipt with us for confirmation.
                    </p>
                  )}
                </div>

                {/* DELIVERY */}
                <div className="rounded-[22px] border border-[#3A2117]/10 bg-[#F7F4EF] p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#3A2117] text-white">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M3 6h11v11H3z" />
                      <path d="M14 10h4l3 3v4h-7z" />
                      <circle cx="7" cy="18" r="2" />
                      <circle cx="18" cy="18" r="2" />
                    </svg>
                  </div>

                  <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8A654D]">
                    Delivery
                  </p>

                  <h3 className="mt-1 text-sm font-semibold text-[#281912]">
                    {city || 'Delivery Address'}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[#7A6A60]">
                    Our team will confirm your order and delivery timeline shortly.
                  </p>
                </div>
              </div>

              {/* ORDER TOTAL */}
              <div className="mt-4 rounded-[22px] border border-[#3A2117]/10 bg-[#FFFEFC] p-5">
                <div className="space-y-3 text-xs text-[#6B5A50]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Subtotal</span>

                    <span className="font-medium text-[#281912]">
                      Rs.{formatPKR(numericTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span>
                      Shipping{city ? ` (${city})` : ''}
                    </span>

                    <span
                      className={
                        !shipping
                          ? 'font-semibold text-emerald-700'
                          : 'font-medium text-[#281912]'
                      }
                    >
                      {!shipping
                        ? 'Free'
                        : `Rs.${formatPKR(shipping)}`}
                    </span>
                  </div>

                  <div className="border-t border-[#3A2117]/10 pt-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#281912]">
                          Order Total
                        </p>

                        <p className="mt-0.5 text-[9px] text-[#9A8171]">
                          Final submitted amount
                        </p>
                      </div>

                      <p className="text-xl font-semibold tracking-[-0.03em] text-[#281912]">
                        Rs.{formatPKR(grandTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHATSAPP REMINDER */}
              {(paymentMethod === 'bank' || paymentMethod === 'cod') && (
                <div className="mt-4 rounded-[22px] border border-emerald-700/15 bg-emerald-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-700 text-white">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M21 11.5a8.4 8.4 0 01-9 8.5 9 9 0 01-4-.9L3 21l1.8-4.7A8.6 8.6 0 013 11.5a9 9 0 0118 0z" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        Payment Confirmation
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-900/70">
                        After making your payment, share the payment screenshot
                        with us on WhatsApp at{' '}
                        <strong className="font-semibold">
                          0309-9164751
                        </strong>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* NEXT STEP */}
              <div className="mt-6 rounded-[22px] bg-[#EEE5DC] px-5 py-5 text-center sm:px-7">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                  What Happens Next?
                </p>

                <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#6B5A50]">
                  Your order is now in our system. You can view it from your
                  account, and our team will keep you updated as it moves through
                  confirmation and delivery.
                </p>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="
                  inline-flex min-h-[50px] items-center justify-center gap-2
                  rounded-full bg-[#3A2117]
                  px-6 text-sm font-semibold text-white
                  shadow-[0_12px_28px_rgba(58,33,23,0.18)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#4A2B1F]
                "
                >
                  View My Order

                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="
                  inline-flex min-h-[50px] items-center justify-center
                  rounded-full border border-[#3A2117]/15
                  bg-[#FFFEFC] px-6
                  text-sm font-semibold text-[#3A2117]
                  transition-colors hover:bg-[#F7F4EF]
                "
                >
                  Continue Shopping
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-4 w-full text-center text-[11px] font-medium text-[#8A7569] transition-colors hover:text-[#3A2117]"
              >
                Back to Home
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] leading-5 text-[#9A8171]">
            Thank you for choosing Lamp & Glow — we look forward to bringing
            warmth to your space.
          </p>
        </div>
      </main>
    )
  }

  const advancePercent = bankDetails?.codAdvancePercent ?? 50
  const advanceAmount = Math.round(grandTotal * (advancePercent / 100))
  const codAmount = grandTotal - advanceAmount

  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#281912]">

      {/* ═══════════════ CHECKOUT HERO ═══════════════ */}
      <section className="border-b border-[#3A2117]/10 bg-[#FFFEFC]">
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-14 lg:px-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#7A6559] transition-colors hover:text-[#3A2117]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M19 12H5" />
              <path d="M11 18l-6-6 6-6" />
            </svg>

            Back to cart
          </button>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] px-3 py-1.5">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 text-[#6B4228]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M9 8h6M9 12h6M9 16h4" />
                </svg>

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A5945]">
                  Secure Checkout
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#281912] sm:text-4xl">
                Complete Your Order
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#7A6A60]">
                Add your delivery details, choose a payment method and review
                everything before placing your order.
              </p>
            </div>

            <div className="hidden items-center gap-2 text-[11px] font-medium text-[#8A7569] sm:flex">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-[#6B4228]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>

              Your information is handled securely
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CHECKOUT PROGRESS ═══════════════ */}
      <section className="border-b border-[#3A2117]/10 bg-[#F2ECE5]">
        <div className="mx-auto w-full max-w-[1400px] overflow-x-auto px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-[760px] items-start py-5">
            {checkoutSteps.map((step, index) => {
              const completed = currentStep > step.id
              const active = currentStep === step.id

              return (
                <div
                  key={step.id}
                  className="flex flex-1 items-start last:flex-none"
                >
                  <button
                    type="button"
                    onClick={() => {
                      // Customer can go back to completed sections,
                      // but cannot skip unfinished steps.
                      if (step.id <= currentStep) {
                        goToStep(step.id)
                      }
                    }}
                    className={classNames(
                      'group flex shrink-0 items-center gap-2.5 text-left',
                      step.id <= currentStep
                        ? 'cursor-pointer'
                        : 'cursor-default',
                    )}
                  >
                    <div
                      className={classNames(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px] font-semibold transition-all',
                        completed &&
                        'border-[#6B4228] bg-[#6B4228] text-white',
                        active &&
                        'border-[#3A2117] bg-[#3A2117] text-white shadow-[0_0_0_4px_rgba(58,33,23,0.08)]',
                        !completed &&
                        !active &&
                        'border-[#3A2117]/15 bg-[#FFFEFC] text-[#9A8171]',
                      )}
                    >
                      {completed ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12l4 4L19 6" />
                        </svg>
                      ) : (
                        String(step.id).padStart(2, '0')
                      )}
                    </div>

                    <div>
                      <p
                        className={classNames(
                          'whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.13em]',
                          active
                            ? 'text-[#281912]'
                            : completed
                              ? 'text-[#6B4228]'
                              : 'text-[#9A8171]',
                        )}
                      >
                        {step.label}
                      </p>

                      <p className="mt-0.5 whitespace-nowrap text-[8px] text-[#A08D81]">
                        {completed
                          ? 'Completed'
                          : active
                            ? 'Current step'
                            : 'Upcoming'}
                      </p>
                    </div>
                  </button>

                  {index < checkoutSteps.length - 1 && (
                    <div
                      className={classNames(
                        'mx-4 mt-4 h-px min-w-8 flex-1 transition-colors',
                        currentStep > step.id
                          ? 'bg-[#6B4228]/60'
                          : 'bg-[#3A2117]/10',
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-100">
              !
            </div>

            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-10">

          {/* ═══════════════ LEFT COLUMN ═══════════════ */}
          <div className="space-y-6">

            {/* ═══════════════ STEP 01 — CUSTOMER ═══════════════ */}
            {currentStep === 1 && (
              <section className="overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_12px_40px_rgba(58,33,23,0.05)]">
                <div className="border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-7">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                    Step 01
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[#281912]">
                    Customer Information
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[#7A6A60]">
                    Tell us who we should contact about this order.
                  </p>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[11px] font-semibold text-[#4C3A31]">
                        Full name <span className="text-rose-500">*</span>
                      </label>

                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="h-12 w-full rounded-xl border border-[#3A2117]/15 bg-[#F7F4EF] px-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A39287] focus:border-[#6B4228] focus:bg-[#FFFEFC] focus:ring-4 focus:ring-[#6B4228]/[0.06]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold text-[#4C3A31]">
                        Phone number <span className="text-rose-500">*</span>
                      </label>

                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="03xx xxxxxxx"
                        className="h-12 w-full rounded-xl border border-[#3A2117]/15 bg-[#F7F4EF] px-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A39287] focus:border-[#6B4228] focus:bg-[#FFFEFC] focus:ring-4 focus:ring-[#6B4228]/[0.06]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-[11px] font-semibold text-[#4C3A31]">
                        Email
                        <span className="ml-1 font-normal text-[#9A8171]">
                          (optional)
                        </span>
                      </label>

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-12 w-full rounded-xl border border-[#3A2117]/15 bg-[#F7F4EF] px-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A39287] focus:border-[#6B4228] focus:bg-[#FFFEFC] focus:ring-4 focus:ring-[#6B4228]/[0.06]"
                      />
                    </div>
                  </div>

                  <div className="mt-7 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#3A2117] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#4A2B1F]"
                    >
                      Continue to Address
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ═══════════════ STEP 02 — ADDRESS ═══════════════ */}
            {currentStep === 2 && (
              <section className="overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_12px_40px_rgba(58,33,23,0.05)]">
                <div className="border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-7">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                    Step 02
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[#281912]">
                    Shipping Address
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[#7A6A60]">
                    Where should we deliver your Lamp & Glow order?
                  </p>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold text-[#4C3A31]">
                        Delivery city <span className="text-rose-500">*</span>
                      </label>

                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={shippingLoading}
                        className="h-12 w-full rounded-xl border border-[#3A2117]/15 bg-[#F7F4EF] px-4 text-sm text-[#281912] outline-none focus:border-[#6B4228]"
                      >
                        <option value="">
                          {shippingLoading
                            ? 'Loading cities...'
                            : 'Select delivery city'}
                        </option>

                        {shippingSettings.cities.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold text-[#4C3A31]">
                        State / Province
                      </label>

                      <input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Punjab"
                        className="h-12 w-full rounded-xl border border-[#3A2117]/15 bg-[#F7F4EF] px-4 text-sm text-[#281912] outline-none focus:border-[#6B4228]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-[11px] font-semibold text-[#4C3A31]">
                        Address line 1 <span className="text-rose-500">*</span>
                      </label>

                      <input
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="House, street, area"
                        className="h-12 w-full rounded-xl border border-[#3A2117]/15 bg-[#F7F4EF] px-4 text-sm text-[#281912] outline-none focus:border-[#6B4228]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-[11px] font-semibold text-[#4C3A31]">
                        Address line 2
                        <span className="ml-1 font-normal text-[#9A8171]">
                          (optional)
                        </span>
                      </label>

                      <input
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Apartment, floor, landmark"
                        className="h-12 w-full rounded-xl border border-[#3A2117]/15 bg-[#F7F4EF] px-4 text-sm text-[#281912] outline-none focus:border-[#6B4228]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] font-semibold text-[#4C3A31]">
                        Postal code
                      </label>

                      <input
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="54000"
                        className="h-12 w-full rounded-xl border border-[#3A2117]/15 bg-[#F7F4EF] px-4 text-sm text-[#281912] outline-none focus:border-[#6B4228]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-[11px] font-semibold text-[#4C3A31]">
                        Delivery instructions
                        <span className="ml-1 font-normal text-[#9A8171]">
                          (optional)
                        </span>
                      </label>

                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        placeholder="Landmark or special instructions..."
                        className="w-full resize-none rounded-xl border border-[#3A2117]/15 bg-[#F7F4EF] px-4 py-3 text-sm leading-6 text-[#281912] outline-none focus:border-[#6B4228]"
                      />
                    </div>
                  </div>

                  {/* BILLING TOGGLE */}
                  <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-4">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) =>
                        setBillingSameAsShipping(e.target.checked)
                      }
                      className="h-4 w-4 accent-[#3A2117]"
                    />

                    <div>
                      <p className="text-xs font-semibold text-[#281912]">
                        Billing address same as shipping address
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#8A7569]">
                        Uncheck this if your billing address is different.
                      </p>
                    </div>
                  </label>

                  {!billingSameAsShipping && (
                    <div className="mt-5 rounded-[22px] border border-[#3A2117]/10 bg-[#F7F4EF] p-5">
                      <p className="mb-4 text-sm font-semibold text-[#281912]">
                        Billing Address
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          value={billingAddressLine1}
                          onChange={(e) =>
                            setBillingAddressLine1(e.target.value)
                          }
                          placeholder="Address line 1 *"
                          className="h-11 rounded-xl border border-[#3A2117]/15 bg-[#FFFEFC] px-4 text-sm outline-none focus:border-[#6B4228] sm:col-span-2"
                        />

                        <input
                          value={billingAddressLine2}
                          onChange={(e) =>
                            setBillingAddressLine2(e.target.value)
                          }
                          placeholder="Address line 2"
                          className="h-11 rounded-xl border border-[#3A2117]/15 bg-[#FFFEFC] px-4 text-sm outline-none focus:border-[#6B4228] sm:col-span-2"
                        />

                        <input
                          value={billingCity}
                          onChange={(e) =>
                            setBillingCity(e.target.value)
                          }
                          placeholder="City *"
                          className="h-11 rounded-xl border border-[#3A2117]/15 bg-[#FFFEFC] px-4 text-sm outline-none focus:border-[#6B4228]"
                        />

                        <input
                          value={billingState}
                          onChange={(e) =>
                            setBillingState(e.target.value)
                          }
                          placeholder="State / Province"
                          className="h-11 rounded-xl border border-[#3A2117]/15 bg-[#FFFEFC] px-4 text-sm outline-none focus:border-[#6B4228]"
                        />

                        <input
                          value={billingPostalCode}
                          onChange={(e) =>
                            setBillingPostalCode(e.target.value)
                          }
                          placeholder="Postal code"
                          className="h-11 rounded-xl border border-[#3A2117]/15 bg-[#FFFEFC] px-4 text-sm outline-none focus:border-[#6B4228]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-7 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="min-h-[46px] rounded-full border border-[#3A2117]/15 px-6 text-xs font-semibold text-[#3A2117]"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="min-h-[48px] rounded-full bg-[#3A2117] px-7 text-sm font-semibold text-white hover:bg-[#4A2B1F]"
                    >
                      Continue to Shipping →
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ═══════════════ STEP 03 — SHIPPING ═══════════════ */}
            {currentStep === 3 && (
              <section className="overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_12px_40px_rgba(58,33,23,0.05)]">
                <div className="border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-7">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                    Step 03
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[#281912]">
                    Shipping Method
                  </h2>

                  <p className="mt-1 text-xs text-[#7A6A60]">
                    Review your available delivery option.
                  </p>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="rounded-[22px] border-2 border-[#3A2117] bg-[#F7F4EF] p-5">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-[#3A2117]">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#281912]">
                              Standard Delivery
                            </p>

                            <p className="mt-1 text-xs text-[#7A6A60]">
                              Delivery to {city}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-[#6B4228]">
                            {shipping === 0
                              ? 'Free'
                              : shipping === null
                                ? 'Calculating...'
                                : `Rs.${formatPKR(shipping)}`}
                          </p>
                        </div>

                        {qualifiesForFreeShipping && (
                          <p className="mt-3 text-[10px] font-medium text-emerald-700">
                            Your order qualifies for free shipping.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#EEE5DC] p-4">
                    <p className="text-[10px] leading-5 text-[#6B5A50]">
                      Our team will confirm the exact delivery timeline after your
                      order is reviewed.
                    </p>
                  </div>

                  <div className="mt-7 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="min-h-[46px] rounded-full border border-[#3A2117]/15 px-6 text-xs font-semibold text-[#3A2117]"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="min-h-[48px] rounded-full bg-[#3A2117] px-7 text-sm font-semibold text-white hover:bg-[#4A2B1F]"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ═══════════════ STEP 04 — PAYMENT ═══════════════ */}
            {currentStep === 4 && (
              <section className="overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_12px_40px_rgba(58,33,23,0.05)]">
                <div className="border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-7">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                    Step 04
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[#281912]">
                    Payment Method
                  </h2>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['cod', 'Cash on Delivery', 'Pay the remaining balance when your order arrives.'],
                      ['bank', 'Bank Deposit', 'Transfer the payment directly to our bank account.'],
                    ].map(([value, title, description]) => (
                      <label
                        key={value}
                        className={classNames(
                          'cursor-pointer rounded-2xl border p-4 transition-all',
                          paymentMethod === value
                            ? 'border-[#3A2117] bg-[#F2ECE5]'
                            : 'border-[#3A2117]/10 hover:border-[#6B4228]/35',
                        )}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={value}
                          checked={paymentMethod === value}
                          onChange={(e) =>
                            setPaymentMethod(e.target.value)
                          }
                          className="sr-only"
                        />

                        <div className="flex gap-3">
                          <div
                            className={classNames(
                              'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border',
                              paymentMethod === value
                                ? 'border-[#3A2117] bg-[#3A2117]'
                                : 'border-[#3A2117]/25',
                            )}
                          >
                            {paymentMethod === value && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#281912]">
                              {title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#7A6A60]">
                              {description}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {(paymentMethod === 'bank' ||
                    paymentMethod === 'cod') &&
                    bankDetails && (
                      <div className="mt-5 overflow-hidden rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF]">
                        <div className="border-b border-[#3A2117]/10 px-5 py-4">
                          <p className="text-sm font-semibold text-[#281912]">
                            Bank Account Details
                          </p>
                        </div>

                        <div className="divide-y divide-[#3A2117]/10 px-5">
                          {[
                            ['Bank Name', bankDetails.bankName],
                            ['Account Title', bankDetails.accountTitle],
                            ['Account Number', bankDetails.accountNumber],
                            ['IBAN', bankDetails.iban],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="flex justify-between gap-5 py-3 text-xs"
                            >
                              <span className="text-[#8A7569]">
                                {label}
                              </span>

                              <span className="break-all text-right font-semibold text-[#3A2117]">
                                {value || '—'}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-[#3A2117]/10 bg-[#EEE5DC] px-5 py-4">
                          {paymentMethod === 'bank' ? (
                            <p className="text-xs font-semibold text-[#3A2117]">
                              Amount to transfer: Rs.{formatPKR(grandTotal)}
                            </p>
                          ) : (
                            <>
                              <p className="text-xs font-semibold text-[#3A2117]">
                                Advance required: Rs.{formatPKR(advanceAmount)} ({advancePercent}%)
                              </p>

                              <p className="mt-1 text-[10px] text-[#7A6559]">
                                Remaining Rs.{formatPKR(codAmount)} will be collected on delivery.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="mt-7 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="min-h-[46px] rounded-full border border-[#3A2117]/15 px-6 text-xs font-semibold text-[#3A2117]"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="min-h-[48px] rounded-full bg-[#3A2117] px-7 text-sm font-semibold text-white hover:bg-[#4A2B1F]"
                    >
                      Review Order →
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ═══════════════ STEP 05 — REVIEW ═══════════════ */}
            {currentStep === 5 && (
              <section className="overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_12px_40px_rgba(58,33,23,0.05)]">
                <div className="border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-7">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                    Step 05
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[#281912]">
                    Review Your Order
                  </h2>

                  <p className="mt-1 text-xs text-[#7A6A60]">
                    Confirm everything before placing your order.
                  </p>
                </div>

                <div className="space-y-4 p-5 sm:p-7">

                  {[
                    {
                      title: 'Customer',
                      step: 1,
                      content: (
                        <>
                          <p>{fullName}</p>
                          <p>{phone}</p>
                          {email && <p>{email}</p>}
                        </>
                      ),
                    },
                    {
                      title: 'Shipping Address',
                      step: 2,
                      content: (
                        <>
                          <p>{addressLine1}</p>
                          {addressLine2 && <p>{addressLine2}</p>}
                          <p>
                            {[city, state, postalCode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </>
                      ),
                    },
                    {
                      title: 'Shipping Method',
                      step: 3,
                      content: (
                        <p>
                          Standard Delivery —{' '}
                          {shipping === 0
                            ? 'Free'
                            : `Rs.${formatPKR(shipping || 0)}`}
                        </p>
                      ),
                    },
                    {
                      title: 'Payment',
                      step: 4,
                      content: (
                        <p>
                          {paymentMethod === 'cod'
                            ? 'Cash on Delivery'
                            : 'Bank Deposit'}
                        </p>
                      ),
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start justify-between gap-5 rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-4"
                    >
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8A654D]">
                          {item.title}
                        </p>

                        <div className="mt-2 space-y-1 text-xs leading-5 text-[#5F4C42]">
                          {item.content}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => goToStep(item.step)}
                        className="shrink-0 text-[10px] font-semibold text-[#6B4228] underline underline-offset-4"
                      >
                        Edit
                      </button>
                    </div>
                  ))}

                  <div className="rounded-2xl border border-[#6B4228]/10 bg-[#EEE5DC] p-4">
                    <p className="text-xs leading-5 text-[#6B5A50]">
                      Review the products and final total in the Order Summary.
                      Once everything looks correct, place your order.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="min-h-[46px] rounded-full border border-[#3A2117]/15 px-6 text-xs font-semibold text-[#3A2117]"
                  >
                    ← Back to Payment
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* ═══════════════ RIGHT SUMMARY ═══════════════ */}
          <aside className="self-start lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_18px_55px_rgba(58,33,23,0.08)]">

              <div className="border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-6">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                  Step 04
                </p>

                <h2 className="mt-1 text-lg font-semibold text-[#281912]">
                  Order Summary
                </h2>
              </div>

              {/* PRODUCTS */}
              <div className="max-h-[320px] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                {cart.map((item) => {
                  const itemPrice =
                    item.unitPrice ?? item.product?.price ?? 0

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#EEE7E1]">
                        {item.product?.image && (
                          <img
                            src={item.product.image}
                            alt={item.product?.name || 'Product'}
                            className="h-full w-full object-cover"
                          />
                        )}

                        <div className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#3A2117] px-1 text-[9px] font-semibold text-white">
                          {item.quantity || 1}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-semibold leading-5 text-[#281912]">
                          {item.product?.name}
                        </p>

                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {item.colorVariant && (
                            <span className="rounded-full bg-[#F2ECE5] px-2 py-0.5 text-[9px] text-[#7A6559]">
                              Color: {item.colorVariant}
                            </span>
                          )}

                          {item.shadeColor && (
                            <span className="rounded-full bg-[#F2ECE5] px-2 py-0.5 text-[9px] text-[#7A6559]">
                              Shade: {item.shadeColor}
                            </span>
                          )}

                          {item.bulbOption && (
                            <span className="rounded-full bg-[#F2ECE5] px-2 py-0.5 text-[9px] capitalize text-[#7A6559]">
                              Bulb:{' '}
                              {item.bulbOption === 'with'
                                ? 'With Bulb'
                                : item.bulbOption === 'without'
                                  ? 'Without Bulb'
                                  : item.bulbOption}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs font-semibold text-[#6B4228]">
                          Rs.{formatPKR(itemPrice * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* TOTALS */}
              <div className="border-t border-[#3A2117]/10 px-5 py-5 sm:px-6">
                <div className="space-y-3 text-xs text-[#6B5A50]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Subtotal</span>

                    <span className="font-medium text-[#281912]">
                      Rs.{formatPKR(numericTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span>
                      Shipping
                      {city ? ` (${city})` : ''}
                    </span>

                    <span
                      className={classNames(
                        'font-medium',
                        shipping === 0
                          ? 'text-emerald-700'
                          : 'text-[#281912]',
                      )}
                    >
                      {shipping === null
                        ? 'Select city'
                        : shipping === 0
                          ? 'Free'
                          : `Rs.${formatPKR(shipping)}`}
                    </span>
                  </div>

                  {!qualifiesForFreeShipping && (
                    <div className="rounded-xl bg-[#F7F4EF] px-3 py-2.5 text-[10px] leading-4 text-[#8A654D]">
                      Free shipping on orders over Rs.
                      {formatPKR(freeShippingThreshold)}
                    </div>
                  )}

                  <div className="border-t border-[#3A2117]/10 pt-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#281912]">
                          Total
                        </p>

                        <p className="mt-0.5 text-[9px] text-[#9A8171]">
                          Including delivery charges
                        </p>
                      </div>

                      <p className="text-xl font-semibold tracking-[-0.03em] text-[#281912]">
                        Rs.{formatPKR(grandTotal)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PLACE ORDER */}
                <button
                  type="button"
                  onClick={
                    currentStep === 5
                      ? handleSubmit
                      : handleNextStep
                  }
                  disabled={
                    loading ||
                    (currentStep === 5 && (!paymentMethod || !city))
                  }
                  className="
                  mt-6 inline-flex min-h-[52px] w-full
                  items-center justify-center gap-2
                  rounded-full bg-[#3A2117]
                  px-6 text-sm font-semibold text-white
                  shadow-[0_12px_30px_rgba(58,33,23,0.20)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#4A2B1F]
                  hover:shadow-[0_16px_36px_rgba(58,33,23,0.25)]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:translate-y-0
                  disabled:hover:shadow-none
                "
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                        />
                      </svg>

                      Processing...
                    </>
                  ) : (
                    <>
                      {currentStep === 5
                        ? 'Place Order'
                        : currentStep === 1
                          ? 'Continue to Address'
                          : currentStep === 2
                            ? 'Continue to Shipping'
                            : currentStep === 3
                              ? 'Continue to Payment'
                              : 'Review Order'}

                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M5 12h14" />
                        <path d="M13 6l6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="mt-3 inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-[#3A2117]/15 bg-[#FFFEFC] px-6 text-xs font-semibold text-[#3A2117] transition-colors hover:bg-[#F7F4EF]"
                >
                  Continue Shopping
                </button>

                {/* TRUST */}
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#3A2117]/10 pt-5">
                  {[
                    ['Secure Checkout', 'shield'],
                    ['COD Available', 'cash'],
                    ['Order Tracking', 'track'],
                    ['Customer Support', 'support'],
                  ].map(([label]) => (
                    <div
                      key={label}
                      className="rounded-xl bg-[#F7F4EF] px-3 py-3 text-center"
                    >
                      <div className="mx-auto mb-1.5 h-1.5 w-1.5 rounded-full bg-[#6B4228]" />

                      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7A6559]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}