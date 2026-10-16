'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ArrowRight,
  X,
} from 'lucide-react'

import {
  useLocation,
  useNavigate,
} from '@/lib/navigation'

import {
  useAppState,
} from '@/context/AppStateContext'

import websitePopupsService from '../utils/websitePopupsService.js'

function getSessionStorageKey(
  popupId
) {
  return `website_popup_dismissed_${popupId}`
}

function wasDismissedThisSession(
  popupId
) {
  if (!popupId) {
    return false
  }

  try {
    return (
      sessionStorage.getItem(
        getSessionStorageKey(
          popupId
        )
      ) === '1'
    )
  } catch {
    return false
  }
}

function rememberDismissedPopup(
  popupId
) {
  if (!popupId) {
    return
  }

  try {
    sessionStorage.setItem(
      getSessionStorageKey(
        popupId
      ),
      '1'
    )
  } catch {
    // Ignore unavailable browser storage.
  }
}

function getSafeActionUrl(
  value
) {
  const url =
    String(
      value || ''
    ).trim()

  if (!url) {
    return ''
  }

  if (
    url.startsWith('/')
  ) {
    return url
  }

  if (
    /^https?:\/\//i.test(
      url
    ) ||
    /^mailto:/i.test(
      url
    ) ||
    /^tel:/i.test(
      url
    )
  ) {
    return url
  }

  return ''
}

