'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Slider from 'react-slick'
import { Instagram } from 'lucide-react'

function getGalleryLayout() {
  if (typeof window === 'undefined') {
    return {
      itemsPerPage: 10,
      columns: 5,
    }
  }

  if (window.matchMedia('(min-width: 1024px)').matches) {
    return {
      // Desktop: 5 columns × 2 rows
      itemsPerPage: 10,
      columns: 5,
    }
  }

  if (window.matchMedia('(min-width: 640px)').matches) {
    return {
      // Tablet: 3 columns × 2 rows
      itemsPerPage: 6,
      columns: 3,
    }
  }

  return {
    // Mobile: 2 columns × 3 rows
    itemsPerPage: 6,
    columns: 2,
  }
}

function useGalleryLayout() {
  const [layout, setLayout] = useState(getGalleryLayout)

  useEffect(() => {
    const handleResize = () => {
      setLayout(getGalleryLayout())
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return layout
}

function chunkItems(items, size) {
  const pages = []

  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size))
  }

  return pages
}

function GridTile({ item, index }) {
  const content = (
    <>
      <img
        src={item.image}
        alt={item.alt || `Instagram post ${index + 1}`}
        loading="lazy"
        className="
          h-full w-full
          object-cover
          transition-transform
          duration-500
          ease-out
          group-hover:scale-[1.035]
        "
      />

      {/* subtle image treatment */}
      <div
        className="
          pointer-events-none
          absolute inset-0
          bg-gradient-to-t
          from-black/20
          via-transparent
          to-transparent
          opacity-60
        "
      />

      {/* HOVER OVERLAY */}
      <div
        className="
          absolute inset-0
          flex flex-col
          items-center justify-center
          gap-2
          bg-black/0
          transition-all duration-300
          group-hover:bg-black/45
        "
      >
        <span
          className="
            flex h-10 w-10
            translate-y-1
            items-center justify-center
            rounded-full
            border border-white/30
            bg-white/10
            text-white
            opacity-0
            backdrop-blur-sm
            transition-all duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          <Instagram
            className="h-[18px] w-[18px]"
            strokeWidth={1.8}
          />
        </span>

        <span
          className="
            translate-y-1
            text-[10px]
            font-semibold uppercase
            tracking-[0.15em]
            text-white
            opacity-0
            transition-all
            delay-75 duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          View Post
        </span>
      </div>
    </>
  )

  if (!item.url) {
    return (
      <div
        className="
          group
          relative block
          aspect-square
          overflow-hidden
          rounded-xl
          bg-[#EEE7E0]
        "
      >
        {content}
      </div>
    )
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        relative block
        aspect-square
        overflow-hidden
        rounded-xl
        bg-[#EEE7E0]
        outline-none
        ring-[#A86C40]
        transition-shadow
        focus-visible:ring-2
        focus-visible:ring-offset-2
      "
    >
      {content}
    </a>
  )
}

export default function HomeInstagramGrid({ images }) {
  const sliderRef = useRef(null)

  const { itemsPerPage, columns } = useGalleryLayout()

  const [activePage, setActivePage] = useState(0)

  const safeImages = useMemo(
    () =>
      Array.isArray(images)
        ? images.filter((item) => item?.image)
        : [],
    [images],
  )

  const pages = useMemo(
    () => chunkItems(safeImages, itemsPerPage),
    [safeImages, itemsPerPage],
  )

  /*
   * Reset to first page when breakpoint changes.
   * Otherwise an old desktop page index could point
   * beyond the mobile page structure.
   */
  useEffect(() => {
    setActivePage(0)

    sliderRef.current?.slickGoTo(0, true)
  }, [itemsPerPage])

  if (safeImages.length === 0) {
    return null
  }

  const gridColumnsClass =
    columns === 5
      ? 'grid-cols-5'
      : columns === 3
        ? 'grid-cols-3'
        : 'grid-cols-2'

  const hasMultiplePages = pages.length > 1

  const settings = {
    dots: false,
    arrows: false,

    slidesToShow: 1,
    slidesToScroll: 1,

    infinite: hasMultiplePages,

    autoplay: hasMultiplePages,
    autoplaySpeed: 3600,

    speed: 700,
    cssEase: 'ease',

    pauseOnHover: true,
    pauseOnFocus: true,

    swipe: true,
    swipeToSlide: true,
    draggable: true,
    touchMove: true,

    adaptiveHeight: false,

    afterChange: (current) => {
      setActivePage(current)
    },
  }

  const handlePageChange = (pageIndex) => {
    sliderRef.current?.slickGoTo(pageIndex)
  }

  return (
    <section
      className="
        w-full
        overflow-hidden
        bg-[#FAF8F5]
        py-10
        sm:py-14
        lg:py-16
      "
    >
      <div className="w-full px-3 sm:px-5 lg:px-8 xl:px-10">
        {/* HEADING */}
        <div className="mx-auto mb-7 text-center sm:mb-9">
          <div
            className="
              mx-auto
              flex h-9 w-9
              items-center justify-center
              rounded-full
              border border-[#E4D5C8]
              bg-white
              text-[#855333]
              shadow-[0_4px_14px_rgba(79,48,27,0.06)]
            "
          >
            <Instagram
              className="h-[17px] w-[17px]"
              strokeWidth={1.8}
            />
          </div>

          <h2
            className="
              mt-3
              text-2xl
              font-semibold
              tracking-[-0.02em]
              text-[#30241D]
              sm:text-3xl
            "
          >
            Instagram
          </h2>

          <div className="mx-auto mt-3 h-px w-8 bg-[#B98255]" />
        </div>

        {/* CAROUSEL */}
        <div className="mx-auto w-full">
          <Slider
            key={`${itemsPerPage}-${columns}`}
            ref={sliderRef}
            {...settings}
          >
            {pages.map((pageItems, pageIndex) => (
              <div
                key={`instagram-page-${pageIndex}`}
                className="outline-none"
              >
                <div
                  className={`
                    grid
                    ${gridColumnsClass}
                    gap-2
                    sm:gap-2.5
                    lg:gap-3
                  `}
                >
                  {pageItems.map((item, itemIndex) => (
                    <GridTile
                      key={
                        item.id ||
                        `${pageIndex}-${itemIndex}`
                      }
                      item={item}
                      index={
                        pageIndex * itemsPerPage +
                        itemIndex
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* MANUAL NAVIGATION — NO ARROWS */}
        {hasMultiplePages && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {pages.map((_, pageIndex) => (
              <button
                key={`instagram-dot-${pageIndex}`}
                type="button"
                onClick={() =>
                  handlePageChange(pageIndex)
                }
                aria-label={`Go to Instagram gallery page ${pageIndex + 1
                  }`}
                aria-current={
                  activePage === pageIndex
                    ? 'true'
                    : undefined
                }
                className={`
                  h-2 rounded-full
                  transition-all duration-300
                  ${activePage === pageIndex
                    ? 'w-7 bg-[#6A4027]'
                    : 'w-2 bg-[#D6C7BA] hover:bg-[#B58F70]'
                  }
                `}
              />
            ))}
          </div>
        )}

        {/* MOBILE HINT */}
        {hasMultiplePages && (
          <p
            className="
              mt-3
              text-center
              text-[9px]
              font-medium uppercase
              tracking-[0.16em]
              text-[#A38E7E]
              sm:hidden
            "
          >
            Swipe to explore
          </p>
        )}
      </div>
    </section>
  )
}