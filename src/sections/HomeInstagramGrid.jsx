'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Instagram } from 'lucide-react'

function InstagramTile({
  item,
  index,
  duplicate = false,
  isDark = false,
}) {
  const content = (
    <>
      <img
        src={item.image}
        alt={
          item.alt ||
          `Instagram post ${index + 1}`
        }
        loading="lazy"
        draggable={false}
        className="h-full w-full select-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 transition-all duration-300 group-hover:bg-black/45">
        <span className="grid h-10 w-10 translate-y-1 place-items-center rounded-full border border-white/30 bg-white/10 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Instagram
            size={18}
            strokeWidth={1.8}
          />
        </span>

        <span className="translate-y-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View Post
        </span>
      </div>
    </>
  )

  const classes = `group relative block aspect-square w-[145px] shrink-0 select-none overflow-hidden rounded-[18px] outline-none transition-shadow duration-300 hover:shadow-[0_14px_35px_rgba(0,0,0,0.22)] focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-[180px] lg:w-[215px] xl:w-[235px] ${isDark
    ? 'bg-[#2A211C] ring-[#D8AD87]'
    : 'bg-[#EEE7E0] ring-[#6B4228]'
    }`

  if (!item.url) {
    return (
      <div className={classes}>
        {content}
      </div>
    )
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={
        duplicate ? true : undefined
      }
      className={classes}
    >
      {content}
    </a>
  )
}

