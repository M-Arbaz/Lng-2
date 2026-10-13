'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from '@/lib/navigation'
import classNames from '../utils/classNames.js'
import { getDiscountInfo } from '../utils/discountHelpers.js'
import { slugify, resolveCategoryName } from '../utils/slugify.js'
import useCategories from '../hooks/useCategories.js'

/* ────────── helper: accordion chevron icon ────────── */
function ChevronDown({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={classNames(
        'h-4 w-4 shrink-0 transition-transform duration-300',
        open ? 'rotate-180' : '',
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/* ────────── helper: accordion section ────────── */
function Accordion({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-stone-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-semibold text-stone-700 transition-colors hover:text-stone-900"
      >
        <span className="flex items-center gap-2.5">
          {icon}
          {title}
        </span>
        <ChevronDown open={open} />
      </button>
      <div
        className={classNames(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-[600px] pb-5 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="text-[13px] leading-relaxed text-stone-600">{children}</div>
      </div>
    </div>
  )
}

export default function ProductDetail({ products, onAddToCart, reviews, handleToggleWishlist, isInWishlist, theme = 'light', user, isLoggedIn, handleSubmitReview }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { categories } = useCategories()

  const product = products.find((p) => slugify(p.name) === slug)
  const productId = product?.id

  /* ─────────────────────────────────────────────────────────────
     ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURN
     (React Rules of Hooks — error #310 if violated)
  ───────────────────────────────────────────────────────────── */

  // ── State ──
  const [selectedBulbOption, setSelectedBulbOption] = useState(null)
  const [selectedColorIndex, setSelectedColorIndex] = useState(null)
  const [activeColorIndex, setActiveColorIndex] = useState(null)
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [compareVisibleIndices, setCompareVisibleIndices] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)
  const [touchEndX, setTouchEndX] = useState(null)
  const [showFixedBar, setShowFixedBar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeVideoIndex, setActiveVideoIndex] = useState(null)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)
  const [localReviewForm, setLocalReviewForm] = useState({ rating: 5, comment: '' })
  const [copied, setCopied] = useState(false)
  const [viewerCount, setViewerCount] = useState(22)
  const actionRef = useRef(null)
  const videoRef = useRef(null)
  const [badgePage, setBadgePage] = useState(0)

  useEffect(() => {
    const syncMobile = () => setIsMobile(window.innerWidth < 640)
    syncMobile()
    window.addEventListener('resize', syncMobile)
    return () => window.removeEventListener('resize', syncMobile)
  }, [])

  // ── Derived data (safe with optional chaining so they work even when product is undefined) ──
  const stock = typeof product?.stock === 'number' ? product.stock : 0
  const inStock = stock > 0
  const bulbOptions = Array.isArray(product?.bulbOptions) ? product.bulbOptions : []
  const sku = product?.sku || `LG-${String(product?.id ?? '0').padStart(4, '0')}`
  const colorVariants = Array.isArray(product?.productDetails?.colorVariants)
    ? product.productDetails.colorVariants
    : []
  const shadeColors = Array.isArray(product?.shadeColors)
    ? product.shadeColors
    : []

  // ── Swipe handler ──
  const handleTouchStart = (e) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return
    const diff = touchStartX - touchEndX
    const minSwipeDistance = 50
    if (Math.abs(diff) < minSwipeDistance) return
    if (diff > 0) {
      // swipe left → next slide
      setActiveImageIndex((prev) =>
        prev === mobileSlides.length - 1 ? 0 : prev + 1
      )
    } else {
      // swipe right → previous slide
      setActiveImageIndex((prev) =>
        prev === 0 ? mobileSlides.length - 1 : prev - 1
      )
    }
  }

  // ── Scroll listener for fixed bottom bar ──
  useEffect(() => {
    const handleScroll = () => {
      if (actionRef.current) {
        const rect = actionRef.current.getBoundingClientRect()
        setShowFixedBar(rect.bottom < 0)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Scroll to top when component mounts ──
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // ── Update viewer count every 5 seconds ──
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(Math.floor(Math.random() * 100) + 1) // Random between 20-50
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ── Effects ──
  useEffect(() => {
    if (isCompareOpen) {
      // Initialize with all color variants and shade colors visible
      const colorIndices = colorVariants.map((_, i) => `color-${i}`)
      const shadeIndices = shadeColors.map((_, i) => `shade-${i}`)
      setCompareVisibleIndices([...colorIndices, ...shadeIndices])
    }
  }, [isCompareOpen, colorVariants, shadeColors])

  useEffect(() => {
    if (!isCompareOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsCompareOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isCompareOpen])

  // ── Memos ──
  const images = useMemo(() => {
    const baseImages = Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : product?.image
        ? [product.image, product.image, product.image]
        : []

    // Check if shade color is selected (takes priority)
    const shades = Array.isArray(product?.shadeColors)
      ? product.shadeColors
      : []
    
    // Only use shade if activeColorIndex is within shades array range
    if (activeColorIndex !== null && activeColorIndex < shades.length && shades[activeColorIndex]?.image) {
      return [shades[activeColorIndex].image, ...baseImages]
    }

    // Only prepend color variant image if user has actively selected a color
    const variants = Array.isArray(product?.productDetails?.colorVariants)
      ? product.productDetails.colorVariants
      : []
    
    // Only use color if selectedColorIndex is within variants array range
    if (selectedColorIndex !== null && selectedColorIndex < variants.length && variants[selectedColorIndex]?.image) {
      return [variants[selectedColorIndex].image, ...baseImages]
    }

    return baseImages
  }, [product?.image, product?.images, product?.productDetails?.colorVariants, product?.shadeColors, selectedColorIndex, activeColorIndex])

  // Combined slides for mobile (images + videos)
  const mobileSlides = useMemo(() => {
    const slides = []
    
    // Add images
    images.forEach((img, idx) => {
      slides.push({ type: 'image', src: img, index: idx })
    })
    
    // Add videos at the end
    if (product.videos && product.videos.length > 0) {
      product.videos.forEach((videoUrl, idx) => {
        slides.push({ type: 'video', url: videoUrl, index: idx })
      })
    } else if (product.videoUrl) {
      slides.push({ type: 'video', url: product.videoUrl, index: 0 })
    }
    
    return slides
  }, [images, product?.videos, product?.videoUrl])

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === productId),
    [reviews, productId],
  )

  const avgRating = useMemo(
    () =>
      productReviews.length === 0
        ? null
        : productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length,
    [productReviews],
  )

  const hasUserReviewed = useMemo(() => {
    if (!user?.uid || !productId) return false
    return reviews.some((r) => r.productId === productId && r.userId === user.uid)
  }, [reviews, productId, user?.uid])

  /* ─────────────────────────────────────────────────────────────
     SAFE TO EARLY-RETURN AFTER ALL HOOKS
  ───────────────────────────────────────────────────────────── */
  if (!product) {
    return (
      <section className="w-full px-0 py-10 sm:py-14">
        <div className="px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#FFD400] hover:text-[#5A2D0C]"
          >
            <span aria-hidden>←</span>
            Back
          </button>
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
            Product not found.
          </div>
        </div>
      </section>
    )
  }

  /* ── Remaining derived data (product is guaranteed defined below) ── */
  const safeColorIndex = selectedColorIndex !== null ? Math.min(
    Math.max(selectedColorIndex, 0),
    Math.max(colorVariants.length - 1, 0),
  ) : null
  const selectedColor = safeColorIndex !== null ? colorVariants[safeColorIndex]?.name || '' : ''
  const selectedImage = images[Math.min(activeImageIndex, images.length - 1)]

  // ── Price Calculation ──
  const discountInfo = getDiscountInfo(product)
  const basePrice = discountInfo.discountedPrice
  const baseOriginalPrice = discountInfo.originalPrice

  const selectedBulb = selectedBulbOption || 'without'
  const isWithBulb = selectedBulb === 'with'
  const bulbPrice = typeof product?.bulbPrice === 'number' ? product.bulbPrice : 500
  const bulbAddon = isWithBulb ? bulbPrice : 0

  const effectivePrice = basePrice + bulbAddon
  const effectiveOriginalPrice = baseOriginalPrice + bulbAddon

  const hasDiscount = discountInfo.hasDiscount
  const discountPercent = hasDiscount
    ? Math.round(
      ((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100,
    )
    : 0

  const formatPKR = (amount) =>
    `Rs.${Number(amount).toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const productType =
    product.productType || (product.category === 'Lamps' ? 'Floor lamp' : 'Wood decor')
  const categoryName = resolveCategoryName(categories, product.category)

  /* ─────────────────────────────────────────────────────────────
     SHARE HANDLER — opens the correct share dialog per platform.
     Uses the live page URL plus the product name/image.
  ───────────────────────────────────────────────────────────── */
  const shareUrl =
    typeof window !== 'undefined' ? window.location.href : ''

  const handleShare = (platform) => {
    const url = encodeURIComponent(shareUrl)
    const text = encodeURIComponent(`${product.name} — ${formatPKR(effectivePrice)}`)
    const media = encodeURIComponent(selectedImage || product.image || '')

    let shareLink = ''
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${text}`
        break
      case 'pinterest':
        shareLink = `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${text}`
        break
      case 'email':
        window.location.href = `mailto:?subject=${text}&body=${decodeURIComponent(url)}`
        return
      default:
        return
    }
    window.open(
      shareLink,
      '_blank',
      'noopener,noreferrer,width=600,height=550',
    )
  }

  // Optional: native share / copy-link fallback when the Web Share API exists
  const handleNativeOrCopy = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: shareUrl })
        return
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  const renderStars = (rating) => {
    const value = Math.round(rating)
    return (
      <div
        className="flex items-center gap-0.5 text-[#FFD400]"
        aria-label={`${value} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, idx) => (
          <svg
            key={idx}
            viewBox="0 0 24 24"
            className={classNames('h-4 w-4', idx < value ? 'fill-current' : 'fill-transparent')}
          >
            <path
              stroke="currentColor"
              strokeWidth="1.5"
              d="M12 17.27l-5.18 3.04 1.4-5.81-4.52-3.92 5.95-.5L12 4.5l2.35 5.58 5.95.5-4.52 3.92 1.4 5.81L12 17.27z"
            />
          </svg>
        ))}
      </div>
    )
  }

  const addQuantityToCart = () => {
    if (!inStock) return
    const count = Math.max(1, Math.min(quantity, Math.max(stock, 1)))
    const payload = {
      product,
      bulbOption: selectedBulb || null,
      colorVariant: selectedColor || null,
      unitPrice: basePrice
    }
    for (let i = 0; i < count; i += 1) {
      onAddToCart(payload)
    }
  }

  const relatedProducts = products.filter((p) => p.id !== productId).slice(0, 6)
  const pd = product.productDetails || {}

  return (
    <section className="w-full">
      <style>{`
        .fill-btn {
          overflow: hidden;
        }
        .fill-btn .fill-layer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 0%;
          transition: height 0.8s cubic-bezier(0.22, 0.9, 0.32, 1);
          pointer-events: none;
          z-index: 0;
        }
        .fill-btn .fill-layer::before {
          content: '';
          position: absolute;
          top: -12px;
          left: 0;
          right: 0;
          height: 24px;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .fill-btn.fill-dark .fill-layer {
          background: #FFD400;
        }
        .fill-btn.fill-dark .fill-layer::before {
          background: #FFD400;
        }
        .fill-btn.fill-amber .fill-layer {
          background: #b45309;
        }
        .fill-btn.fill-amber .fill-layer::before {
          background: #b45309;
        }
        .fill-btn:hover .fill-layer {
          height: 100%;
        }
        .fill-btn:hover .fill-layer::before {
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .fill-btn:hover .fill-layer { transition: none; height: 100%; }
          .fill-btn:hover .fill-layer::before { opacity: 1; }
        }
      `}</style>
      {/* ═══════════════ BREADCRUMBS ═══════════════ */}
      <div className="border-b border-stone-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-1.5 py-4 text-[12px] text-stone-500">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-stone-800 transition-colors"
            >
              Home
            </button>
            <span aria-hidden className="text-stone-300">/</span>
            <button
              type="button"
              onClick={() => navigate(`/collections/${slugify(categoryName)}`)}
              className="hover:text-stone-800 transition-colors"
            >
              {categoryName}
            </button>
            <span aria-hidden className="text-stone-300">/</span>
            <span className="text-stone-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════ MAIN PRODUCT AREA ═══════════════ */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ─── LEFT: Image Gallery ─── */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 h-full">

              {/* ── Vertical Thumbnail Strip (desktop) ── */}
              <div
                className="hidden sm:flex flex-col gap-2.5 overflow-y-auto"
                style={{ maxHeight: '600px' }}
              >
                {mobileSlides.map((slide, idx) => {
                  if (slide.type === 'video') {
                    const isActive = activeImageIndex === idx
                    return (
                      <button
                        key={`desk-video-${idx}`}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={classNames(
                          'relative shrink-0 overflow-hidden transition-all duration-200 rounded-sm',
                          'w-[70px] h-[86px]',
                          isActive
                            ? 'border-2 border-stone-800 opacity-100 shadow-md scale-[1.03]'
                            : 'border-2 border-transparent opacity-50 hover:opacity-80 hover:border-stone-300 hover:scale-[1.01]',
                        )}
                        aria-label={`View video ${idx + 1}`}
                      >
                        <img
                          src={product.image}
                          alt={`${product.name} video ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 text-stone-900 ml-0.5" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        {isActive && (
                          <span className="absolute left-0 top-0 h-full w-0.5 bg-stone-800" />
                        )}
                      </button>
                    )
                  }
                  return (
                    <button
                      key={`thumb-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={classNames(
                        'relative shrink-0 overflow-hidden transition-all duration-200 rounded-sm',
                        'w-[70px] h-[86px]',
                        idx === activeImageIndex
                          ? 'border-2 border-stone-800 opacity-100 shadow-md scale-[1.03]'
                          : 'border-2 border-transparent opacity-50 hover:opacity-80 hover:border-stone-300 hover:scale-[1.01]',
                      )}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={slide.src}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === activeImageIndex && (
                        <span className="absolute left-0 top-0 h-full w-0.5 bg-stone-800" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* ── Main Image ── */}
              <div className="relative flex-1 h-full overflow-hidden bg-stone-100 group rounded-sm">
                {/* Badges */}
                {product.isNewArrival && (
                  <span className="absolute left-0 top-0 z-10 bg-[#F5F1EA]0 px-3 py-1.5 text-[11px] font-bold text-white tracking-wide uppercase">
                    New Arrival
                  </span>
                )}
                {hasDiscount && (
                  <span
                    className={classNames(
                      'absolute z-10 bg-[#E53935] px-3 py-1.5 text-[11px] font-bold text-white tracking-wide uppercase',
                      product.isNewArrival ? 'left-0 top-7' : 'left-0 top-0',
                    )}
                  >
                    Sale
                  </span>
                )}

                {/* Main photo — covers the full width */}
                <div
                  className="w-full h-full"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {mobileSlides[activeImageIndex]?.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        key={mobileSlides[activeImageIndex].url}
                        ref={videoRef}
                        src={mobileSlides[activeImageIndex].url}
                        poster={product.image}
                        className={classNames(
                          'w-full h-full transition-all duration-300',
                          isPlayingVideo ? 'object-contain' : 'object-cover',
                        )}
                        style={{ minHeight: '500px' }}
                        playsInline
                        onPlay={() => setIsPlayingVideo(true)}
                        onPause={() => setIsPlayingVideo(false)}
                        onEnded={() => setIsPlayingVideo(false)}
                      >
                        Your browser does not support the video tag.
                      </video>

                      {/* Custom play/pause button at bottom-left corner */}
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current?.paused) {
                            videoRef.current?.play()
                          } else {
                            videoRef.current?.pause()
                          }
                        }}
                        className="absolute bottom-4 left-4 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                        aria-label={isPlayingVideo ? 'Pause video' : 'Play video'}
                      >
                        {isPlayingVideo ? (
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-stone-900" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-stone-900 ml-0.5" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      {/* Fullscreen button at bottom-right corner */}
                      <button
                        type="button"
                        onClick={() => {
                          if (document.fullscreenElement) {
                            document.exitFullscreen()
                          } else {
                            videoRef.current?.requestFullscreen?.()
                          }
                        }}
                        className="absolute bottom-4 right-4 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                        aria-label={typeof document !== 'undefined' && document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen'}
                      >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-stone-900" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <img
                      src={mobileSlides[activeImageIndex]?.src || selectedImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      style={{ minHeight: '500px' }}
                    />
                  )}
                </div>

                {/* Arrow nav (hover) */}
                {mobileSlides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? mobileSlides.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-white/85 hover:bg-white text-stone-700 rounded-full shadow transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Previous"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === mobileSlides.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-white/85 hover:bg-white text-stone-700 rounded-full shadow transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Next"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Counter badge */}
                {mobileSlides.length > 1 && (
                  <div className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {activeImageIndex + 1} / {mobileSlides.length}
                  </div>
                )}

                {/* Dot indicators (mobile only) */}
                {mobileSlides.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden z-10">
                    {mobileSlides.map((slide, idx) => (
                      <button
                        key={`dot-${idx}`}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={classNames(
                          'h-1.5 rounded-full transition-all duration-200',
                          idx === activeImageIndex ? 'w-5 bg-stone-900' : 'w-1.5 bg-stone-400/60',
                        )}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>


            {/* ── Mobile horizontal thumbnail strip with images and videos ── */}
            <div className="flex sm:hidden gap-2 overflow-x-auto pb-1">
              {/* Images */}
              {images.map((src, idx) => (
                <button
                  key={`mobile-thumb-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={classNames(
                    'relative shrink-0 w-16 aspect-square overflow-hidden border-2 transition-all duration-200 rounded-sm',
                    idx === activeImageIndex
                      ? 'border-stone-800 opacity-100 scale-[1.04] shadow'
                      : 'border-transparent opacity-50 hover:opacity-80',
                  )}
                >
                  <img
                    src={src}
                    alt={`${product.name} view ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
              
              {/* Videos (added at the end) */}
              {product.videos && product.videos.map((videoUrl, idx) => {
                const videoSlideIndex = images.length + idx
                const isActive = activeImageIndex === videoSlideIndex
                
                return (
                  <button
                    key={`mobile-video-${idx}`}
                    type="button"
                    onClick={() => {
                      // Just set the active index to show the video slide in main view
                      setActiveImageIndex(videoSlideIndex)
                    }}
                    className={classNames(
                      'relative shrink-0 w-16 aspect-square overflow-hidden border-2 transition-all duration-200 rounded-sm',
                      isActive ? 'border-stone-800 opacity-100 scale-[1.04] shadow' : 'border-transparent opacity-50 hover:opacity-80',
                    )}
                  >
                    <img
                      src={product.image}
                      alt={`${product.name} video ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-stone-900 ml-0.5" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ─── RIGHT: Product Info ─── */}
          <div className="lg:sticky lg:top-24">
            {/* Title + Wishlist */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#222222] leading-tight">
                {product.name}
              </h1>
              <button
                type="button"
                onClick={() => handleToggleWishlist?.(product)}
                className="mt-1 shrink-0 transition-colors"
                aria-label={isInWishlist?.(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isInWishlist?.(product.id) ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s-7-4.35-9.5-8.5C.5 9.5 2.5 6.5 6 6.5c2 0 3.5 1.2 4 2 0.5-0.8 2-2 4-2 3.5 0 5.5 3 3.5 6-2.5 4.15-9.5 8.5-9.5 8.5z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-stone-400 hover:text-red-500" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s-7-4.35-9.5-8.5C.5 9.5 2.5 6.5 6 6.5c2 0 3.5 1.2 4 2 0.5-0.8 2-2 4-2 3.5 0 5.5 3 3.5 6-2.5 4.15-9.5 8.5-9.5 8.5z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Reviews */}
            <div className="mt-2 flex items-center gap-2.5">
              {avgRating ? renderStars(avgRating) : renderStars(0)}
              <span className="text-xs text-stone-500">
                {productReviews.length} review{productReviews.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <div
                className="page-content mt-4 text-[13px] text-stone-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />
            )}

            {/* Price */}
            <div className="mt-5 flex items-end gap-3">
              {hasDiscount ? (
                <>
                  <p className="text-base text-stone-400 line-through">
                    {formatPKR(effectiveOriginalPrice)}
                  </p>
                  <p className="text-2xl font-bold text-[#E53935]">{formatPKR(effectivePrice)}</p>
                  <span className="inline-flex items-center bg-red-100 text-red-700 px-2 py-0.5 text-[11px] font-semibold rounded-sm">
                    Save {discountPercent}%
                  </span>
                </>
              ) : (
                <p className="text-2xl font-bold text-[#5A2D0C]">{formatPKR(effectivePrice)}</p>
              )}
            </div>

            {/* Stock indicator */}
            {inStock && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#22C55E]">
                  In stock — {stock} available
                </p>
                <div className="mt-1.5 h-1 w-full max-w-xs bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (stock / 20) * 100))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-5 border-t border-stone-200 pt-5">
              <div className="flex flex-col items-start sm:flex-row sm:items-center gap-3 text-[13px] text-stone-700">
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 uppercase tracking-wide text-[11px]">SKU:</span>
                  <span className="font-medium">{sku}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 uppercase tracking-wide text-[11px]">Availability:</span>
                  <span className={inStock ? 'text-emerald-600 font-semibold' : 'text-[#E53935] font-semibold'}>
                    {inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 uppercase tracking-wide text-[11px]">Product Type:</span>
                  <span className="font-medium">{productType}</span>
                </div>
              </div>
            </div>

             {/* ── Color & Shade Selector ── */}
             {(colorVariants.length > 0 || shadeColors.length > 0) && (
               <div className="mt-5 border-t border-stone-200 pt-5">
                 <div className="flex items-start gap-8">
                   {/* Color Variants */}
                   {colorVariants.length > 0 && (
                     <div>
                       <p className="text-[13px] font-semibold text-stone-800">
                         Color: <span className="font-normal text-stone-500">{selectedColor}</span>
                       </p>
                       <div className="mt-3 flex items-center gap-3">
                         {colorVariants.map((variant, idx) => {
                           const active = idx === safeColorIndex
                           return (
                             <button
                               key={`color-${variant.name}-${idx}`}
                               type="button"
                               onClick={() => {
                                 // Toggle: if clicking the same color, deselect it
                                 if (active) {
                                   setSelectedColorIndex(null)
                                 } else {
                                   setSelectedColorIndex(idx)
                                 }
                                 setActiveImageIndex(0)
                               }}
                               className={classNames(
                                 'rounded-full p-0.5 transition-all duration-200 hover:scale-110',
                                 active
                                   ? 'ring-2 ring-stone-900 ring-offset-2 ring-offset-white'
                                   : 'ring-1 ring-stone-200 ring-offset-1 ring-offset-white hover:ring-stone-400',
                               )}
                               aria-label={`Select color ${variant.name}`}
                             >
                               <div className="h-10 w-10 rounded-full overflow-hidden border border-stone-200">
                                 <img src={variant.image} alt={variant.name} className="h-full w-full object-cover" />
                               </div>
                             </button>
                           )
                         })}
                       </div>
                     </div>
                   )}

                   {/* Shade Colors */}
                   {shadeColors.length > 0 && (
                     <div>
                       <p className="text-[13px] font-semibold text-stone-800">
                         Shade: <span className="font-normal text-stone-500">
                           {shadeColors.find((_, i) => i === activeColorIndex)?.name || 'Select shade'}
                         </span>
                       </p>
                       <div className="mt-3 flex items-center gap-3">
                         {shadeColors.map((shade, idx) => {
                           const active = idx === activeColorIndex
                           return (
                             <button
                               key={`shade-${shade.name}-${idx}`}
                               type="button"
                               onClick={() => {
                                 setActiveColorIndex(prev => prev === idx ? null : idx)
                                 setActiveImageIndex(0)
                               }}
                               className={classNames(
                                 'rounded-full p-0.5 transition-all duration-200 hover:scale-110',
                                 active
                                   ? 'ring-2 ring-stone-900 ring-offset-2 ring-offset-white'
                                   : 'ring-1 ring-stone-200 ring-offset-1 ring-offset-white hover:ring-stone-400',
                               )}
                               aria-label={`Select shade ${shade.name}`}
                             >
                               <div className="h-10 w-10 rounded-full overflow-hidden border border-stone-200">
                                 <img src={shade.image} alt={shade.name} className="h-full w-full object-cover" />
                               </div>
                             </button>
                           )
                         })}
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Compare Color & Shade Button */}
                 {(colorVariants.length > 1 || shadeColors.length > 1) && (
                   <button
                     type="button"
                     onClick={() => setIsCompareOpen(true)}
                     className="mt-4 flex items-center gap-2 text-[13px] font-medium text-stone-700 hover:text-stone-900 hover:underline transition-all"
                   >
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                       <circle cx="12" cy="12" r="10" stroke="url(#color-wheel-gradient)" strokeWidth="3" />
                       <defs>
                         <linearGradient id="color-wheel-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                           <stop offset="0%" stopColor="#f87171" />
                           <stop offset="20%" stopColor="#fbbf24" />
                           <stop offset="40%" stopColor="#34d399" />
                           <stop offset="60%" stopColor="#60a5fa" />
                           <stop offset="80%" stopColor="#818cf8" />
                           <stop offset="100%" stopColor="#a78bfa" />
                         </linearGradient>
                       </defs>
                     </svg>
                      {shadeColors.length > 0 && colorVariants.length > 0
                        ? 'Compare Color & Shade'
                        : colorVariants.length > 1
                          ? 'Compare Color'
                          : 'Compare Shade'}
                   </button>
                 )}
               </div>
             )}

             {/* ── Bulb Option: With / Without ── */}
             {(product.bulbEnabled || bulbOptions.length > 0) && (
               <div className="mt-5 border-t border-stone-200 pt-5">
                 <p className="text-[13px] font-semibold text-stone-800">
                   Bulb Option
                 </p>
                 <div className="mt-3 flex items-center gap-4">
                   <label className={classNames(
                     'flex items-center gap-2 px-4 py-2.5 border text-[13px] cursor-pointer transition-all duration-200',
                     selectedBulbOption === 'with'
                       ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                       : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500',
                   )}>
                     <input
                       type="radio"
                       name="bulbOption"
                       value="with"
                       checked={selectedBulbOption === 'with'}
                       onChange={() => setSelectedBulbOption('with')}
                       className="sr-only"
                     />
                     With Bulb
                   </label>
                   <label className={classNames(
                     'flex items-center gap-2 px-4 py-2.5 border text-[13px] cursor-pointer transition-all duration-200',
                     selectedBulbOption === 'without'
                       ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                       : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500',
                   )}>
                     <input
                       type="radio"
                       name="bulbOption"
                       value="without"
                       checked={selectedBulbOption === 'without'}
                       onChange={() => setSelectedBulbOption('without')}
                       className="sr-only"
                     />
                     Without Bulb
                   </label>
                 </div>
               </div>
             )}

            {/* ── Quantity + Add to Cart ── */}
            <div ref={actionRef} className="mt-6 border-t border-stone-200 pt-5">
              <p className="text-[13px] text-stone-600">
                Subtotal:{' '}
                <span className="font-bold text-stone-900">
                  {formatPKR(effectivePrice * Math.max(1, quantity))}
                </span>
              </p>

              <p className="mt-4 text-[13px] font-semibold text-stone-800">Quantity:</p>

              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex items-center border border-stone-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="h-12 w-12 grid place-items-center text-stone-600 text-lg transition-colors hover:bg-stone-50"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <div className="h-12 w-14 grid place-items-center text-sm font-semibold text-stone-900 border-x border-stone-300">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(Math.max(stock, 99), prev + 1))}
                    className="h-12 w-12 grid place-items-center text-stone-600 text-lg transition-colors hover:bg-stone-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={addQuantityToCart}
                  className={classNames(
                    'fill-btn fill-dark group relative h-12 flex-1 overflow-hidden bg-[#5A2D0C] text-white text-[13px] font-semibold tracking-wide uppercase',
                    !inStock && 'opacity-50 cursor-not-allowed',
                  )}
                  disabled={!inStock}
                >
                  <span className="fill-layer" aria-hidden="true" />
                  <span className="relative z-10 transition-colors group-hover:text-[#222222]">Add To Cart</span>
                </button>
              </div>

              {/* Buy It Now */}
              <button
                type="button"
                onClick={() => {
                  addQuantityToCart()
                  if (!inStock) return
                  navigate('/checkout')
                }}
                className={classNames(
                  'fill-btn fill-amber group relative mt-3 h-12 w-full overflow-hidden bg-[#FFD400] text-[#222222] text-[13px] font-semibold tracking-wide uppercase',
                  !inStock && 'opacity-50 cursor-not-allowed',
                )}
                disabled={!inStock}
              >
                <span className="fill-layer" aria-hidden="true" />
                <span className="relative z-10 transition-colors group-hover:text-white">Buy It Now</span>
              </button>

              {/* Share row — buttons are now wired to handleShare() */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-[12px] text-stone-500 uppercase tracking-wide font-semibold">Share</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleShare('facebook')}
                    className="h-8 w-8 grid place-items-center text-stone-400 hover:text-blue-600 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('twitter')}
                    className="h-8 w-8 grid place-items-center text-stone-400 hover:text-stone-900 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('pinterest')}
                    className="h-8 w-8 grid place-items-center text-stone-400 hover:text-[#E53935] transition-colors"
                    aria-label="Share on Pinterest"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 0a12 12 0 0 0-4.37 23.17c-.02-.94-.004-2.07.24-3.09l1.73-7.33s-.43-.86-.43-2.13c0-2 1.16-3.5 2.6-3.5 1.23 0 1.82.92 1.82 2.02 0 1.23-.78 3.07-1.18 4.78-.34 1.42.71 2.58 2.1 2.58 2.52 0 4.21-3.24 4.21-7.07 0-2.92-1.97-5.1-5.55-5.1a6.4 6.4 0 0 0-6.63 6.45c0 1.17.35 2 .89 2.63.25.3.28.41.19.75l-.27 1.07c-.09.35-.36.47-.66.34-1.84-.75-2.7-2.77-2.7-5.04 0-3.75 3.16-8.24 9.42-8.24 5.04 0 8.34 3.64 8.34 7.55 0 5.17-2.88 9.04-7.12 9.04-1.42 0-2.76-.77-3.22-1.64l-.92 3.58c-.3 1.1-.89 2.2-1.43 3.07A12 12 0 1 0 12 0z" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('email')}
                    className="h-8 w-8 grid place-items-center text-stone-400 hover:text-stone-700 transition-colors"
                    aria-label="Share via email"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleNativeOrCopy}
                    className="h-8 w-8 grid place-items-center text-stone-400 hover:text-[#5A2D0C] transition-colors relative"
                    aria-label="Copy link or share"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    {copied && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-0.5 text-[10px] font-medium text-white">
                        Link copied
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Viewers badge ── */}
            <div className="mt-5 flex items-center gap-2 text-[12px] text-stone-500">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{viewerCount} customers are viewing this product</span>
            </div>

            {/* ═══ Accordions ═══ */}
            <div className="mt-6 border-t border-stone-200">
              <Accordion
                defaultOpen={false}
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-stone-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="6" width="15" height="12" rx="1" /><path d="M16 10h4l3 4v4h-7V10z" /><circle cx="5.5" cy="18" r="2" /><circle cx="19.5" cy="18" r="2" />
                  </svg>
                }
                title="Free Shipping"
              >
                {product.freeShippingContent ? (
                  <div className="page-content" dangerouslySetInnerHTML={{ __html: product.freeShippingContent }} />
                ) : (
                  <>
                    <p>Free standard shipping on orders over 10,000 PKR</p>
                    <p className="mt-2">All in-stock products will be delivered within <strong>3 to 5 days</strong>. Custom designs will take 8 to 12 days to complete and ship.</p>
                  </>
                )}
              </Accordion>

              <Accordion
                defaultOpen={false}
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-stone-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 14l-4-4 4-4" /><path d="M5 10h11a4 4 0 0 1 0 8h-1" />
                  </svg>
                }
                title="Free Returns"
              >
                {product.freeReturnsContent ? (
                  <div className="page-content" dangerouslySetInnerHTML={{ __html: product.freeReturnsContent }} />
                ) : (
                  <>
                    <p>At Lamp&Glow, we stand by the quality of our handcrafted wooden lamps and want you to be completely satisfied with your purchase.</p>
                    <p className="mt-2">You may return most new, unopened items within <strong>7 days</strong> of delivery for a full refund. If the return is due to our error, we will cover the return shipping costs.</p>
                    <h4 className="mt-3 font-semibold text-stone-700">How to Initiate a Return</h4>
                    <ol className="mt-1 list-decimal pl-5 space-y-1">
                      <li>Log in to your account.</li>
                      <li>Navigate to the "Complete Orders" section under My Account.</li>
                      <li>Click the "Return Item(s)" button and follow the instructions.</li>
                      <li>You will receive an email notification once your return has been processed.</li>
                    </ol>
                  </>
                )}
              </Accordion>

              <Accordion
                defaultOpen={false}
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-stone-600" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
                  </svg>
                }
                title="Our Promise"
              >
                {product.ourPromiseContent ? (
                  <div className="page-content" dangerouslySetInnerHTML={{ __html: product.ourPromiseContent }} />
                ) : (
                  <>
                    <p>Every product is handcrafted with premium-quality wood and materials. We ensure:</p>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      <li>Built and shipped within 3-5 business days.</li>
                      <li>Quality check before every dispatch.</li>
                      <li>Dedicated customer support via WhatsApp and email.</li>
                    </ul>
                  </>
                )}
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ COMPARE COLOR & SHADE MODAL ═══════════════ */}
      {(isCompareOpen && (colorVariants.length > 0 || shadeColors.length > 0)) && (
        <div
          className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => setIsCompareOpen(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-4xl bg-white shadow-2xl max-h-[90vh] flex flex-col z-[99999]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={shadeColors.length > 0 && colorVariants.length > 0
              ? 'Compare Color & Shade'
              : colorVariants.length > 1
                ? 'Compare Color'
                : 'Compare Shade'}
          >
            <button
              type="button"
              onClick={() => setIsCompareOpen(false)}
              className="absolute right-4 top-4 z-[99999] flex h-10 w-10 items-center justify-center bg-black text-white hover:bg-stone-800 transition-colors rounded-full shadow-lg"
              aria-label="Close compare"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 13L13 1M1 1l12 12" />
              </svg>
            </button>

            <div className="p-8 sm:p-12 overflow-y-auto">
              <h3 className="mb-6 text-base font-bold text-stone-900">
                {shadeColors.length > 0 && colorVariants.length > 0
                  ? 'Compare Color & Shade'
                  : colorVariants.length > 1
                    ? 'Compare Color'
                    : 'Compare Shade'}
              </h3>

              {/* Color & Shade Selection Buttons - Same Row */}
              {(colorVariants.length > 0 || shadeColors.length > 0) && (
                <div className="mb-8">
                  <div className="flex items-center gap-8 flex-wrap">
                    {/* Color Variants */}
                    {colorVariants.length > 0 && (
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-stone-700">Colors:</p>
                        <div className="flex items-center gap-3">
                          {colorVariants.map((variant, idx) => (
                            <button
                              key={`compare-color-${variant.name}-${idx}`}
                              type="button"
                              onClick={() => {
                                setCompareVisibleIndices((prev) =>
                                  prev.includes(`color-${idx}`) ? prev.filter((i) => !i.startsWith('color-')) : [...prev.filter((i) => !i.startsWith('color-')), `color-${idx}`],
                                )
                              }}
                              className={classNames(
                                'rounded-full p-[3px] transition-all duration-200',
                                compareVisibleIndices.includes(`color-${idx}`)
                                  ? 'ring-1 ring-black opacity-100'
                                  : 'ring-1 ring-stone-200 opacity-40 grayscale hover:opacity-70',
                              )}
                              aria-label={`Toggle visibility for ${variant.name}`}
                            >
                              <div className="h-10 w-10 rounded-full overflow-hidden border border-stone-200">
                                <img src={variant.image} alt={variant.name} className="h-full w-full object-cover" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shade Colors */}
                    {shadeColors.length > 0 && (
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-stone-700">Shades:</p>
                        <div className="flex items-center gap-3">
                          {shadeColors.map((shade, idx) => (
                            <button
                              key={`compare-shade-${shade.name}-${idx}`}
                              type="button"
                              onClick={() => {
                                setCompareVisibleIndices((prev) =>
                                  prev.includes(`shade-${idx}`) ? prev.filter((i) => !i.startsWith('shade-')) : [...prev.filter((i) => !i.startsWith('shade-')), `shade-${idx}`],
                                )
                              }}
                              className={classNames(
                                'rounded-full p-[3px] transition-all duration-200',
                                compareVisibleIndices.includes(`shade-${idx}`)
                                  ? 'ring-1 ring-black opacity-100'
                                  : 'ring-1 ring-stone-200 opacity-40 grayscale hover:opacity-70',
                              )}
                              aria-label={`Toggle visibility for ${shade.name}`}
                            >
                              <div className="h-10 w-10 rounded-full overflow-hidden border border-stone-200">
                                <img src={shade.image} alt={shade.name} className="h-full w-full object-cover" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shade Images Grid */}
              {shadeColors.length > 0 && compareVisibleIndices.some(idx => idx.startsWith('shade-')) && (
                <div className="mb-8">
                  <p className="text-sm font-semibold text-stone-700 mb-4">Shade Colors</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {shadeColors
                      .map((shade, idx) => ({ shade, idx }))
                      .filter(({ idx }) => compareVisibleIndices.includes(`shade-${idx}`))
                      .map(({ shade, idx }) => {
                        const imageSrc = shade.image || selectedImage
                        return (
                          <div
                            key={`compare-shade-card-${shade.name}-${idx}`}
                            className="group cursor-pointer flex flex-col items-center"
                            onClick={() => { 
                              setActiveColorIndex(idx)
                              setIsCompareOpen(false)
                            }}
                          >
                            <div className="aspect-[3/4] w-full overflow-hidden bg-stone-50 mb-4 transition-opacity group-hover:opacity-90">
                              <img src={imageSrc} alt={shade.name} className="h-full w-full object-cover object-center" />
                            </div>
                            <p className="text-sm font-medium text-stone-600 group-hover:text-stone-900 transition-colors">{shade.name}</p>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Color Images Grid */}
              {colorVariants.length > 0 && compareVisibleIndices.some(idx => idx.startsWith('color-')) && (
                <div>
                  <p className="text-sm font-semibold text-stone-700 mb-4">Color Variants</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {colorVariants
                      .map((variant, idx) => ({ variant, idx }))
                      .filter(({ idx }) => compareVisibleIndices.includes(`color-${idx}`))
                      .map(({ variant, idx }) => {
                        const imageSrc = variant.image || selectedImage
                        return (
                          <div
                            key={`compare-color-card-${variant.name}-${idx}`}
                            className="group cursor-pointer flex flex-col items-center"
                            onClick={() => { 
                              setSelectedColorIndex(idx)
                              setActiveColorIndex(null)
                              setIsCompareOpen(false)
                            }}
                          >
                            <div className="aspect-[3/4] w-full overflow-hidden bg-stone-50 mb-4 transition-opacity group-hover:opacity-90">
                              <img src={imageSrc} alt={variant.name} className="h-full w-full object-cover object-center" />
                            </div>
                            <p className="text-sm font-medium text-stone-600 group-hover:text-stone-900 transition-colors">{variant.name}</p>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TABS ═══════════════ */}
      <div className="border-t border-stone-200 bg-stone-50/60">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 border-b border-stone-200 overflow-x-auto scrollbar-hide sm:justify-center">
            {['description', 'dimension', 'shipping', 'reviews'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={classNames(
                  'relative px-6 py-4 text-[13px] font-semibold tracking-wide uppercase transition-colors duration-200 whitespace-nowrap flex-shrink-0',
                  activeTab === tab
                    ? 'text-stone-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-stone-900'
                    : 'text-stone-400 hover:text-stone-600',
                )}
              >
                {tab === 'description' ? 'Description' : tab === 'dimension' ? 'Dimension' : tab === 'shipping' ? 'Shipping & Return' : `Reviews (${productReviews.length})`}
              </button>
            ))}
          </div>

          <div className="px-4 sm:px-6 lg:px-60 py-8 sm:py-10">
            {activeTab === 'description' ? (
              <div className="max-w-3xl text-sm text-stone-700 leading-7 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{product.name}</h3>
                </div>

                {product.description ? (
                  <div className="page-content" dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p>{`The ${product.name} is an elegant tribute to creativity and craftsmanship, offering a versatile design with endless combinations. Handcrafted from solid wood, this lightweight yet durable piece is perfect for adding a stylish and functional element to your living space.`}</p>
                )}

                {Array.isArray(product.whyLoveItems) && product.whyLoveItems.length > 0 && product.whyLoveItems.some(item => item.trim()) && (
                  <div>
                    <h4 className="text-base font-bold text-stone-900">Why You'll Love It</h4>
                    <ul className="mt-3 space-y-2">
                      {product.whyLoveItems.filter(item => item.trim()).map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-[#FFD400] mt-0.5">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(product.careInstructions) && product.careInstructions.length > 0 && product.careInstructions.some(item => item.trim()) && (
                  <div>
                    <h4 className="text-base font-bold text-stone-900">Care Instructions</h4>
                    <ul className="mt-3 list-disc pl-5 space-y-1.5 text-stone-600">
                      {product.careInstructions.filter(item => item.trim()).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.noteText && product.noteText.trim() && (
                  <p className="text-[12px] text-stone-400 italic mt-4">
                    {product.noteText}
                  </p>
                )}
              </div>
            ) : activeTab === 'dimension' ? (
              <div className="max-w-3xl">
                {product.dimensions ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">Product Dimensions</h3>
                      <p className="mt-2 text-stone-600">Here are the detailed measurements of this product:</p>
                    </div>

                    <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {product.dimensions.width && (
                          <div className="text-center">
                            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Width</p>
                            <p className="text-2xl font-bold text-stone-900">{product.dimensions.width}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{product.dimensions.unit || 'cm'}</p>
                          </div>
                        )}
                        {product.dimensions.height && (
                          <div className="text-center">
                            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Height</p>
                            <p className="text-2xl font-bold text-stone-900">{product.dimensions.height}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{product.dimensions.unit || 'cm'}</p>
                          </div>
                        )}
                        {product.dimensions.depth && (
                          <div className="text-center">
                            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Depth</p>
                            <p className="text-2xl font-bold text-stone-900">{product.dimensions.depth}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{product.dimensions.unit || 'cm'}</p>
                          </div>
                        )}
                        {product.dimensions.weight && (
                          <div className="text-center">
                            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Weight</p>
                            <p className="text-2xl font-bold text-stone-900">{product.dimensions.weight}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{product.dimensions.weightUnit || 'kg'}</p>
                          </div>
                        )}
                      </div>

                      {product.dimensions.notes && (
                        <div className="mt-6 pt-6 border-t border-stone-200">
                          <p className="text-sm text-stone-600">{product.dimensions.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <p className="text-stone-500">No dimensions specified for this product</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'shipping' ? (
              <div className="max-w-3xl text-sm text-stone-700 leading-7 space-y-6">
                {product.shippingReturnContent ? (
                  <div className="page-content" dangerouslySetInnerHTML={{ __html: product.shippingReturnContent }} />
                ) : (
                  <>
                    <div>
                      <h3 className="text-base font-bold text-stone-900">Returns Policy</h3>
                      <p className="mt-2">
                        You may return most new, unopened items within <strong>7 days</strong> of delivery for a full refund.
                        We'll also pay the return shipping costs if the return is a result of our error (you received an incorrect or defective item, etc.).
                      </p>
                      <p className="mt-2">
                        You should expect to receive your refund within four weeks of giving your package to the return shipper.
                        This time period includes the transit time for us to receive your return from the shipper (5 to 10 business days),
                        the time it takes us to process your return once we receive it (3 to 5 business days),
                        and the time it takes your bank to process our refund request (5 to 10 business days).
                      </p>
                      <p className="mt-2">
                        If you need to return an item, simply login to your account, view the order using the "Complete Orders" link under the My Account menu and click the Return Item(s) button. We'll notify you via e-mail of your refund once we've received and processed the returned item.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900">Shipping</h3>
                      <p className="mt-2">
                        We can ship to virtually any address in Pakistan. Free standard shipping on orders over 10,000 PKR. Orders are typically dispatched within 1-2 business days.
                      </p>
                      <p className="mt-2">
                        When you place an order, we will estimate shipping and delivery dates for you based on the availability of your items and the shipping options you choose.
                      </p>
                      <p className="mt-2">
                        All in-stock products will be delivered within <strong>3 to 5 days</strong>. Custom designs will take 8 to 12 days to complete and ship.
                      </p>
                    </div>
                  </>
                )}
              </div>
              ) : (
                <div className="max-w-3xl space-y-8">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-stone-900">{avgRating ? avgRating.toFixed(1) : '0.0'}</p>
                    <div className="mt-1">{renderStars(avgRating || 0)}</div>
                    <p className="mt-1 text-xs text-stone-500">Based on {productReviews.length} review{productReviews.length === 1 ? '' : 's'}</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = productReviews.filter((r) => Math.round(r.rating) === star).length
                      const pct = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-stone-500 text-right">{star}</span>
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#FFD400] fill-current"><path d="M12 17.27l-5.18 3.04 1.4-5.81-4.52-3.92 5.95-.5L12 4.5l2.35 5.58 5.95.5-4.52 3.92 1.4 5.81z" /></svg>
                          <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F5F1EA]0 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-stone-400">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {productReviews.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-stone-400 text-sm">No reviews yet for this product.</p>
                    <p className="text-stone-400 text-xs mt-1">Be the first to write a review!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {productReviews.map((review) => (
                      <div key={review.id} className="py-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-stone-200 grid place-items-center text-sm font-bold text-stone-600">
                              {review.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{review.name}</p>
                              <p className="text-[11px] text-stone-400">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="mt-3 text-[13px] text-stone-600 leading-relaxed">{review.comment}</p>
                        
                        {/* Admin Reply */}
                        {review.adminReply && (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                A
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-blue-900 text-sm">Admin Response</p>
                                  {review.adminReplyAt && (
                                    <p className="text-xs text-blue-600">
                                      {new Date(review.adminReplyAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  )}
                                </div>
                                <p className="text-blue-800 text-sm leading-relaxed">{review.adminReply}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isLoggedIn && !hasUserReviewed && (
                  <div className="mt-8 p-6 rounded-2xl border border-stone-200 bg-white">
                    <h3 className="text-lg font-bold text-stone-900 mb-4">Write a Review</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      if (!localReviewForm.comment.trim() || !user) return

                      // Check if user already reviewed this product
                      const hasAlreadyReviewed = reviews.some(
                        (r) => r.productId === productId && r.userId === user.uid
                      )

                      if (hasAlreadyReviewed) {
                        alert('You have already reviewed this product.')
                        return
                      }

                      const newReview = {
                        id: Date.now(),
                        productId: productId,
                        userId: user.uid,
                        name: user.displayName || user.email || 'Anonymous',
                        rating: Number(localReviewForm.rating),
                        comment: localReviewForm.comment.trim(),
                        createdAt: new Date().toISOString(),
                      }

                      handleSubmitReview(newReview)
                      setLocalReviewForm({ rating: 5, comment: '' })
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Your Rating</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setLocalReviewForm((prev) => ({ ...prev, rating: star }))}
                              className="focus:outline-none"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className={classNames(
                                  'h-8 w-8 transition-colors',
                                  star <= localReviewForm.rating ? 'text-[#FFD400] fill-current' : 'text-stone-300 fill-transparent'
                                )}
                                stroke="currentColor"
                                strokeWidth="1.5"
                              >
                                <path d="M12 17.27l-5.18 3.04 1.4-5.81-4.52-3.92 5.95-.5L12 4.5l2.35 5.58 5.95.5-4.52 3.92 1.4 5.81L12 17.27z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Your Review</label>
                        <textarea
                          value={localReviewForm.comment}
                          onChange={(e) => setLocalReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                          rows={4}
                          required
                          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                          placeholder="Share your experience with this product..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!localReviewForm.comment.trim()}
                        className="inline-flex items-center justify-center rounded-full bg-[#5A2D0C] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#FFD400] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>
                )}

                {!isLoggedIn && (
                  <div className="mt-8 p-6 rounded-2xl border border-stone-200 bg-white text-center">
                    <p className="text-stone-600 mb-3">Please log in to write a review</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center justify-center rounded-full bg-[#5A2D0C] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#FFD400] transition-colors"
                    >
                      Log In to Review
                    </button>
                  </div>
                )}

                {hasUserReviewed && (
                  <div className="mt-8 p-6 rounded-2xl border border-[#FFD400]/30 bg-[#F5F1EA]/50 text-center">
                    <p className="text-stone-700 font-medium">You have already reviewed this product</p>
                    <p className="text-sm text-stone-500 mt-1">Thank you for your feedback!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════ TRUST BADGES ═══════════════ */}
      <div className="border-t border-stone-200 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
          {/* Mobile: 2 per row with arrow navigation */}
          <div className="sm:hidden">
            <div className="relative flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBadgePage((p) => Math.max(0, p - 1))}
                disabled={badgePage === 0}
                className={classNames(
                  'shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                  badgePage === 0
                    ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-stone-500 shadow-sm',
                )}
                aria-label="Previous"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="grid grid-cols-2 gap-3 flex-1">
                {[
                  { icon: 'M3 3h7l2 3h9v13H3z', icon2: 'M3 8h18', label: 'Dedicated Support' },
                  { icon: 'M9 14l-4-4 4-4', icon2: 'M5 10h11a4 4 0 0 1 0 8h-1', label: '7 Days Free Returns' },
                  { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', icon2: 'm9 12 2 2 4-4', label: 'Safe Payment' },
                  { icon: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6', icon2: null, label: 'Online Discounts', iconType: 'cart' },
                ].slice(badgePage * 2, badgePage * 2 + 2).map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    {item.iconType === 'cart' ? (
                      <svg viewBox="0 0 24 24" className="h-8 w-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d={item.icon} />
                      </svg>
                    ) : item.icon2 ? (
                      <svg viewBox="0 0 24 24" className="h-8 w-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d={item.icon} />
                        <path d={item.icon2} />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-8 w-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d={item.icon} />
                      </svg>
                    )}
                    <p className="text-[12px] font-bold text-stone-800 uppercase tracking-wide">{item.label}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setBadgePage((p) => Math.min(1, p + 1))}
                disabled={badgePage >= 1}
                className={classNames(
                  'shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                  badgePage >= 1
                    ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-stone-500 shadow-sm',
                )}
                aria-label="Next"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mt-3">
              {[0, 1].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setBadgePage(page)}
                  className={classNames(
                    'h-1.5 rounded-full transition-all duration-200',
                    badgePage === page ? 'w-5 bg-stone-900' : 'w-1.5 bg-stone-400/60',
                  )}
                  aria-label={`Go to page ${page + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 3h7l2 3h9v13H3z" /><path d="M3 8h18" /></svg>
              <p className="text-[12px] font-bold text-stone-800 uppercase tracking-wide">Dedicated Support</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M9 14l-4-4 4-4" /><path d="M5 10h11a4 4 0 0 1 0 8h-1" /></svg>
              <p className="text-[12px] font-bold text-stone-800 uppercase tracking-wide">7 Days Free Returns</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
              <p className="text-[12px] font-bold text-stone-800 uppercase tracking-wide">Safe Payment</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
              <p className="text-[12px] font-bold text-stone-800 uppercase tracking-wide">Online Discounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ RELATED PRODUCTS ═══════════════ */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-stone-200 bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">Related Products</h2>
            <p className="mt-1 text-sm text-stone-500">You may also like</p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((rp) => {
                const rpInfo = getDiscountInfo(rp)
                return (
                  <Link
                    key={rp.id}
                    to={`/products/${slugify(rp.name)}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                    className="group block overflow-hidden bg-white border border-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-stone-300"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                      {rp.isNewArrival && (
                        <span className="absolute left-0 top-0 z-10 bg-[#F5F1EA]0 px-2 py-1 text-[10px] font-bold text-white tracking-wide">New</span>
                      )}
                      {rpInfo.hasDiscount && (
                        <span className={classNames('absolute z-10 bg-[#E53935] px-2 py-1 text-[10px] font-bold text-white tracking-wide', rp.isNewArrival ? 'left-0 top-6' : 'left-0 top-0')}>
                          -{rpInfo.discountPercent}%
                        </span>
                      )}
                      <img src={rp.image} alt={rp.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-[13px] font-semibold text-stone-900 leading-snug line-clamp-2">{rp.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                        {rpInfo.hasDiscount ? (
                          <>
                            <span className="text-stone-400 line-through text-[12px]">Rs.{rpInfo.originalPrice.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
                            <span className="font-bold text-[#E53935] text-[13px]">Rs.{rpInfo.discountedPrice.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
                          </>
                        ) : (
                          <span className="font-bold text-stone-900 text-[13px]">Rs.{rp.price.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ FIXED BOTTOM BAR ═══════════════ */}
      {showFixedBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-3">
            <div className="flex items-center justify-center gap-3">
              {/* Quantity Selector - hidden on mobile */}
              <div className="hidden sm:flex items-center border border-stone-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="h-11 w-11 grid place-items-center text-stone-600 text-lg transition-colors hover:bg-stone-50"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="h-11 w-12 grid place-items-center text-sm font-semibold text-stone-900 border-x border-stone-300">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(Math.max(stock, 99), prev + 1))}
                  className="h-11 w-11 grid place-items-center text-stone-600 text-lg transition-colors hover:bg-stone-50"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={addQuantityToCart}
                className={classNames(
                  'fill-btn fill-dark group relative h-11 flex-1 sm:flex-none px-8 overflow-hidden bg-[#5A2D0C] text-white text-[12px] font-semibold tracking-wide uppercase whitespace-nowrap',
                  !inStock && 'opacity-50 cursor-not-allowed',
                )}
                disabled={!inStock}
              >
                <span className="fill-layer" aria-hidden="true" />
                <span className="relative z-10 transition-colors group-hover:text-[#222222]">Add To Cart</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  addQuantityToCart()
                  if (!inStock) return
                  navigate('/checkout')
                }}
                className={classNames(
                  'fill-btn fill-amber group relative h-11 flex-1 sm:flex-none px-8 overflow-hidden bg-[#FFD400] text-[#222222] text-[12px] font-semibold tracking-wide uppercase whitespace-nowrap',
                  !inStock && 'opacity-50 cursor-not-allowed',
                )}
                disabled={!inStock}
              >
                <span className="fill-layer" aria-hidden="true" />
                <span className="relative z-10 transition-colors group-hover:text-white">Buy It Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ RECENTLY VIEWED ═══════════════ */}
      {relatedProducts.length > 2 && (
        <div className="border-t border-stone-200 bg-stone-50/40">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">Recently Viewed Products</h2>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.slice(0, 5).map((rp) => {
                const rpInfo = getDiscountInfo(rp)
                return (
                  <Link key={`rv-${rp.id}`} to={`/products/${slugify(rp.name)}`} onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })} className="group block overflow-hidden bg-white border border-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <div className="relative aspect-square overflow-hidden bg-stone-100">
                      {rp.isNewArrival && (
                        <span className="absolute left-0 top-0 z-10 bg-[#F5F1EA]0 px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wide">New</span>
                      )}
                      <img src={rp.image} alt={rp.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-[12px] font-semibold text-stone-900 leading-snug line-clamp-2">{rp.name}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[12px]">
                        {rpInfo.hasDiscount && <span className="text-stone-400 line-through">Rs.{rpInfo.originalPrice.toLocaleString('en-PK')}</span>}
                        <span className={rpInfo.hasDiscount ? 'font-bold text-[#E53935]' : 'font-bold text-stone-900'}>
                          Rs.{rpInfo.discountedPrice.toLocaleString('en-PK')}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}