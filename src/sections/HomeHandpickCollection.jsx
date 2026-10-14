'use client'

export default function HomeHandpickCollection({ slides, onAction }) {
  if (!slides || slides.length === 0) return null

  return (
    <section className="overflow-hidden bg-[#FFFCF9]">
      {slides.map((slide, index) => {
        const imageOnRight = slide.imageSide === 'right'

        return (
          <article
            key={slide.id}
            className={`group relative overflow-hidden ${index > 0 ? 'border-t border-[#E9DED4]' : ''
              }`}
          >
            <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-2">
              {/* Image */}
              <div
                className={`relative min-h-[360px] overflow-hidden sm:min-h-[440px] lg:min-h-[620px] ${imageOnRight ? 'lg:order-2' : 'lg:order-1'
                  }`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt || slide.title || 'Lamp & Glow collection'}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.035]"
                />

                {/* soft image treatment */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#24150D]/20 via-transparent to-transparent" />

                {/* editorial corner detail */}
                <div className="absolute bottom-5 left-5 flex items-center gap-3 sm:bottom-7 sm:left-7">
                  <span className="h-px w-8 bg-white/70" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90">
                    Lamp &amp; Glow
                  </span>
                </div>
              </div>

              {/* Content */}
              <div
                className={`relative flex items-center overflow-hidden ${imageOnRight ? 'lg:order-1' : 'lg:order-2'
                  }`}
              >
                {/* subtle warm depth */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#C89B72]/[0.08] blur-3xl"
                />

                <div className="relative mx-auto w-full max-w-[620px] px-6 py-14 sm:px-10 sm:py-18 lg:px-14 xl:px-20">
                  {/* Eyebrow */}
                  {slide.eyebrow && (
                    <div className="mb-6 flex items-center gap-3">
                      <span className="h-px w-8 bg-[#B98255]" />

                      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9A6843] sm:text-[11px]">
                        {slide.eyebrow}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  {slide.title && (
                    <h2 className="max-w-xl font-serif text-[clamp(2.5rem,4.4vw,4.8rem)] leading-[1.02] tracking-[-0.035em] text-[#2B1A12]">
                      {slide.title}
                    </h2>
                  )}

                  {/* Description */}
                  {slide.description && (
                    <p className="mt-6 max-w-lg text-[15px] leading-7 text-[#74645A] sm:text-base sm:leading-8">
                      {slide.description}
                    </p>
                  )}

                  {/* CTA */}
                  {slide.buttonLabel && slide.buttonAction && (
                    <div className="mt-8 sm:mt-10">
                      <button
                        type="button"
                        onClick={() =>
                          onAction && onAction(slide.buttonAction)
                        }
                        className="group/btn inline-flex min-h-[48px] items-center justify-center gap-3 rounded-full bg-[#4A2C1A] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFF9F4] shadow-[0_10px_30px_rgba(74,44,26,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#351F12] hover:shadow-[0_14px_36px_rgba(74,44,26,0.22)] focus:outline-none focus:ring-2 focus:ring-[#B98255]/50 focus:ring-offset-2 focus:ring-offset-[#FFFCF9] sm:px-8"
                      >
                        <span>{slide.buttonLabel}</span>

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                        >
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* subtle index */}
                  <div className="mt-12 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#B7A89D]">
                    <span>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="h-px w-10 bg-[#D7C8BC]" />

                    <span>Collection</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}