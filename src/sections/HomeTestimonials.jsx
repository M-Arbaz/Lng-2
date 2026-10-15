'use client'

import { useMemo, useRef } from 'react'
import Slider from 'react-slick'
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
} from 'lucide-react'

function ReviewCard({
  review,
  productImage,
  isDark = false,
}) {
  const rating = Number(review.rating) || 0

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${isDark
        ? 'border border-white/10 bg-[#241C18] shadow-[0_4px_18px_rgba(0,0,0,0.18)] hover:border-[#D8AD87]/30 hover:shadow-[0_14px_34px_rgba(0,0,0,0.28)]'
        : 'border border-[#E8DDD3] bg-[#FFFCF9] shadow-[0_4px_18px_rgba(74,45,25,0.05)] hover:border-[#D8C2AE] hover:shadow-[0_14px_34px_rgba(74,45,25,0.10)]'
        }`}
    >
      {/* PRODUCT / REVIEW IMAGE */}
      <div
        className={`relative aspect-[4/3] overflow-hidden ${isDark
          ? 'bg-[#2A211C]'
          : 'bg-[#F2ECE6]'
          }`}
      >
        {productImage ? (
          <img
            src={productImage}
            alt={review.name || 'Lamp & Glow product'}
            loading="lazy"
            className="
              h-full w-full object-cover
              transition-transform duration-500
              group-hover:scale-[1.035]
            "
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-xs ${isDark
              ? 'text-stone-500'
              : 'text-[#A79587]'
              }`}
          >
            Lamp & Glow
          </div>
        )}

        {/* soft image treatment */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

        {/* SCREENSHOT OVERLAY */}
        {review.screenshotImage && (
          <div
            className="
              absolute bottom-2.5 right-2.5
              w-[36%]
              overflow-hidden
              rounded-lg
              border-2 border-white
              bg-white
              shadow-[0_6px_18px_rgba(0,0,0,0.18)]
            "
          >
            <img
              src={review.screenshotImage}
              alt="Customer review screenshot"
              loading="lazy"
              className="h-auto w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-4">
        {/* STARS */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={14}
              strokeWidth={1.7}
              className={
                index < rating
                  ? 'fill-[#B77A3F] text-[#B77A3F]'
                  : isDark
                    ? 'fill-[#493A31] text-[#493A31]'
                    : 'fill-[#E8DED5] text-[#E8DED5]'
              }
            />
          ))}
        </div>

        {/* CUSTOMER */}
        <div className="mt-3">
          <p
            className={`truncate text-[13px] font-semibold ${isDark
              ? 'text-[#FFF8F1]'
              : 'text-[#342820]'
              }`}
          >
            {review.name || 'Anonymous'}
          </p>

          {review.handle && (
            <p
              className={`mt-0.5 truncate text-[10px] ${isDark
                ? 'text-stone-500'
                : 'text-[#A18D7D]'
                }`}
            >
              {review.handle}
            </p>
          )}
        </div>

        {/* REVIEW */}
        <div className="relative mt-3 flex flex-1 flex-col">
          <p
            className={`line-clamp-5 text-[12px] leading-[1.65] sm:text-[12.5px] ${isDark
              ? 'text-stone-300'
              : 'text-[#746257]'
              }`}
          >
            {review.comment}
          </p>

          <Quote
            size={18}
            strokeWidth={1.5}
            className={`mt-auto self-end ${isDark
              ? 'text-[#6B5141]'
              : 'text-[#D7C5B6]'
              }`}
          />
        </div>
      </div>
    </article>
  )
}

