'use client'

import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from '@/lib/navigation'
import { useAuth } from '../context/AuthContext'
import classNames from '../utils/classNames.js'
import bankDetailsService from '../utils/bankDetailsService'
import shippingService from '../utils/shippingService'

export default function CheckoutPage({ cart, cartTotal, onPlaceOrder }) {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
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
      items: cart.map((item) => ({
        id: item.id,
        productId: item.product?.id,
        name: item.product?.name,
        image: item.product?.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice ?? item.product?.price,
        bulbOption: item.bulbOption,
      })),
      subtotal: numericTotal,
      shipping: shipping || 0,
      total: grandTotal,
    }

    try {
      const orderId = await onPlaceOrder(order)
      if (orderId) {
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
      <section className="w-full px-0 py-10 sm:py-14">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#FFD400]/20 p-6 sm:p-8 bg-[#7A4A20]">
            <p className="text-xs font-semibold text-white/80">
              Order placed
            </p>
            <h1 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Thank you for your order
            </h1>
            <p className="mt-3 text-sm text-white/70">
              {placedOrderId ? `Your order id is ${placedOrderId}.` : 'Your order has been created.'}
            </p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#FFD400]/20 p-4 bg-[#7A4A20]">
                <p className="text-xs font-semibold text-white/80">
                  Payment method
                </p>
                <div className="mt-3 space-y-2 text-sm text-white/70">
                  {paymentMethod === 'cod' ? (
                    <>
                      <p className="font-semibold">Cash on Delivery (COD)</p>
                      <p>Your order will arrive at your address. Please have the exact payment amount ready.</p>
                      {bankDetails && (
                        <p className="text-xs mt-1 text-amber-400">Note: {bankDetails.codAdvancePercent || 50}% advance payment required via Bank Deposit. Remaining balance paid on delivery.</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">Bank Deposit</p>
                      <p>Please transfer the full amount to our bank account. We will process your order once payment is confirmed.</p>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#FFD400]/20 p-4 bg-[#7A4A20]">
                <p className="text-xs font-semibold text-white/80">
                  Order summary
                </p>
                <div className="mt-3 space-y-1 text-xs text-white/70">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs.{formatPKR(numericTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping ({city})</span>
                    <span>{!shipping ? 'Free' : `Rs.${formatPKR(shipping)}`}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-[#FFD400]/20 mt-1">
                    <span>Total</span>
                    <span>Rs.{formatPKR(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center rounded-full bg-[#5A2D0C] px-5 py-2 text-xs font-semibold text-white hover:bg-[#FFD400]"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center rounded-full border border-[#FFD400]/20 px-5 py-2 text-xs font-semibold bg-transparent text-white hover:bg-[#7A4A20]/40"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const advancePercent = bankDetails?.codAdvancePercent ?? 50
  const advanceAmount = Math.round(grandTotal * (advancePercent / 100))
  const codAmount = grandTotal - advanceAmount

  return (
    <section className="w-full px-0 py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Checkout
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-white/70">
              Enter your delivery address. Payment will be collected on delivery.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold underline underline-offset-4 text-white/80 hover:text-white"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border p-4 text-xs border-rose-700 bg-rose-950/30 text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 items-start">
          <div className="rounded-3xl border-2 border-[#FFD400]/30 p-6 sm:p-8 bg-gradient-to-br from-[#7A4A20] to-[#5A2D0C] shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-[#FFD400] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#5A2D0C]" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[#FFD400]">
                Shipping details
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/80">
                  Full name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#FFD400]/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-[#5A2D0C] text-white focus:ring-[#FFD400] placeholder:text-white/40"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/80">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#FFD400]/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-[#5A2D0C] text-white focus:ring-[#FFD400] placeholder:text-white/40"
                  placeholder="03xx xxxxxxx"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/80">
                  Email (optional)
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#FFD400]/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-[#5A2D0C] text-white focus:ring-[#FFD400] placeholder:text-white/40"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/80">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={shippingLoading}
                  className="mt-2 w-full rounded-xl border border-[#FFD400]/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-[#5A2D0C] text-white focus:ring-[#FFD400] disabled:opacity-60"
                >
                  <option value="" className="text-black">
                    {shippingLoading ? 'Loading cities...' : 'Select city'}
                  </option>
                  {shippingSettings.cities.map((c) => (
                    <option key={c.id} value={c.name} className="text-black">
                      {c.name}
                    </option>
                  ))}
                </select>
                {!shippingLoading && shippingSettings.cities.length === 0 && (
                  <p className="mt-1 text-[10px] text-amber-400">
                    No delivery cities configured yet. Please contact support.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-white/80">
                  Address line 1
                </label>
                <input
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#FFD400]/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-[#5A2D0C] text-white focus:ring-[#FFD400] placeholder:text-white/40"
                  placeholder="Street, house, area"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-white/80">
                  Address line 2 (optional)
                </label>
                <input
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#FFD400]/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-[#5A2D0C] text-white focus:ring-[#FFD400] placeholder:text-white/40"
                  placeholder="Apartment, floor, landmark"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/80">
                  State (optional)
                </label>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#FFD400]/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-[#5A2D0C] text-white focus:ring-[#FFD400] placeholder:text-white/40"
                  placeholder="Punjab"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/80">
                  Postal code (optional)
                </label>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#FFD400]/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-[#5A2D0C] text-white focus:ring-[#FFD400] placeholder:text-white/40"
                  placeholder="57000"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-white/80">
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-[#FFD400]/20 px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-[#5A2D0C] text-white focus:ring-[#FFD400] placeholder:text-white/40"
                  placeholder="Any delivery instructions"
                />
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border-2 border-[#FFD400]/30 p-6 sm:p-8 bg-gradient-to-br from-[#7A4A20] to-[#5A2D0C] shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-[#FFD400] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#5A2D0C]" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[#FFD400]">
                Payment method
              </p>
            </div>

            {/* Payment Method Options - none selected by default */}
            <div className="mt-4 space-y-3">
              {/* Cash on Delivery */}
              <label
                className={classNames(
                  'flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition',
                  paymentMethod === 'cod'
                    ? 'border-amber-500 bg-amber-900/20'
                    : 'border-[#FFD400]/20 hover:border-[#FFD400]/30'
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-0.5 accent-amber-600"
                />
                <div className="text-sm">
                  <p className="font-semibold text-white/90">Cash on Delivery (COD)</p>
                  <p className="text-xs mt-0.5 text-white/60">Pay at your doorstep on delivery.</p>
                </div>
              </label>

              {/* Bank Deposit */}
              <label
                className={classNames(
                  'flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition',
                  paymentMethod === 'bank'
                    ? 'border-amber-500 bg-amber-900/20'
                    : 'border-[#FFD400]/20 hover:border-[#FFD400]/30'
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-0.5 accent-amber-600"
                />
                <div className="text-sm">
                  <p className="font-semibold text-white/90">Bank Deposit</p>
                  <p className="text-xs mt-0.5 text-white/60">Full payment via bank transfer before dispatch.</p>
                </div>
              </label>

              {/* Hint shown until the user picks a method */}
              {!paymentMethod && (
                <p className="text-[11px] text-amber-400 pt-1">
                  Please select a payment method to continue.
                </p>
              )}
            </div>

            {/* Conditional Bank Details - show for both bank deposit and COD */}
            {(paymentMethod === 'bank' || paymentMethod === 'cod') && bankDetails && (
              <div className="mt-4 rounded-xl border-2 border-[#FFD400] p-5 bg-[#7A4A20] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#FFD400]" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                  </svg>
                  <p className="text-sm font-bold text-[#FFD400]">
                    Bank Account Details
                  </p>
                </div>
                <div className="space-y-2 text-sm text-white/90">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="font-semibold text-white/70">Bank Name:</span>
                    <span className="font-medium">{bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="font-semibold text-white/70">Account Title:</span>
                    <span className="font-medium">{bankDetails.accountTitle}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="font-semibold text-white/70">Account Number:</span>
                    <span className="font-medium font-mono">{bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="font-semibold text-white/70">IBAN:</span>
                    <span className="font-medium font-mono text-xs">{bankDetails.iban}</span>
                  </div>
                  {bankDetails.branchCode && (
                    <div className="flex justify-between py-2">
                      <span className="font-semibold text-white/70">Branch Code:</span>
                      <span className="font-medium">{bankDetails.branchCode}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 rounded-lg border-2 border-amber-400 bg-amber-900/30 p-4">
                  {paymentMethod === 'bank' ? (
                    <>
                      <p className="text-sm font-bold text-[#FFD400]">
                        Total Amount to Transfer: Rs.{formatPKR(grandTotal)}
                      </p>
                      <p className="mt-2 text-xs text-white/80 leading-relaxed">
                        Please transfer the full amount to the above bank account and share the payment receipt via WhatsApp for faster processing.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-[#FFD400]">
                        Advance Payment Required: Rs.{formatPKR(advanceAmount)} ({advancePercent}% of Rs.{formatPKR(grandTotal)})
                      </p>
                      <p className="mt-2 text-xs text-white/80 leading-relaxed">
                        For Cash on Delivery, please transfer the advance amount ({advancePercent}%) to the above bank account. Remaining balance of Rs.{formatPKR(codAmount)} will be collected on delivery. Share the payment receipt via WhatsApp for faster processing.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp Payment Note */}
            <div className="mt-4 rounded-xl border-2 border-green-500/50 bg-green-900/20 p-4">
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-400 shrink-0 mt-0.5" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <div>
                  <p className="text-sm font-bold text-green-300">
                    Payment Confirmation Required
                  </p>
                  <p className="mt-1 text-xs text-white/80 leading-relaxed">
                    After completing your payment, please share the payment screenshot with us on WhatsApp at <span className="font-bold text-green-300">(0309-9164751)</span> so we can process your order smoothly. Thank you!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border-2 border-[#FFD400]/30 p-5 bg-[#7A4A20]/50 backdrop-blur">
              <p className="text-xs font-bold text-[#FFD400] uppercase tracking-wider mb-3">
                Order Summary
              </p>
              <div className="mt-3 space-y-1 text-xs text-white/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs.{formatPKR(numericTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping{city ? ` (${city})` : ''}</span>
                  <span>
                    {shipping === null
                      ? 'Select city'
                      : shipping === 0
                      ? 'Free'
                      : `Rs.${formatPKR(shipping)}`}
                  </span>
                </div>
                {!qualifiesForFreeShipping && (
                  <p className="text-[10px] text-amber-400 pt-1">
                    Free shipping on orders over Rs.{formatPKR(freeShippingThreshold)}
                  </p>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t border-[#FFD400]/20 mt-1">
                  <span>Total</span>
                  <span>Rs.{formatPKR(grandTotal)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !paymentMethod || !city}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FFD400] to-amber-500 px-6 py-3 text-sm font-bold text-[#5A2D0C] hover:from-amber-400 hover:to-[#FFD400] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border-2 border-[#FFD400]/40 px-6 py-3 text-sm font-semibold bg-transparent text-[#FFD400] hover:bg-[#FFD400]/10 transition-all duration-200"
            >
              Continue Shopping
            </button>
          </aside>
        </div>
      </div>
    </section>
  )
}