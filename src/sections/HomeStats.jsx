'use client'

import { useEffect, useRef, useState } from 'react'
import Slider from 'react-slick'

const STATS = [
  {
    value: 8,
    suffix: '+',
    label: 'Years of experience',
  },
  {
    value: 280,
    suffix: '+',
    label: 'Projects delivered',
  },
  {
    value: 99,
    suffix: '%',
    label: 'Client satisfaction rate',
  },
  {
    value: 12,
    suffix: '+',
    label: 'Long-term partners',
  },
]

const DURATION = 1600

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t)
}

export default function HomeStats() {
  const sectionRef = useRef(null)
  const hasAnimated = useRef(false)

  const [counts, setCounts] = useState(() =>
    STATS.map(() => 0),
  )

  useEffect(() => {
    const element = sectionRef.current

    if (!element) return

    let animationFrame = null

    const startCounterAnimation = () => {
      // Ensure animation visibly starts from zero
      setCounts(STATS.map(() => 0))

      const startTime = performance.now()

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / DURATION, 1)
        const easedProgress = easeOutQuad(progress)

        setCounts(
          STATS.map((stat) =>
            Math.round(stat.value * easedProgress),
          ),
        )

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        } else {
          // Guarantee exact final values
          setCounts(STATS.map((stat) => stat.value))
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !hasAnimated.current
        ) {
          hasAnimated.current = true

          startCounterAnimation()

          // Animation only once
          observer.unobserve(element)
        }
      },
      {
        threshold: 0.15,

        // Start only when section properly enters screen
        rootMargin: '0px 0px -10% 0px',
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()

      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  const settings = {
    dots: false,
    arrows: false,

    // DESKTOP: all 4 stats in one row
    slidesToShow: 4,
    slidesToScroll: 1,

    infinite: false,
    autoplay: false,

    speed: 600,
    cssEase: 'ease',

    swipe: true,
    swipeToSlide: true,
    draggable: true,
    touchMove: true,

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: false,
          autoplay: false,
        },
      },

      {
        breakpoint: 640,
        settings: {
          // MOBILE: one stat at a time
          slidesToShow: 1,
          slidesToScroll: 1,

          infinite: true,

          // Client requirement
          autoplay: true,
          autoplaySpeed: 2600,

          speed: 650,

          swipe: true,
          swipeToSlide: true,
          draggable: true,
          touchMove: true,
        },
      },
    ],
  }

  return (
    <section
      ref={sectionRef}
      className="
        relative
        w-full
        overflow-hidden
        bg-[#4A2A1B]
        py-10
        sm:py-12
        lg:py-14
      "
    >
      {/* SUBTLE WARM GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          -left-32 top-1/2
          h-64 w-64
          -translate-y-1/2
          rounded-full
          bg-[#C58B55]/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32 top-1/2
          h-64 w-64
          -translate-y-1/2
          rounded-full
          bg-[#D5A26E]/10
          blur-3xl
        "
      />

      {/* TOP / BOTTOM PREMIUM LINES */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/20" />

      <div className="relative w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        <div
          className="
            min-w-0

            [&_.slick-track]:!flex
            [&_.slick-track]:!items-stretch

            [&_.slick-slide]:!h-auto
            [&_.slick-slide>div]:h-full
          "
        >
          <Slider {...settings}>
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className="h-full px-2 sm:px-3"
              >
                <div
                  className="
                    group
                    relative
                    flex h-full
                    min-h-[130px]
                    flex-col
                    items-center
                    justify-center
                    px-4
                    text-center
                    sm:min-h-[145px]
                    lg:min-h-[150px]
                  "
                >
                  {/* DESKTOP DIVIDER */}
                  {index !== 0 && (
                    <div
                      className="
                        pointer-events-none
                        absolute
                        -left-2
                        top-1/2
                        hidden
                        h-16
                        w-px
                        -translate-y-1/2
                        bg-white/10
                        lg:block
                      "
                    />
                  )}

                  {/* SMALL ACCENT */}
                  <div
                    className="
                      mb-4
                      h-px w-7
                      bg-[#D6A66F]
                      transition-all
                      duration-300
                      group-hover:w-10
                    "
                  />

                  {/* NUMBER */}
                  <div
                    className="
                      text-[38px]
                      font-semibold
                      leading-none
                      tracking-[-0.04em]
                      text-[#FFF8F1]
                      sm:text-[44px]
                      lg:text-[48px]
                      xl:text-[52px]
                    "
                  >
                    {counts[index]}
                    <span className="text-[#D9AD79]">
                      {stat.suffix}
                    </span>
                  </div>

                  {/* LABEL */}
                  <p
                    className="
                      mt-3
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-white/55
                      sm:text-[11px]
                    "
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* MOBILE SWIPE HINT */}
        <p
          className="
            mt-1
            text-center
            text-[9px]
            font-medium
            uppercase
            tracking-[0.18em]
            text-white/30
            sm:hidden
          "
        >
          Swipe to explore
        </p>
      </div>
    </section>
  )
}