'use client'

import { useMemo, useRef } from 'react'
import Slider from 'react-slick'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'

function shuffleArray(array) {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

      ;[shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i],
      ]
  }

  return shuffled
}

export default function HomeFeaturedProducts({
  products,
  onViewAll,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  theme = 'light',

}) {
  const isDark = theme === 'dark'
  const sliderRef = useRef(null)

  const randomProducts = useMemo(() => {
    if (!products?.length) return []

    return shuffleArray(products).slice(0, 12)
  }, [products])

  const canLoop = randomProducts.length > 5

  const settings = {
    dots: false,
    arrows: false,
    infinite: canLoop,
    autoplay: canLoop,
    autoplaySpeed: 2200,
    speed: 600,
    slidesToShow: 5,
    slidesToScroll: 1,
    pauseOnHover: true,
    swipe: true,
    touchMove: true,

    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  if (!randomProducts.length) return null

  return (
    <section
      className={`w-full py-10 transition-colors duration-300 sm:py-12 ${isDark
        ? 'bg-[#171310]'
        : 'bg-[#FAF9F7]'
        }`}
    >      {/* Heading */}
      <div className="mb-7 px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center">
          <div className="text-center">
            <h2
              className={`text-xl font-semibold tracking-tight sm:text-2xl ${isDark
                ? 'text-[#FFF8F1]'
                : 'text-stone-900'
                }`}
            >
              Light Up Your Space
            </h2>

            <p
              className={`mt-1.5 text-xs sm:text-sm ${isDark
                ? 'text-stone-400'
                : 'text-stone-500'
                }`}
            >
              Unique wooden lamps curated to elevate your home.
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className={`absolute right-0 hidden text-xs font-semibold transition-colors sm:block ${isDark
              ? 'text-[#D8AD87] hover:text-[#FFF8F1]'
              : 'text-[#A55B14] hover:text-[#5A2D0C]'
              }`}          >
            View all products
          </button>
        </div>
      </div>

      {/* Slider Area */}
      <div className="relative">
        {/* Previous */}
        <button
          type="button"
          onClick={() => sliderRef.current?.slickPrev()}
          aria-label="Previous products"
          className={`absolute left-3 top-[40%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition hover:scale-105 hover:shadow-lg sm:flex ${isDark
            ? 'border border-white/10 bg-[#2A211C] text-[#EADFD6] hover:border-white/20 hover:bg-[#EEE5DC] hover:text-[#3A2117]'
            : 'border border-stone-200 bg-white text-stone-700 hover:text-[#5A2D0C]'
            }`}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={() => sliderRef.current?.slickNext()}
          aria-label="Next products"
          className={`absolute right-3 top-[40%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition hover:scale-105 hover:shadow-lg sm:flex ${isDark
            ? 'border border-white/10 bg-[#2A211C] text-[#EADFD6] hover:border-white/20 hover:bg-[#EEE5DC] hover:text-[#3A2117]'
            : 'border border-stone-200 bg-white text-stone-700 hover:text-[#5A2D0C]'
            }`}
        >
          <ChevronRight size={20} />
        </button>

        <div
          className="
            px-4
            sm:px-6
            lg:px-8

            [&_.slick-list]:overflow-hidden
            [&_.slick-list]:pb-6

            [&_.slick-track]:!flex
            [&_.slick-track]:!items-stretch

            [&_.slick-slide]:!h-auto
            [&_.slick-slide]:px-2

            [&_.slick-slide>div]:h-full
          "
        >
          <Slider
            ref={sliderRef}
            {...settings}
          >
            {randomProducts.map((product) => (
              <div
                key={product.id}
                className="h-full"
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isInWishlist={isInWishlist}
                />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Mobile View All */}
      <div className="mt-2 flex justify-center px-4 sm:hidden">
        <button
          type="button"
          onClick={onViewAll}
          className={`text-sm font-semibold transition-colors ${isDark
              ? 'text-[#D8AD87] hover:text-white'
              : 'text-[#7A3E0D]'
            }`}        >
          View all products
        </button>
      </div>
    </section>
  )
}