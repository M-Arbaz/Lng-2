'use client'

import { useState, useEffect, useRef } from 'react'
import { Link } from '@/lib/navigation'
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaPhoneAlt,
} from 'react-icons/fa'
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaLinkedin,
  FaXTwitter,
  FaPinterestP,
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

const DEFAULT_CONFIG = {
  phone: '',
  email: 'lampandglowofficial01@gmail.com',
  whatsapp: '923134371467',
  showWhatsAppInFooter: true,
  address: '',
  city: 'Sahiwal, Punjab Pakistan',
}

const DEFAULT_LINKS = [
  // Quick Links
  { id: 'default-home', label: 'Home', url: '/', section: 'quickLinks', isActive: true, displayOrder: 0 },
  { id: 'default-contact', label: 'Contact Us', url: '/contact', section: 'quickLinks', isActive: true, displayOrder: 1 },
  { id: 'default-about', label: 'About Us', url: '/about-us', section: 'quickLinks', isActive: true, displayOrder: 2 },
  { id: 'default-wishlist', label: 'Wishlist', url: '/wishlist', section: 'quickLinks', isActive: true, displayOrder: 3 },
  { id: 'default-blogs', label: 'Blog', url: '/blogs', section: 'quickLinks', isActive: true, displayOrder: 4 },
  { id: 'default-shipping', label: 'Shipping Policy', url: '/shipping-policy', section: 'quickLinks', isActive: true, displayOrder: 5 },

  // Collections
  { id: 'default-table', label: 'Table Lamps', url: '#', section: 'collections', isActive: true, displayOrder: 0 },
  { id: 'default-floor', label: 'Floor Lamps', url: '#', section: 'collections', isActive: true, displayOrder: 1 },
  { id: 'default-ceiling', label: 'Roof/Ceiling Lamps', url: '#', section: 'collections', isActive: true, displayOrder: 2 },
  { id: 'default-wall', label: 'Wall Lamps', url: '#', section: 'collections', isActive: true, displayOrder: 3 },
  { id: 'default-hanging', label: 'Hanging Lamps', url: '#', section: 'collections', isActive: true, displayOrder: 4 },
  { id: 'default-bedside', label: 'Bedside/Side Table Lamps', url: '#', section: 'collections', isActive: true, displayOrder: 5 },

  // Policies
  { id: 'default-privacy', label: 'Privacy Policy', url: '/privacy-policy', section: 'policies', isActive: true, displayOrder: 0 },
  { id: 'default-refund', label: 'Refund Policy', url: '#', section: 'policies', isActive: true, displayOrder: 1 },
  { id: 'default-tos', label: 'Terms Of Service', url: '#', section: 'policies', isActive: true, displayOrder: 2 },
  { id: 'default-affiliate', label: 'Affiliate Program', url: '#', section: 'policies', isActive: true, displayOrder: 3 },
]

const SECTION_LABELS = {
  quickLinks: 'Quick Links',
  collections: 'Collections',
  policies: 'Policies',
  other: 'Other',
}

