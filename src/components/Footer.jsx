'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Link } from '@/lib/navigation'

import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from 'react-icons/fa'

import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterestP,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'

import socialLinksService from '../utils/socialLinksService.js'
import footerService from '../utils/footerService.js'
import newsletterService from '../utils/newsletterService.js'

const PLATFORM_ICONS = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  linkedin: FaLinkedin,
  x: FaXTwitter,
  pinterest: FaPinterestP,
  whatsapp: FaWhatsapp,
}

const EMPTY_CONFIG = {
  phone: '',
  email: '',
  whatsapp: '',
  showWhatsAppInFooter: true,
  address: '',
  city: '',
}

const SECTION_LABELS = {
  quickLinks: 'Quick Links',
  collections: 'Collections',
  policies: 'Policies',
  other: 'Other',
}

const SECTION_ORDER = [
  'quickLinks',
  'collections',
  'policies',
  'other',
]

function clean(value) {
  return String(value ?? '').trim()
}

function getDisplayOrder(value) {
  const order = Number(value)

  return Number.isFinite(order)
    ? order
    : 0
}

function isExternalHttp(url = '') {
  return /^https?:\/\//i.test(
    clean(url)
  )
}

function isDirectHref(url = '') {
  const value = clean(url)

  return (
    value.startsWith('#') ||
    /^mailto:/i.test(value) ||
    /^tel:/i.test(value)
  )
}

function getWhatsAppNumber(value = '') {
  return clean(value).replace(
    /\D/g,
    ''
  )
}

