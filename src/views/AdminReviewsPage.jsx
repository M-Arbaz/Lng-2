'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  CheckCircle,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  Reply,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import reviewsService from '../utils/reviewsService.js'
import productsService from '../utils/productsService.js'

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

function createEmptyReviewForm() {
  return {
    name: '',
    handle: '',
    rating: 5,
    comment: '',
    screenshotImage: '',
    productId: '',
    productImage: '',
    isActive: true,
  }
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—'
  }

  return date.toLocaleString(
    'en-PK',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  )
}

function Stars({
  rating,
  size = 'small',
}) {
  const value =
    Number(rating) || 0

  const iconClass =
    size === 'large'
      ? 'h-7 w-7'
      : 'h-4 w-4'

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            className={`${iconClass} ${star <= value
                ? 'fill-[#B77A3F] text-[#B77A3F]'
                : 'fill-[#E8DED5] text-[#E8DED5]'
              }`}
          />
        )
      )}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] =
    useState([])

  const [products, setProducts] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState('all')

  const [
    ratingFilter,
    setRatingFilter,
  ] = useState('all')

  const [
    visibilityFilter,
    setVisibilityFilter,
  ] = useState('all')

  const [
    replyFilter,
    setReplyFilter,
  ] = useState('all')

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const [
    replyingTo,
    setReplyingTo,
  ] = useState(null)

  const [
    replyText,
    setReplyText,
  ] = useState('')

  const [
    replySavingId,
    setReplySavingId,
  ] = useState(null)

  const [showForm, setShowForm] =
    useState(false)

  const [
    editingId,
    setEditingId,
  ] = useState(null)

  const [saving, setSaving] =
    useState(false)

  const [
    uploadingScreenshot,
    setUploadingScreenshot,
  ] = useState(false)

  const [
    uploadingProductImage,
    setUploadingProductImage,
  ] = useState(false)

  const [
    deletingId,
    setDeletingId,
  ] = useState(null)

  const [
    togglingId,
    setTogglingId,
  ] = useState(null)

  const [
    removingReplyId,
    setRemovingReplyId,
  ] = useState(null)

  const [
    reviewForm,
    setReviewForm,
  ] = useState(
    createEmptyReviewForm
  )

  const screenshotInputRef =
    useRef(null)

  const productImageInputRef =
    useRef(null)

  const messageTimerRef =
    useRef(null)

  const formBusy =
    saving ||
    uploadingScreenshot ||
    uploadingProductImage

  const showMessage = (
    type,
    text
  ) => {
    if (
      messageTimerRef.current
    ) {
      window.clearTimeout(
        messageTimerRef.current
      )
    }

    setMessage({
      type,
      text,
    })

    messageTimerRef.current =
      window.setTimeout(() => {
        setMessage({
          type: '',
          text: '',
        })
      }, 3500)
  }

  useEffect(() => {
    return () => {
      if (
        messageTimerRef.current
      ) {
        window.clearTimeout(
          messageTimerRef.current
        )
      }
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [
        reviewsData,
        productsData,
      ] = await Promise.all([
        reviewsService.getAllReviews(),
        productsService.getAllProducts(),
      ])

      setReviews(
        Array.isArray(reviewsData)
          ? reviewsData
          : []
      )

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : []
      )
    } catch (error) {
      console.error(
        'Error loading reviews:',
        error
      )

      showMessage(
        'error',
        'Failed to load reviews.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getProduct = (
    productId
  ) => {
    return products.find(
      (product) =>
        product.id === productId
    )
  }

  const getProductName = (
    productId
  ) => {
    return (
      getProduct(productId)
        ?.name ||
      'No Product'
    )
  }

  const getProductImage = (
    review
  ) => {
    if (review?.productImage) {
      return review.productImage
    }

    const product =
      getProduct(
        review?.productId
      )

    if (
      Array.isArray(
        product?.images
      ) &&
      product.images.length > 0
    ) {
      return product.images[0]
    }

    return (
      product?.image ||
      ''
    )
  }

  const stats = useMemo(() => {
    const ratings =
      reviews
        .map((review) =>
          Number(review.rating)
        )
        .filter(
          (rating) =>
            Number.isFinite(
              rating
            )
        )

    const average =
      ratings.length > 0
        ? ratings.reduce(
          (sum, rating) =>
            sum + rating,
          0
        ) / ratings.length
        : 0

    return {
      total:
        reviews.length,

      active:
        reviews.filter(
          (review) =>
            review.isActive !== false
        ).length,

      replied:
        reviews.filter(
          (review) =>
            Boolean(
              String(
                review.adminReply ||
                ''
              ).trim()
            )
        ).length,

      average,
    }
  }, [reviews])

  const filteredReviews =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      return reviews.filter(
        (review) => {
          const matchesSearch =
            !query ||
            [
              review.name,
              review.handle,
              review.comment,
              review.adminReply,
              getProductName(
                review.productId
              ),
            ].some((value) =>
              String(value || '')
                .toLowerCase()
                .includes(query)
            )

          const matchesProduct =
            selectedProduct ===
            'all' ||
            review.productId ===
            selectedProduct

          const matchesRating =
            ratingFilter ===
            'all' ||
            Number(
              review.rating
            ) ===
            Number(
              ratingFilter
            )

          const isActive =
            review.isActive !==
            false

          const matchesVisibility =
            visibilityFilter ===
            'all' ||
            (visibilityFilter ===
              'active'
              ? isActive
              : !isActive)

          const hasReply =
            Boolean(
              String(
                review.adminReply ||
                ''
              ).trim()
            )

          const matchesReply =
            replyFilter ===
            'all' ||
            (replyFilter ===
              'replied'
              ? hasReply
              : !hasReply)

          return (
            matchesSearch &&
            matchesProduct &&
            matchesRating &&
            matchesVisibility &&
            matchesReply
          )
        }
      )
    }, [
      reviews,
      products,
      searchQuery,
      selectedProduct,
      ratingFilter,
      visibilityFilter,
      replyFilter,
    ])

  const resetReviewForm = () => {
    setReviewForm(
      createEmptyReviewForm()
    )

    setEditingId(null)
    setShowForm(false)

    if (
      screenshotInputRef.current
    ) {
      screenshotInputRef.current.value =
        ''
    }

    if (
      productImageInputRef.current
    ) {
      productImageInputRef.current.value =
        ''
    }
  }

  const openAddReview = () => {
    setReviewForm(
      createEmptyReviewForm()
    )

    setEditingId(null)
    setShowForm(true)
  }

  const openEditReview = (
    review
  ) => {
    setReviewForm({
      name:
        review.name || '',

      handle:
        review.handle || '',

      rating:
        Number(
          review.rating
        ) || 5,

      comment:
        review.comment || '',

      screenshotImage:
        review.screenshotImage ||
        '',

      productId:
        review.productId || '',

      productImage:
        review.productImage ||
        '',

      isActive:
        review.isActive !== false,
    })

    setEditingId(review.id)
    setShowForm(true)
  }

  const closeForm = () => {
    if (formBusy) {
      return
    }

    resetReviewForm()
  }

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setReviewForm((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const handleScreenshotUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      if (!file) return

      try {
        setUploadingScreenshot(
          true
        )

        const url =
          await reviewsService.uploadReviewImage(
            file
          )

        setReviewForm(
          (prev) => ({
            ...prev,

            screenshotImage:
              url,
          })
        )

        showMessage(
          'success',
          'Review screenshot uploaded to XCDN.'
        )
      } catch (error) {
        console.error(
          'Screenshot upload failed:',
          error
        )

        showMessage(
          'error',
          'Screenshot upload failed.'
        )
      } finally {
        setUploadingScreenshot(
          false
        )

        if (
          screenshotInputRef.current
        ) {
          screenshotInputRef.current.value =
            ''
        }
      }
    }

  const handleProductImageUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      if (!file) return

      try {
        setUploadingProductImage(
          true
        )

        const url =
          await reviewsService.uploadReviewImage(
            file
          )

        setReviewForm(
          (prev) => ({
            ...prev,

            productImage:
              url,
          })
        )

        showMessage(
          'success',
          'Custom product image uploaded to XCDN.'
        )
      } catch (error) {
        console.error(
          'Product image upload failed:',
          error
        )

        showMessage(
          'error',
          'Product image upload failed.'
        )
      } finally {
        setUploadingProductImage(
          false
        )

        if (
          productImageInputRef.current
        ) {
          productImageInputRef.current.value =
            ''
        }
      }
    }

  const handleSubmitReview =
    async (event) => {
      event.preventDefault()

      if (
        !reviewForm.comment.trim()
      ) {
        showMessage(
          'error',
          'Review text is required.'
        )

        return
      }

      const payload = {
        name:
          reviewForm.name.trim() ||
          'Anonymous',

        handle:
          reviewForm.handle.trim(),

        rating:
          Number(
            reviewForm.rating
          ) || 5,

        comment:
          reviewForm.comment.trim(),

        screenshotImage:
          reviewForm.screenshotImage ||
          '',

        productId:
          reviewForm.productId ||
          '',

        productImage:
          reviewForm.productImage ||
          '',

        isActive:
          reviewForm.isActive,
      }

      try {
        setSaving(true)

        if (editingId) {
          const updated =
            await reviewsService.updateReview(
              editingId,
              payload
            )

          setReviews((prev) =>
            prev.map((review) =>
              review.id ===
                editingId
                ? {
                  ...review,
                  ...updated,
                }
                : review
            )
          )

          showMessage(
            'success',
            'Review updated successfully.'
          )
        } else {
          const created =
            await reviewsService.addReview(
              payload
            )

          setReviews((prev) => [
            created,
            ...prev,
          ])

          showMessage(
            'success',
            'Review created successfully.'
          )
        }

        resetReviewForm()
      } catch (error) {
        console.error(
          'Review save failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to save review.'
        )
      } finally {
        setSaving(false)
      }
    }

  const handleDelete =
    async (review) => {
      const confirmed =
        window.confirm(
          `Delete ${review.name
            ? `${review.name}'s`
            : 'this'
          } review? This action cannot be undone.`
        )

      if (!confirmed) return

      try {
        setDeletingId(
          review.id
        )

        await reviewsService.deleteReview(
          review.id
        )

        setReviews((prev) =>
          prev.filter(
            (item) =>
              item.id !== review.id
          )
        )

        showMessage(
          'success',
          'Review deleted.'
        )
      } catch (error) {
        console.error(
          'Review delete failed:',
          error
        )

        showMessage(
          'error',
          'Failed to delete review.'
        )
      } finally {
        setDeletingId(null)
      }
    }

  const handleToggleActive =
    async (review) => {
      const nextActive =
        review.isActive === false

      try {
        setTogglingId(
          review.id
        )

        await reviewsService.updateReview(
          review.id,
          {
            isActive:
              nextActive,
          }
        )

        setReviews((prev) =>
          prev.map((item) =>
            item.id === review.id
              ? {
                ...item,
                isActive:
                  nextActive,
              }
              : item
          )
        )

        showMessage(
          'success',
          nextActive
            ? 'Review is now visible.'
            : 'Review hidden from storefront.'
        )
      } catch (error) {
        console.error(
          'Visibility update failed:',
          error
        )

        showMessage(
          'error',
          'Failed to update review visibility.'
        )
      } finally {
        setTogglingId(null)
      }
    }

  const openReplyEditor = (
    review
  ) => {
    setReplyingTo(
      review.id
    )

    setReplyText(
      review.adminReply ||
      ''
    )
  }

  const closeReplyEditor =
    () => {
      setReplyingTo(null)
      setReplyText('')
    }

  const handleReply =
    async (reviewId) => {
      const text =
        replyText.trim()

      if (!text) {
        showMessage(
          'error',
          'Please enter a reply.'
        )

        return
      }

      try {
        setReplySavingId(
          reviewId
        )

        const updated =
          await reviewsService.addReply(
            reviewId,
            text
          )

        setReviews((prev) =>
          prev.map((review) =>
            review.id ===
              reviewId
              ? {
                ...review,

                adminReply:
                  updated.adminReply,

                adminReplyAt:
                  updated.adminReplyAt,
              }
              : review
          )
        )

        closeReplyEditor()

        showMessage(
          'success',
          'Admin reply saved.'
        )
      } catch (error) {
        console.error(
          'Reply save failed:',
          error
        )

        showMessage(
          'error',
          'Failed to save reply.'
        )
      } finally {
        setReplySavingId(null)
      }
    }

  const handleRemoveReply =
    async (review) => {
      const confirmed =
        window.confirm(
          'Remove the admin reply from this review?'
        )

      if (!confirmed) return

      try {
        setRemovingReplyId(
          review.id
        )

        await reviewsService.removeReply(
          review.id
        )

        setReviews((prev) =>
          prev.map((item) =>
            item.id === review.id
              ? {
                ...item,
                adminReply: null,
                adminReplyAt:
                  null,
              }
              : item
          )
        )

        if (
          replyingTo ===
          review.id
        ) {
          closeReplyEditor()
        }

        showMessage(
          'success',
          'Admin reply removed.'
        )
      } catch (error) {
        console.error(
          'Reply removal failed:',
          error
        )

        showMessage(
          'error',
          'Failed to remove reply.'
        )
      } finally {
        setRemovingReplyId(
          null
        )
      }
    }

  const selectedFormProduct =
    useMemo(
      () =>
        products.find(
          (product) =>
            product.id ===
            reviewForm.productId
        ),
      [
        products,
        reviewForm.productId,
      ]
    )

  const selectedProductImage =
    useMemo(() => {
      if (
        reviewForm.productImage
      ) {
        return reviewForm.productImage
      }

      if (
        Array.isArray(
          selectedFormProduct?.images
        ) &&
        selectedFormProduct.images
          .length > 0
      ) {
        return selectedFormProduct
          .images[0]
      }

      return (
        selectedFormProduct?.image ||
        ''
      )
    }, [
      reviewForm.productImage,
      selectedFormProduct,
    ])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-[#FFFEFC]">
                <MessageSquare className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Storefront
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Reviews
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Manage customer
                  feedback, storefront
                  visibility, product
                  associations and Lamp &
                  Glow replies.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                openAddReview
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Review
            </button>
          </div>
        </section>

        {/* Feedback */}
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
          <StatCard
            icon={MessageSquare}
            label="Total Reviews"
            value={stats.total}
            text="All customer feedback"
          />

          <StatCard
            icon={Eye}
            label="Visible"
            value={stats.active}
            text="Shown on storefront"
          />

          <StatCard
            icon={Reply}
            label="Replied"
            value={stats.replied}
            text="Lamp & Glow responses"
          />

          <StatCard
            icon={Star}
            label="Average Rating"
            value={
              stats.average > 0
                ? stats.average.toFixed(
                  1
                )
                : '0.0'
            }
            text="Across all reviews"
          />
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_repeat(4,minmax(145px,190px))]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

              <input
                type="text"
                value={
                  searchQuery
                }
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search customer, review, reply or product..."
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>

            <select
              value={
                selectedProduct
              }
              onChange={(event) =>
                setSelectedProduct(
                  event.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="all">
                All Products
              </option>

              {products.map(
                (product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                )
              )}
            </select>

            <select
              value={
                ratingFilter
              }
              onChange={(event) =>
                setRatingFilter(
                  event.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="all">
                All Ratings
              </option>

              {[5, 4, 3, 2, 1].map(
                (rating) => (
                  <option
                    key={rating}
                    value={rating}
                  >
                    {rating} Star
                  </option>
                )
              )}
            </select>

            <select
              value={
                visibilityFilter
              }
              onChange={(event) =>
                setVisibilityFilter(
                  event.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="all">
                All Visibility
              </option>

              <option value="active">
                Visible
              </option>

              <option value="inactive">
                Hidden
              </option>
            </select>

            <select
              value={
                replyFilter
              }
              onChange={(event) =>
                setReplyFilter(
                  event.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="all">
                All Replies
              </option>

              <option value="replied">
                Replied
              </option>

              <option value="unreplied">
                No Reply
              </option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
            <p className="text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {
                  filteredReviews.length
                }
              </span>{' '}
              of {reviews.length} reviews
            </p>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B4228] hover:text-[#281912] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading
                    ? 'animate-spin'
                    : ''
                  }`}
              />

              Refresh
            </button>
          </div>
        </section>

        {/* Reviews */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading reviews...
              </p>
            </div>
          </section>
        ) : filteredReviews.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <MessageSquare className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No reviews found
            </h3>

            <p className="mt-1 text-sm text-[#8A7467]">
              Try adjusting the
              current filters.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredReviews.map(
              (review) => {
                const active =
                  review.isActive !==
                  false

                const productImage =
                  getProductImage(
                    review
                  )

                const hasReply =
                  Boolean(
                    String(
                      review.adminReply ||
                      ''
                    ).trim()
                  )

                return (
                  <article
                    key={review.id}
                    className={`rounded-2xl border bg-[#FFFEFC] p-5 shadow-[0_10px_30px_rgba(58,33,23,0.05)] sm:p-6 ${active
                        ? 'border-[#E7DCD4]'
                        : 'border-[#E6DDD7] opacity-75'
                      }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row">
                      {/* Product */}
                      <div className="flex shrink-0 items-start gap-3 lg:w-[190px] lg:flex-col">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#EEE7E1] lg:h-36 lg:w-full">
                          {productImage ? (
                            <img
                              src={
                                productImage
                              }
                              alt={
                                getProductName(
                                  review.productId
                                )
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#A89285]">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A7A68]">
                            Product
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#3A2117]">
                            {getProductName(
                              review.productId
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Main */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3A2117] text-sm font-semibold text-white">
                                {review.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  '?'}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-[#281912]">
                                  {review.name ||
                                    'Anonymous'}
                                </p>

                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9A8478]">
                                  {review.handle && (
                                    <span>
                                      {
                                        review.handle
                                      }
                                    </span>
                                  )}

                                  <span>
                                    {formatDate(
                                      review.createdAt
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <Stars
                                rating={
                                  review.rating
                                }
                              />

                              <span className="text-xs font-semibold text-[#6B5A50]">
                                {Number(
                                  review.rating
                                ) || 0}
                                /5
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleActive(
                                  review
                                )
                              }
                              disabled={
                                togglingId ===
                                review.id
                              }
                              className={`flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-50 ${active
                                  ? 'text-[#44704B] hover:bg-[#EFF8F0]'
                                  : 'text-[#75645A] hover:bg-[#F7F4EF]'
                                }`}
                              title={
                                active
                                  ? 'Hide review'
                                  : 'Show review'
                              }
                            >
                              {togglingId ===
                                review.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : active ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditReview(
                                  review
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                              title="Edit review"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openReplyEditor(
                                  review
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                              title={
                                hasReply
                                  ? 'Edit reply'
                                  : 'Reply'
                              }
                            >
                              <Reply className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  review
                                )
                              }
                              disabled={
                                deletingId ===
                                review.id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                              title="Delete review"
                            >
                              {deletingId ===
                                review.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-[#5F4C42]">
                          {review.comment}
                        </p>

                        {/* Screenshot */}
                        {review.screenshotImage && (
                          <a
                            href={
                              review.screenshotImage
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-block overflow-hidden rounded-xl border border-[#E4D8CF]"
                          >
                            <img
                              src={
                                review.screenshotImage
                              }
                              alt="Customer review screenshot"
                              className="h-24 w-32 object-cover"
                            />
                          </a>
                        )}

                        {/* Existing Reply */}
                        {hasReply && (
                          <div className="mt-5 rounded-2xl border border-[#DCCCBD] bg-[#F7F4EF] p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3A2117] text-[10px] font-bold text-white">
                                L&G
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-[#3A2117]">
                                      Lamp & Glow
                                      Reply
                                    </p>

                                    {review.adminReplyAt && (
                                      <p className="mt-0.5 text-[10px] text-[#9A8478]">
                                        {formatDate(
                                          review.adminReplyAt
                                        )}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openReplyEditor(
                                          review
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B4228] hover:bg-white"
                                      title="Edit reply"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveReply(
                                          review
                                        )
                                      }
                                      disabled={
                                        removingReplyId ===
                                        review.id
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#954B42] hover:bg-[#FFF2EF] disabled:opacity-50"
                                      title="Delete reply"
                                    >
                                      {removingReplyId ===
                                        review.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <p className="mt-2 text-sm leading-6 text-[#5F4C42]">
                                  {
                                    review.adminReply
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reply Editor */}
                        {replyingTo ===
                          review.id && (
                            <div className="mt-5 rounded-2xl border border-[#DCCCBD] bg-[#FFFEFC] p-4">
                              <label className="mb-2 block text-sm font-semibold text-[#4E3D34]">
                                {hasReply
                                  ? 'Edit Lamp & Glow Reply'
                                  : 'Reply to Customer'}
                              </label>

                              <textarea
                                value={
                                  replyText
                                }
                                onChange={(event) =>
                                  setReplyText(
                                    event.target.value
                                  )
                                }
                                rows={3}
                                autoFocus
                                placeholder="Write your reply..."
                                className={`${inputClass} resize-none`}
                              />

                              <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <button
                                  type="button"
                                  onClick={
                                    closeReplyEditor
                                  }
                                  className="rounded-xl border border-[#DCCFC6] px-4 py-2.5 text-xs font-semibold text-[#6B4228] hover:bg-[#F7F4EF]"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReply(
                                      review.id
                                    )
                                  }
                                  disabled={
                                    replySavingId ===
                                    review.id ||
                                    !replyText.trim()
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                                >
                                  {replySavingId ===
                                    review.id && (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    )}

                                  {hasReply
                                    ? 'Update Reply'
                                    : 'Post Reply'}
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </article>
                )
              }
            )}
          </section>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3A2117] text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Reviews
                    </p>

                    <h3 className="text-lg font-semibold text-[#281912] sm:text-xl">
                      {editingId
                        ? 'Edit Review'
                        : 'Add Review'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={formBusy}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7B685D] hover:bg-[#F2ECE7] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={
                handleSubmitReview
              }
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Scrollable Content */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
                <div className="space-y-5">
                  {/* Customer */}
                  <FormSection
                    eyebrow="Customer"
                    title="Review Details"
                    description="Add or update the reviewer information, rating and review content."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>
                          Reviewer Name
                        </FieldLabel>

                        <input
                          type="text"
                          name="name"
                          value={
                            reviewForm.name
                          }
                          onChange={
                            handleFormChange
                          }
                          placeholder="e.g. Asad"
                          className={
                            inputClass
                          }
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          Handle
                        </FieldLabel>

                        <input
                          type="text"
                          name="handle"
                          value={
                            reviewForm.handle
                          }
                          onChange={
                            handleFormChange
                          }
                          placeholder="e.g. @asad"
                          className={
                            inputClass
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <FieldLabel>
                        Rating
                      </FieldLabel>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setReviewForm(
                                  (prev) => ({
                                    ...prev,
                                    rating:
                                      star,
                                  })
                                )
                              }
                              className="rounded-lg p-1 transition hover:scale-110"
                            >
                              <Star
                                className={`h-7 w-7 ${star <=
                                    reviewForm.rating
                                    ? 'fill-[#B77A3F] text-[#B77A3F]'
                                    : 'fill-[#E8DED5] text-[#E8DED5]'
                                  }`}
                              />
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <FieldLabel>
                        Review Text *
                      </FieldLabel>

                      <textarea
                        name="comment"
                        value={
                          reviewForm.comment
                        }
                        onChange={
                          handleFormChange
                        }
                        rows={5}
                        placeholder="Customer review text..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </FormSection>

                  {/* Screenshot */}
                  <FormSection
                    eyebrow="Evidence"
                    title="Review Screenshot"
                    description="Optional screenshot of WhatsApp, Instagram or other customer feedback."
                  >
                    <ImageUploader
                      value={
                        reviewForm.screenshotImage
                      }
                      inputRef={
                        screenshotInputRef
                      }
                      uploading={
                        uploadingScreenshot
                      }
                      onUpload={
                        handleScreenshotUpload
                      }
                      onRemove={() =>
                        setReviewForm(
                          (prev) => ({
                            ...prev,
                            screenshotImage:
                              '',
                          })
                        )
                      }
                      title="Review Screenshot"
                    />
                  </FormSection>

                  {/* Product */}
                  <FormSection
                    eyebrow="Product"
                    title="Product Association"
                    description="Associate the review with an existing product or optionally provide a custom display image."
                  >
                    <div>
                      <FieldLabel>
                        Existing Product
                      </FieldLabel>

                      <select
                        name="productId"
                        value={
                          reviewForm.productId
                        }
                        onChange={
                          handleFormChange
                        }
                        className={
                          inputClass
                        }
                      >
                        <option value="">
                          No Product
                        </option>

                        {products.map(
                          (product) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                            >
                              {
                                product.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {selectedProductImage &&
                      !reviewForm.productImage && (
                        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#E7DCD4] bg-[#FAF7F4] p-3">
                          <img
                            src={
                              selectedProductImage
                            }
                            alt="Selected product"
                            className="h-14 w-14 rounded-lg object-cover"
                          />

                          <div>
                            <p className="text-xs font-semibold text-[#3A2117]">
                              Product image
                              selected
                              automatically
                            </p>

                            <p className="mt-1 text-[11px] text-[#9A8478]">
                              Custom image below
                              will override it.
                            </p>
                          </div>
                        </div>
                      )}

                    <div className="mt-4">
                      <FieldLabel>
                        Custom Product Image
                      </FieldLabel>

                      <ImageUploader
                        value={
                          reviewForm.productImage
                        }
                        inputRef={
                          productImageInputRef
                        }
                        uploading={
                          uploadingProductImage
                        }
                        onUpload={
                          handleProductImageUpload
                        }
                        onRemove={() =>
                          setReviewForm(
                            (prev) => ({
                              ...prev,
                              productImage:
                                '',
                            })
                          )
                        }
                        title="Custom Product Image"
                      />
                    </div>
                  </FormSection>

                  {/* Visibility */}
                  <FormSection
                    eyebrow="Display"
                    title="Storefront Visibility"
                    description="Hidden reviews remain in Admin but should not contribute to public review sections."
                  >
                    <label
                      className={`block cursor-pointer rounded-xl border p-4 transition ${reviewForm.isActive
                          ? 'border-[#BFA995] bg-[#F5EEE8]'
                          : 'border-[#E6DCD5] bg-[#FAF7F4]'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                            {reviewForm.isActive ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#281912]">
                              Visible Review
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#8A7467]">
                              Show this review
                              across customer-facing
                              review areas.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          name="isActive"
                          checked={
                            reviewForm.isActive
                          }
                          onChange={
                            handleFormChange
                          }
                          className="mt-1 h-4 w-4 accent-[#6B4228]"
                        />
                      </div>
                    </label>
                  </FormSection>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={formBusy}
                    className="rounded-xl border border-[#DCCFC6] px-5 py-2.5 text-sm font-semibold text-[#6B4228] hover:bg-[#F7F4EF] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={formBusy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#281912] disabled:opacity-50"
                  >
                    {formBusy && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {saving
                      ? 'Saving...'
                      : uploadingScreenshot ||
                        uploadingProductImage
                        ? 'Uploading...'
                        : editingId
                          ? 'Update Review'
                          : 'Create Review'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  text,
}) {
  return (
    <div className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8A7467]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold text-[#281912]">
            {value}
          </p>

          <p className="mt-1 text-xs text-[#9A8478]">
            {text}
          </p>
        </div>

        <div className="rounded-xl bg-[#F0E8E1] p-2.5 text-[#6B4228]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
          {eyebrow}
        </p>

        <h4 className="mt-1 text-lg font-semibold text-[#281912]">
          {title}
        </h4>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[#8A7467]">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  )
}

function FieldLabel({
  children,
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-[#4E3D34]">
      {children}
    </label>
  )
}

function ImageUploader({
  value,
  inputRef,
  uploading,
  onUpload,
  onRemove,
  title,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-[#D7C7BC] bg-[#FAF7F4]">
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt={`${title} preview`}
            className="h-52 w-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#281912]/80 to-transparent p-4 pt-12">
            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#3A2117]"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}

              Replace
            </button>

            <button
              type="button"
              onClick={onRemove}
              disabled={uploading}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-[#954B42]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          disabled={uploading}
          className="flex min-h-[150px] w-full flex-col items-center justify-center p-6 text-center hover:bg-[#F5EFEA] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}

          <p className="mt-3 text-sm font-semibold text-[#4E3D34]">
            {uploading
              ? 'Uploading to XCDN...'
              : `Upload ${title}`}
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
      />
    </div>
  )
}