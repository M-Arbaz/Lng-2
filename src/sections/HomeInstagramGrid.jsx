'use client'

import { useEffect, useState } from 'react'
import { Instagram, ChevronLeft, ChevronRight } from 'lucide-react'

function GridTile({ item, index }) {
  return (
    <a
      href={item.url || '#'}
      target={item.url ? '_blank' : undefined}
      rel={item.url ? 'noopener noreferrer' : undefined}
      className="group relative block aspect-square overflow-hidden"
    >
      <img
        src={item.image}
        alt={item.alt || `Instagram post ${index + 1}`}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 flex flex-col items-center justify-center gap-2 transition-colors duration-300 group-hover:bg-black/50">
        <Instagram className="w-8 h-8 text-white opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" strokeWidth={1.75} />
        <span className="text-white text-sm font-semibold tracking-wide opacity-0 -translate-y-1 transition-all duration-300 delay-75 group-hover:opacity-100 group-hover:translate-y-0">
          Shop It
        </span>
      </div>
    </a>
  )
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  )
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = (e) => setIsDesktop(e.matches)
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }
    mql.addListener(onChange)
    return () => mql.removeListener(onChange)
  }, [])
  return isDesktop
}

export default function HomeInstagramGrid({ images }) {
  const isDesktop = useIsDesktop()
  const [page, setPage] = useState(0)

  if (!images || images.length === 0) return null

  // Desktop: 5 columns x 2 rows = 10 per page. Mobile: 2 columns x 3 rows = 6 per page.
  const itemsPerPage = isDesktop ? 10 : 6
  const totalPages = Math.ceil(images.length / itemsPerPage)
  const safePage = ((page % totalPages) + totalPages) % totalPages
  const start = safePage * itemsPerPage
  const currentImages = images.slice(start, start + itemsPerPage)
  const showArrows = totalPages > 1

  const goPrev = () => setPage((p) => p - 1)
  const goNext = () => setPage((p) => p + 1)

  return (
    <section className="bg-white py-14 sm:py-16">
      <h2 className="text-center font-serif text-3xl sm:text-4xl text-stone-900 mb-10">
        Instagram
      </h2>

      <div className="relative px-10 sm:px-14">
        {showArrows && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous images"
            className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-md ring-1 ring-stone-200 text-stone-700 hover:text-[#FFD400] hover:shadow-lg transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className={`grid ${isDesktop ? 'grid-cols-5' : 'grid-cols-2'}`}>
          {currentImages.map((item, i) => (
            <GridTile key={item.id} item={item} index={start + i} />
          ))}
        </div>

        {showArrows && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next images"
            className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-md ring-1 ring-stone-200 text-stone-700 hover:text-[#FFD400] hover:shadow-lg transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  )
}
