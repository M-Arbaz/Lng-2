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
}) {
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
    <section className="w-full bg-[#FAF9F7] py-10 sm:py-12">
      {/* Heading */}
      <div className="mb-7 px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
              Light Up Your Space
            </h2>

            <p className="mt-1.5 text-xs text-stone-500 sm:text-sm">
              Unique wooden lamps curated to elevate your home.
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="absolute right-0 hidden text-xs font-semibold text-[#A55B14] transition-colors hover:text-[#5A2D0C] sm:block"
          >
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
          className="absolute left-3 top-[40%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-md transition hover:scale-105 hover:text-[#5A2D0C] hover:shadow-lg sm:flex"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={() => sliderRef.current?.slickNext()}
          aria-label="Next products"
          className="absolute right-3 top-[40%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-md transition hover:scale-105 hover:text-[#5A2D0C] hover:shadow-lg sm:flex"
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
          className="text-sm font-semibold text-[#7A3E0D]"
        >
          View all products
        </button>
      </div>
    </section>
  )
}