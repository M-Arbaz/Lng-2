'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import announcementService, {
  isAnnouncementActive,
} from '../utils/announcementService.js'

export default function AnnouncementBar() {
  const [
    announcements,
    setAnnouncements,
  ] = useState([])

  const [
    barEnabled,
    setBarEnabled,
  ] = useState(true)

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0)

  const [
    nowTick,
    setNowTick,
  ] = useState(
    Date.now()
  )

  /*
   * Reload Firestore regularly so:
   * - Admin edits appear
   * - master enable/disable updates
   * - scheduled announcements enter/leave
   */
  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const [
          items,
          enabled,
        ] =
          await Promise.all([
            announcementService.getAllAnnouncements(),

            announcementService.getAnnouncementBarEnabled(),
          ])

        if (!mounted) {
          return
        }

        setAnnouncements(
          Array.isArray(items)
            ? items
            : []
        )

        setBarEnabled(
          enabled !== false
        )

        setNowTick(
          Date.now()
        )
      } catch (error) {
        console.error(
          'Error loading announcement bar:',
          error
        )
      }
    }

    load()

    const refreshInterval =
      window.setInterval(
        load,
        30000
      )

    const clockInterval =
      window.setInterval(
        () => {
          if (mounted) {
            setNowTick(
              Date.now()
            )
          }
        },
        15000
      )

    return () => {
      mounted = false

      window.clearInterval(
        refreshInterval
      )

      window.clearInterval(
        clockInterval
      )
    }
  }, [])

  const activeAnnouncements =
    useMemo(
      () =>
        announcements.filter(
          (announcement) =>
            isAnnouncementActive(
              announcement,
              nowTick
            )
        ),
      [
        announcements,
        nowTick,
      ]
    )

  /*
   * If several announcements are live,
   * rotate between them so every active
   * campaign gets displayed.
   */
  useEffect(() => {
    setActiveIndex(0)

    if (
      activeAnnouncements.length <=
      1
    ) {
      return undefined
    }

    const interval =
      window.setInterval(
        () => {
          setActiveIndex(
            (current) =>
              (current + 1) %
              activeAnnouncements.length
          )
        },
        8000
      )

    return () => {
      window.clearInterval(
        interval
      )
    }
  }, [
    activeAnnouncements.length,
  ])

  if (
    !barEnabled ||
    activeAnnouncements.length ===
    0
  ) {
    return null
  }

  const announcement =
    activeAnnouncements[
    activeIndex %
    activeAnnouncements.length
    ]

  if (!announcement) {
    return null
  }

  const isMarquee =
    announcement.displayStyle !==
    'static'

  const scrollSpeed =
    Math.min(
      60,
      Math.max(
        5,
        Number(
          announcement.scrollSpeed
        ) || 20
      )
    )

  const backgroundColor =
    announcement.bgColor ||
    '#3A2117'

  const textColor =
    announcement.textColor ||
    '#FFFEFC'

  const separator = `
    <span
      style="
        opacity:.45;
        margin:0 1.65rem;
        font-size:.72em;
      "
    >
      ✦
    </span>
  `

  const itemHtml =
    `${announcement.message}${separator}`

  return (
    <div
      key={announcement.id}
      data-announcement-bar="true"
      role="region"
      aria-label="Store announcement"
      aria-live="polite"
      className="group relative z-[160] w-full overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.10)]"
      style={{
        backgroundColor,
        color:
          textColor,
      }}
    >
      {/* subtle premium texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,.14) 0px,
              rgba(255,255,255,.14) 1px,
              transparent 1px,
              transparent 5px
            )
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/15" />

      {isMarquee ? (
        <>
          {/* edge fades */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-16"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,.16), transparent)',
            }}
          />

          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-16"
            style={{
              background:
                'linear-gradient(to left, rgba(0,0,0,.16), transparent)',
            }}
          />

          <div
            className="
              flex
              w-max
              whitespace-nowrap
              group-hover:[animation-play-state:paused]
            "
            style={{
              animation:
                `announcementMarquee ${scrollSpeed}s linear infinite`,
            }}
          >
            <MarqueeCopy
              itemHtml={
                itemHtml
              }
              prefix="a"
            />

            <MarqueeCopy
              itemHtml={
                itemHtml
              }
              prefix="b"
              hidden
            />
          </div>
        </>
      ) : (
        <div
          className="
            relative
            z-[2]
            mx-auto
            flex
            min-h-[36px]
            max-w-7xl
            items-center
            justify-center
            px-5
            py-2
            text-center
            text-[11px]
            font-medium
            leading-5
            tracking-[0.035em]
            sm:min-h-[38px]
            sm:px-8
            sm:text-[12px]
            lg:text-[13px]
            [&_a]:font-semibold
            [&_a]:underline
            [&_a]:underline-offset-2
          "
          dangerouslySetInnerHTML={{
            __html:
              announcement.message,
          }}
        />
      )}

      {/* multi-announcement indicator */}
      {activeAnnouncements.length >
        1 && (
          <div className="pointer-events-none absolute bottom-1 right-2 z-20 hidden items-center gap-1 sm:flex">
            {activeAnnouncements.map(
              (item, index) => (
                <span
                  key={item.id}
                  className={`h-1 rounded-full bg-current transition-all ${index ===
                      activeIndex
                      ? 'w-3 opacity-70'
                      : 'w-1 opacity-25'
                    }`}
                />
              )
            )}
          </div>
        )}

      <style>{`
        @keyframes announcementMarquee {
          from {
            transform: translateX(0);
          }

          to {
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

function MarqueeCopy({
  itemHtml,
  prefix,
  hidden = false,
}) {
  return (
    <div
      className="relative z-[2] flex shrink-0 items-center"
      aria-hidden={
        hidden
          ? 'true'
          : undefined
      }
    >
      {Array.from({
        length: 8,
      }).map(
        (_, index) => (
          <span
            key={`${prefix}-${index}`}
            className="
              inline-flex
              min-h-[36px]
              items-center
              py-1.5
              text-[11px]
              font-medium
              tracking-[0.035em]
              sm:min-h-[38px]
              sm:text-[12px]
              lg:text-[13px]
              [&_a]:font-semibold
              [&_a]:underline
              [&_a]:underline-offset-2
            "
            dangerouslySetInnerHTML={{
              __html:
                itemHtml,
            }}
          />
        )
      )}
    </div>
  )
}