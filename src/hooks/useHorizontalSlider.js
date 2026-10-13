'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

export function useHorizontalSlider(itemsLength = 0) {
  const scrollContainerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 1)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el || itemsLength === 0) return undefined

    const runCheck = () => {
      requestAnimationFrame(checkScroll)
    }

    runCheck()
    const timer = setTimeout(runCheck, 150)
    const timer2 = setTimeout(runCheck, 600)

    const resizeObserver = new ResizeObserver(runCheck)
    resizeObserver.observe(el)
    Array.from(el.children).forEach((child) => resizeObserver.observe(child))

    window.addEventListener('resize', runCheck)
    el.addEventListener('scroll', runCheck, { passive: true })

    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
      window.removeEventListener('resize', runCheck)
      el.removeEventListener('scroll', runCheck)
      resizeObserver.disconnect()
    }
  }, [checkScroll, itemsLength])

  const scroll = useCallback((direction) => {
    const el = scrollContainerRef.current
    if (!el) return

    const firstChild = el.firstElementChild
    const styles = window.getComputedStyle(el)
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0
    const itemWidth = firstChild
      ? firstChild.getBoundingClientRect().width + gap
      : Math.min(el.clientWidth * 0.8, 320)

    const nextLeft =
      direction === 'left'
        ? Math.max(0, el.scrollLeft - itemWidth)
        : Math.min(el.scrollLeft + itemWidth, el.scrollWidth - el.clientWidth)

    el.scrollTo({ left: nextLeft, behavior: 'smooth' })
    setTimeout(checkScroll, 400)
  }, [checkScroll])

  return { scrollContainerRef, canScrollLeft, canScrollRight, checkScroll, scroll }
}
