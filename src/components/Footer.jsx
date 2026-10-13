'use client'

import { useState, useEffect, useRef } from 'react'
import { Link } from '@/lib/navigation'
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
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
  city: 'Sahiwal',
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
  const [newsletterStatus, setNewsletterStatus] = useState('idle') // idle | submitting | success | error
  const [newsletterMsg, setNewsletterMsg] = useState('')

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
  const waDrag = useRef({ dragging: false, startX: 0, startY: 0, posX: 0, posY: 0 })
  const waWasDragged = useRef(false)

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

  const activeLinks = footerLinks.filter((l) => l.isActive !== false)

  const groupedLinks = activeLinks.reduce((acc, link) => {
    const section = link.section || 'other'
    if (!acc[section]) acc[section] = []
    acc[section].push(link)
    return acc
  }, {})

  // Sort links within each section by displayOrder
  Object.keys(groupedLinks).forEach((section) => {
    groupedLinks[section].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  })

  const getSectionTitle = (section) => SECTION_LABELS[section] || section

  const textClass = 'text-[#D1D1D1]'
  const headingClass = 'text-sm font-semibold text-[#FFD400]'
  const linkListClass = `mt-4 space-y-2 text-sm ${textClass} flex flex-col items-center sm:items-start`
  const iconClass = 'mt-1 h-4 w-4 text-[#FFD400]'
  const socialContainerClass = `mt-6 flex items-center justify-center sm:justify-start gap-5 ${textClass}`
  const hoverClass = 'hover:text-[#FFD400]'

  const renderLink = (link) => {
    const isExternal = link.url?.startsWith('http')
    const isHash = link.url === '#'
    if (isHash) {
      return (
        <span className="hover:underline cursor-default opacity-60">
          {link.label}
        </span>
      )
    }
    if (isExternal) {
      return (
        <a href={link.url}  className="hover:underline">
          {link.label}
        </a>
      )
    }
    return (
      <Link to={link.url} className="hover:underline">
        {link.label}
      </Link>
    )
  }

  const sectionOrder = ['quickLinks', 'collections', 'policies', 'other']
  const visibleSections = sectionOrder.filter((s) => groupedLinks[s] && groupedLinks[s].length > 0)

  return (
    <footer>
      {/* Scoped styles for the reusable "water fill + shake" hover effect */}
      <style>{`
        .fill-btn {
          overflow: hidden;
        }
        .fill-btn .fill-layer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 0%;
          background: #059669;
          transition: height 1.8s cubic-bezier(0.22, 0.9, 0.32, 1);
          pointer-events: none;
          z-index: 0;
        }
        .fill-btn .fill-layer::before {
          content: '';
          position: absolute;
          top: -16px;
          left: 0;
          right: 0;
          height: 32px;
          background: #059669;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .fill-btn.fill-amber .fill-layer {
          background: #d97706;
        }
        .fill-btn.fill-amber .fill-layer::before {
          background: #d97706;
        }
        .fill-btn:hover .fill-layer {
          height: 100%;
        }
        .fill-btn:hover .fill-layer::before {
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .fill-btn:hover .fill-layer { transition: none; height: 100%; }
          .fill-btn:hover .fill-layer::before { opacity: 1; }
        }
      `}</style>

      <div className="border-t border-[#E5E5E5] bg-[#1F1F1F]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-8 lg:gap-x-4">
            {/* Contact Info Column */}
            <div className="text-center sm:text-left sm:border-r sm:border-[#333333] sm:pr-6 lg:pr-4">
              <p className={headingClass}>
                {footerConfig.city || 'Contact'}
              </p>
              <div className={linkListClass}>
                {footerConfig.address && (
                  <div className="flex justify-center sm:justify-start gap-3 min-w-0 w-full">
                    <FaMapMarkerAlt className={iconClass} />
                    <span className="break-words text-left">{footerConfig.address}</span>
                  </div>
                )}
                {footerConfig.city && !footerConfig.address && (
                  <div className="flex justify-center sm:justify-start gap-3 min-w-0 w-full">
                    <FaMapMarkerAlt className={iconClass} />
                    <span className="break-words text-left">{footerConfig.city}</span>
                  </div>
                )}
                {footerConfig.phone && (
                  <div className="flex justify-center sm:justify-start gap-3 min-w-0 w-full">
                    <FaWhatsapp className={iconClass} />
                    <span className="break-words text-left">Phone: {footerConfig.phone}</span>
                  </div>
                )}
                {footerConfig.whatsapp && footerConfig.showWhatsAppInFooter !== false && (
                  <div className="flex justify-center sm:justify-start gap-3 min-w-0 w-full">
                    <FaWhatsapp className={iconClass} />
                    <span className="break-words text-left">WhatsApp: {footerConfig.whatsapp}</span>
                  </div>
                )}
                {footerConfig.email && (
                  <div className="flex justify-center sm:justify-start gap-3 min-w-0 w-full">
                    <FaEnvelope className={iconClass} />
                    <a href={`mailto:${footerConfig.email}`} className="hover:underline break-all text-left">
                      {footerConfig.email}
                    </a>
                  </div>
                )}
              </div>

              <div className={socialContainerClass}>
                {loadingSocial ? (
                  <span className="text-xs text-stone-400">Loading...</span>
                ) : socialLinks.length > 0 ? (
                  socialLinks.map((link) => {
                    const Icon = PLATFORM_ICONS[link.platform] || FaFacebook
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        
                        aria-label={link.platform}
                        className={hoverClass}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    )
                  })
                ) : (
                  <span className="text-xs text-stone-400">No social links configured</span>
                )}
              </div>
            </div>

            {/* Dynamic Footer Link Sections */}
            {visibleSections.map((section) => (
              <div key={section} className="text-center sm:text-left sm:border-r sm:border-[#333333] sm:pr-6 lg:pr-4">
                <p className={headingClass}>
                  {getSectionTitle(section)}
                </p>
                <ul className={linkListClass}>
                  {groupedLinks[section].map((link) => (
                    <li key={link.id}>{renderLink(link)}</li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter Column - wider, shorter, self-start so it doesn't stretch to match taller columns */}
            <div className="self-start text-center sm:text-left sm:col-span-2 lg:col-span-2 rounded-2xl bg-gradient-to-br from-[#8a5a28] via-[#5A2D0C] to-[#33190a] p-5 sm:p-6 -mx-2 sm:mx-0">
              <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#FFD400]">
                Newsletter Sign Up
              </p>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Receive the latest updates about our products and promotions.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="mt-4 mx-auto sm:mx-0">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full flex-1 rounded-lg border border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'submitting'}
                    className="fill-btn fill-amber group relative shrink-0 whitespace-nowrap rounded-lg bg-[#FFD400] px-6 py-2.5 text-sm font-bold text-[#222222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="fill-layer" aria-hidden="true" />
                    <span className="relative z-10 transition-colors group-hover:text-white">
                      {newsletterStatus === 'submitting' ? 'Subscribing...' : 'Subscribe'}
                    </span>
                  </button>
                </div>
                {newsletterMsg && (
                  <p className={`mt-2 text-xs ${newsletterStatus === 'success' ? 'text-[#22C55E]' : 'text-red-400'}`}>
                    {newsletterMsg}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1F1F1F] border-t border-[#333333]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-[#D1D1D1]/70">
          &copy; {new Date().getFullYear()} All rights reserved by Lampandglow.
        </div>
      </div>

      {footerConfig.whatsapp && (
        <a
          href={`https://wa.me/${footerConfig.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in your products from Lamp and Glow. Website: ${typeof window !== 'undefined' ? window.location.href : 'https://lampandglow.pk'}`)}`}
          target="_blank"
          rel="noreferrer"
          className="fill-btn fixed z-40 inline-flex items-center justify-center rounded-xl bg-emerald-500 p-3 text-white shadow-lg cursor-grab active:cursor-grabbing select-none touch-none"
          aria-label="Chat on WhatsApp"
          style={
            waPos
              ? { bottom: waPos.y + 'px', right: waPos.x + 'px' }
              : { bottom: '24px', right: '24px' }
          }
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
            const dx = Math.abs(touch.clientX - waDrag.current.startX)
            const dy = Math.abs(touch.clientY - waDrag.current.startY)
            if (dx > 5 || dy > 5) {
              waWasDragged.current = true
              waDrag.current.dragging = true
              const newX = Math.max(4, Math.min(window.innerWidth - 80, waDrag.current.posX - (touch.clientX - waDrag.current.startX)))
              const newY = Math.max(4, Math.min(window.innerHeight - 120, waDrag.current.posY - (touch.clientY - waDrag.current.startY)))
              setWaPos({ x: newX, y: newY })
            }
          }}
          onTouchEnd={(e) => {
            if (waWasDragged.current) {
              e.preventDefault()
              localStorage.setItem('whatsappPos', JSON.stringify(waPos))
            }
          }}
          onClick={(e) => {
            if (waWasDragged.current) {
              e.preventDefault()
              waWasDragged.current = false
            }
          }}
        >
          <span className="fill-layer" aria-hidden="true" />
          <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <FaWhatsapp className="h-5 w-5" />
          </span>
        </a>
      )}
    </footer>
  )
}