export default function Footer({
  theme = 'light',
}) {
  const [
    socialLinks,
    setSocialLinks,
  ] = useState([])

  const [
    loadingSocial,
    setLoadingSocial,
  ] = useState(true)

  const [
    footerConfig,
    setFooterConfig,
  ] = useState(EMPTY_CONFIG)

  const [
    footerLinks,
    setFooterLinks,
  ] = useState([])

  const [
    newsletterEmail,
    setNewsletterEmail,
  ] = useState('')

  const [
    newsletterStatus,
    setNewsletterStatus,
  ] = useState('idle')

  const [
    newsletterMsg,
    setNewsletterMsg,
  ] = useState('')

  const [
    waChatOpen,
    setWaChatOpen,
  ] = useState(false)

  const [
    waMessage,
    setWaMessage,
  ] = useState('')

  const [
    waHasInteracted,
    setWaHasInteracted,
  ] = useState(false)

  const [
    waPos,
    setWaPos,
  ] = useState(null)

  const waButtonRef =
    useRef(null)

  const waWasDragged =
    useRef(false)

  const waDrag = useRef({
    active: false,
    pointerId: null,

    startX: 0,
    startY: 0,

    startRight: 24,
    startBottom: 24,

    lastRight: 24,
    lastBottom: 24,
  })

  /*
   * Restore WhatsApp button position
   * after client mount.
   */
  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          'whatsappPos'
        )

      if (!saved) {
        return
      }

      const parsed =
        JSON.parse(saved)

      if (
        Number.isFinite(
          Number(parsed?.x)
        ) &&
        Number.isFinite(
          Number(parsed?.y)
        )
      ) {
        setWaPos({
          x: Number(parsed.x),
          y: Number(parsed.y),
        })
      }
    } catch (error) {
      console.warn(
        'Unable to restore WhatsApp position:',
        error
      )
    }
  }, [])

  /*
   * Small attention animation.
   */
  useEffect(() => {
    if (waHasInteracted) {
      return undefined
    }

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

    if (
      prefersReducedMotion
    ) {
      return undefined
    }

    const shake = () => {
      if (
        !waButtonRef.current
      ) {
        return
      }

      waButtonRef.current.animate(
        [
          {
            transform:
              'rotate(0deg)',
          },
          {
            transform:
              'rotate(-10deg)',
          },
          {
            transform:
              'rotate(10deg)',
          },
          {
            transform:
              'rotate(-8deg)',
          },
          {
            transform:
              'rotate(8deg)',
          },
          {
            transform:
              'rotate(-4deg)',
          },
          {
            transform:
              'rotate(4deg)',
          },
          {
            transform:
              'rotate(0deg)',
          },
        ],
        {
          duration: 650,
          easing:
            'ease-in-out',
        }
      )
    }

    const firstShake =
      window.setTimeout(
        shake,
        2500
      )

    const interval =
      window.setInterval(
        shake,
        7000
      )

    return () => {
      window.clearTimeout(
        firstShake
      )

      window.clearInterval(
        interval
      )
    }
  }, [waHasInteracted])

  /*
   * Social Links
   */
  useEffect(() => {
    let active = true

    const loadSocialLinks =
      async () => {
        try {
          const links =
            await socialLinksService.getActiveSocialLinks()

          if (!active) {
            return
          }

          setSocialLinks(
            Array.isArray(links)
              ? links.filter(
                (link) =>
                  link?.isActive !==
                  false &&
                  clean(link?.url)
              )
              : []
          )
        } catch (error) {
          console.error(
            'Error loading social links:',
            error
          )

          if (active) {
            setSocialLinks([])
          }
        } finally {
          if (active) {
            setLoadingSocial(
              false
            )
          }
        }
      }

    loadSocialLinks()

    return () => {
      active = false
    }
  }, [])

  /*
   * Footer configuration
   * + footer navigation.
   *
   * No hard-coded contact
   * information or fake links.
   */
  useEffect(() => {
    let active = true

    const loadFooterData =
      async () => {
        try {
          const [
            configData,
            linksData,
          ] = await Promise.all([
            footerService.getFooterConfig(),
            footerService.getActiveFooterLinks(),
          ])

          if (!active) {
            return
          }

          if (configData) {
            setFooterConfig({
              phone:
                clean(
                  configData.phone
                ),

              email:
                clean(
                  configData.email
                ),

              whatsapp:
                clean(
                  configData.whatsapp
                ),

              showWhatsAppInFooter:
                configData.showWhatsAppInFooter !==
                false,

              address:
                clean(
                  configData.address
                ),

              city:
                clean(
                  configData.city
                ),
            })
          } else {
            setFooterConfig({
              ...EMPTY_CONFIG,
            })
          }

          setFooterLinks(
            Array.isArray(
              linksData
            )
              ? linksData
              : []
          )
        } catch (error) {
          console.error(
            'Error loading footer data:',
            error
          )

          if (active) {
            setFooterConfig({
              ...EMPTY_CONFIG,
            })

            setFooterLinks(
              []
            )
          }
        }
      }

    loadFooterData()

    return () => {
      active = false
    }
  }, [])

  const handleNewsletterSubmit =
    async (event) => {
      event.preventDefault()

      const email =
        clean(
          newsletterEmail
        ).toLowerCase()

      if (!email) {
        return
      }

      setNewsletterStatus(
        'submitting'
      )

      setNewsletterMsg('')

      try {
        const result =
          await newsletterService.subscribe(
            email,
            'footer'
          )

        setNewsletterStatus(
          'success'
        )

        setNewsletterMsg(
          result?.alreadySubscribed
            ? 'You are already subscribed.'
            : 'Thank you for subscribing!'
        )

        setNewsletterEmail('')

        window.setTimeout(
          () => {
            setNewsletterStatus(
              'idle'
            )

            setNewsletterMsg('')
          },
          4000
        )
      } catch (error) {
        console.error(
          'Newsletter subscription error:',
          error
        )

        setNewsletterStatus(
          'error'
        )

        setNewsletterMsg(
          error?.message ||
          'Something went wrong. Please try again.'
        )

        window.setTimeout(
          () => {
            setNewsletterStatus(
              'idle'
            )

            setNewsletterMsg('')
          },
          4000
        )
      }
    }

  const handleWhatsAppMessageSubmit =
    (event) => {
      event.preventDefault()

      const message =
        clean(waMessage)

      const phone =
        getWhatsAppNumber(
          footerConfig.whatsapp
        )

      if (
        !message ||
        !phone
      ) {
        return
      }

      const whatsappUrl =
        `https://wa.me/${phone}?text=${encodeURIComponent(
          message
        )}`

      window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer'
      )
    }

  /*
   * Filter legacy dead links
   * such as url="#".
   */
  const activeFooterLinks =
    useMemo(() => {
      return footerLinks.filter(
        (link) => {
          const url =
            clean(link?.url)

          return (
            link?.isActive !==
            false &&
            url &&
            url !== '#'
          )
        }
      )
    }, [footerLinks])

  const groupedLinks =
    useMemo(() => {
      const groups = {}

      activeFooterLinks.forEach(
        (link) => {
          const section =
            clean(
              link.section
            ) || 'other'

          if (
            !groups[section]
          ) {
            groups[section] = []
          }

          groups[
            section
          ].push(link)
        }
      )

      Object.keys(
        groups
      ).forEach(
        (section) => {
          groups[
            section
          ].sort(
            (a, b) =>
              getDisplayOrder(
                a.displayOrder
              ) -
              getDisplayOrder(
                b.displayOrder
              )
          )
        }
      )

      return groups
    }, [activeFooterLinks])

  const visibleSections =
    useMemo(() => {
      const knownSections =
        SECTION_ORDER.filter(
          (section) =>
            groupedLinks[
              section
            ]?.length > 0
        )

      const extraSections =
        Object.keys(
          groupedLinks
        ).filter(
          (section) =>
            !SECTION_ORDER.includes(
              section
            ) &&
            groupedLinks[
              section
            ]?.length > 0
        )

      return [
        ...knownSections,
        ...extraSections,
      ]
    }, [groupedLinks])

  const getSectionTitle = (
    section
  ) =>
    SECTION_LABELS[
    section
    ] ||
    section

  const footerLinkClass =
    'group inline-flex items-center gap-2 text-[13px] leading-6 text-[#CFC1B3] transition-all duration-200 hover:translate-x-1 hover:text-[#FFF7EE]'

  const renderLink = (
    link
  ) => {
    const url =
      clean(link?.url)

    if (
      !url ||
      url === '#'
    ) {
      return null
    }

    const content = (
      <>
        <span>
          {link.label}
        </span>

        <span
          aria-hidden="true"
          className="text-[#C99562] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          ↗
        </span>
      </>
    )

    /*
     * External website:
     * open new tab.
     */
    if (
      isExternalHttp(url)
    ) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            footerLinkClass
          }
        >
          {content}
        </a>
      )
    }

    /*
     * Hash / mailto / tel:
     * normal anchor behavior.
     */
    if (
      isDirectHref(url)
    ) {
      return (
        <a
          href={url}
          className={
            footerLinkClass
          }
        >
          {content}
        </a>
      )
    }

    /*
     * Internal website route:
     * keep same tab.
     */
    return (
      <Link
        to={url}
        className={
          footerLinkClass
        }
      >
        {content}
      </Link>
    )
  }

  /*
   * WhatsApp floating button
   * drag handlers.
   */
  const handleWaPointerDown =
    (event) => {
      setWaHasInteracted(
        true
      )

      waWasDragged.current =
        false

      const startRight =
        waPos?.x ?? 24

      const startBottom =
        waPos?.y ?? 24

      waDrag.current = {
        active: true,
        pointerId:
          event.pointerId,

        startX:
          event.clientX,

        startY:
          event.clientY,

        startRight,
        startBottom,

        lastRight:
          startRight,

        lastBottom:
          startBottom,
      }

      try {
        event.currentTarget.setPointerCapture(
          event.pointerId
        )
      } catch {
        // Ignore unsupported pointer capture.
      }
    }

  const handleWaPointerMove =
    (event) => {
      if (
        !waDrag.current
          .active
      ) {
        return
      }

      const dx =
        event.clientX -
        waDrag.current
          .startX

      const dy =
        event.clientY -
        waDrag.current
          .startY

      if (
        Math.abs(dx) >
        5 ||
        Math.abs(dy) >
        5
      ) {
        waWasDragged.current =
          true
      }

      if (
        !waWasDragged.current
      ) {
        return
      }

      const maxRight =
        Math.max(
          4,
          window.innerWidth -
          80
        )

      const maxBottom =
        Math.max(
          4,
          window.innerHeight -
          100
        )

      const nextRight =
        Math.max(
          4,
          Math.min(
            maxRight,
            waDrag.current
              .startRight -
            dx
          )
        )

      const nextBottom =
        Math.max(
          4,
          Math.min(
            maxBottom,
            waDrag.current
              .startBottom -
            dy
          )
        )

      waDrag.current.lastRight =
        nextRight

      waDrag.current.lastBottom =
        nextBottom

      setWaPos({
        x: nextRight,
        y: nextBottom,
      })
    }

  const finishWaDrag = (
    event
  ) => {
    if (
      !waDrag.current
        .active
    ) {
      return
    }

    waDrag.current.active =
      false

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      )
    } catch {
      // Ignore unsupported pointer capture.
    }

    if (
      waWasDragged.current
    ) {
      const position = {
        x:
          waDrag.current
            .lastRight,

        y:
          waDrag.current
            .lastBottom,
      }

      setWaPos(position)

      try {
        window.localStorage.setItem(
          'whatsappPos',
          JSON.stringify(
            position
          )
        )
      } catch (error) {
        console.warn(
          'Unable to save WhatsApp position:',
          error
        )
      }
    }
  }

  const whatsappPhone =
    getWhatsAppNumber(
      footerConfig.whatsapp
    )

  return (
    <footer
      data-theme={theme}
      className="relative isolate overflow-hidden bg-[#120B07] text-[#F7EFE7]"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10%] top-[-120px] h-[520px] w-[520px] rounded-full bg-[#9A5C2D]/10 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8%] top-[16%] h-[620px] w-[620px] rounded-full bg-[#D08A45]/[0.07] blur-[150px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-260px] left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#5E321B]/20 blur-[130px]"
      />

      <div className="relative mx-auto w-full max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Newsletter */}
        <div className="grid gap-10 border-b border-white/[0.08] py-14 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-16 lg:py-20">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#D4A36F]">
              <span className="h-px w-8 bg-[#D4A36F]/70" />

              Lamp &amp; Glow
            </div>

            <h2 className="mt-6 max-w-3xl text-[clamp(2.4rem,5vw,5.6rem)] font-medium leading-[1.05] tracking-[-0.05em] text-[#FFF9F3]">
              Light, crafted to
              live with you.
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-sm leading-7 text-[#C3B5A8] sm:text-[15px]">
              Join our list for
              new collections,
              thoughtful pieces
              and selected Lamp
              &amp; Glow updates.
            </p>

            <form
              onSubmit={
                handleNewsletterSubmit
              }
              className="mt-7"
            >
              <div className="group flex overflow-hidden rounded-full border border-white/[0.14] bg-white/[0.035] p-1.5 transition-colors duration-200 focus-within:border-[#D0A06D]/60">
                <input
                  type="email"
                  value={
                    newsletterEmail
                  }
                  onChange={(
                    event
                  ) =>
                    setNewsletterEmail(
                      event.target
                        .value
                    )
                  }
                  placeholder="Email address"
                  required
                  aria-label="Email address"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#FFF9F3] outline-none placeholder:text-[#77695E]"
                />

                <button
                  type="submit"
                  disabled={
                    newsletterStatus ===
                    'submitting'
                  }
                  className="shrink-0 rounded-full bg-[#D8A15F] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1A0F08] transition-all duration-200 hover:bg-[#E9BC82] disabled:cursor-not-allowed disabled:opacity-60 sm:px-7"
                >
                  {newsletterStatus ===
                    'submitting'
                    ? 'Joining...'
                    : 'Subscribe'}
                </button>
              </div>

              {newsletterMsg && (
                <p
                  className={`mt-3 text-xs ${newsletterStatus ===
                    'success'
                    ? 'text-emerald-300'
                    : 'text-red-300'
                    }`}
                >
                  {
                    newsletterMsg
                  }
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Brand / Social */}
        <div className="grid gap-10 border-b border-white/[0.08] py-10 sm:py-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
            <div className="h-16 w-16 shrink-0 sm:h-[72px] sm:w-[72px]">
              <img
                src="/logo.png"
                alt="Lamp & Glow"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[#F5EDE5]">
                Hand-finished
                lighting, made
                for warm and
                considered
                spaces.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#9D8D80]">
                {footerConfig.city && (
                  <span>
                    {
                      footerConfig.city
                    }
                  </span>
                )}

                {footerConfig.city && (
                  <span className="hidden h-1 w-1 rounded-full bg-[#7B6553] sm:block" />
                )}

                <span>
                  Handcrafted
                  with character
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {loadingSocial ? (
              <span className="text-xs text-[#8D7D70]">
                Loading...
              </span>
            ) : socialLinks.length >
              0 ? (
              socialLinks.map(
                (link) => {
                  const Icon =
                    PLATFORM_ICONS[
                    link.platform
                    ] ||
                    FaFacebook

                  return (
                    <a
                      key={
                        link.id
                      }
                      href={
                        link.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        link.platform
                      }
                      title={
                        link.platform
                      }
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.11] bg-white/[0.025] text-[#BBAEA2] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D0A06D]/50 hover:bg-[#D0A06D]/10 hover:text-[#FFEAD3]"
                    >
                      <Icon className="h-[14px] w-[14px]" />
                    </a>
                  )
                }
              )
            ) : (
              <span className="text-xs text-[#8D7D70]">
                Social links
                coming soon
              </span>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="grid gap-12 border-b border-white/[0.08] py-12 lg:grid-cols-[1.2fr_2.8fr] lg:gap-16 lg:py-14">
          {/* Contact */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D5A672]">
              Contact
            </p>

            <div className="mt-6 space-y-4 text-sm text-[#C6B8AB]">
              {footerConfig.address && (
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C89561]" />

                  <span className="max-w-[280px] leading-6">
                    {
                      footerConfig.address
                    }
                  </span>
                </div>
              )}

              {footerConfig.city && (
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C89561]" />

                  <span className="leading-6">
                    {
                      footerConfig.city
                    }
                  </span>
                </div>
              )}

              {footerConfig.phone && (
                <div className="flex items-start gap-3">
                  <FaPhoneAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C89561]" />

                  <a
                    href={`tel:${footerConfig.phone}`}
                    className="leading-6 transition-colors duration-200 hover:text-[#FFF7EE]"
                  >
                    {
                      footerConfig.phone
                    }
                  </a>
                </div>
              )}

              {footerConfig.whatsapp &&
                footerConfig.showWhatsAppInFooter !==
                false && (
                  <div className="flex items-start gap-3">
                    <FaWhatsapp className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C89561]" />

                    <a
                      href={`https://wa.me/${whatsappPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leading-6 transition-colors duration-200 hover:text-[#FFF7EE]"
                    >
                      {
                        footerConfig.whatsapp
                      }
                    </a>
                  </div>
                )}

              {footerConfig.email && (
                <div className="flex items-start gap-3">
                  <FaEnvelope className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C89561]" />

                  <a
                    href={`mailto:${footerConfig.email}`}
                    className="break-all leading-6 transition-colors duration-200 hover:text-[#FFF7EE]"
                  >
                    {
                      footerConfig.email
                    }
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Sections */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {visibleSections.map(
              (section) => (
                <div
                  key={
                    section
                  }
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D5A672]">
                    {getSectionTitle(
                      section
                    )}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {groupedLinks[
                      section
                    ].map(
                      (link) => {
                        const rendered =
                          renderLink(
                            link
                          )

                        if (
                          !rendered
                        ) {
                          return null
                        }

                        return (
                          <li
                            key={
                              link.id
                            }
                          >
                            {
                              rendered
                            }
                          </li>
                        )
                      }
                    )}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col gap-3 py-6 text-[11px] text-[#776A60] sm:flex-row sm:items-center sm:justify-between">
          <p>
            ©{' '}
            {new Date().getFullYear()}{' '}
            Lamp &amp; Glow.
            All rights
            reserved.
          </p>

          <p className="text-[#8A7767]">
            Handcrafted in
            Pakistan.
          </p>
        </div>

        {/* Brand Signature */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none overflow-hidden pb-3 pt-5 text-center"
        >
          <div className="relative inline-block whitespace-nowrap text-[clamp(3.6rem,10vw,12rem)] font-medium leading-[0.8] tracking-[-0.065em]">
            <span className="absolute inset-0 animate-[pulse_3.2s_ease-in-out_infinite] text-[#D8A15F]/40 blur-[14px] [text-shadow:0_0_18px_rgba(216,161,95,0.5),0_0_42px_rgba(216,161,95,0.35),0_0_78px_rgba(216,161,95,0.2)]">
              LAMP AND GLOW
              PK
            </span>

            <span className="relative text-[#F8EFE4] drop-shadow-[0_0_12px_rgba(216,161,95,0.26)] [-webkit-text-stroke:1px_rgba(255,244,232,0.12)]">
              LAMP AND GLOW
              PK
            </span>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp */}
      {footerConfig.whatsapp && (
        <div
          className="fixed z-40"
          style={
            waPos
              ? {
                bottom:
                  `${waPos.y}px`,
                right:
                  `${waPos.x}px`,
              }
              : {
                bottom:
                  '24px',
                right:
                  '24px',
              }
          }
        >
          {/* Chat Box */}
          <div
            className={`absolute bottom-[calc(100%+14px)] right-0 w-[min(350px,calc(100vw-32px))] origin-bottom-right transition-all duration-200 ${waChatOpen
              ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none translate-y-2 scale-[0.98] opacity-0'
              }`}
          >
            <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#18100B] shadow-[0_24px_70px_rgba(0,0,0,0.42)]">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#20140D] px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white">
                    <FaWhatsapp className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#FFF7EF]">
                      Lamp &amp;
                      Glow
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#9E8F83]">
                      WhatsApp
                      support
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setWaChatOpen(
                      false
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#9E8F83] transition-colors hover:bg-white/[0.06] hover:text-white"
                  aria-label="Close WhatsApp chat"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Chat Body */}
              <div className="px-4 pb-4 pt-4">
                <div className="mb-4 max-w-[88%] rounded-2xl rounded-tl-md bg-[#2A1B12] px-3.5 py-3 text-[13px] leading-5 text-[#D9CCC0]">
                  Hi! How can we
                  help you today?
                </div>

                <form
                  onSubmit={
                    handleWhatsAppMessageSubmit
                  }
                >
                  <div className="rounded-2xl border border-white/[0.10] bg-white/[0.035] p-2 focus-within:border-[#D1A16F]/45">
                    <textarea
                      value={
                        waMessage
                      }
                      onChange={(
                        event
                      ) =>
                        setWaMessage(
                          event.target
                            .value
                        )
                      }
                      placeholder="Type your message..."
                      rows={3}
                      required
                      className="block w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-6 text-[#FFF7EF] outline-none placeholder:text-[#74665A]"
                    />

                    <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-2">
                      <span className="pl-1 text-[10px] text-[#73665C]">
                        Opens in
                        WhatsApp
                      </span>

                      <button
                        type="submit"
                        disabled={
                          !waMessage.trim()
                        }
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-all duration-200 hover:scale-[1.04] hover:bg-[#2ADF70] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send message on WhatsApp"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-[18px] w-[18px]"
                          fill="currentColor"
                        >
                          <path d="M21.6 3.2a1 1 0 0 0-1.04-.2L2.9 10.2a1 1 0 0 0 .08 1.88l7.02 2.34 2.34 7.02a1 1 0 0 0 .92.68h.04a1 1 0 0 0 .92-.6L21.8 4.24a1 1 0 0 0-.2-1.04ZM12.78 18.2l-1.35-4.05 5.06-5.06-6.1 4.07-4.05-1.35 12.37-5.04-5.93 11.43Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Floating Button */}
          <button
            type="button"
            ref={waButtonRef}
            aria-expanded={
              waChatOpen
            }
            aria-label={
              waChatOpen
                ? 'Close WhatsApp chat'
                : 'Open WhatsApp chat'
            }
            onPointerDown={
              handleWaPointerDown
            }
            onPointerMove={
              handleWaPointerMove
            }
            onPointerUp={
              finishWaDrag
            }
            onPointerCancel={
              finishWaDrag
            }
            onClick={(event) => {
              if (
                waWasDragged.current
              ) {
                event.preventDefault()

                waWasDragged.current =
                  false

                return
              }

              setWaHasInteracted(
                true
              )

              setWaChatOpen(
                (open) =>
                  !open
              )
            }}
            className="inline-flex cursor-grab touch-none select-none items-center justify-center rounded-full bg-[#25D366] p-2 text-white shadow-[0_14px_38px_rgba(37,211,102,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20BD5A] active:cursor-grabbing"
          >
            <span className="flex h-10 w-10 items-center justify-center">
              <FaWhatsapp className="h-6 w-6" />
            </span>
          </button>
        </div>
      )}
    </footer>
  )
}