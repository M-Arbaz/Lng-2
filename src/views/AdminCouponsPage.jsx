'use client'

import { useEffect, useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  Tag,
  Power,
  CalendarDays,
  TicketPercent,
  Users,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import couponsService from '../utils/couponsService.js'
import productsService from '../utils/productsService.js'
import categoriesService from '../utils/categoriesService.js'

const EMPTY_FORM = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  applicableTo: 'all',
  productIds: [],
  categoryIds: [],
  minOrderValue: '',
  maxUsageLimit: '',
  expiryDate: '',
  isActive: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [targetsLoading, setTargetsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [copiedCode, setCopiedCode] = useState(null)

  const [message, setMessage] = useState({
    type: '',
    text: '',
  })

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
  })

  // Load Coupons
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        setLoading(true)

        const data =
          await couponsService.getAllCoupons()

        setCoupons(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (error) {
        console.error(
          'Error loading coupons:',
          error
        )

        setMessage({
          type: 'error',
          text: 'Failed to load coupons',
        })
      } finally {
        setLoading(false)
      }
    }

    loadCoupons()
  }, [])

  // Load Products + Categories
  useEffect(() => {
    const loadCouponTargets = async () => {
      try {
        setTargetsLoading(true)

        const [
          productData,
          categoryData,
        ] = await Promise.all([
          productsService.getAllProducts(),
          categoriesService.getAllCategories(),
        ])

        setProducts(
          Array.isArray(productData)
            ? productData
            : []
        )

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : []
        )
      } catch (error) {
        console.error(
          'Error loading coupon targets:',
          error
        )

        setMessage({
          type: 'error',
          text: 'Failed to load products or categories',
        })
      } finally {
        setTargetsLoading(false)
      }
    }

    loadCouponTargets()
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
    }, 3000)
  }

  const handleInputChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target

    if (name === 'applicableTo') {
      setFormData((prev) => ({
        ...prev,
        applicableTo: value,

        productIds:
          value === 'products'
            ? prev.productIds
            : [],

        categoryIds:
          value === 'categories'
            ? prev.categoryIds
            : [],
      }))

      setProductSearch('')
      setCategorySearch('')

      return
    }

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const toggleCouponTarget = (
    field,
    id
  ) => {
    setFormData((prev) => {
      const current =
        Array.isArray(prev[field])
          ? prev[field]
          : []

      const alreadySelected =
        current.includes(id)

      return {
        ...prev,

        [field]: alreadySelected
          ? current.filter(
            (itemId) =>
              itemId !== id
          )
          : [...current, id],
      }
    })
  }

  const resetForm = () => {
    setFormData({
      ...EMPTY_FORM,
      productIds: [],
      categoryIds: [],
    })

    setEditingId(null)
    setProductSearch('')
    setCategorySearch('')
    setShowForm(false)
  }

  const openCreateForm = () => {
    setFormData({
      ...EMPTY_FORM,
      productIds: [],
      categoryIds: [],
    })

    setEditingId(null)
    setProductSearch('')
    setCategorySearch('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.code.trim() ||
      !String(
        formData.discountValue
      ).trim()
    ) {
      setMessage({
        type: 'error',
        text: 'Please fill all required fields',
      })

      return
    }

    const discountValue =
      Number(formData.discountValue)

    if (
      !Number.isFinite(
        discountValue
      ) ||
      discountValue <= 0
    ) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid discount value',
      })

      return
    }

    if (
      formData.discountType ===
      'percentage' &&
      discountValue > 100
    ) {
      setMessage({
        type: 'error',
        text: 'Percentage discount cannot be greater than 100%',
      })

      return
    }

    if (
      formData.applicableTo ===
      'products' &&
      formData.productIds.length === 0
    ) {
      setMessage({
        type: 'error',
        text: 'Please select at least one product',
      })

      return
    }

    if (
      formData.applicableTo ===
      'categories' &&
      formData.categoryIds.length === 0
    ) {
      setMessage({
        type: 'error',
        text: 'Please select at least one category',
      })

      return
    }

    try {
      setSaving(true)

      const payload = {
        code: formData.code
          .trim()
          .toUpperCase(),

        description:
          formData.description.trim(),

        discountType:
          formData.discountType,

        discountValue,

        applicableTo:
          formData.applicableTo,

        productIds:
          formData.applicableTo ===
            'products'
            ? formData.productIds
            : [],

        categoryIds:
          formData.applicableTo ===
            'categories'
            ? formData.categoryIds
            : [],

        minOrderValue:
          formData.minOrderValue
            ? Number(
              formData.minOrderValue
            )
            : 0,

        maxUsageLimit:
          formData.maxUsageLimit
            ? Number.parseInt(
              formData.maxUsageLimit,
              10
            )
            : null,

        expiryDate:
          formData.expiryDate ||
          null,

        isActive:
          formData.isActive,
      }

      if (editingId) {
        await couponsService.updateCoupon(
          editingId,
          payload
        )

        setCoupons((prev) =>
          prev.map((coupon) =>
            coupon.id === editingId
              ? {
                ...coupon,
                ...payload,
                updatedAt:
                  new Date().toISOString(),
              }
              : coupon
          )
        )

        showTemporaryMessage(
          'success',
          'Coupon updated successfully!'
        )
      } else {
        const newCoupon =
          await couponsService.createCoupon(
            payload
          )

        setCoupons((prev) => [
          newCoupon,
          ...prev,
        ])

        showTemporaryMessage(
          'success',
          'Coupon created successfully!'
        )
      }

      resetForm()
    } catch (error) {
      console.error(
        'Error saving coupon:',
        error
      )

      showTemporaryMessage(
        'error',
        'Failed to save coupon. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (coupon) => {
    setFormData({
      code:
        coupon.code || '',

      description:
        coupon.description || '',

      discountType:
        coupon.discountType ||
        'percentage',

      discountValue: String(
        coupon.discountValue ?? ''
      ),

      applicableTo:
        coupon.applicableTo ||
        'all',

      productIds:
        Array.isArray(
          coupon.productIds
        )
          ? coupon.productIds
          : [],

      categoryIds:
        Array.isArray(
          coupon.categoryIds
        )
          ? coupon.categoryIds
          : [],

      minOrderValue:
        coupon.minOrderValue != null
          ? String(
            coupon.minOrderValue
          )
          : '',

      maxUsageLimit:
        coupon.maxUsageLimit != null
          ? String(
            coupon.maxUsageLimit
          )
          : '',

      expiryDate:
        coupon.expiryDate || '',

      isActive:
        coupon.isActive !== false,
    })

    setProductSearch('')
    setCategorySearch('')
    setEditingId(coupon.id)
    setShowForm(true)
  }

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this coupon?'
      )

    if (!confirmed) {
      return
    }

    try {
      await couponsService.deleteCoupon(
        id
      )

      setCoupons((prev) =>
        prev.filter(
          (coupon) =>
            coupon.id !== id
        )
      )

      showTemporaryMessage(
        'success',
        'Coupon deleted successfully!'
      )
    } catch (error) {
      console.error(
        'Error deleting coupon:',
        error
      )

      showTemporaryMessage(
        'error',
        'Failed to delete coupon. Please try again.'
      )
    }
  }

  const handleToggleStatus = async (
    coupon
  ) => {
    try {
      const nextStatus =
        !coupon.isActive

      await couponsService.updateCoupon(
        coupon.id,
        {
          isActive: nextStatus,
        }
      )

      setCoupons((prev) =>
        prev.map((item) =>
          item.id === coupon.id
            ? {
              ...item,
              isActive:
                nextStatus,
            }
            : item
        )
      )

      showTemporaryMessage(
        'success',
        `Coupon ${nextStatus
          ? 'activated'
          : 'deactivated'
        }!`
      )
    } catch (error) {
      console.error(
        'Error toggling coupon status:',
        error
      )

      showTemporaryMessage(
        'error',
        'Failed to update coupon status'
      )
    }
  }

  const copyToClipboard = async (
    code
  ) => {
    try {
      await navigator.clipboard.writeText(
        code
      )

      setCopiedCode(code)

      setTimeout(() => {
        setCopiedCode(null)
      }, 2000)
    } catch (error) {
      console.error(
        'Failed to copy coupon code:',
        error
      )
    }
  }

  const isExpired = (
    expiryDate
  ) => {
    if (!expiryDate) {
      return false
    }

    const expiry =
      new Date(expiryDate)

    if (
      Number.isNaN(
        expiry.getTime()
      )
    ) {
      return false
    }

    return (
      expiry.getTime() <
      new Date().setHours(
        0,
        0,
        0,
        0
      )
    )
  }

  const formatMoney = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString('en-PK')
  }

  const formatDate = (
    value
  ) => {
    if (!value) {
      return 'No expiry'
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'Invalid date'
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

  const getApplicableLabel = (
    value
  ) => {
    if (value === 'products') {
      return 'Specific Products'
    }

    if (
      value === 'categories'
    ) {
      return 'Specific Categories'
    }

    return 'All Products'
  }

  const filteredCoupons =
    coupons.filter((coupon) => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      return (
        (coupon.code || '')
          .toLowerCase()
          .includes(query) ||
        (coupon.description || '')
          .toLowerCase()
          .includes(query)
      )
    })

  const filteredProducts =
    products.filter(
      (product) => {
        const query =
          productSearch
            .trim()
            .toLowerCase()

        if (!query) {
          return true
        }

        return (
          product.name
            ?.toLowerCase()
            .includes(query) ||
          product.title
            ?.toLowerCase()
            .includes(query)
        )
      }
    )

  const filteredCategories =
    categories.filter(
      (category) => {
        const query =
          categorySearch
            .trim()
            .toLowerCase()

        if (!query) {
          return true
        }

        return category.name
          ?.toLowerCase()
          .includes(query)
      }
    )

  const totalUsage =
    coupons.reduce(
      (sum, coupon) =>
        sum +
        Number(
          coupon.usageCount || 0
        ),
      0
    )

  const activeCoupons =
    coupons.filter(
      (coupon) =>
        coupon.isActive &&
        !isExpired(
          coupon.expiryDate
        )
    ).length

  const expiredCoupons =
    coupons.filter((coupon) =>
      isExpired(
        coupon.expiryDate
      )
    ).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-[#FFFEFC] shadow-sm">
                <TicketPercent className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Commerce
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Coupon Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Create and manage discount
                  codes, usage limits,
                  eligibility and expiry
                  settings.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-[#FFFEFC] shadow-sm transition hover:bg-[#281912] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Coupon
            </button>
          </div>
        </section>

        {/* Alert */}
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
          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Total Coupons
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {coupons.length}
                </p>
              </div>

              <div className="rounded-xl bg-[#F0E8E1] p-2.5 text-[#6B4228]">
                <Tag className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Active Coupons
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {activeCoupons}
                </p>
              </div>

              <div className="rounded-xl border border-[#CFE0D1] bg-[#F3F8F3] p-2.5 text-[#4D7553]">
                <Power className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Total Usage
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {totalUsage}
                </p>
              </div>

              <div className="rounded-xl border border-[#D9D2E5] bg-[#F7F4FA] p-2.5 text-[#6B5B7A]">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#8A7467]">
                  Expired
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
                  {expiredCoupons}
                </p>
              </div>

              <div className="rounded-xl border border-[#E5D4B4] bg-[#FFF9EA] p-2.5 text-[#8B6B2D]">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

              <input
                type="text"
                placeholder="Search by coupon code or description..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>

            <p className="shrink-0 text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {
                  filteredCoupons.length
                }
              </span>{' '}
              of {coupons.length}
            </p>
          </div>
        </section>

        {/* Coupons */}
        {loading ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-8 shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
            <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />

            <p className="mt-3 text-sm font-medium text-[#7B685D]">
              Loading coupons...
            </p>
          </section>
        ) : filteredCoupons.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] p-8 text-center shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2EBE5] text-[#9A7A68]">
              <Tag className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No coupons found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
              {searchQuery
                ? 'Try changing your search query.'
                : 'Create your first coupon to start offering discounts.'}
            </p>

            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3A2117] px-5 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912]"
              >
                <Plus className="h-4 w-4" />
                Create Coupon
              </button>
            )}
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredCoupons.map(
              (coupon) => {
                const expired =
                  isExpired(
                    coupon.expiryDate
                  )

                const status =
                  expired
                    ? 'expired'
                    : coupon.isActive
                      ? 'active'
                      : 'inactive'

                const selectedTargetCount =
                  coupon.applicableTo ===
                    'products'
                    ? coupon
                      .productIds
                      ?.length || 0
                    : coupon.applicableTo ===
                      'categories'
                      ? coupon
                        .categoryIds
                        ?.length || 0
                      : null

                return (
                  <article
                    key={coupon.id}
                    className="flex overflow-hidden rounded-2xl border border-[#E8DDD5] bg-[#FFFEFC] shadow-[0_10px_30px_rgba(58,33,23,0.05)] transition hover:-translate-y-0.5 hover:border-[#D8C7BB] hover:shadow-[0_16px_40px_rgba(58,33,23,0.09)]"
                  >
                    <div className="w-1.5 shrink-0 bg-[#6B4228]" />

                    <div className="flex min-w-0 flex-1 flex-col">
                      {/* Card Header */}
                      <div className="border-b border-[#EEE5DF] px-5 py-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A7A68]">
                              Coupon Code
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <h3 className="break-all font-mono text-xl font-bold tracking-wide text-[#3A2117]">
                                {
                                  coupon.code
                                }
                              </h3>

                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    coupon.code
                                  )
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DED1C8] text-[#7B685D] transition hover:border-[#6B4228] hover:bg-[#F7F4EF] hover:text-[#3A2117]"
                                title="Copy coupon code"
                              >
                                {copiedCode ===
                                  coupon.code ? (
                                  <CheckCircle className="h-4 w-4 text-[#4D7553]" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status ===
                                'active'
                                ? 'border-[#C8DDCB] bg-[#F2F8F3] text-[#4A7450]'
                                : status ===
                                  'expired'
                                  ? 'border-[#E5D4B4] bg-[#FFF9EA] text-[#866A28]'
                                  : 'border-[#D8D0CB] bg-[#F7F4F2] text-[#796B63]'
                              }`}
                          >
                            {status ===
                              'active'
                              ? 'Active'
                              : status ===
                                'expired'
                                ? 'Expired'
                                : 'Inactive'}
                          </span>
                        </div>

                        {coupon.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#7B685D]">
                            {
                              coupon.description
                            }
                          </p>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="rounded-xl border border-[#E7DAD0] bg-[#F7F4EF] p-4">
                          <p className="text-xs font-medium text-[#8A7467]">
                            Discount
                          </p>

                          <p className="mt-1 text-2xl font-semibold text-[#3A2117]">
                            {coupon.discountType ===
                              'percentage'
                              ? `${coupon.discountValue}%`
                              : `Rs. ${formatMoney(
                                coupon.discountValue
                              )}`}
                          </p>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-[#8A7467]">
                              Applies To
                            </span>

                            <span className="text-right font-semibold text-[#4D3A31]">
                              {getApplicableLabel(
                                coupon.applicableTo
                              )}
                            </span>
                          </div>

                          {selectedTargetCount !==
                            null && (
                              <div className="flex items-center justify-between gap-4 text-sm">
                                <span className="text-[#8A7467]">
                                  Selected
                                </span>

                                <span className="font-semibold text-[#4D3A31]">
                                  {
                                    selectedTargetCount
                                  }{' '}
                                  {coupon.applicableTo ===
                                    'products'
                                    ? 'products'
                                    : 'categories'}
                                </span>
                              </div>
                            )}

                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-[#8A7467]">
                              Minimum Order
                            </span>

                            <span className="font-semibold text-[#4D3A31]">
                              {Number(
                                coupon.minOrderValue ||
                                0
                              ) > 0
                                ? `Rs. ${formatMoney(
                                  coupon.minOrderValue
                                )}`
                                : 'None'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-[#8A7467]">
                              Usage
                            </span>

                            <span className="font-semibold text-[#4D3A31]">
                              {coupon.usageCount ||
                                0}

                              {coupon.maxUsageLimit
                                ? ` / ${coupon.maxUsageLimit}`
                                : ' / Unlimited'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-[#8A7467]">
                              Expiry
                            </span>

                            <span
                              className={`text-right font-semibold ${expired
                                  ? 'text-[#A05C46]'
                                  : 'text-[#4D3A31]'
                                }`}
                            >
                              {formatDate(
                                coupon.expiryDate
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-5 border-t border-[#EEE5DF] pt-4">
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(
                                  coupon
                                )
                              }
                              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition ${coupon.isActive
                                  ? 'border-[#E1C8C2] bg-[#FFF6F3] text-[#965044] hover:bg-[#FCEAE6]'
                                  : 'border-[#C9DCCB] bg-[#F3F8F3] text-[#4D7553] hover:bg-[#EAF4EB]'
                                }`}
                            >
                              <Power className="h-3.5 w-3.5" />

                              {coupon.isActive
                                ? 'Disable'
                                : 'Enable'}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  coupon
                                )
                              }
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D7C7BC] bg-[#FFFEFC] px-3 py-2.5 text-xs font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF]"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  coupon.id
                                )
                              }
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E3CBC6] bg-[#FFF8F6] px-3 py-2.5 text-xs font-semibold text-[#9B5145] transition hover:bg-[#FCEBE7]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              }
            )}
          </section>
        )}
      </div>

      {/* Create / Edit Coupon Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.3)]"
          >
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-[#FFFEFC]">
                    <TicketPercent className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-[#281912] sm:text-xl">
                      {editingId
                        ? 'Edit Coupon'
                        : 'Create Coupon'}
                    </h3>

                    <p className="mt-0.5 text-xs text-[#8A7467]">
                      {editingId
                        ? 'Update discount settings and availability.'
                        : 'Create a new discount code for customers.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7] hover:text-[#3A2117] disabled:opacity-50"
                  aria-label="Close coupon form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/65 p-4 sm:p-6">
              <div className="space-y-5">
                {/* Coupon Details */}
                <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Discount
                    </p>

                    <h4 className="mt-1 text-base font-semibold text-[#281912]">
                      Coupon Details
                    </h4>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                        Coupon Code{' '}
                        <span className="text-[#A35447]">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="code"
                        value={
                          formData.code
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="e.g. SUMMER20"
                        required
                        className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 font-mono text-sm uppercase text-[#281912] outline-none transition placeholder:font-sans placeholder:normal-case placeholder:text-[#AA9A91] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                        Discount Type{' '}
                        <span className="text-[#A35447]">
                          *
                        </span>
                      </label>

                      <select
                        name="discountType"
                        value={
                          formData.discountType
                        }
                        onChange={
                          handleInputChange
                        }
                        className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                      >
                        <option value="percentage">
                          Percentage (%)
                        </option>

                        <option value="fixed">
                          Fixed Amount (Rs.)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                        Discount Value{' '}
                        <span className="text-[#A35447]">
                          *
                        </span>
                      </label>

                      <input
                        type="number"
                        name="discountValue"
                        value={
                          formData.discountValue
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder={
                          formData.discountType ===
                            'percentage'
                            ? '20'
                            : '500'
                        }
                        min="0"
                        step="0.01"
                        required
                        className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#AA9A91] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                        Applicable To
                      </label>

                      <select
                        name="applicableTo"
                        value={
                          formData.applicableTo
                        }
                        onChange={
                          handleInputChange
                        }
                        className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                      >
                        <option value="all">
                          All Products
                        </option>

                        <option value="products">
                          Specific Products
                        </option>

                        <option value="categories">
                          Specific Categories
                        </option>
                      </select>
                    </div>

                    {/* Specific Products */}
                    {formData.applicableTo ===
                      'products' && (
                        <div className="sm:col-span-2">
                          <div className="rounded-xl border border-[#E1D5CD] bg-[#F8F5F1] p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-[#3A2117]">
                                  Select Products
                                </p>

                                <p className="mt-1 text-xs text-[#8A7467]">
                                  Coupon will only
                                  apply to selected
                                  products.
                                </p>
                              </div>

                              <span className="w-fit rounded-full bg-[#EDE4DC] px-3 py-1 text-xs font-semibold text-[#6B4228]">
                                {
                                  formData
                                    .productIds
                                    .length
                                }{' '}
                                selected
                              </span>
                            </div>

                            <div className="relative mt-4">
                              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

                              <input
                                type="text"
                                value={
                                  productSearch
                                }
                                onChange={(e) =>
                                  setProductSearch(
                                    e.target
                                      .value
                                  )
                                }
                                placeholder="Search products..."
                                className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] py-2.5 pl-10 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#AA9A91] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                              />
                            </div>

                            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                              {targetsLoading ? (
                                <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#DCCFC6] bg-[#FFFEFC] px-4 py-6 text-sm text-[#8A7467]">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Loading products...
                                </div>
                              ) : filteredProducts.length ===
                                0 ? (
                                <div className="rounded-lg border border-dashed border-[#DCCFC6] bg-[#FFFEFC] px-4 py-6 text-center text-sm text-[#8A7467]">
                                  No products found
                                </div>
                              ) : (
                                filteredProducts.map(
                                  (
                                    product
                                  ) => {
                                    const checked =
                                      formData.productIds.includes(
                                        product.id
                                      )

                                    return (
                                      <label
                                        key={
                                          product.id
                                        }
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${checked
                                            ? 'border-[#6B4228] bg-[#F4ECE6]'
                                            : 'border-[#E6DBD3] bg-[#FFFEFC] hover:border-[#CDBCAF]'
                                          }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={
                                            checked
                                          }
                                          onChange={() =>
                                            toggleCouponTarget(
                                              'productIds',
                                              product.id
                                            )
                                          }
                                          className="h-4 w-4 shrink-0 accent-[#6B4228]"
                                        />

                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-semibold text-[#281912]">
                                            {product.name ||
                                              product.title ||
                                              'Unnamed Product'}
                                          </p>

                                          {product.price !=
                                            null && (
                                              <p className="mt-0.5 text-xs text-[#8A7467]">
                                                Rs.{' '}
                                                {Number(
                                                  product.price
                                                ).toLocaleString(
                                                  'en-PK'
                                                )}
                                              </p>
                                            )}
                                        </div>

                                        {checked && (
                                          <CheckCircle className="h-4 w-4 shrink-0 text-[#6B4228]" />
                                        )}
                                      </label>
                                    )
                                  }
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Specific Categories */}
                    {formData.applicableTo ===
                      'categories' && (
                        <div className="sm:col-span-2">
                          <div className="rounded-xl border border-[#E1D5CD] bg-[#F8F5F1] p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-[#3A2117]">
                                  Select Categories
                                </p>

                                <p className="mt-1 text-xs text-[#8A7467]">
                                  Coupon will apply
                                  to products inside
                                  selected
                                  categories.
                                </p>
                              </div>

                              <span className="w-fit rounded-full bg-[#EDE4DC] px-3 py-1 text-xs font-semibold text-[#6B4228]">
                                {
                                  formData
                                    .categoryIds
                                    .length
                                }{' '}
                                selected
                              </span>
                            </div>

                            <div className="relative mt-4">
                              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

                              <input
                                type="text"
                                value={
                                  categorySearch
                                }
                                onChange={(e) =>
                                  setCategorySearch(
                                    e.target
                                      .value
                                  )
                                }
                                placeholder="Search categories..."
                                className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] py-2.5 pl-10 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#AA9A91] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                              />
                            </div>

                            <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                              {targetsLoading ? (
                                <div className="sm:col-span-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#DCCFC6] bg-[#FFFEFC] px-4 py-6 text-sm text-[#8A7467]">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Loading
                                  categories...
                                </div>
                              ) : filteredCategories.length ===
                                0 ? (
                                <div className="sm:col-span-2 rounded-lg border border-dashed border-[#DCCFC6] bg-[#FFFEFC] px-4 py-6 text-center text-sm text-[#8A7467]">
                                  No categories
                                  found
                                </div>
                              ) : (
                                filteredCategories.map(
                                  (
                                    category
                                  ) => {
                                    const checked =
                                      formData.categoryIds.includes(
                                        category.id
                                      )

                                    return (
                                      <label
                                        key={
                                          category.id
                                        }
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${checked
                                            ? 'border-[#6B4228] bg-[#F4ECE6]'
                                            : 'border-[#E6DBD3] bg-[#FFFEFC] hover:border-[#CDBCAF]'
                                          }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={
                                            checked
                                          }
                                          onChange={() =>
                                            toggleCouponTarget(
                                              'categoryIds',
                                              category.id
                                            )
                                          }
                                          className="h-4 w-4 shrink-0 accent-[#6B4228]"
                                        />

                                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#281912]">
                                          {category.name ||
                                            'Unnamed Category'}
                                        </span>

                                        {checked && (
                                          <CheckCircle className="h-4 w-4 shrink-0 text-[#6B4228]" />
                                        )}
                                      </label>
                                    )
                                  }
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                        Description
                      </label>

                      <textarea
                        name="description"
                        value={
                          formData.description
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Describe the offer..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm leading-6 text-[#281912] outline-none transition placeholder:text-[#AA9A91] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                      />
                    </div>
                  </div>
                </section>

                {/* Usage Conditions */}
                <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
                  <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Rules
                    </p>

                    <h4 className="mt-1 text-base font-semibold text-[#281912]">
                      Usage Conditions
                    </h4>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                        Minimum Order
                        Value (Rs.)
                      </label>

                      <input
                        type="number"
                        name="minOrderValue"
                        value={
                          formData.minOrderValue
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="0"
                        step="0.01"
                        min="0"
                        className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#AA9A91] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                      />

                      <p className="mt-1.5 text-xs text-[#99867B]">
                        Leave empty for no
                        minimum order value.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                        Maximum Usage Limit
                      </label>

                      <input
                        type="number"
                        name="maxUsageLimit"
                        value={
                          formData.maxUsageLimit
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="Unlimited"
                        min="1"
                        className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#AA9A91] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                      />

                      <p className="mt-1.5 text-xs text-[#99867B]">
                        Leave empty for
                        unlimited usage.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#3A2117]">
                        Expiry Date
                      </label>

                      <input
                        type="date"
                        name="expiryDate"
                        value={
                          formData.expiryDate
                        }
                        onChange={
                          handleInputChange
                        }
                        className="w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#E1D5CD] bg-[#F8F5F1] px-4 py-3.5">
                        <div>
                          <p className="text-sm font-semibold text-[#3A2117]">
                            Coupon Active
                          </p>

                          <p className="mt-0.5 text-xs text-[#8A7467]">
                            Customers can use
                            this coupon when
                            enabled.
                          </p>
                        </div>

                        <div className="relative shrink-0">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={
                              formData.isActive
                            }
                            onChange={
                              handleInputChange
                            }
                            className="peer sr-only"
                          />

                          <div className="h-6 w-11 rounded-full bg-[#D8CEC8] transition peer-checked:bg-[#6B4228]" />

                          <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                        </div>
                      </label>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingId
                    ? 'Update Coupon'
                    : 'Create Coupon'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  )
}