export default function HomeInstagramGrid({
  images,
  theme = 'light',
}) {
  const isDark = theme === 'dark'
  const trackRef = useRef(null)
  const firstGroupRef = useRef(null)

  const offsetRef = useRef(0)
  const groupWidthRef = useRef(0)

  // -1 = right to left
  //  1 = left to right
  const directionRef = useRef(-1)

  const draggingRef = useRef(false)
  const pointerDownRef = useRef(false)
  const hoverRef = useRef(false)

  const pointerIdRef = useRef(null)

  const lastPointerXRef = useRef(0)
  const dragStartXRef = useRef(0)

  const suppressClickUntilRef =
    useRef(0)

  const [isDragging, setIsDragging] =
    useState(false)

  const safeImages = useMemo(() => {
    return Array.isArray(images)
      ? images.filter(
        (item) => item?.image
      )
      : []
  }, [images])

  const marqueeItems = useMemo(() => {
    if (safeImages.length === 0) {
      return []
    }

    const minimumItems = 10

    const repeatCount = Math.max(
      1,
      Math.ceil(
        minimumItems /
        safeImages.length
      )
    )

    return Array.from(
      { length: repeatCount },
      () => safeImages
    ).flat()
  }, [safeImages])

  const applyTransform = () => {
    if (!trackRef.current) return

    trackRef.current.style.transform =
      `translate3d(${offsetRef.current}px, 0, 0)`
  }

  const normalizeOffset = () => {
    const width =
      groupWidthRef.current

    if (!width) return

    while (
      offsetRef.current <= -width
    ) {
      offsetRef.current += width
    }

    while (
      offsetRef.current > 0
    ) {
      offsetRef.current -= width
    }
  }

  /*
   * Automatic marquee engine.
   *
   * It uses JS instead of CSS animation so
   * dragging can change both position and
   * future movement direction seamlessly.
   */
  useEffect(() => {
    if (
      marqueeItems.length === 0
    ) {
      return
    }

    let frameId
    let previousTime = null

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      )

    const measure = () => {
      if (!firstGroupRef.current) {
        return
      }

      groupWidthRef.current =
        firstGroupRef.current.getBoundingClientRect()
          .width

      normalizeOffset()
      applyTransform()
    }

    const animate = (time) => {
      if (previousTime === null) {
        previousTime = time
      }

      const deltaSeconds = Math.min(
        (time - previousTime) / 1000,
        0.05
      )

      previousTime = time

      const width =
        groupWidthRef.current

      if (
        width &&
        !draggingRef.current &&
        !hoverRef.current &&
        !reducedMotion.matches
      ) {
        /*
         * Keep approximately the slower speed
         * we selected earlier:
         *
         * Desktop = one loop in ~52 sec
         * Mobile  = one loop in ~40 sec
         */
        const duration =
          window.innerWidth < 640
            ? 40
            : 52

        const pixelsPerSecond =
          width / duration

        offsetRef.current +=
          directionRef.current *
          pixelsPerSecond *
          deltaSeconds

        normalizeOffset()
        applyTransform()
      }

      frameId =
        requestAnimationFrame(
          animate
        )
    }

    measure()

    window.addEventListener(
      'resize',
      measure
    )

    frameId =
      requestAnimationFrame(
        animate
      )

    return () => {
      cancelAnimationFrame(frameId)

      window.removeEventListener(
        'resize',
        measure
      )
    }
  }, [marqueeItems])

  const handlePointerDown = (event) => {
    if (
      event.pointerType === 'mouse' &&
      event.button !== 0
    ) {
      return
    }

    pointerDownRef.current = true
    draggingRef.current = false

    pointerIdRef.current = event.pointerId

    dragStartXRef.current = event.clientX
    lastPointerXRef.current = event.clientX
  }

  const handlePointerMove = (event) => {
    if (
      !pointerDownRef.current ||
      pointerIdRef.current !== event.pointerId
    ) {
      return
    }

    const totalDragDistance =
      Math.abs(
        event.clientX -
        dragStartXRef.current
      )

    /*
     * Normal click ko drag na samjho.
     * 6px movement cross hone ke baad hi
     * actual marquee dragging start hogi.
     */
    if (
      !draggingRef.current &&
      totalDragDistance > 6
    ) {
      draggingRef.current = true
      setIsDragging(true)

      event.currentTarget.setPointerCapture?.(
        event.pointerId
      )
    }

    if (!draggingRef.current) {
      return
    }

    const deltaX =
      event.clientX -
      lastPointerXRef.current

    lastPointerXRef.current =
      event.clientX

    offsetRef.current += deltaX

    if (Math.abs(deltaX) > 0.25) {
      directionRef.current =
        deltaX < 0 ? -1 : 1
    }

    normalizeOffset()
    applyTransform()

    event.preventDefault()
  }
  const finishDragging = (event) => {
    if (
      !pointerDownRef.current ||
      pointerIdRef.current !== event.pointerId
    ) {
      return
    }

    const wasDragging =
      draggingRef.current

    if (wasDragging) {
      suppressClickUntilRef.current =
        performance.now() + 350
    }

    pointerDownRef.current = false
    draggingRef.current = false
    setIsDragging(false)

    if (
      event.currentTarget.hasPointerCapture?.(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      )
    }

    pointerIdRef.current = null
  }

  const handleClickCapture = (
    event
  ) => {
    if (
      performance.now() <
      suppressClickUntilRef.current
    ) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  if (safeImages.length === 0) {
    return null
  }

  return (
    <section
      className={`w-full overflow-hidden py-10 transition-colors duration-300 sm:py-14 lg:py-16 ${isDark
        ? 'bg-[#171310]'
        : 'bg-[#FAF8F5]'
        }`}
    >
      {/* HEADING */}
      <div className="mx-auto mb-7 px-4 text-center sm:mb-9 sm:px-6">
        <div className={`mx-auto grid h-10 w-10 place-items-center rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.10)] ${isDark
          ? 'border border-white/10 bg-[#2A211C] text-[#D8AD87]'
          : 'border border-[#E4D5C8] bg-[#FFFEFC] text-[#6B4228]'
          }`}>
          <Instagram
            size={18}
            strokeWidth={1.8}
          />
        </div>

        <p className={`mt-4 text-[9px] font-semibold uppercase tracking-[0.25em] ${isDark
          ? 'text-[#D8AD87]'
          : 'text-[#8A654D]'
          }`}>
          Follow us <a href="https://www.instagram.com/lampandglow/" target="_blank" rel="noopener noreferrer" className="underline"> @lampandglow </a>
        </p>

        <h2 className={`mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl ${isDark
            ? 'text-[#FFF8F1]'
            : 'text-[#30241D]'
          }`}>
          Instagram
        </h2>

        <p className="mx-auto mt-2.5 max-w-lg text-[11px] leading-5 text-[#8A7569] sm:text-xs">
          Inspiration, details and
          everyday moments from Lamp
          and  Glow.
        </p>
      </div>

      {/* MARQUEE */}
      <div
        onPointerEnter={() => {
          hoverRef.current = true
        }}
        onPointerLeave={() => {
          hoverRef.current = false
        }}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          finishDragging
        }
        onPointerCancel={
          finishDragging
        }
        onClickCapture={
          handleClickCapture
        }
        onDragStart={(event) =>
          event.preventDefault()
        }
        className={`instagram-marquee relative w-full touch-pan-y select-none overflow-hidden ${isDragging
          ? 'cursor-grabbing'
          : 'cursor-grab'
          }`}
      >
        {/* LEFT FADE */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-[#FAF8F5] to-transparent sm:w-14 lg:w-20" />

        {/* RIGHT FADE */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-[#FAF8F5] to-transparent sm:w-14 lg:w-20" />

        <div
          ref={trackRef}
          className="flex w-max"
          style={{
            willChange: 'transform',
          }}
        >
          {/* FIRST GROUP */}
          <div
            ref={firstGroupRef}
            className="flex shrink-0 gap-2.5 pr-2.5 sm:gap-3 sm:pr-3 lg:gap-3.5 lg:pr-3.5"
          >
            {marqueeItems.map(
              (item, index) => (
                <InstagramTile
                  key={`instagram-a-${item.id || index
                    }-${index}`}
                  item={item}
                  index={index}
                />
              )
            )}
          </div>

          {/* SECOND IDENTICAL GROUP */}
          <div className="flex shrink-0 gap-2.5 pr-2.5 sm:gap-3 sm:pr-3 lg:gap-3.5 lg:pr-3.5">
            {marqueeItems.map(
              (item, index) => (
                <InstagramTile
                  key={`instagram-b-${item.id || index
                    }-${index}`}
                  item={item}
                  index={index}
                  duplicate
                />
              )
            )}
          </div>
        </div>
      </div>


    </section>
  )
}