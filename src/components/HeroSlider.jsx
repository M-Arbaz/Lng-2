'use client'

import { useEffect, useMemo, useState } from 'react'
import Slider from 'react-slick'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function HeroArrow({ direction, onClick }) {
  const isLeft = direction === 'left'
  const Icon = isLeft ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isLeft ? 'Previous slide' : 'Next slide'}
      className={[
        'absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full',
        'border border-white/30 bg-black/10 text-white backdrop-blur-md',
        'transition-all duration-300',
        'hover:scale-105 hover:border-white/60 hover:bg-white hover:text-[#3b281d]',
        'md:flex',
        isLeft ? 'left-3 lg:left-4' : 'right-3 lg:right-4',
      ].join(' ')}
    >
      <Icon size={20} strokeWidth={1.8} />
    </button>
  )
}

export default function HeroSlider({ slides, onPrimaryAction }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')

    const onChange = (event) => {
      setIsMobile(event.matches)
    }

    setIsMobile(mql.matches)

    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)

      return () => {
        mql.removeEventListener('change', onChange)
      }
    }

    mql.addListener(onChange)

    return () => {
      mql.removeListener(onChange)
    }
  }, [])

  const visibleSlides = useMemo(() => {
    if (isMobile) {
      return (slides || []).filter((slide) => slide.imageMobile)
    }

    return slides || []
  }, [slides, isMobile])

  if (!visibleSlides || visibleSlides.length === 0) {
    return null
  }

  const hasMultiple = visibleSlides.length > 1

  const settings = {
    dots: hasMultiple,
    arrows: hasMultiple,

    prevArrow: <HeroArrow direction="left" />,
    nextArrow: <HeroArrow direction="right" />,

    infinite: hasMultiple,
    autoplay: hasMultiple,
    autoplaySpeed: 5000,
    speed: 750,

    slidesToShow: 1,
    slidesToScroll: 1,

    pauseOnHover: true,
    swipe: true,
    touchMove: true,

    customPaging: () => (
      <span className="block h-1.5 w-1.5 rounded-full bg-white/65 transition-all duration-300" />
    ),

    appendDots: (dots) => (
      <div>
        <ul className="m-0 flex items-center justify-center gap-2 p-0">
          {dots}
        </ul>
      </div>
    ),
  }

  // Existing proportions preserved for now.
  // We can tune hero height/image composition in the next controlled step.
  const paddingBottom = isMobile ? '100%' : '40%'
  return (
    <>
      <style>{`
        .hero-slider .slick-slide > div {
          line-height: 0;
        }

        .hero-slider .hero-anim {
          opacity: 0;
          animation: none;
        }

        .hero-slider .slick-active .hero-anim {
          animation: heroTextUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .hero-slider .slick-active .hero-badge {
          animation-delay: 0.1s;
        }

        .hero-slider .slick-active .hero-title {
          animation-delay: 0.25s;
        }

        .hero-slider .slick-active .hero-subtitle {
          animation-delay: 0.45s;
        }

        .hero-slider .slick-active .hero-cta {
          animation-delay: 0.6s;
        }

        @keyframes heroTextUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-slider .hero-anim {
            opacity: 1;
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <section
        className="
          hero-slider
          hero-gradient-bg
          pb-3
          sm:pb-5
          lg:pb-8

          [&_.slick-dots]:!bottom-4
          [&_.slick-dots]:!z-20

          [&_.slick-dots_li]:!m-0
          [&_.slick-dots_li]:!h-1.5
          [&_.slick-dots_li]:!w-auto

          [&_.slick-dots_button]:!h-1.5
          [&_.slick-dots_button]:!w-auto
          [&_.slick-dots_button]:!p-0
          [&_.slick-dots_button:before]:!hidden

          [&_.slick-dots_li.slick-active_span]:!w-7
          [&_.slick-dots_li.slick-active_span]:!bg-white
        "
      >
        <div className="relative overflow-hidden">
          <Slider
            key={isMobile ? 'mobile' : 'desktop'}
            {...settings}
          >
            {visibleSlides.map((slide) => (
              <div key={slide.id}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom,
                    height: 0,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={isMobile ? slide.imageMobile : slide.image}
                    alt={slide.alt || slide.title || 'Lamp & Glow'}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit:
                        slide.fitToScreen !== false
                          ? 'cover'
                          : 'contain',
                      backgroundColor:
                        slide.fitToScreen === false
                          ? '#5A2D0C'
                          : undefined,
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/50 via-black/30 to-black/15" />
                  {/* Premium image contrast */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-[linear-gradient(180deg,rgba(18,12,8,0.12)_0%,rgba(18,12,8,0.24)_48%,rgba(18,12,8,0.52)_100%)]
                    "
                  />

                  {/* Admin-managed hero content */}
                  {(
                    slide.badge ||
                    slide.title ||
                    slide.subtitle ||
                    (slide.primaryLabel && slide.primaryAction) ||
                    (slide.secondaryLabel && slide.secondaryAction)
                  ) && (
                      <div className="absolute inset-0 z-10 flex items-end justify-start pl-16 pr-5 pb-10 sm:pl-20 sm:pr-8 sm:pb-12 lg:pl-24 lg:pr-12 lg:pb-14">
                        <div className="flex w-full max-w-3xl flex-col items-start text-left">
                          {slide.badge && (
                            <span
                              className="
                              hero-anim
                              hero-badge
                              mb-3
                              inline-flex
                              items-center
                              rounded-full
                              border
                              border-white/30
                              bg-black/10
                              px-3.5
                              py-1.5
                              text-[10px]
                              font-medium
                              uppercase
                              tracking-[0.22em]
                              text-white/90
                              backdrop-blur-sm
                              sm:mb-4
                              sm:px-4
                              sm:text-[11px]
                            "
                            >
                              {slide.badge}
                            </span>
                          )}

                          {slide.title && (
                            <h2
                              className="
                              hero-anim
                              hero-title
                              max-w-4xl
                              font-serif
                              text-[2.35rem]
                              leading-[1.02]
                              tracking-[-0.025em]
                              text-white
                              drop-shadow-sm
                              sm:text-5xl
                              md:text-6xl
                              lg:text-[5rem]
                              xl:text-[5.5rem]
                            "
                            >
                              {slide.title}
                            </h2>
                          )}

                          {slide.subtitle && (
                            <p
                              className="
                              hero-anim
                              hero-subtitle
                              mt-3
                              max-w-2xl
                              text-sm
                              font-normal
                              leading-6
                              text-white/85
                              sm:mt-4
                              sm:text-base
                              sm:leading-7
                              md:text-lg
                            "
                            >
                              {slide.subtitle}
                            </p>
                          )}

                          {(
                            (slide.primaryLabel &&
                              slide.primaryAction) ||
                            (slide.secondaryLabel &&
                              slide.secondaryAction)
                          ) && (
                              <div className="hero-anim hero-cta mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-7">

                                {slide.primaryLabel &&
                                  slide.primaryAction && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onPrimaryAction(
                                          slide.primaryAction
                                        )
                                      }
                                      className="
                                    inline-flex
                                    min-h-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#f1e5d7]
                                    px-6
                                    py-3
                                    text-xs
                                    font-semibold
                                    tracking-[0.08em]
                                    text-[#3b281d]
                                    shadow-lg
                                    shadow-black/10
                                    transition
                                    duration-300
                                    hover:-translate-y-0.5
                                    hover:bg-white
                                    hover:shadow-xl
                                    motion-reduce:transform-none
                                    motion-reduce:transition-none
                                    sm:min-h-12
                                    sm:px-8
                                    sm:text-sm
                                  "
                                    >
                                      {slide.primaryLabel}
                                    </button>
                                  )}

                                {slide.secondaryLabel &&
                                  slide.secondaryAction && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onPrimaryAction(
                                          slide.secondaryAction
                                        )
                                      }
                                      className="
                                    inline-flex
                                    min-h-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-white/55
                                    bg-white/10
                                    px-6
                                    py-3
                                    text-xs
                                    font-semibold
                                    tracking-[0.08em]
                                    text-white
                                    backdrop-blur-sm
                                    transition
                                    duration-300
                                    hover:-translate-y-0.5
                                    hover:border-white
                                    hover:bg-white
                                    hover:text-[#3b281d]
                                    motion-reduce:transform-none
                                    motion-reduce:transition-none
                                    sm:min-h-12
                                    sm:px-8
                                    sm:text-sm
                                  "
                                    >
                                      {slide.secondaryLabel}
                                    </button>
                                  )}

                              </div>
                            )}

                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>
    </>
  )
}