export default function Footer({ theme = 'light' }) {
  const [socialLinks, setSocialLinks] = useState([])
  const [loadingSocial, setLoadingSocial] = useState(true)
  const [footerConfig, setFooterConfig] = useState(DEFAULT_CONFIG)
  const [footerLinks, setFooterLinks] = useState([])
  const [loadingFooter, setLoadingFooter] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState('idle')
  const [newsletterMsg, setNewsletterMsg] = useState('')
  const [waChatOpen, setWaChatOpen] = useState(false)
  const [waMessage, setWaMessage] = useState('');
  const waButtonRef = useRef(null)
  const [waHasInteracted, setWaHasInteracted] = useState(false)
  // ── Draggable WhatsApp ──
  const [waPos, setWaPos] = useState(() => {
    if (typeof window === 'undefined') return null

    try {
      const saved = window.localStorage.getItem('whatsappPos')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const waDrag = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  })

  const waWasDragged = useRef(false)
  useEffect(() => {
    if (waHasInteracted) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const shake = () => {
      if (!waButtonRef.current) return

      waButtonRef.current.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-10deg)' },
          { transform: 'rotate(10deg)' },
          { transform: 'rotate(-8deg)' },
          { transform: 'rotate(8deg)' },
          { transform: 'rotate(-4deg)' },
          { transform: 'rotate(4deg)' },
          { transform: 'rotate(0deg)' },
        ],
        {
          duration: 650,
          easing: 'ease-in-out',
        }
      )
    }

    const firstShake = setTimeout(shake, 2500)
    const interval = setInterval(shake, 7000)

    return () => {
      clearTimeout(firstShake)
      clearInterval(interval)
    }
  }, [waHasInteracted])
  useEffect(() => {
    const loadSocial = async () => {
      try {
        const links = await socialLinksService.getActiveSocialLinks()
        setSocialLinks(links)
      } catch (e) {
        console.error('Error loading social links:', e)
      } finally {
        setLoadingSocial(false)
      }
    }

    loadSocial()
  }, [])

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const [configData, linksData] = await Promise.all([
          footerService.getFooterConfig(),
          footerService.getActiveFooterLinks(),
        ])

        if (configData) {
          setFooterConfig({
            phone: configData.phone || DEFAULT_CONFIG.phone,
            email: configData.email || DEFAULT_CONFIG.email,
            whatsapp: configData.whatsapp || DEFAULT_CONFIG.whatsapp,
            showWhatsAppInFooter: configData.showWhatsAppInFooter !== false,
            address: configData.address || DEFAULT_CONFIG.address,
            city: configData.city || DEFAULT_CONFIG.city,
          })
        }

        if (linksData && linksData.length > 0) {
          setFooterLinks(linksData)
        } else {
          setFooterLinks(DEFAULT_LINKS)
        }
      } catch (e) {
        console.error('Error loading footer data:', e)
        setFooterLinks(DEFAULT_LINKS)
      } finally {
        setLoadingFooter(false)
      }
    }

    loadFooterData()
  }, [])

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()

    const email = newsletterEmail.trim()
    if (!email) return

    setNewsletterStatus('submitting')
    setNewsletterMsg('')

    try {
      await newsletterService.subscribe(email)
      setNewsletterStatus('success')
      setNewsletterMsg('Thank you for subscribing!')
      setNewsletterEmail('')

      setTimeout(() => {
        setNewsletterStatus('idle')
        setNewsletterMsg('')
      }, 4000)
    } catch (err) {
      console.error('Newsletter subscription error:', err)
      setNewsletterStatus('error')
      setNewsletterMsg('Something went wrong. Please try again.')

      setTimeout(() => {
        setNewsletterStatus('idle')
        setNewsletterMsg('')
      }, 4000)
    }
  }
  const handleWhatsAppMessageSubmit = (e) => {
    e.preventDefault()

    const message = waMessage.trim()

    if (!message || !footerConfig.whatsapp) return

    const phone = footerConfig.whatsapp.replace(/\D/g, '')

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }
  const activeLinks = footerLinks.filter((l) => l.isActive !== false)

  const groupedLinks = activeLinks.reduce((acc, link) => {
    const section = link.section || 'other'
    if (!acc[section]) acc[section] = []
    acc[section].push(link)
    return acc
  }, {})

  Object.keys(groupedLinks).forEach((section) => {
    groupedLinks[section].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    )
  })

  const getSectionTitle = (section) => SECTION_LABELS[section] || section

  const sectionOrder = ['quickLinks', 'collections', 'policies', 'other']
  const visibleSections = sectionOrder.filter(
    (section) => groupedLinks[section] && groupedLinks[section].length > 0
  )

  const footerLinkClass =
    'group inline-flex items-center gap-2 text-[13px] leading-6 text-[#CFC1B3] transition-all duration-200 hover:translate-x-1 hover:text-[#FFF7EE]'

  const renderLink = (link) => {
    const isExternal = link.url?.startsWith('http')
    const isHash = link.url === '#'

    if (isHash) {
      return (
        <span className="cursor-default text-[13px] leading-6 text-[#8F8175]">
          {link.label}
        </span>
      )
    }

    const content = (
      <>
        <span>{link.label}</span>
        <span
          aria-hidden="true"
          className="text-[#C99562] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          ↗
        </span>
      </>
    )

    if (isExternal) {
      return (
        <a href={link.url} className={footerLinkClass}>
          {content}
        </a>
      )
    }

    return (
      <Link to={link.url} className={footerLinkClass}>
        {content}
      </Link>
    )
  }

  return (
    <footer className="relative isolate overflow-hidden bg-[#120B07] text-[#F7EFE7]">
      {/* Ambient depth */}
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
        {/* Newsletter statement */}
        <div className="grid gap-10 border-b border-white/[0.08] py-14 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-16 lg:py-20">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#D4A36F]">
              <span className="h-px w-8 bg-[#D4A36F]/70" />
              Lamp & Glow
            </div>

            <h2 className="mt-6 max-w-3xl text-[clamp(2.4rem,5vw,5.6rem)] font-medium leading-[1.05] tracking-[-0.05em] text-[#FFF9F3]">
              Light, crafted to live with you.
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-xl text-sm leading-7 text-[#C3B5A8] sm:text-[15px]">
              Join our list for new collections, thoughtful pieces and selected
              Lamp & Glow updates.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="mt-7">
              <div className="group flex overflow-hidden rounded-full border border-white/[0.14] bg-white/[0.035] p-1.5 transition-colors duration-200 focus-within:border-[#D0A06D]/60">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  aria-label="Email address"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#FFF9F3] outline-none placeholder:text-[#77695E]"
                />

                <button
                  type="submit"
                  disabled={newsletterStatus === 'submitting'}
                  className="shrink-0 rounded-full bg-[#D8A15F] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1A0F08] transition-all duration-200 hover:bg-[#E9BC82] sm:px-7 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {newsletterStatus === 'submitting'
                    ? 'Joining...'
                    : 'Subscribe'}
                </button>
              </div>

              {newsletterMsg && (
                <p
                  className={`mt-3 text-xs ${newsletterStatus === 'success'
                    ? 'text-emerald-300'
                    : 'text-red-300'
                    }`}
                >
                  {newsletterMsg}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Brand / contact row */}
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
                Hand-finished lighting, made for warm and considered spaces.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#9D8D80]">
                {footerConfig.city && <span>{footerConfig.city}, Pakistan</span>}
                <span className="hidden h-1 w-1 rounded-full bg-[#7B6553] sm:block" />
                <span>Handcrafted with character</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {loadingSocial ? (
              <span className="text-xs text-[#8D7D70]">Loading...</span>
            ) : socialLinks.length > 0 ? (
              socialLinks.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform] || FaFacebook

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    aria-label={link.platform}
                    title={link.platform}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.11] bg-white/[0.025] text-[#BBAEA2] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D0A06D]/50 hover:bg-[#D0A06D]/10 hover:text-[#FFEAD3]"
                  >
                    <Icon className="h-[14px] w-[14px]" />
                  </a>
                )
              })
            ) : (
              <span className="text-xs text-[#8D7D70]">
                Social links coming soon
              </span>
            )}
          </div>
        </div>

        {/* Main footer navigation */}
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
                    {footerConfig.address}
                  </span>
                </div>
              )}

              {footerConfig.city && !footerConfig.address && (
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C89561]" />
                  <span className="leading-6">{footerConfig.city}</span>
                </div>
              )}

              {footerConfig.phone && (
                <div className="flex items-start gap-3">
                  <FaPhoneAlt className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C89561]" />
                  <a
                    href={`tel:${footerConfig.phone}`}
                    className="leading-6 transition-colors duration-200 hover:text-[#FFF7EE]"
                  >
                    {footerConfig.phone}
                  </a>
                </div>
              )}

              {footerConfig.whatsapp &&
                footerConfig.showWhatsAppInFooter !== false && (
                  <div className="flex items-start gap-3">
                    <FaWhatsapp className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C89561]" />
                    <a
                      href={`https://wa.me/${footerConfig.whatsapp.replace(
                        /\D/g,
                        ''
                      )}`}
                      className="leading-6 transition-colors duration-200 hover:text-[#FFF7EE]"
                    >
                      {footerConfig.whatsapp}
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
                    {footerConfig.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic link sections */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {visibleSections.map((section) => (
              <div key={section}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#D5A672]">
                  {getSectionTitle(section)}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {groupedLinks[section].map((link) => (
                    <li key={link.id}>{renderLink(link)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright row */}
        <div className="flex flex-col gap-3 py-6 text-[11px] text-[#776A60] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Lamp & Glow. All rights reserved.
          </p>
          <p className="text-[#8A7767]">Handcrafted in Pakistan.</p>
        </div>

        {/* Oversized glowing brand signature */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none overflow-hidden pb-3 pt-5 text-center"
        >
          <div className="relative inline-block whitespace-nowrap text-[clamp(3.6rem,10vw,12rem)] font-medium leading-[0.8] tracking-[-0.065em]">
            <span
              className="absolute inset-0 text-[#D8A15F]/40 blur-[14px] animate-[pulse_3.2s_ease-in-out_infinite] [text-shadow:0_0_18px_rgba(216,161,95,0.5),0_0_42px_rgba(216,161,95,0.35),0_0_78px_rgba(216,161,95,0.2)]"
            >
              LAMP &amp; GLOW PK
            </span>

            <span
              className="relative text-[#F8EFE4] [-webkit-text-stroke:1px_rgba(255,244,232,0.12)] drop-shadow-[0_0_12px_rgba(216,161,95,0.26)]"
            >
              LAMP &amp; GLOW PK
            </span>
          </div>
        </div>
      </div>

      {/* Draggable WhatsApp */}
      {/* Draggable WhatsApp Chat */}
      {footerConfig.whatsapp && (
        <div
          className="fixed z-40"
          style={
            waPos
              ? {
                bottom: waPos.y + 'px',
                right: waPos.x + 'px',
              }
              : {
                bottom: '24px',
                right: '24px',
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
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#20140D] px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white">
                    <FaWhatsapp className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#FFF7EF]">
                      Lamp &amp; Glow
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#9E8F83]">
                      WhatsApp support
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setWaChatOpen(false)}
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

              {/* Body */}
              <div className="px-4 pb-4 pt-4">
                <div className="mb-4 max-w-[88%] rounded-2xl rounded-tl-md bg-[#2A1B12] px-3.5 py-3 text-[13px] leading-5 text-[#D9CCC0]">
                  Hi! How can we help you today?
                </div>

                <form onSubmit={handleWhatsAppMessageSubmit}>
                  <div className="rounded-2xl border border-white/[0.10] bg-white/[0.035] p-2 focus-within:border-[#D1A16F]/45">
                    <textarea
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      required
                      className="block w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-6 text-[#FFF7EF] outline-none placeholder:text-[#74665A]"
                    />

                    <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-2">
                      <span className="pl-1 text-[10px] text-[#73665C]">
                        Opens in WhatsApp
                      </span>

                      <button
                        type="submit"
                        disabled={!waMessage.trim()}
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

          {/* Floating WhatsApp Button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-[#25D366] p-2 text-white shadow-[0_14px_38px_rgba(37,211,102,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20BD5A] cursor-grab select-none touch-none active:cursor-grabbing"
            aria-label={
              waChatOpen
                ? 'Close WhatsApp chat'
                : 'Open WhatsApp chat'
            }
            ref={waButtonRef}

            aria-expanded={waChatOpen}
            onTouchStart={(e) => {
              const touch = e.touches[0]

              waWasDragged.current = false

              waDrag.current = {
                dragging: false,
                startX: touch.clientX,
                startY: touch.clientY,
                posX: waPos?.x ?? 24,
                posY: waPos?.y ?? 24,
              }
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0]

              const dx = Math.abs(
                touch.clientX - waDrag.current.startX
              )

              const dy = Math.abs(
                touch.clientY - waDrag.current.startY
              )

              if (dx > 5 || dy > 5) {
                waWasDragged.current = true
                waDrag.current.dragging = true

                const newX = Math.max(
                  4,
                  Math.min(
                    window.innerWidth - 80,
                    waDrag.current.posX -
                    (touch.clientX - waDrag.current.startX)
                  )
                )

                const newY = Math.max(
                  4,
                  Math.min(
                    window.innerHeight - 120,
                    waDrag.current.posY -
                    (touch.clientY - waDrag.current.startY)
                  )
                )

                setWaPos({
                  x: newX,
                  y: newY,
                })
              }
            }}
            onTouchEnd={(e) => {
              if (waWasDragged.current) {
                e.preventDefault()

                localStorage.setItem(
                  'whatsappPos',
                  JSON.stringify(waPos)
                )
              }
            }}
            onClick={(e) => {
              if (waWasDragged.current) {
                e.preventDefault()
                waWasDragged.current = false
                return
              }

              setWaHasInteracted(true)
              setWaChatOpen((open) => !open)
            }}
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