export default function HomeTestimonials({
  products,
  reviews,
  theme = 'light',
}) {
  const sliderRef = useRef(null)
  const isDark = theme === 'dark'

  const visibleReviews = useMemo(
    () =>
      (reviews || []).filter(
        (review) => review.isActive !== false,
      ),
    [reviews],
  )

  const getProductImage = (review) => {
    if (review.productImage) {
      return review.productImage
    }

    const product = products?.find(
      (item) => item.id === review.productId,
    )

    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return product.images[0]
    }

    return product?.image || null
  }

  const settings = {
    dots: false,
    arrows: false,

    // Client requirement
    slidesToShow: 5,
    slidesToScroll: 1,

    autoplay: visibleReviews.length > 1,
    autoplaySpeed: 3500,

    speed: 650,
    cssEase: 'ease',

    infinite: visibleReviews.length > 5,

    swipe: true,
    swipeToSlide: true,
    draggable: true,
    touchMove: true,

    pauseOnHover: true,
    pauseOnFocus: true,

    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  if (visibleReviews.length === 0) {
    return (
      <section
        className={`w-full overflow-hidden py-10 transition-colors duration-300 sm:py-14 lg:py-16 ${isDark
          ? 'bg-[#1B1613]'
          : 'bg-[#FAF7F3]'
          }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A06E45]">
              Customer Stories
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#30241D] sm:text-3xl">
              Loved by Our Customers
            </h2>
          </div>

          <div
            className="
              mx-auto mt-8 max-w-2xl
              rounded-2xl
              border border-dashed border-[#DCCFC4]
              bg-white
              px-6 py-10
              text-center
              text-sm text-[#806F62]
            "
          >
            No reviews yet. Be the first to share your
            Lamp & Glow experience.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={`w-full overflow-hidden py-10 transition-colors duration-300 sm:py-14 lg:py-16 ${isDark
        ? 'bg-[#1B1613]'
        : 'bg-[#FAF7F3]'
        }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* HEADING */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${isDark
              ? 'text-[#D8AD87]'
              : 'text-[#A06E45]'
              }`}
          >
            Customer Stories
          </p>

          <h2
            className={`mt-2 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl ${isDark
                ? 'text-[#FFF8F1]'
                : 'text-[#30241D]'
              }`}
          >
            Loved by Our Customers
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#8C796B] sm:text-sm">
            Real experiences from customers who made
            Lamp & Glow part of their homes.
          </p>
        </div>

        {/* SLIDER */}
        <div className="relative">
          {/* LEFT ARROW */}
          {visibleReviews.length > 1 && (
            <button
              type="button"
              onClick={() =>
                sliderRef.current?.slickPrev()
              }
              aria-label="Previous reviews"
              className="
                absolute
                -left-1
                top-1/2
                z-20
                hidden
                h-11 w-11
                -translate-y-1/2
                items-center justify-center
                rounded-full
                border border-[#E1D4C9]
                bg-white/95
                text-[#5A3B28]
                shadow-[0_6px_20px_rgba(71,43,24,0.12)]
                backdrop-blur
                transition-all duration-200
                hover:scale-105
                hover:border-[#C69A72]
                hover:bg-[#5A3422]
                hover:text-white
                sm:flex
                lg:-left-3
              "
            >
              <ChevronLeft
                size={20}
                strokeWidth={1.8}
              />
            </button>
          )}

          {/* RIGHT ARROW */}
          {visibleReviews.length > 1 && (
            <button
              type="button"
              onClick={() =>
                sliderRef.current?.slickNext()
              }
              aria-label="Next reviews"
              className="
                absolute
                -right-1
                top-1/2
                z-20
                hidden
                h-11 w-11
                -translate-y-1/2
                items-center justify-center
                rounded-full
                border border-[#E1D4C9]
                bg-white/95
                text-[#5A3B28]
                shadow-[0_6px_20px_rgba(71,43,24,0.12)]
                backdrop-blur
                transition-all duration-200
                hover:scale-105
                hover:border-[#C69A72]
                hover:bg-[#5A3422]
                hover:text-white
                sm:flex
                lg:-right-3
              "
            >
              <ChevronRight
                size={20}
                strokeWidth={1.8}
              />
            </button>
          )}

          <div
            className="
              min-w-0

              [&_.slick-track]:!flex
              [&_.slick-track]:!items-stretch

              [&_.slick-slide]:!h-auto
              [&_.slick-slide>div]:h-full
            "
          >
            <Slider ref={sliderRef} {...settings}>
              {visibleReviews.map((review) => (
                <div
                  key={review.id}
                  className="h-full px-1.5 sm:px-2"
                >
                  <ReviewCard
                    review={review}
                    productImage={getProductImage(
                      review,
                    )}
                  />
                </div>
              ))}
            </Slider>
          </div>

          {/* MOBILE SWIPE HINT */}
          {visibleReviews.length > 1 && (
            <p className="mt-5 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-[#AA9687] sm:hidden">
              Swipe to explore reviews
            </p>
          )}
        </div>
      </div>
    </section>
  )
}