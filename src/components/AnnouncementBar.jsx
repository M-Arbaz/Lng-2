'use client'

import { useEffect, useRef, useState } from 'react'
import announcementService from '../utils/announcementService.js'

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false)
  const [announcement, setAnnouncement] = useState(null)

  const trackRef = useRef(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const [active, enabled] = await Promise.all([
          announcementService.getActiveAnnouncement(),
          announcementService.getAnnouncementBarEnabled(),
        ])

        if (!mounted) return

        if (!enabled || !active) {
          setVisible(false)
          setAnnouncement(null)
          return
        }

        setAnnouncement(active)
        setVisible(true)
      } catch (error) {
        console.error(
          'Error loading announcement bar:',
          error,
        )
      }
    }

    load()

    const interval = window.setInterval(load, 30000)

    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  if (!visible || !announcement) {
    return null
  }

  const scrollSpeed =
    announcement.scrollSpeed || 20

  const textColor =
    announcement.textColor || '#FFF8F1'

  const separator =
    '<span style="opacity:.42;margin:0 1.65rem;font-size:.72em;">✦</span>'

  const itemHtml =
    announcement.message + separator

  return (
    <div
      data-announcement-bar="true"
      className="group relative z-[160] w-full overflow-hidden"
      style={{
        color: textColor,
        backgroundImage: `
          linear-gradient(
            90deg,
            #342116 0%,
            #4A2B1B 18%,
            #633A24 42%,
            #70452B 50%,
            #633A24 58%,
            #4A2B1B 82%,
            #342116 100%
          )
        `,
      }}
    >
      {/* WOOD GRAIN */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.05) 0px,
              rgba(255,255,255,0.05) 1px,
              transparent 1px,
              transparent 4px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0,0,0,0.08) 0px,
              rgba(0,0,0,0.08) 1px,
              transparent 1px,
              transparent 17px
            )
          `,
        }}
      />

      {/* SOFT INNER HIGHLIGHTS */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/25" />

      {/* LEFT FADE */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-16"
        style={{
          background:
            'linear-gradient(to right, rgba(52,33,22,0.96), transparent)',
        }}
      />

      {/* RIGHT FADE */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-16"
        style={{
          background:
            'linear-gradient(to left, rgba(52,33,22,0.96), transparent)',
        }}
      />

      {/* MARQUEE */}
      <div
        ref={trackRef}
        className="flex w-max whitespace-nowrap group-hover:[animation-play-state:paused]"
        style={{
          animation: `announcementMarquee ${scrollSpeed}s linear infinite`,
        }}
      >
        {/* FIRST COPY */}
        <div className="flex shrink-0 items-center">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <span
                key={`announcement-a-${index}`}
                className="
                  inline-flex
                  min-h-[34px]
                  items-center
                  py-1.5
                  text-[11px]
                  font-medium
                  tracking-[0.035em]
                  sm:min-h-[36px]
                  sm:text-[12px]
                  lg:text-[13px]
                "
                dangerouslySetInnerHTML={{
                  __html: itemHtml,
                }}
              />
            ),
          )}
        </div>

        {/* SECOND COPY */}
        <div
          className="flex shrink-0 items-center"
          aria-hidden="true"
        >
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <span
                key={`announcement-b-${index}`}
                className="
                  inline-flex
                  min-h-[34px]
                  items-center
                  py-1.5
                  text-[11px]
                  font-medium
                  tracking-[0.035em]
                  sm:min-h-[36px]
                  sm:text-[12px]
                  lg:text-[13px]
                "
                dangerouslySetInnerHTML={{
                  __html: itemHtml,
                }}
              />
            ),
          )}
        </div>
      </div>

      <style>{`
        @keyframes announcementMarquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-announcement-bar="true"] > div {
            animation-play-state: paused !important;
          }
        }
      `}</style>
    </div>
  )
}