export default function WebsitePopup() {
  const location =
    useLocation()

  const navigate =
    useNavigate()

  const {
    theme,
  } = useAppState()

  const isDark =
    theme === 'dark'

  const isHomepage =
    location.pathname === '/'

  const [
    popup,
    setPopup,
  ] = useState(null)

  const [
    visible,
    setVisible,
  ] = useState(false)

  const [
    loading,
    setLoading,
  ] = useState(false)

  const timerRef =
    useRef(null)

  /*
   * Load popup only while customer
   * is actually on the homepage.
   */
  useEffect(() => {
    if (
      timerRef.current
    ) {
      window.clearTimeout(
        timerRef.current
      )

      timerRef.current =
        null
    }

    setVisible(false)
    setPopup(null)

    if (!isHomepage) {
      setLoading(false)
      return undefined
    }

    let cancelled =
      false

    const loadPopup =
      async () => {
        try {
          setLoading(true)

          const popups =
            await websitePopupsService.getActivePopups()

          if (
            cancelled ||
            !Array.isArray(
              popups
            ) ||
            popups.length ===
            0
          ) {
            return
          }

          /*
           * Use newest eligible popup
           * that has not already been
           * dismissed this session.
           */
          const target =
            popups.find(
              (item) => {
                if (
                  item.showOncePerSession ===
                  false
                ) {
                  return true
                }

                return !wasDismissedThisSession(
                  item.id
                )
              }
            )

          if (
            !target ||
            cancelled
          ) {
            return
          }

          setPopup(
            target
          )

          const delay =
            Math.max(
              0,
              Number(
                target.displayDelay
              ) || 0
            ) * 1000

          timerRef.current =
            window.setTimeout(
              () => {
                if (
                  !cancelled
                ) {
                  setVisible(
                    true
                  )
                }
              },
              delay
            )
        } catch (error) {
          console.error(
            'Error loading website popup:',
            error
          )
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
        }
      }

    loadPopup()

    return () => {
      cancelled = true

      if (
        timerRef.current
      ) {
        window.clearTimeout(
          timerRef.current
        )

        timerRef.current =
          null
      }
    }
  }, [
    isHomepage,
    location.pathname,
  ])

  /*
   * Lock background page while the
   * popup modal is open.
   */
  useEffect(() => {
    if (!visible) {
      return undefined
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    return () => {
      document.body.style.overflow =
        previousOverflow
    }
  }, [
    visible,
  ])

  /*
   * Escape key closes popup.
   */
  useEffect(() => {
    if (!visible) {
      return undefined
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        handleClose()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  })

  const handleClose = () => {
    setVisible(false)

    if (
      popup?.id &&
      popup.showOncePerSession !==
      false
    ) {
      rememberDismissedPopup(
        popup.id
      )
    }
  }

  const handleAction = () => {
    const url =
      getSafeActionUrl(
        popup?.buttonUrl
      )

    handleClose()

    if (!url) {
      return
    }

    /*
     * Internal website links stay in
     * the same tab and use app
     * navigation.
     */
    if (
      url.startsWith('/')
    ) {
      navigate(url)
      return
    }

    /*
     * External / mail / telephone
     * actions also remain explicit.
     */
    window.location.href =
      url
  }

  if (
    !isHomepage ||
    loading ||
    !popup ||
    !visible
  ) {
    return null
  }

  const hasAction =
    Boolean(
      popup.buttonText &&
      getSafeActionUrl(
        popup.buttonUrl
      )
    )

  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="website-popup-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close popup"
        onClick={
          handleClose
        }
        className="absolute inset-0 cursor-default bg-[#17110E]/65 backdrop-blur-[5px]"
      />

      {/* Card */}
      <div
        className={`relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[26px] border shadow-[0_35px_100px_rgba(25,15,10,0.35)] sm:rounded-[30px] ${isDark
            ? 'border-[#4B372D] bg-[#211711]'
            : 'border-[#E0D4CB] bg-[#FFFEFC]'
          }`}
      >
        {/* Close */}
        <button
          type="button"
          onClick={
            handleClose
          }
          className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition sm:right-4 sm:top-4 ${popup.bannerImage
              ? 'border-white/25 bg-black/30 text-white hover:bg-black/50'
              : isDark
                ? 'border-white/10 bg-white/5 text-[#F4E8E0] hover:bg-white/10'
                : 'border-[#DDD0C7] bg-[#FFFEFC]/90 text-[#3A2117] hover:bg-[#F3ECE7]'
            }`}
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image */}
        {popup.bannerImage && (
          <div className="relative shrink-0 overflow-hidden bg-[#E8DDD5]">
            <img
              src={
                popup.bannerImage
              }
              alt={
                popup.title ||
                'Lamp & Glow'
              }
              className="aspect-[16/8] max-h-[310px] w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
          </div>
        )}

        {/* Scrollable content */}
        <div className="min-h-0 overflow-y-auto px-5 py-7 text-center sm:px-8 sm:py-9">
          <div
            className={`mx-auto mb-4 h-px w-10 ${isDark
                ? 'bg-[#D8AD87]/55'
                : 'bg-[#6B4228]/40'
              }`}
          />

          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${isDark
                ? 'text-[#D8AD87]'
                : 'text-[#8A654D]'
              }`}
          >
            Lamp &amp; Glow
          </p>

          <h2
            id="website-popup-title"
            className={`mx-auto mt-3 max-w-md break-words text-2xl font-semibold leading-[1.15] tracking-[-0.03em] sm:text-3xl ${isDark
                ? 'text-[#FFF8F1]'
                : 'text-[#281912]'
              }`}
          >
            {popup.title}
          </h2>

          {popup.description && (
            <p
              className={`mx-auto mt-4 max-w-md whitespace-pre-line break-words text-sm leading-7 sm:text-[15px] ${isDark
                  ? 'text-[#BFAFA6]'
                  : 'text-[#6F5E54]'
                }`}
            >
              {
                popup.description
              }
            </p>
          )}

          {hasAction && (
            <button
              type="button"
              onClick={
                handleAction
              }
              className={`mt-7 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${isDark
                  ? 'bg-[#D8AD87] text-[#281912] hover:bg-[#E8C09E]'
                  : 'bg-[#3A2117] text-[#FFFEFC] hover:bg-[#281912]'
                }`}
            >
              {
                popup.buttonText
              }

              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={
              handleClose
            }
            className={`mx-auto mt-4 block text-xs font-medium transition ${isDark
                ? 'text-[#94847B] hover:text-[#D8C8BE]'
                : 'text-[#9A8478] hover:text-[#6B4228]'
              }`}
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  )
}