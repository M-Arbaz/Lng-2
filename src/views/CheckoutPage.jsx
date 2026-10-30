'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import {
  TicketPercent,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'
import { useNavigate } from '@/lib/navigation'
import { useAuth } from '../context/AuthContext'
import classNames from '../utils/classNames.js'
import bankDetailsService from '../utils/bankDetailsService'
import shippingService from '../utils/shippingService'
import couponsService from '../utils/couponsService'

const fieldClass =
  'h-12 w-full rounded-xl border border-[#3A2117]/15 bg-[#FFFEFC] px-4 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.06] placeholder:text-[#A29186]'

const textAreaClass =
  'min-h-[110px] w-full resize-y rounded-xl border border-[#3A2117]/15 bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.06] placeholder:text-[#A29186]'

const labelClass =
  'mb-2 block text-[11px] font-semibold text-[#4C3A31]'

function safeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function formatPKR(value) {
  return safeNumber(value).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export default function CheckoutPage({
  cart,
  cartTotal,
  appliedCoupon,
  onCouponChange,
  onPlaceOrder,
}) {
  const navigate = useNavigate()

  const {
    user,
    updateProfile,
  } = useAuth()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [couponCode, setCouponCode] = useState(
    appliedCoupon?.coupon?.code || ''
  )

  const [couponLoading, setCouponLoading] = useState(false)

  const [couponMessage, setCouponMessage] = useState({
    type: '',
    text: '',
  })
  const [
    addressLine1,
    setAddressLine1,
  ] = useState('')

  const [
    addressLine2,
    setAddressLine2,
  ] = useState('')

  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  const [
    postalCode,
    setPostalCode,
  ] = useState('')

  const [note, setNote] = useState('')

  const [
    billingSameAsShipping,
    setBillingSameAsShipping,
  ] = useState(true)

  const [
    billingAddressLine1,
    setBillingAddressLine1,
  ] = useState('')

  const [
    billingAddressLine2,
    setBillingAddressLine2,
  ] = useState('')

  const [
    billingCity,
    setBillingCity,
  ] = useState('')

  const [
    billingState,
    setBillingState,
  ] = useState('')

  const [
    billingPostalCode,
    setBillingPostalCode,
  ] = useState('')

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('')

  const [
    bankDetails,
    setBankDetails,
  ] = useState(null)
  const [copyToast, setCopyToast] = useState('')
  const copyToastTimerRef = useRef(null)

  const handleCopy = async (label, value) => {
    const text = String(value ?? '').trim()

    if (!text) return

    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          // Fallback for browsers that block Clipboard API
          const textarea = document.createElement('textarea')
          textarea.value = text
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()

          const copied = document.execCommand('copy')
          textarea.remove()

          if (!copied) throw new Error('Copy failed')
        }
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()

        const copied = document.execCommand('copy')
        textarea.remove()

        if (!copied) throw new Error('Copy failed')
      }

      setCopyToast(`${label} copied to clipboard`)
    } catch (error) {
      console.error('Clipboard copy failed:', error)
      setCopyToast('Unable to copy. Please try again.')
    }

    if (copyToastTimerRef.current) {
      window.clearTimeout(copyToastTimerRef.current)
    }

    copyToastTimerRef.current = window.setTimeout(() => {
      setCopyToast('')
    }, 2500)
  }

  useEffect(() => {
    return () => {
      if (copyToastTimerRef.current) {
        window.clearTimeout(copyToastTimerRef.current)
      }
    }
  }, [])
  const [
    shippingSettings,
    setShippingSettings,
  ] = useState({
    cities: [],
    methods: [],
    freeShippingEnabled: true,
    freeShippingThreshold: 15000,
  })

  const [
    shippingMethodId,
    setShippingMethodId,
  ] = useState('')

  const [
    shippingLoading,
    setShippingLoading,
  ] = useState(true)

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [
    placedOrderId,
    setPlacedOrderId,
  ] = useState('')

  const [
    placedOrderSummary,
    setPlacedOrderSummary,
  ] = useState(null)

  const checkoutSteps = [
    {
      id: 1,
      label: 'Customer',
    },
    {
      id: 2,
      label: 'Address',
    },
    {
      id: 3,
      label: 'Shipping',
    },
    {
      id: 4,
      label: 'Payment',
    },
    {
      id: 5,
      label: 'Review',
    },
  ]

  useEffect(() => {
    let alive = true

    const load = async () => {
      try {
        const data =
          await bankDetailsService.getBankDetails()

        if (alive) {
          setBankDetails(data)
        }
      } catch (err) {
        console.error(
          'Error loading bank details:',
          err
        )
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true

    const load = async () => {
      try {
        setShippingLoading(true)

        const data =
          await shippingService.getShippingSettings()

        if (alive) {
          setShippingSettings({
            cities:
              Array.isArray(
                data?.cities
              )
                ? data.cities
                : [],

            methods:
              Array.isArray(
                data?.methods
              )
                ? data.methods
                : [],

            freeShippingEnabled:
              data?.freeShippingEnabled !==
              false,

            freeShippingThreshold:
              safeNumber(
                data?.freeShippingThreshold,
                15000
              ),
          })
        }
      } catch (err) {
        console.error(
          'Error loading shipping settings:',
          err
        )
      } finally {
        if (alive) {
          setShippingLoading(false)
        }
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!user) {
      return
    }

    const profileFullName =
      [
        user.firstName,
        user.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      user.displayName ||
      ''

    setFullName(
      (prev) =>
        prev ||
        profileFullName
    )

    setPhone(
      (prev) =>
        prev ||
        user.mobile ||
        ''
    )

    setEmail(
      (prev) =>
        prev ||
        user.email ||
        ''
    )

    setAddressLine1(
      (prev) =>
        prev ||
        user.addressLine1 ||
        ''
    )

    setAddressLine2(
      (prev) =>
        prev ||
        user.addressLine2 ||
        ''
    )

    setState(
      (prev) =>
        prev ||
        user.state ||
        ''
    )

    setPostalCode(
      (prev) =>
        prev ||
        user.postalCode ||
        ''
    )

    setCity((prev) => {
      if (prev) {
        return prev
      }

      const savedCity =
        String(
          user.city || ''
        ).trim()

      if (!savedCity) {
        return ''
      }

      const matched =
        shippingSettings.cities.find(
          (item) =>
            String(
              item?.name || ''
            )
              .trim()
              .toLowerCase() ===
            savedCity.toLowerCase()
        )

      return (
        matched?.name ||
        ''
      )
    })
  }, [
    user,
    shippingSettings.cities,
  ])

  const numericTotal =
    Math.max(
      0,
      safeNumber(cartTotal)
    )

  const couponDiscount =
    Math.min(
      numericTotal,
      Math.max(
        0,
        safeNumber(
          appliedCoupon?.discountAmount
        )
      )
    )

  const discountedSubtotal =
    Math.max(
      0,
      numericTotal -
      couponDiscount
    )
  // Keep coupon input synchronized with global coupon state
  useEffect(() => {
    setCouponCode(
      appliedCoupon?.coupon?.code || ''
    )
  }, [appliedCoupon?.coupon?.code])

  // Apply coupon
  const handleApplyCoupon = async (event) => {
    event?.preventDefault()

    const code = couponCode.trim().toUpperCase()

    if (!code) {
      setCouponMessage({
        type: 'error',
        text: 'Please enter a coupon code.',
      })
      return
    }

    try {
      setCouponLoading(true)

      setCouponMessage({
        type: '',
        text: '',
      })

      const result = await couponsService.validateCoupon({
        code,
        cart,
        cartTotal: numericTotal,
      })

      if (!result.valid) {
        setCouponMessage({
          type: 'error',
          text: result.message || 'Coupon could not be applied.',
        })
        return
      }

      onCouponChange?.({
        coupon: result.coupon,
        discountAmount: result.discountAmount,
        eligibleSubtotal: result.eligibleSubtotal,
      })

      setCouponCode(result.coupon.code)

      setCouponMessage({
        type: 'success',
        text: result.message || 'Coupon applied successfully!',
      })
    } catch (error) {
      console.error('Error applying checkout coupon:', error)

      setCouponMessage({
        type: 'error',
        text: 'Unable to apply coupon. Please try again.',
      })
    } finally {
      setCouponLoading(false)
    }
  }

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    onCouponChange?.(null)
    setCouponCode('')

    setCouponMessage({
      type: '',
      text: '',
    })
  }

  // Revalidate coupon if cart contents or subtotal changes
  useEffect(() => {
    const code = appliedCoupon?.coupon?.code

    if (!code || !cart.length) {
      return
    }

    let active = true

    const revalidateCoupon = async () => {
      try {
        const result = await couponsService.validateCoupon({
          code,
          cart,
          cartTotal: numericTotal,
        })

        if (!active) return

        if (!result.valid) {
          onCouponChange?.(null)
          setCouponCode('')

          setCouponMessage({
            type: 'error',
            text: result.message || 'The applied coupon is no longer valid.',
          })

          return
        }

        onCouponChange?.({
          coupon: result.coupon,
          discountAmount: result.discountAmount,
          eligibleSubtotal: result.eligibleSubtotal,
        })
      } catch (error) {
        console.error('Error revalidating checkout coupon:', error)
      }
    }

    revalidateCoupon()

    return () => {
      active = false
    }
  }, [
    cart,
    cartTotal,
    appliedCoupon?.coupon?.code,
    onCouponChange,
  ])
  const activeShippingMethods =
    useMemo(
      () =>
        (
          shippingSettings.methods ||
          []
        ).filter(
          (method) =>
            method &&
            method.enabled !==
            false
        ),
      [
        shippingSettings.methods,
      ]
    )

  useEffect(() => {
    if (
      !activeShippingMethods.length
    ) {
      if (
        shippingMethodId
      ) {
        setShippingMethodId('')
      }

      return
    }

    const selectedStillExists =
      activeShippingMethods.some(
        (method) =>
          method.id ===
          shippingMethodId
      )

    if (
      !selectedStillExists
    ) {
      setShippingMethodId(
        activeShippingMethods[0]
          .id
      )
    }
  }, [
    activeShippingMethods,
    shippingMethodId,
  ])

  const selectedShippingMethod =
    useMemo(
      () =>
        activeShippingMethods.find(
          (method) =>
            method.id ===
            shippingMethodId
        ) || null,
      [
        activeShippingMethods,
        shippingMethodId,
      ]
    )

  const shippingQuote =
    useMemo(
      () =>
        shippingService.calculateShippingQuote(
          shippingSettings,
          {
            cityName: city,
            methodId:
              shippingMethodId,
            subtotal:
              numericTotal,
          }
        ),
      [
        shippingSettings,
        city,
        shippingMethodId,
        numericTotal,
      ]
    )

  const shipping =
    shippingQuote?.fee ??
    null

  const qualifiesForFreeShipping =
    Boolean(
      shippingQuote?.qualifiesForFreeShipping
    )

  const freeShippingEnabled =
    shippingQuote?.freeShippingEnabled !==
    false

  const freeShippingThreshold =
    safeNumber(
      shippingQuote?.freeShippingThreshold,
      15000
    )

  const grandTotal =
    discountedSubtotal +
    (shipping ?? 0)

  const bankAccountActive =
    Boolean(
      bankDetails?.isActive &&
      String(
        bankDetails?.bankName ||
        ''
      ).trim() &&
      String(
        bankDetails?.accountTitle ||
        ''
      ).trim() &&
      String(
        bankDetails?.accountNumber ||
        ''
      ).trim() &&
      String(
        bankDetails?.iban ||
        ''
      ).trim()
    )

  const advancePercent =
    bankAccountActive
      ? Math.min(
        100,
        Math.max(
          0,
          safeNumber(
            bankDetails?.codAdvancePercent,
            0
          )
        )
      )
      : 0

  const requiresCodAdvance =
    bankAccountActive &&
    advancePercent > 0

  const advanceAmount =
    requiresCodAdvance
      ? Math.round(
        grandTotal *
        (advancePercent /
          100)
      )
      : 0

  const codAmount =
    Math.max(
      0,
      grandTotal -
      advanceAmount
    )

  const goToStep = (step) => {
    setError('')

    setCurrentStep(
      Math.min(
        5,
        Math.max(1, step)
      )
    )

    if (
      typeof window !==
      'undefined'
    ) {
      window.requestAnimationFrame(
        () => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior:
              'smooth',
          })
        }
      )
    }
  }

  const validateCustomerStep =
    () => {
      if (
        !fullName.trim()
      ) {
        setError(
          'Please enter your full name.'
        )

        return false
      }

      const cleanPhone =
        phone.replace(
          /\D/g,
          ''
        )

      if (
        !phone.trim() ||
        cleanPhone.length < 10
      ) {
        setError(
          'Please enter a valid phone number.'
        )

        return false
      }

      if (
        email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email.trim()
        )
      ) {
        setError(
          'Please enter a valid email address.'
        )

        return false
      }

      return true
    }

  const validateAddressStep =
    () => {
      if (
        !addressLine1.trim()
      ) {
        setError(
          'Please enter your delivery address.'
        )

        return false
      }

      if (!city) {
        setError(
          'Please select your delivery city.'
        )

        return false
      }

      if (
        !billingSameAsShipping
      ) {
        if (
          !billingAddressLine1.trim()
        ) {
          setError(
            'Please enter your billing address.'
          )

          return false
        }

        if (
          !billingCity.trim()
        ) {
          setError(
            'Please enter your billing city.'
          )

          return false
        }
      }

      return true
    }

  const validateShippingStep =
    () => {
      if (!city) {
        setError(
          'Please select your delivery city first.'
        )

        return false
      }

      if (
        !activeShippingMethods.length
      ) {
        setError(
          'No delivery method is currently available. Please contact us for assistance.'
        )

        return false
      }

      if (
        !selectedShippingMethod
      ) {
        setError(
          'Please select a shipping method.'
        )

        return false
      }

      if (
        shipping === null
      ) {
        setError(
          'Shipping charges could not be calculated for this delivery option.'
        )

        return false
      }

      return true
    }

  const validatePaymentStep =
    () => {
      if (
        !paymentMethod
      ) {
        setError(
          'Please select a payment method.'
        )

        return false
      }

      if (
        paymentMethod ===
        'bank' &&
        !bankAccountActive
      ) {
        setError(
          'Bank Deposit is currently unavailable. Please select Cash on Delivery.'
        )

        return false
      }

      return true
    }

  const handleNextStep =
    () => {
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

      goToStep(
        currentStep + 1
      )
    }

  const handlePreviousStep =
    () =>
      goToStep(
        currentStep - 1
      )

  const handleSubmit =
    async () => {
      /*
       * Guest checkout is allowed.
       * No forced login redirect.
       */
      if (
        !Array.isArray(cart) ||
        cart.length === 0
      ) {
        setError(
          'Your cart is empty.'
        )

        return
      }

      if (
        !validateCustomerStep()
      ) {
        return
      }

      if (
        !validateAddressStep()
      ) {
        return
      }

      if (
        !validateShippingStep()
      ) {
        return
      }

      if (
        !validatePaymentStep()
      ) {
        return
      }

      let checkoutCoupon =
        appliedCoupon?.coupon ||
        null

      let checkoutDiscountAmount =
        couponDiscount

      let checkoutEligibleSubtotal =
        safeNumber(
          appliedCoupon?.eligibleSubtotal
        )

      if (
        checkoutCoupon?.code
      ) {
        try {
          const result =
            await couponsService.validateCoupon(
              {
                code:
                  checkoutCoupon.code,

                cart,

                cartTotal:
                  numericTotal,
              }
            )

          if (
            !result?.valid
          ) {
            onCouponChange?.(
              null
            )

            setError(
              result?.message ||
              'Your coupon is no longer valid. Please review your order.'
            )

            return
          }

          checkoutCoupon =
            result.coupon

          checkoutDiscountAmount =
            Math.min(
              numericTotal,
              Math.max(
                0,
                safeNumber(
                  result.discountAmount
                )
              )
            )

          checkoutEligibleSubtotal =
            safeNumber(
              result.eligibleSubtotal
            )

          onCouponChange?.({
            coupon:
              result.coupon,

            discountAmount:
              checkoutDiscountAmount,

            eligibleSubtotal:
              checkoutEligibleSubtotal,
          })
        } catch (
        couponError
        ) {
          console.error(
            'Checkout coupon validation failed:',
            couponError
          )

          setError(
            'We could not verify your coupon. Please try again.'
          )

          return
        }
      }

      const checkoutDiscountedSubtotal =
        Math.max(
          0,
          numericTotal -
          checkoutDiscountAmount
        )

      const checkoutGrandTotal =
        checkoutDiscountedSubtotal +
        (shipping ?? 0)

      const checkoutAdvanceAmount =
        paymentMethod ===
          'cod' &&
          requiresCodAdvance
          ? Math.round(
            checkoutGrandTotal *
            (advancePercent /
              100)
          )
          : 0

      const checkoutCodRemaining =
        Math.max(
          0,
          checkoutGrandTotal -
          checkoutAdvanceAmount
        )

      const order = {
        fullName:
          fullName.trim(),

        phone:
          phone.trim(),

        email:
          email.trim(),

        addressLine1:
          addressLine1.trim(),

        addressLine2:
          addressLine2.trim(),

        city:
          city.trim(),

        state:
          state.trim(),

        postalCode:
          postalCode.trim(),

        note:
          note.trim(),

        paymentMethod,

        paymentDetails: {
          bankName:
            paymentMethod ===
              'bank' ||
              checkoutAdvanceAmount >
              0
              ? bankDetails?.bankName ||
              ''
              : '',

          accountTitle:
            paymentMethod ===
              'bank' ||
              checkoutAdvanceAmount >
              0
              ? bankDetails?.accountTitle ||
              ''
              : '',

          accountNumber:
            paymentMethod ===
              'bank' ||
              checkoutAdvanceAmount >
              0
              ? bankDetails?.accountNumber ||
              ''
              : '',

          iban:
            paymentMethod ===
              'bank' ||
              checkoutAdvanceAmount >
              0
              ? bankDetails?.iban ||
              ''
              : '',

          branchCode:
            paymentMethod ===
              'bank' ||
              checkoutAdvanceAmount >
              0
              ? bankDetails?.branchCode ||
              ''
              : '',

          codAdvancePercent:
            paymentMethod ===
              'cod'
              ? advancePercent
              : 0,

          codAdvanceAmount:
            checkoutAdvanceAmount,

          codRemainingAmount:
            paymentMethod ===
              'cod'
              ? checkoutCodRemaining
              : 0,
        },

        shippingMethod: {
          id:
            selectedShippingMethod.id,

          name:
            selectedShippingMethod.name,

          city:
            city.trim(),

          fee:
            shipping ?? 0,

          rateType:
            selectedShippingMethod.rateType ||
            'city',

          deliveryEstimate:
            selectedShippingMethod.deliveryEstimate ||
            '',

          description:
            selectedShippingMethod.description ||
            '',

          policy:
            selectedShippingMethod.policy ||
            '',
        },

        billingSameAsShipping,

        billingAddress:
          billingSameAsShipping
            ? {
              addressLine1:
                addressLine1.trim(),

              addressLine2:
                addressLine2.trim(),

              city:
                city.trim(),

              state:
                state.trim(),

              postalCode:
                postalCode.trim(),
            }
            : {
              addressLine1:
                billingAddressLine1.trim(),

              addressLine2:
                billingAddressLine2.trim(),

              city:
                billingCity.trim(),

              state:
                billingState.trim(),

              postalCode:
                billingPostalCode.trim(),
            },

        items: cart.map(
          (item) => ({
            id:
              item.id,

            productId:
              item.product
                ?.id,

            name:
              item.product
                ?.name,

            image:
              item.product
                ?.image,

            quantity:
              item.quantity,

            unitPrice:
              item.unitPrice ??
              item.product
                ?.price,

            colorVariant:
              item.colorVariant ||
              null,

            shadeColor:
              item.shadeColor ||
              null,

            bulbOption:
              item.bulbOption ||
              null,
          })
        ),

        subtotal:
          numericTotal,

        discountAmount:
          checkoutDiscountAmount,

        discountedSubtotal:
          checkoutDiscountedSubtotal,

        couponEligibleSubtotal:
          checkoutEligibleSubtotal,

        coupon:
          checkoutCoupon
            ? {
              id:
                checkoutCoupon.id,

              code:
                checkoutCoupon.code,

              description:
                checkoutCoupon.description ||
                '',

              discountType:
                checkoutCoupon.discountType,

              discountValue:
                checkoutCoupon.discountValue,

              applicableTo:
                checkoutCoupon.applicableTo ||
                'all',

              productIds:
                checkoutCoupon.productIds ||
                [],

              categoryIds:
                checkoutCoupon.categoryIds ||
                [],
            }
            : null,

        shipping:
          shipping ?? 0,

        shippingMethodName:
          selectedShippingMethod.name,

        deliveryEstimate:
          selectedShippingMethod.deliveryEstimate ||
          '',

        total:
          checkoutGrandTotal,
      }

      setError('')
      setLoading(true)

      try {
        const orderId =
          await onPlaceOrder(
            order
          )

        if (!orderId) {
          setError(
            'Failed to place order. Please try again.'
          )

          return
        }

        setPlacedOrderSummary({
          subtotal:
            numericTotal,

          discountAmount:
            checkoutDiscountAmount,

          discountedSubtotal:
            checkoutDiscountedSubtotal,

          couponCode:
            checkoutCoupon?.code ||
            '',

          shipping:
            shipping ?? 0,

          shippingMethodName:
            selectedShippingMethod.name,

          deliveryEstimate:
            selectedShippingMethod.deliveryEstimate ||
            '',

          total:
            checkoutGrandTotal,
        })

        setPlacedOrderId(
          String(orderId)
        )

        /*
         * Existing logged-in users still
         * receive the current profile
         * auto-save behavior.
         *
         * Guest checkout simply skips it.
         */
        if (user) {
          const trimmedFullName =
            fullName.trim()

          const nameParts =
            trimmedFullName
              .split(/\s+/)
              .filter(Boolean)

          const profileUpdates =
            {}

          if (
            !String(
              user.firstName ||
              ''
            ).trim() &&
            nameParts[0]
          ) {
            profileUpdates.firstName =
              nameParts[0]
          }

          if (
            !String(
              user.lastName ||
              ''
            ).trim() &&
            nameParts.length >
            1
          ) {
            profileUpdates.lastName =
              nameParts
                .slice(1)
                .join(' ')
          }

          if (
            !String(
              user.displayName ||
              ''
            ).trim() &&
            trimmedFullName
          ) {
            profileUpdates.displayName =
              trimmedFullName
          }

          if (
            !String(
              user.mobile ||
              ''
            ).trim() &&
            phone.trim()
          ) {
            profileUpdates.mobile =
              phone.trim()
          }

          if (
            !String(
              user.addressLine1 ||
              ''
            ).trim() &&
            addressLine1.trim()
          ) {
            profileUpdates.addressLine1 =
              addressLine1.trim()
          }

          if (
            !String(
              user.addressLine2 ||
              ''
            ).trim() &&
            addressLine2.trim()
          ) {
            profileUpdates.addressLine2 =
              addressLine2.trim()
          }

          if (
            !String(
              user.city ||
              ''
            ).trim() &&
            city.trim()
          ) {
            profileUpdates.city =
              city.trim()
          }

          if (
            !String(
              user.state ||
              ''
            ).trim() &&
            state.trim()
          ) {
            profileUpdates.state =
              state.trim()
          }

          if (
            !String(
              user.postalCode ||
              ''
            ).trim() &&
            postalCode.trim()
          ) {
            profileUpdates.postalCode =
              postalCode.trim()
          }

          if (
            Object.keys(
              profileUpdates
            ).length
          ) {
            try {
              await updateProfile(
                profileUpdates
              )
            } catch (
            profileError
            ) {
              console.error(
                'Checkout profile auto-save failed:',
                profileError
              )
            }
          }
        }
      } catch (err) {
        console.error(
          'Checkout order failed:',
          err
        )

        setError(
          err?.message ||
          'Failed to place order. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

  if (placedOrderId) {
    return (
      <main className="min-h-screen bg-[#F7F4EF] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-[32px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_24px_80px_rgba(58,33,23,0.10)]">
            <div className="relative overflow-hidden bg-[#3A2117] px-6 py-10 text-center text-white sm:px-10 sm:py-12">
              <div className="relative">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/15 bg-white/[0.08]">
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
                  Thank You
                  {fullName
                    ? `, ${fullName.split(
                      ' '
                    )[0]
                    }`
                    : ''}
                  !
                </h1>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/70">
                  Your order has
                  been successfully
                  submitted. Our
                  team will review
                  it and contact you
                  shortly.
                </p>
              </div>
            </div>

            <div className="border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                    Order Number
                  </p>

                  <p className="mt-1 text-base font-semibold text-[#281912]">
                    #
                    {
                      placedOrderId
                    }
                  </p>
                </div>

                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-800">
                  Successfully
                  submitted
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#3A2117]/10 bg-[#F7F4EF] p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8A654D]">
                    Payment Method
                  </p>

                  <h3 className="mt-2 text-sm font-semibold text-[#281912]">
                    {paymentMethod ===
                      'cod'
                      ? 'Cash on Delivery'
                      : 'Bank Deposit'}
                  </h3>
                </div>

                <div className="rounded-[22px] border border-[#3A2117]/10 bg-[#F7F4EF] p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8A654D]">
                    Delivery
                  </p>

                  <h3 className="mt-2 text-sm font-semibold text-[#281912]">
                    {placedOrderSummary?.shippingMethodName ||
                      'Shipping'}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[#7A6A60]">
                    Delivery to{' '}
                    {city}.
                    {placedOrderSummary?.deliveryEstimate
                      ? ` Estimated ${placedOrderSummary.deliveryEstimate}.`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-[#3A2117]/10 bg-[#FFFEFC] p-5">
                <div className="space-y-3 text-xs text-[#6B5A50]">
                  <div className="flex justify-between gap-4">
                    <span>
                      Subtotal
                    </span>

                    <span className="font-medium text-[#281912]">
                      Rs.
                      {formatPKR(
                        placedOrderSummary?.subtotal
                      )}
                    </span>
                  </div>

                  {safeNumber(
                    placedOrderSummary?.discountAmount
                  ) > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>
                          Discount{' '}
                          {placedOrderSummary?.couponCode
                            ? `(${placedOrderSummary.couponCode})`
                            : ''}
                        </span>

                        <span className="font-semibold text-emerald-700">
                          - Rs.
                          {formatPKR(
                            placedOrderSummary.discountAmount
                          )}
                        </span>
                      </div>
                    )}

                  <div className="flex justify-between gap-4">
                    <span>
                      Shipping
                    </span>

                    <span
                      className={
                        placedOrderSummary?.shipping ===
                          0
                          ? 'font-semibold text-emerald-700'
                          : 'font-medium text-[#281912]'
                      }
                    >
                      {placedOrderSummary?.shipping ===
                        0
                        ? 'Free'
                        : `Rs.${formatPKR(
                          placedOrderSummary?.shipping
                        )}`}
                    </span>
                  </div>

                  <div className="border-t border-[#3A2117]/10 pt-4">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-sm font-semibold text-[#281912]">
                        Order Total
                      </span>

                      <span className="text-xl font-semibold text-[#281912]">
                        Rs.
                        {formatPKR(
                          placedOrderSummary?.total
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {user ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        '/orders'
                      )
                    }
                    className="min-h-[50px] rounded-full bg-[#3A2117] px-6 text-sm font-semibold text-white transition hover:bg-[#4A2B1F]"
                  >
                    View My Order
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/')
                    }
                    className="min-h-[50px] rounded-full bg-[#3A2117] px-6 text-sm font-semibold text-white transition hover:bg-[#4A2B1F]"
                  >
                    Back to Home
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/products'
                    )
                  }
                  className="min-h-[50px] rounded-full border border-[#3A2117]/15 bg-[#FFFEFC] px-6 text-sm font-semibold text-[#3A2117] transition hover:bg-[#F7F4EF]"
                >
                  Continue
                  Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#281912]">
      {copyToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#3A2117] px-5 py-3 text-xs font-medium text-white shadow-xl"
        >
          <Check size={16} className="text-emerald-400" />
          {copyToast}
        </div>
      )}
      <section className="border-b border-[#3A2117]/10 bg-[#FFFEFC]">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
                Secure Checkout
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#281912] sm:text-4xl">
                Complete your
                order
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6A60]">
                Your details stay
                in place as you
                move through
                customer info,
                address, shipping,
                payment and
                review.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/cart')
              }
              className="w-fit rounded-full border border-[#3A2117]/15 bg-[#FFFEFC] px-5 py-2.5 text-xs font-semibold text-[#3A2117] transition hover:bg-[#F7F4EF]"
            >
              ← Back to Cart
            </button>
          </div>

          <div className="mt-8 flex items-start overflow-x-auto pb-2">
            {checkoutSteps.map(
              (
                step,
                index
              ) => (
                <div
                  key={step.id}
                  className="flex min-w-[125px] flex-1 items-start"
                >
                  <button
                    type="button"
                    onClick={() =>
                      step.id <
                      currentStep &&
                      goToStep(
                        step.id
                      )
                    }
                    disabled={
                      step.id >
                      currentStep
                    }
                    className="group flex shrink-0 flex-col items-center gap-2 disabled:cursor-default"
                  >
                    <span
                      className={classNames(
                        'grid h-8 w-8 place-items-center rounded-full border text-[11px] font-semibold transition',

                        currentStep ===
                          step.id
                          ? 'border-[#3A2117] bg-[#3A2117] text-white'
                          : currentStep >
                            step.id
                            ? 'border-[#6B4228] bg-[#EEE5DC] text-[#6B4228]'
                            : 'border-[#3A2117]/15 bg-[#FFFEFC] text-[#9A8171]'
                      )}
                    >
                      {currentStep >
                        step.id
                        ? '✓'
                        : step.id}
                    </span>

                    <span
                      className={classNames(
                        'text-[9px] font-semibold uppercase tracking-[0.12em]',

                        currentStep >=
                          step.id
                          ? 'text-[#6B4228]'
                          : 'text-[#A69489]'
                      )}
                    >
                      {
                        step.label
                      }
                    </span>
                  </button>

                  {index <
                    checkoutSteps.length -
                    1 && (
                      <div
                        className={classNames(
                          'mx-4 mt-4 h-px min-w-8 flex-1',

                          currentStep >
                            step.id
                            ? 'bg-[#6B4228]/60'
                            : 'bg-[#3A2117]/10'
                        )}
                      />
                    )}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-10">
          <div className="space-y-6">
            {currentStep ===
              1 && (
                <StepCard
                  step="01"
                  title="Customer Information"
                  description="Tell us who we should contact about this order."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name *">
                      <input
                        value={
                          fullName
                        }
                        onChange={(
                          event
                        ) =>
                          setFullName(
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          fieldClass
                        }
                        placeholder="Your full name"
                      />
                    </Field>

                    <Field label="Phone number *">
                      <input
                        value={
                          phone
                        }
                        onChange={(
                          event
                        ) =>
                          setPhone(
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          fieldClass
                        }
                        placeholder="03XX XXXXXXX"
                        inputMode="tel"
                      />
                    </Field>

                    <Field label="Email address">
                      <input
                        value={
                          email
                        }
                        onChange={(
                          event
                        ) =>
                          setEmail(
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          fieldClass
                        }
                        placeholder="you@example.com"
                        type="email"
                      />
                    </Field>
                  </div>

                  <ActionRow
                    nextLabel="Continue to Address →"
                    onNext={
                      handleNextStep
                    }
                    hideBack
                  />
                </StepCard>
              )}

            {currentStep ===
              2 && (
                <StepCard
                  step="02"
                  title="Shipping Address"
                  description="Choose the delivery city configured by the store and enter your complete address."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Address line 1 *"
                      span
                    >
                      <input
                        value={
                          addressLine1
                        }
                        onChange={(
                          event
                        ) =>
                          setAddressLine1(
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          fieldClass
                        }
                        placeholder="House / street / area"
                      />
                    </Field>

                    <Field
                      label="Address line 2"
                      span
                    >
                      <input
                        value={
                          addressLine2
                        }
                        onChange={(
                          event
                        ) =>
                          setAddressLine2(
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          fieldClass
                        }
                        placeholder="Apartment, landmark, etc."
                      />
                    </Field>

                    <Field label="Delivery city *">
                      <select
                        value={city}
                        onChange={(
                          event
                        ) =>
                          setCity(
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          fieldClass
                        }
                        disabled={
                          shippingLoading
                        }
                      >
                        <option value="">
                          {shippingLoading
                            ? 'Loading cities...'
                            : shippingSettings
                              .cities
                              .length
                              ? 'Select delivery city'
                              : 'No delivery cities available'}
                        </option>

                        {shippingSettings.cities.map(
                          (
                            item
                          ) => (
                            <option
                              key={
                                item.id ||
                                item.name
                              }
                              value={
                                item.name
                              }
                            >
                              {
                                item.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    <Field label="State / Province">
                      <input
                        value={
                          state
                        }
                        onChange={(
                          event
                        ) =>
                          setState(
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          fieldClass
                        }
                        placeholder="Punjab"
                      />
                    </Field>

                    <Field label="Postal code">
                      <input
                        value={
                          postalCode
                        }
                        onChange={(
                          event
                        ) =>
                          setPostalCode(
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          fieldClass
                        }
                        placeholder="54000"
                      />
                    </Field>

                    <Field
                      label="Delivery instructions"
                      span
                    >
                      <textarea
                        value={
                          note
                        }
                        onChange={(
                          event
                        ) =>
                          setNote(
                            event
                              .target
                              .value
                          )
                        }
                        className={
                          textAreaClass
                        }
                        placeholder="Optional delivery note"
                      />
                    </Field>
                  </div>

                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-4">
                    <input
                      type="checkbox"
                      checked={
                        billingSameAsShipping
                      }
                      onChange={(
                        event
                      ) =>
                        setBillingSameAsShipping(
                          event
                            .target
                            .checked
                        )
                      }
                      className="mt-0.5 h-4 w-4 accent-[#3A2117]"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-[#281912]">
                        Billing
                        address is
                        the same as
                        shipping
                        address
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#7A6A60]">
                        Uncheck this
                        only if your
                        billing
                        address is
                        different.
                      </span>
                    </span>
                  </label>

                  {!billingSameAsShipping && (
                    <div className="mt-5 rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-5">
                      <p className="mb-4 text-sm font-semibold text-[#281912]">
                        Billing
                        Address
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          value={
                            billingAddressLine1
                          }
                          onChange={(
                            event
                          ) =>
                            setBillingAddressLine1(
                              event
                                .target
                                .value
                            )
                          }
                          className={`${fieldClass} sm:col-span-2`}
                          placeholder="Address line 1 *"
                        />

                        <input
                          value={
                            billingAddressLine2
                          }
                          onChange={(
                            event
                          ) =>
                            setBillingAddressLine2(
                              event
                                .target
                                .value
                            )
                          }
                          className={`${fieldClass} sm:col-span-2`}
                          placeholder="Address line 2"
                        />

                        <input
                          value={
                            billingCity
                          }
                          onChange={(
                            event
                          ) =>
                            setBillingCity(
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            fieldClass
                          }
                          placeholder="City *"
                        />

                        <input
                          value={
                            billingState
                          }
                          onChange={(
                            event
                          ) =>
                            setBillingState(
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            fieldClass
                          }
                          placeholder="State / Province"
                        />

                        <input
                          value={
                            billingPostalCode
                          }
                          onChange={(
                            event
                          ) =>
                            setBillingPostalCode(
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            fieldClass
                          }
                          placeholder="Postal code"
                        />
                      </div>
                    </div>
                  )}

                  <ActionRow
                    onBack={
                      handlePreviousStep
                    }
                    onNext={
                      handleNextStep
                    }
                    nextLabel="Continue to Shipping →"
                  />
                </StepCard>
              )}

            {currentStep ===
              3 && (
                <StepCard
                  step="03"
                  title="Shipping Method"
                  description="Choose an active delivery method. Charges update automatically in your order summary."
                >
                  {shippingLoading ? (
                    <div className="rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-6 text-center text-sm text-[#7A6A60]">
                      Loading
                      delivery
                      methods...
                    </div>
                  ) : activeShippingMethods.length ? (
                    <div className="space-y-3">
                      {activeShippingMethods.map(
                        (
                          method
                        ) => {
                          const quote =
                            shippingService.calculateShippingQuote(
                              shippingSettings,
                              {
                                cityName:
                                  city,

                                methodId:
                                  method.id,

                                subtotal:
                                  numericTotal,
                              }
                            )

                          const selected =
                            shippingMethodId ===
                            method.id

                          return (
                            <button
                              key={
                                method.id
                              }
                              type="button"
                              onClick={() =>
                                setShippingMethodId(
                                  method.id
                                )
                              }
                              className={classNames(
                                'w-full rounded-[22px] border-2 p-5 text-left transition',

                                selected
                                  ? 'border-[#3A2117] bg-[#F7F4EF]'
                                  : 'border-[#3A2117]/10 bg-[#FFFEFC] hover:border-[#6B4228]/35'
                              )}
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className={classNames(
                                    'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border',

                                    selected
                                      ? 'border-[#3A2117] bg-[#3A2117]'
                                      : 'border-[#BDAEA5] bg-white'
                                  )}
                                >
                                  {selected && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-[#281912]">
                                        {
                                          method.name
                                        }
                                      </p>

                                      {method.deliveryEstimate && (
                                        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#8A654D]">
                                          {
                                            method.deliveryEstimate
                                          }
                                        </p>
                                      )}
                                    </div>

                                    <p className="text-sm font-semibold text-[#6B4228]">
                                      {quote.fee ===
                                        null
                                        ? 'Unavailable'
                                        : quote.fee ===
                                          0
                                          ? 'Free'
                                          : `Rs.${formatPKR(
                                            quote.fee
                                          )}`}
                                    </p>
                                  </div>

                                  {method.description && (
                                    <p className="mt-3 text-xs leading-5 text-[#7A6A60]">
                                      {
                                        method.description
                                      }
                                    </p>
                                  )}

                                  {method.policy && (
                                    <p className="mt-3 rounded-xl bg-[#EEE5DC] px-3 py-2.5 text-[10px] leading-5 text-[#6B5A50]">
                                      {
                                        method.policy
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          )
                        }
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                      No active
                      shipping
                      method is
                      configured
                      right now.
                    </div>
                  )}

                  {qualifiesForFreeShipping &&
                    selectedShippingMethod && (
                      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-[11px] font-semibold text-emerald-800">
                        Your order
                        qualifies
                        for free
                        shipping.
                      </div>
                    )}

                  <ActionRow
                    onBack={
                      handlePreviousStep
                    }
                    onNext={
                      handleNextStep
                    }
                    nextLabel="Continue to Payment →"
                    nextDisabled={
                      shippingLoading ||
                      !selectedShippingMethod ||
                      shipping ===
                      null
                    }
                  />
                </StepCard>
              )}

            {currentStep ===
              4 && (
                <StepCard
                  step="04"
                  title="Payment Method"
                  description="Choose your preferred payment option."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={classNames(
                        'cursor-pointer rounded-2xl border p-4 transition',

                        paymentMethod ===
                          'cod'
                          ? 'border-[#3A2117] bg-[#F2ECE5]'
                          : 'border-[#3A2117]/10 bg-[#FFFEFC] hover:border-[#6B4228]/35'
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={
                          paymentMethod ===
                          'cod'
                        }
                        onChange={(
                          event
                        ) =>
                          setPaymentMethod(
                            event
                              .target
                              .value
                          )
                        }
                        className="sr-only"
                      />

                      <div className="flex gap-3">
                        <div
                          className={classNames(
                            'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border',

                            paymentMethod ===
                              'cod'
                              ? 'border-[#3A2117] bg-[#3A2117]'
                              : 'border-[#3A2117]/25'
                          )}
                        >
                          {paymentMethod ===
                            'cod' && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#281912]">
                            Cash on
                            Delivery
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#7A6A60]">
                            {requiresCodAdvance
                              ? `${advancePercent}% advance is required. Remaining balance is payable on delivery.`
                              : 'Pay when your order arrives.'}
                          </p>
                        </div>
                      </div>
                    </label>

                    {bankAccountActive && (
                      <label
                        className={classNames(
                          'cursor-pointer rounded-2xl border p-4 transition',

                          paymentMethod ===
                            'bank'
                            ? 'border-[#3A2117] bg-[#F2ECE5]'
                            : 'border-[#3A2117]/10 bg-[#FFFEFC] hover:border-[#6B4228]/35'
                        )}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={
                            paymentMethod ===
                            'bank'
                          }
                          onChange={(
                            event
                          ) =>
                            setPaymentMethod(
                              event
                                .target
                                .value
                            )
                          }
                          className="sr-only"
                        />

                        <div className="flex gap-3">
                          <div
                            className={classNames(
                              'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border',

                              paymentMethod ===
                                'bank'
                                ? 'border-[#3A2117] bg-[#3A2117]'
                                : 'border-[#3A2117]/25'
                            )}
                          >
                            {paymentMethod ===
                              'bank' && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#281912]">
                              Bank
                              Deposit
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#7A6A60]">
                              Transfer
                              payment
                              directly
                              to our
                              bank
                              account.
                            </p>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>

                  {paymentMethod ===
                    'bank' &&
                    bankAccountActive && (
                      <div className="mt-5 overflow-hidden rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF]">
                        <div className="border-b border-[#3A2117]/10 px-5 py-4">
                          <p className="text-sm font-semibold text-[#281912]">
                            Bank
                            Account
                            Details
                          </p>
                        </div>

                        <div className="grid gap-4 p-5 text-xs sm:grid-cols-2">
                          <Info
                            label="Bank"
                            value={bankDetails.bankName}
                            onCopy={handleCopy}
                          />

                          <Info
                            label="Account Title"
                            value={bankDetails.accountTitle}
                            onCopy={handleCopy}
                          />

                          <Info
                            label="Account Number"
                            value={bankDetails.accountNumber}
                            onCopy={handleCopy}
                          />

                          <Info
                            label="IBAN"
                            value={bankDetails.iban}
                            onCopy={handleCopy}
                          />

                          <Info
                            label="Branch Code"
                            value={bankDetails.branchCode}
                            onCopy={handleCopy}
                          />
                        </div>

                        {bankDetails.bankTransferInstructions && (
                          <div className="border-t border-[#3A2117]/10 px-5 py-4 text-xs leading-5 text-[#6B5A50]">
                            {
                              bankDetails.bankTransferInstructions
                            }
                          </div>
                        )}
                      </div>
                    )}

                  {paymentMethod ===
                    'cod' && (
                      <div className="mt-5 overflow-hidden rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF]">
                        <div className="border-b border-[#3A2117]/10 px-5 py-4">
                          <p className="text-sm font-semibold text-[#281912]">
                            Cash on
                            Delivery
                          </p>
                        </div>

                        {requiresCodAdvance ? (
                          <>
                            <div className="px-5 py-4 text-xs leading-5 text-[#6B5A50]">
                              COD
                              requires{' '}
                              <strong className="text-[#281912]">
                                {
                                  advancePercent
                                }
                                %
                              </strong>{' '}
                              advance
                              payment:{' '}
                              <strong className="text-[#281912]">
                                Rs.
                                {formatPKR(
                                  advanceAmount
                                )}
                              </strong>
                              .
                              <br />

                              Remaining
                              on
                              delivery:{' '}
                              <strong className="text-[#281912]">
                                Rs.
                                {formatPKR(
                                  codAmount
                                )}
                              </strong>
                              .
                            </div>

                            <div className="grid gap-4 border-t border-[#3A2117]/10 p-5 text-xs sm:grid-cols-2">
                              <Info
                                label="Bank"
                                value={bankDetails.bankName}
                                onCopy={handleCopy}
                              />

                              <Info
                                label="Account Title"
                                value={bankDetails.accountTitle}
                                onCopy={handleCopy}
                              />

                              <Info
                                label="Account Number"
                                value={bankDetails.accountNumber}
                                onCopy={handleCopy}
                              />

                              <Info
                                label="IBAN"
                                value={bankDetails.iban}
                                onCopy={handleCopy}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="px-5 py-4 text-xs leading-5 text-[#6B5A50]">
                            No advance
                            payment is
                            required.
                            Pay the
                            order
                            amount on
                            delivery.
                          </div>
                        )}

                        {bankDetails?.codInstructions && (
                          <div className="border-t border-[#3A2117]/10 px-5 py-4 text-xs leading-5 text-[#6B5A50]">
                            {
                              bankDetails.codInstructions
                            }
                          </div>
                        )}
                      </div>
                    )}

                  <ActionRow
                    onBack={
                      handlePreviousStep
                    }
                    onNext={
                      handleNextStep
                    }
                    nextLabel="Review Order →"
                  />
                </StepCard>
              )}

            {currentStep ===
              5 && (
                <StepCard
                  step="05"
                  title="Order Review"
                  description="Review your details before placing the order."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ReviewBox
                      title="Customer"
                      onEdit={() =>
                        goToStep(
                          1
                        )
                      }
                    >
                      <p>
                        {
                          fullName
                        }
                      </p>

                      <p>
                        {phone}
                      </p>

                      {email && (
                        <p>
                          {email}
                        </p>
                      )}
                    </ReviewBox>

                    <ReviewBox
                      title="Shipping Address"
                      onEdit={() =>
                        goToStep(
                          2
                        )
                      }
                    >
                      <p>
                        {
                          addressLine1
                        }
                      </p>

                      {addressLine2 && (
                        <p>
                          {
                            addressLine2
                          }
                        </p>
                      )}

                      <p>
                        {[
                          city,
                          state,
                          postalCode,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            ', '
                          )}
                      </p>
                    </ReviewBox>

                    <ReviewBox
                      title="Shipping"
                      onEdit={() =>
                        goToStep(
                          3
                        )
                      }
                    >
                      <p>
                        {selectedShippingMethod?.name ||
                          'Not selected'}{' '}
                        —{' '}
                        {shipping ===
                          0
                          ? 'Free'
                          : shipping ===
                            null
                            ? 'Unavailable'
                            : `Rs.${formatPKR(
                              shipping
                            )}`}
                      </p>

                      {selectedShippingMethod?.deliveryEstimate && (
                        <p>
                          {
                            selectedShippingMethod.deliveryEstimate
                          }
                        </p>
                      )}
                    </ReviewBox>

                    <ReviewBox
                      title="Payment"
                      onEdit={() =>
                        goToStep(
                          4
                        )
                      }
                    >
                      <p>
                        {paymentMethod ===
                          'cod'
                          ? 'Cash on Delivery'
                          : paymentMethod ===
                            'bank'
                            ? 'Bank Deposit'
                            : 'Not selected'}
                      </p>
                    </ReviewBox>
                  </div>

                  <ActionRow
                    onBack={
                      handlePreviousStep
                    }
                    hideNext
                  />
                </StepCard>
              )}
          </div>

          <aside className="self-start lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_18px_55px_rgba(58,33,23,0.08)]">
              <div className="border-b border-[#3A2117]/10 bg-[#3A2117] px-5 py-5 text-white">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#D9BFAE]">
                  Your Order
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Order Summary
                </h2>
              </div>

              <div className="max-h-[370px] space-y-4 overflow-y-auto p-5">
                {cart?.length ? (
                  cart.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="flex gap-3"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F2ECE5]">
                          {item.product
                            ?.image ? (
                            <img
                              src={
                                item
                                  .product
                                  .image
                              }
                              alt={
                                item
                                  .product
                                  ?.name ||
                                'Product'
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-[9px] text-[#A18E82]">
                              No
                              image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-[#281912]">
                            {item
                              .product
                              ?.name ||
                              'Product'}
                          </p>

                          <p className="mt-1 text-[10px] text-[#8A7569]">
                            Qty{' '}
                            {
                              item.quantity
                            }
                          </p>

                          {item.colorVariant && (
                            <p className="mt-1 text-[9px] text-[#8A7569]">
                              Color:{' '}
                              {typeof item.colorVariant ===
                                'object'
                                ? item
                                  .colorVariant
                                  .name ||
                                item
                                  .colorVariant
                                  .label ||
                                'Selected'
                                : item.colorVariant}
                            </p>
                          )}

                          {item.shadeColor && (
                            <p className="text-[9px] text-[#8A7569]">
                              Shade:{' '}
                              {typeof item.shadeColor ===
                                'object'
                                ? item
                                  .shadeColor
                                  .name ||
                                item
                                  .shadeColor
                                  .label ||
                                'Selected'
                                : item.shadeColor}
                            </p>
                          )}

                          {item.bulbOption && (
                            <p className="text-[9px] text-[#8A7569]">
                              Bulb:{' '}
                              {typeof item.bulbOption ===
                                'object'
                                ? item
                                  .bulbOption
                                  .name ||
                                item
                                  .bulbOption
                                  .label ||
                                'Selected'
                                : item.bulbOption}
                            </p>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-[#281912]">
                          Rs.
                          {formatPKR(
                            safeNumber(
                              item.unitPrice ??
                              item
                                .product
                                ?.price
                            ) *
                            safeNumber(
                              item.quantity,
                              1
                            )
                          )}
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <p className="py-8 text-center text-xs text-[#8A7569]">
                    Your cart is
                    empty.
                  </p>
                )}
              </div>

              <div className="border-t border-[#3A2117]/10 p-5">
                <div className="space-y-3 text-xs text-[#6B5A50]">
                  {/* PROMO CODE */}
                  <div className="mb-5 rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-4">

                    <div className="flex items-center gap-2">
                      <TicketPercent
                        size={17}
                        className="text-[#6B4228]"
                      />

                      <p className="text-xs font-semibold text-[#3A2117]">
                        Promo Code
                      </p>
                    </div>

                    {appliedCoupon ? (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                        <div className="flex items-start justify-between gap-3">

                          <div className="flex min-w-0 gap-2.5">
                            <CheckCircle
                              size={17}
                              className="mt-0.5 shrink-0 text-emerald-600"
                            />

                            <div className="min-w-0">
                              <p className="font-mono text-sm font-bold tracking-wide text-emerald-800">
                                {appliedCoupon.coupon.code}
                              </p>

                              <p className="mt-1 text-[10px] text-[#6B5A50]">
                                You save Rs.{formatPKR(couponDiscount)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            aria-label="Remove coupon"
                            title="Remove coupon"
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#8A7569] transition hover:bg-[#E9DED6] hover:text-[#3A2117]"
                          >
                            <X size={15} />
                          </button>

                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleApplyCoupon}
                        className="mt-3 flex gap-2"
                      >
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(event) => {
                            setCouponCode(event.target.value.toUpperCase())

                            if (couponMessage.text) {
                              setCouponMessage({
                                type: '',
                                text: '',
                              })
                            }
                          }}
                          placeholder="Enter promo code"
                          autoComplete="off"
                          className="min-w-0 flex-1 rounded-xl border border-[#3A2117]/15 bg-[#FFFEFC] px-3.5 py-2.5 text-xs font-medium uppercase text-[#281912] outline-none placeholder:normal-case placeholder:text-[#A28E82] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                        />

                        <button
                          type="submit"
                          disabled={couponLoading || !couponCode.trim()}
                          className="inline-flex min-w-[82px] items-center justify-center gap-1.5 rounded-xl bg-[#3A2117] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#4A2B1F] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {couponLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : null}

                          Apply
                        </button>
                      </form>
                    )}

                    {couponMessage.text && (
                      <div
                        className={`mt-2.5 flex items-start gap-2 text-[10px] leading-4 ${couponMessage.type === 'success'
                          ? 'text-emerald-700'
                          : 'text-rose-600'
                          }`}
                      >
                        {couponMessage.type === 'success' ? (
                          <CheckCircle size={13} className="mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle size={13} className="mt-0.5 shrink-0" />
                        )}

                        <span>{couponMessage.text}</span>
                      </div>
                    )}

                  </div>
                  {/* END PROMO CODE */}
                  <div className="flex justify-between gap-4">
                    <span>
                      Subtotal
                    </span>

                    <span className="font-medium text-[#281912]">
                      Rs.
                      {formatPKR(
                        numericTotal
                      )}
                    </span>
                  </div>

                  {couponDiscount >
                    0 && (
                      <div className="flex justify-between gap-4">
                        <span>
                          Discount{' '}
                          {appliedCoupon
                            ?.coupon
                            ?.code
                            ? `(${appliedCoupon.coupon.code})`
                            : ''}
                        </span>

                        <span className="font-semibold text-emerald-700">
                          - Rs.
                          {formatPKR(
                            couponDiscount
                          )}
                        </span>
                      </div>
                    )}

                  <div className="flex justify-between gap-4">
                    <span>
                      Shipping
                      {selectedShippingMethod?.name
                        ? ` · ${selectedShippingMethod.name}`
                        : ''}
                      {city
                        ? ` (${city})`
                        : ''}
                    </span>

                    <span
                      className={
                        shipping ===
                          0
                          ? 'font-semibold text-emerald-700'
                          : 'font-medium text-[#281912]'
                      }
                    >
                      {shipping ===
                        null
                        ? 'Select city'
                        : shipping ===
                          0
                          ? 'Free'
                          : `Rs.${formatPKR(
                            shipping
                          )}`}
                    </span>
                  </div>

                  {freeShippingEnabled &&
                    !qualifiesForFreeShipping && (
                      <div className="rounded-xl bg-[#F7F4EF] px-3 py-2.5 text-[10px] leading-4 text-[#8A654D]">
                        Free
                        shipping
                        on orders
                        of Rs.
                        {formatPKR(
                          freeShippingThreshold
                        )}{' '}
                        or more.
                      </div>
                    )}

                  <div className="border-t border-[#3A2117]/10 pt-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#281912]">
                          Total
                        </p>

                        <p className="mt-0.5 text-[9px] text-[#9A8171]">
                          Including
                          delivery
                          charges
                        </p>
                      </div>

                      <p className="text-xl font-semibold tracking-[-0.03em] text-[#281912]">
                        Rs.
                        {formatPKR(
                          grandTotal
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    currentStep ===
                      5
                      ? handleSubmit
                      : handleNextStep
                  }
                  disabled={
                    loading ||
                    (currentStep ===
                      5 &&
                      (!paymentMethod ||
                        !city ||
                        !selectedShippingMethod ||
                        shipping ===
                        null))
                  }
                  className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#3A2117] px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(58,33,23,0.20)] transition hover:bg-[#4A2B1F] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading
                    ? 'Placing Order...'
                    : currentStep ===
                      5
                      ? 'Place Order'
                      : 'Continue'}
                </button>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[9px] font-medium text-[#7A6A60]">
                  <div className="rounded-xl bg-[#F7F4EF] px-2 py-2.5">
                    Secure
                    Checkout
                  </div>

                  <div className="rounded-xl bg-[#F7F4EF] px-2 py-2.5">
                    Order
                    Tracking
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

function StepCard({
  step,
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_12px_40px_rgba(58,33,23,0.05)]">
      <div className="border-b border-[#3A2117]/10 bg-[#F2ECE5] px-5 py-5 sm:px-7">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
          Step {step}
        </p>

        <h2 className="mt-1 text-lg font-semibold text-[#281912]">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-[#7A6A60]">
          {description}
        </p>
      </div>

      <div className="p-5 sm:p-7">
        {children}
      </div>
    </section>
  )
}

function Field({
  label,
  span = false,
  children,
}) {
  return (
    <div
      className={
        span
          ? 'sm:col-span-2'
          : ''
      }
    >
      <label
        className={
          labelClass
        }
      >
        {label}
      </label>

      {children}
    </div>
  )
}

function ActionRow({
  onBack,
  onNext,
  nextLabel = 'Continue →',
  hideBack = false,
  hideNext = false,
  nextDisabled = false,
}) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3">
      {hideBack ? (
        <span />
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="min-h-[46px] rounded-full border border-[#3A2117]/15 px-6 text-xs font-semibold text-[#3A2117]"
        >
          ← Back
        </button>
      )}

      {!hideNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={
            nextDisabled
          }
          className="min-h-[48px] rounded-full bg-[#3A2117] px-7 text-sm font-semibold text-white transition hover:bg-[#4A2B1F] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}

function ReviewBox({
  title,
  onEdit,
  children,
}) {
  return (
    <div className="flex items-start justify-between gap-5 rounded-2xl border border-[#3A2117]/10 bg-[#F7F4EF] p-4">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8A654D]">
          {title}
        </p>

        <div className="mt-2 space-y-1 text-xs leading-5 text-[#5F4C42]">
          {children}
        </div>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-[10px] font-semibold text-[#6B4228] underline underline-offset-4"
      >
        Edit
      </button>
    </div>
  )
}

function Info({
  label,
  value,
  onCopy,
}) {
  if (!value) {
    return null
  }

  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8A654D]">
        {label}
      </p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="min-w-0 break-all font-medium text-[#281912]">
          {value}
        </p>

        {onCopy && (
          <button
            type="button"
            onClick={() => onCopy(label, value)}
            title={`Copy ${label}`}
            aria-label={`Copy ${label}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#3A2117]/10 bg-white text-[#6B4228] transition hover:border-[#6B4228]/40 hover:bg-[#F2ECE5] active:scale-95"
          >
            <Copy size={15} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  )
}