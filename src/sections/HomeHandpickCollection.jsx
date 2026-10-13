'use client'

export default function HomeHandpickCollection({ slides, onAction }) {
  if (!slides || slides.length === 0) return null

  return (
    <section className="bg-white">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`flex flex-col-reverse ${
            slide.imageSide === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'
          } ${index > 0 ? 'border-t border-stone-100' : ''}`}
        >
          <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:h-[520px] overflow-hidden">
            <img
              src={slide.image}
              alt={slide.alt || slide.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="w-full md:w-1/2 md:h-[520px] flex items-center justify-center px-6 py-12 sm:py-16">
            <div className="max-w-sm text-center">
              {slide.eyebrow && (
                <span className="block text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-stone-500 mb-4">
                  {slide.eyebrow}
                </span>
              )}
              {slide.title && (
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 mb-4">
                  {slide.title}
                </h2>
              )}
              {slide.description && (
                <p className="text-sm sm:text-base text-stone-500 mb-8">
                  {slide.description}
                </p>
              )}
              {slide.buttonLabel && slide.buttonAction && (
                <button
                  onClick={() => onAction && onAction(slide.buttonAction)}
                  className="inline-flex items-center justify-center bg-stone-900 text-white text-xs sm:text-sm font-semibold tracking-widest uppercase px-8 py-3.5 transition-colors hover:bg-[#5A2D0C]"
                >
                  {slide.buttonLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
