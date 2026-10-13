'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Slider from 'react-slick'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

function ReviewCard({ review, productImage }) {
  return (
    <div className="h-full rounded-3xl border border-stone-200 bg-white p-5 sm:p-7 shadow-sm">
      <div className="flex justify-center text-[#FFD400] text-base sm:text-lg leading-none mb-3">
        {'★'.repeat(review.rating)}
        <span className="text-stone-300">{'★'.repeat(5 - review.rating)}</span>
      </div>

      <div className="text-center mb-4">
        <span className="text-sm sm:text-base font-bold text-stone-900">{review.name || 'Anonymous'}</span>
        {review.handle && <span className="ml-1.5 text-xs text-stone-400">{review.handle}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-stone-100">
          {productImage ? (
            <img src={productImage} alt={review.name || 'Product'} className="h-full w-full object-cover" />
          ) : null}

          {review.screenshotImage && (
            <div className="absolute left-1.5 bottom-1.5 w-[62%] rounded-md overflow-hidden shadow-lg ring-1 ring-black/10 -rotate-2">
              <img src={review.screenshotImage} alt="Review screenshot" className="w-full h-auto object-cover" />
            </div>
          )}
        </div>

        <div className="relative min-h-[10rem] flex flex-col justify-between">
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            <span className="text-stone-400">— </span>
            {review.comment}
          </p>
          <Quote className="w-5 h-5 text-stone-200 self-end mt-2" fill="currentColor" />
        </div>
      </div>
    </div>
  )
}

const BREAKPOINTS = [
  { query: '(max-width: 639px)', slidesToShow: 1 },
  { query: '(max-width: 1023px)', slidesToShow: 2 },
]

function getSlidesToShow() {
  if (typeof window === 'undefined') return 4
  if (window.matchMedia('(max-width: 639px)').matches) return 1
  if (window.matchMedia('(max-width: 1023px)').matches) return 2
  return 4
}

export default function HomeTestimonials({ products, reviews }) {
  const sliderRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesToShow, setSlidesToShow] = useState(getSlidesToShow)

  useEffect(() => {
    const mqls = BREAKPOINTS.map((b) => window.matchMedia(b.query))
    const update = () => setSlidesToShow(getSlidesToShow())
    update()
    mqls.forEach((mql) => {
      if (mql.addEventListener) mql.addEventListener('change', update)
      else mql.addListener(update)
    })
    return () => {
      mqls.forEach((mql) => {
        if (mql.removeEventListener) mql.removeEventListener('change', update)
        else mql.removeListener(update)
      })
    }
  }, [])

  const visibleReviews = useMemo(
    () => (reviews || []).filter((r) => r.isActive !== false),
    [reviews],
  )

  const getProductImage = (review) => {
    if (review.productImage) return review.productImage
    const product = products?.find((p) => p.id === review.productId)
    if (product?.images && product.images.length > 0) return product.images[0]
    return product?.image || null
  }

  const useSlider = visibleReviews.length > 4
  const displayReviews = useSlider ? visibleReviews : visibleReviews.slice(0, 4)
  const canGoPrev = currentSlide > 0
  const canGoNext = currentSlide + slidesToShow < visibleReviews.length

  const settings = {
    dots: true,
    arrows: false,
    infinite: false,
    autoplay: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    swipe: true,
    touchMove: true,
    afterChange: (index) => setCurrentSlide(index),
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  }

  if (visibleReviews.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-[#F5F1EA]">
        <div className="rounded-3xl border border-[#E5E5E5] bg-white shadow-sm overflow-hidden">
          <div className="relative px-5 sm:px-8 py-6 sm:py-8">
            <div className="relative flex flex-col items-center text-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
                Loved by Our Customers
              </h1>
            </div>
          </div>
          <div className="px-5 sm:px-8 pb-8">
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-xs sm:text-sm text-stone-600">
              <p>No reviews yet. Be the first to share your Lamp & Glow experience.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-[#F5F1EA]">
      <style>{`
        .home-reviews-slider .slick-list {
          margin: 0 -0.625rem;
        }
        .home-reviews-slider .slick-slide > div {
          padding: 0 0.625rem;
          height: 100%;
        }
        .home-reviews-slider .slick-track {
          display: flex !important;
        }
        .home-reviews-slider .slick-slide {
          height: auto;
        }
        .home-reviews-slider .slick-dots {
          position: static;
          margin-top: 1.5rem;
          display: flex !important;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .home-reviews-slider .slick-dots li {
          margin: 0;
          width: auto;
          height: auto;
        }
        .home-reviews-slider .slick-dots li button {
          width: 9px;
          height: 9px;
          padding: 0;
        }
        .home-reviews-slider .slick-dots li button:before {
          content: '';
          width: 9px;
          height: 9px;
          border-radius: 9999px;
          background: #D6D3D1;
          opacity: 1;
          top: 0;
          left: 0;
        }
        .home-reviews-slider .slick-dots li.slick-active button:before {
          background: #FFD400;
        }
      `}</style>

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          Loved by Our Customers
        </h1>
      </div>

      {!useSlider ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayReviews.map((review) => (
            <ReviewCard key={review.id} review={review} productImage={getProductImage(review)} />
          ))}
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => sliderRef.current?.slickPrev()}
            disabled={!canGoPrev}
            aria-label="Previous reviews"
            className="hidden sm:flex absolute -left-4 sm:-left-5 top-[38%] -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-md ring-1 ring-stone-200 text-stone-700 hover:text-[#FFD400] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => sliderRef.current?.slickNext()}
            disabled={!canGoNext}
            aria-label="Next reviews"
            className="hidden sm:flex absolute -right-4 sm:-right-5 top-[38%] -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-md ring-1 ring-stone-200 text-stone-700 hover:text-[#FFD400] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="home-reviews-slider">
            <Slider ref={sliderRef} {...settings}>
              {visibleReviews.map((review) => (
                <div key={review.id} className="h-full">
                  <ReviewCard review={review} productImage={getProductImage(review)} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
    </section>
  )
}
