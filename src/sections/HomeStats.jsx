'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 8, suffix: '+', label: 'Years of experience' },
  { value: 280, suffix: '+', label: 'Projects delivered' },
  { value: 99, suffix: '%', label: 'Client satisfaction rate' },
  { value: 12, suffix: '+', label: 'Long-term partners' },
]

const DURATION = 1600

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t)
}

export default function HomeStats() {
  const sectionRef = useRef(null)
  const hasAnimated = useRef(false)
  const [counts, setCounts] = useState(() => STATS.map(() => 0))

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            const start = performance.now()

            const tick = (now) => {
              const elapsed = now - start
              const progress = Math.min(elapsed / DURATION, 1)
              const eased = easeOutQuad(progress)
              setCounts(STATS.map((stat) => Math.round(stat.value * eased)))
              if (progress < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-white py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6 text-center">
          {STATS.map((stat, i) => (
            <div key={stat.label}>
              <div className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900">
                {counts[i]}
                {stat.suffix}
              </div>
              <p className="mt-2 text-xs sm:text-sm text-stone-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
