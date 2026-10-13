'use client'

import { useEffect, useState, useRef } from 'react'
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
        if (!enabled) {
          setVisible(false)
          return
        }
        setAnnouncement(active)
        setVisible(active !== null)
      } catch (e) {
        console.error('Error loading announcement bar:', e)
      }
    }
    load()
    const interval = setInterval(load, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (!visible || !announcement) return null

  const bg = announcement.bgColor || '#5A2D0C'
  const tc = announcement.textColor || '#ffffff'
  const scrollSpeed = announcement.scrollSpeed || 20

  // Separator between repeated messages
  const separator = '<span style="opacity:0.4;margin:0 1.5rem;">•</span>'
  const itemHtml = announcement.message + separator

  return (
    <div className="w-full overflow-hidden relative" data-announcement-bar="true" style={{ backgroundColor: bg, color: tc }}>
      {/*
        Two identical halves side-by-side.
        We animate translateX from 0 to -50% — exactly one full half-width.
        This creates a perfect seamless loop with zero gap.
      */}
      <div
        ref={trackRef}
        className="flex whitespace-nowrap w-max"
        style={{
          animation: `marquee ${scrollSpeed}s linear infinite`,
        }}
      >
        {/* First half */}
        <div className="flex shrink-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={`a-${i}`}
              className="inline-flex items-center py-2 text-xs sm:text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: itemHtml }}
            />
          ))}
        </div>

        {/* Exact duplicate — when first half scrolls out, this takes over */}
        <div className="flex shrink-0" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={`b-${i}`}
              className="inline-flex items-center py-2 text-xs sm:text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: itemHtml }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}