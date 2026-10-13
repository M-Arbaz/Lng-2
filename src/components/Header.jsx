'use client'

import { useMemo, useState, useEffect, useRef, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { FaHeart, FaSearch, FaShoppingCart, FaUserAlt } from 'react-icons/fa'
import { Moon, Sun, LogIn, Sparkles, ChevronDown } from 'lucide-react'
import { useNavigate, useLocation } from '@/lib/navigation'
import { useAuth } from '../context/AuthContext'
import { slugify } from '../utils/slugify.js'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Header = forwardRef(function Header({
  activeSection,
  cartItemsCount,
  categories,
  handleNavigate,
  mobileNavOpen,
  navigateToWishlist,
  products,
  searchQuery,
  setMobileNavOpen,
  setSearchQuery,
  theme,
  toggleTheme,
  transparentOverlay = false,
  wishlistItemsCount = 0,
}, ref) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoggedIn } = useAuth()
  const [logoError, setLogoError] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchInputRef = useRef(null)
  const mobileSearchInputRef = useRef(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [headerTranslate, setHeaderTranslate] = useState(0)
  const [hoveredNav, setHoveredNav] = useState(null)
  const showTransparent = transparentOverlay && !isScrolled

  useEffect(() => {
    let resizeObserver = null
    let observedBar = null

    const updatePosition = () => {
      const bar = document.querySelector('[data-announcement-bar="true"]')
      const barHeight = bar ? bar.offsetHeight : 0
      const scrollY = window.scrollY

      const translateY = scrollY < barHeight ? barHeight - scrollY : 0
      setHeaderTranslate(translateY)
      setIsScrolled(scrollY > barHeight)

      if (bar && bar !== observedBar) {
        if (resizeObserver) resizeObserver.disconnect()
        resizeObserver = new ResizeObserver(updatePosition)
        resizeObserver.observe(bar)
        observedBar = bar
      }

      if (!bar && resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
        observedBar = null
      }
    }

    window.addEventListener('scroll', updatePosition, { passive: true })
    updatePosition()

    const mutationObserver = new MutationObserver(updatePosition)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', updatePosition)
      if (resizeObserver) resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!searchOpen && !searchExpanded) return
    const handlePointerDown = (event) => {
      if (!event.target.closest('[data-search-root="true"]')) {
        setSearchOpen(false)
        setSearchExpanded(false)
      }
    }
    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [searchOpen, searchExpanded])

  useEffect(() => {
    if (!searchExpanded) return
    searchInputRef.current?.focus()
    mobileSearchInputRef.current?.focus()
  }, [searchExpanded])

  useEffect(() => {
    if (!mobileNavOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileNavOpen])

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!Array.isArray(products)) return []

    const base = q
      ? products.filter((p) => {
          const name = String(p.name ?? '').toLowerCase()
          const category = String(p.category ?? '').toLowerCase()
          return name.includes(q) || category.includes(q)
        })
      : products

    return base.slice(0, 6)
  }, [products, searchQuery])

  function handlePickSuggestion(product) {
    if (!product) return
    setSearchQuery(product.name ?? '')
    setSearchOpen(false)
    navigate(`/products/${slugify(product.name)}`)
  }

  const navLinks = [
    { key: 'categories', label: 'COLLECTION', mobileLabel: 'Collection', icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    )},
    { key: 'products',   label: 'PRODUCTS',   mobileLabel: 'Products', icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    )},
    { key: 'blogs',      label: 'BLOG',        mobileLabel: 'Blog', icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    )},
    { key: 'reels',      label: 'REELS',       mobileLabel: 'Reels', icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="8" y1="2" x2="8" y2="22"/><line x1="16" y1="2" x2="16" y2="22"/>
        <line x1="2" y1="8" x2="22" y2="8"/><line x1="2" y1="16" x2="22" y2="16"/>
      </svg>
    )},
  ]

  const isNavActive = (key) => {
    if (key === 'categories') {
      return location.pathname.startsWith('/collections')
    }
    if (key === 'blogs') {
      return location.pathname === '/blogs' || location.pathname.startsWith('/blog/')
    }
    if (key === 'reels') {
      return location.pathname === '/reels' || location.pathname.startsWith('/reels/')
    }
    if (key === 'products') {
      return location.pathname === '/products' || location.pathname.startsWith('/products/')
    }
    return activeSection === key
  }

  // ── Mobile drawer rendered via portal so it escapes the header stacking context ──
  const mobileDrawer = mobileNavOpen
    ? createPortal(
        <div className="fixed inset-0 z-[9999] lg:hidden overflow-x-hidden">
          {/* Backdrop with blur */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <nav
            className={classNames(
              'absolute top-0 right-0 h-[100dvh] w-[85vw] max-w-[380px] shadow-2xl border-l flex flex-col overflow-hidden',
              theme === 'dark' ? 'bg-[#1F1F1F] border-white/10' : 'bg-white/95 backdrop-blur-xl border-[#E5E5E5]',
            )}
          >
            {/* Decorative gradient top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD400] via-amber-500 to-orange-500" />

            {/* Drawer header */}
            <div
              className={classNames(
                'h-16 sm:h-20 px-5 flex items-center justify-between border-b flex-shrink-0',
                theme === 'dark' ? 'border-white/10' : 'border-stone-200',
              )}
            >
              {/* Logo mini */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FFD400] to-amber-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs">LG</span>
                </div>
                <span className={classNames('text-sm font-bold tracking-wider', theme === 'dark' ? 'text-stone-200' : 'text-[#222222]')}>
                  Menu
                </span>
              </div>

              {/* Close button */}
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileNavOpen(false)}
                className={classNames(
                  'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:rotate-90',
                  theme === 'dark'
                    ? 'border-white/15 bg-white/5 text-stone-100 hover:bg-white/10'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:shadow-md',
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer links */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-10 flex flex-col gap-1.5">
              {navLinks.map(({ key, mobileLabel, icon }) => (
                <button
                  key={key}
                  onClick={() => handleNavigate(key)}
                  className={classNames(
                    'w-full text-right rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-end gap-3 group',
                    isNavActive(key)
                      ? theme === 'dark'
                        ? 'bg-[#FFD400]/15 text-[#FFD400] shadow-sm'
                        : 'bg-gradient-to-r from-[#FFD400]/20 to-amber-50 text-[#5A2D0C] shadow-sm'
                      : theme === 'dark'
                        ? 'text-stone-200 hover:bg-white/5 hover:translate-x-[-2px]'
                        : 'text-[#222222] hover:bg-[#F5F1EA] hover:translate-x-[-2px]',
                  )}
                >
                  <span className={classNames(
                    'transition-transform duration-200',
                    isNavActive(key) ? 'scale-110' : 'group-hover:scale-110'
                  )}>
                    {icon}
                  </span>
                  {mobileLabel}
                </button>
              ))}

              {/* Divider */}
              <div className={classNames('my-3 border-t', theme === 'dark' ? 'border-white/10' : 'border-stone-100')} />

              {/* Cart */}
              <button
                onClick={() => handleNavigate('cart')}
                className={classNames(
                  'w-full text-right rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-end gap-3',
                  activeSection === 'cart'
                    ? theme === 'dark'
                      ? 'bg-[#FFD400]/15 text-[#FFD400]'
                      : 'bg-gradient-to-r from-[#FFD400]/20 to-amber-50 text-[#5A2D0C]'
                    : theme === 'dark'
                      ? 'text-stone-200 hover:bg-white/5'
                      : 'text-[#222222] hover:bg-[#F5F1EA]',
                )}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Cart
                {cartItemsCount > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#5A2D0C] to-[#7A4A20] text-[10px] font-bold text-white shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={navigateToWishlist}
                className={classNames(
                  'w-full text-right rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-end gap-3',
                  theme === 'dark' ? 'text-stone-200 hover:bg-white/5' : 'text-[#222222] hover:bg-[#F5F1EA]',
                )}
              >
                <FaHeart className="w-3.5 h-3.5" />
                Wishlist
                {wishlistItemsCount > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#E53935] to-rose-500 text-[10px] font-bold text-white shadow-sm">
                    {wishlistItemsCount}
                  </span>
                )}
              </button>

              {/* Profile / Sign in */}
              {isLoggedIn() ? (
                <button
                  onClick={() => handleNavigate('profile')}
                  className={classNames(
                    'w-full text-right rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-end gap-3',
                    activeSection === 'profile'
                      ? theme === 'dark'
                        ? 'bg-[#FFD400]/15 text-[#FFD400]'
                        : 'bg-gradient-to-r from-[#FFD400]/20 to-amber-50 text-[#5A2D0C]'
                      : theme === 'dark'
                        ? 'text-stone-200 hover:bg-white/5'
                        : 'text-[#222222] hover:bg-[#F5F1EA]',
                  )}
                >
                  <FaUserAlt className="w-3 h-3" />
                  Profile
                </button>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMobileNavOpen(false) }}
                  className={classNames(
                    'w-full text-right rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-end gap-3',
                    theme === 'dark' ? 'text-stone-200 hover:bg-white/5' : 'text-[#222222] hover:bg-[#F5F1EA]',
                  )}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}

              {/* Divider + theme toggle */}
              <div className={classNames('mt-auto pt-4 border-t', theme === 'dark' ? 'border-white/10' : 'border-stone-100')}>
                <button
                  onClick={toggleTheme}
                  className={classNames(
                    'w-full text-right rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-end gap-2',
                    theme === 'dark' ? 'text-stone-200 hover:bg-white/5' : 'text-[#222222] hover:bg-[#F5F1EA]',
                  )}
                >
                  {theme === 'dark' ? (
                    <><Sun className="h-4 w-4" /> Light mode</>
                  ) : (
                    <><Moon className="h-4 w-4" /> Dark mode</>
                  )}
                </button>
              </div>
            </div>
          </nav>
        </div>,
        document.body
      )
    : null

  return (
    <>
      <header
        ref={ref}
        className={classNames(
          'fixed left-0 right-0 top-0 z-[150] transition-all duration-500',
          showTransparent
            ? 'bg-transparent border-b border-transparent'
            : isScrolled
              ? theme === 'dark'
                ? 'bg-[#1F1F1F]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
                : 'bg-white/90 backdrop-blur-xl border-b border-[#E5E5E5] shadow-[0_4px_30px_rgba(0,0,0,0.08)]'
              : theme === 'dark'
                ? 'bg-[#1F1F1F] border-b border-white/10'
                : 'bg-white border-b border-[#E5E5E5]',
        )}
        style={{ transform: `translateY(${headerTranslate}px)` }}
      >
        {/* Gradient accent line on top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD400] via-amber-400 to-orange-500 opacity-80" />

        {/* ── Main bar (desktop, lg and up) ── */}
        <div className="hidden lg:flex w-full px-3 sm:px-6 lg:px-8 h-16 sm:h-20 items-center gap-2 sm:gap-4 relative">

          {/* Logo */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-2 flex-shrink-0 group"
            aria-label="Go to home"
          >
            {logoError ? (
              <div className="h-[52px] w-[52px] p-2 sm:h-[68px] sm:w-[68px] sm:p-3 transition-transform duration-300 group-hover:scale-105">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-[#FFD400] via-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-xl sm:text-2xl">LG</span>
                </div>
              </div>
            ) : (
              <div className="h-[52px] w-[52px] p-2 sm:h-[68px] sm:w-[68px] sm:p-3 transition-transform duration-300 group-hover:scale-105">
                <img
                  src='/logo.png'
                  alt="Lamp & Glow"
                  className="h-full w-full object-contain drop-shadow-sm"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
          </button>

          {/* Desktop nav */}
          <nav
            className={classNames(
              'hidden lg:flex items-center gap-1 ml-4',
              showTransparent ? 'text-white' : theme === 'dark' ? 'text-stone-200' : 'text-[#222222]',
            )}
          >
            {navLinks.map(({ key, label, icon }) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => setHoveredNav(key)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <button
                  onClick={() => key === 'products' ? navigate('/products') : handleNavigate(key)}
                  className={classNames(
                    'relative px-4 py-2 text-[11px] font-black tracking-[0.15em] transition-all duration-300 group',
                    isNavActive(key) && (showTransparent ? 'text-[#FFD400]' : theme === 'dark' ? 'text-[#FFD400]' : 'text-[#5A2D0C]'),
                    !isNavActive(key) && (showTransparent ? 'text-white/85 hover:text-white' : theme === 'dark' ? 'text-stone-400 hover:text-stone-100' : 'text-stone-500 hover:text-[#222222]'),
                  )}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className={classNames(
                      'transition-transform duration-300',
                      isNavActive(key) ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-[-5deg]',
                    )}>
                      {icon}
                    </span>
                    {label}
                    {key === 'categories' && (
                      <ChevronDown className={classNames(
                        'w-3 h-3 transition-transform duration-300',
                        hoveredNav === 'categories' ? 'rotate-180' : '',
                      )} />
                    )}
                  </span>
                  {/* Animated underline */}
                  <span className={classNames(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300',
                    isNavActive(key)
                      ? 'w-3/4 bg-gradient-to-r from-[#FFD400] to-amber-500'
                      : 'w-0 bg-gradient-to-r from-[#FFD400] to-amber-500 group-hover:w-3/4',
                  )} />
                </button>

                {/* Categories dropdown */}
                {key === 'categories' && categories?.length > 0 && hoveredNav === 'categories' && (
                  <div className="absolute left-0 top-full pt-2 w-72 z-50">
                    <div className="bg-transparent rounded-2xl overflow-hidden">
                      <div className="max-h-[360px] overflow-y-auto py-2 scrollbar-hide">
                        {categories.map((cat) => (
                          <button
                            key={cat.firestoreId || cat.id}
                            type="button"
                            onClick={() => {
                              navigate(`/collections/${slugify(cat.id)}`)
                              setHoveredNav(null)
                            }}
                            className={classNames(
                              'w-full px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 flex items-center gap-3',
                              theme === 'dark' ? 'text-stone-200 hover:bg-white/5' : 'text-stone-700 hover:bg-stone-50',
                            )}
                          >
                            <div className="h-8 w-8 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                              {cat.image ? (
                                <img src={cat.image} alt="" className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <span className="truncate">{cat.title}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleNavigate('categories')
                          setHoveredNav(null)
                        }}
                        className={classNames(
                          'w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide border-t transition-colors',
                          theme === 'dark'
                            ? 'text-[#FFD400] border-white/10 hover:bg-white/5'
                            : 'text-[#5A2D0C] border-stone-100 hover:bg-stone-50',
                        )}
                      >
                        View all collections
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop search */}
          <div
            className={classNames(
              'hidden md:flex items-center relative',
              searchExpanded ? 'flex-1 max-w-md mx-auto' : 'flex-1 justify-end',
            )}
            data-search-root="true"
          >
            {!searchExpanded ? (
              <button
                type="button"
                onClick={() => setSearchExpanded(true)}
                aria-label="Open search"
                className={classNames(
                  'inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-[0.98] motion-reduce:transform-none',
                  showTransparent ? 'text-white' : theme === 'dark' ? 'text-stone-100 hover:text-[#FFD400]' : 'text-[#222222] hover:text-[#FFD400] hover:bg-black/5',
                )}
              >
                <FaSearch className="h-4 w-4" />
              </button>
            ) : (
              <div
                className={classNames(
                  'w-full flex items-center gap-3 rounded-full border shadow-sm px-4 py-2 transition-all duration-300',
                  isScrolled
                    ? theme === 'dark'
                      ? 'border-white/10 bg-white/5 focus-within:border-[#FFD400]/50 focus-within:shadow-[0_0_15px_rgba(255,212,0,0.1)]'
                      : 'border-stone-200 bg-stone-50 focus-within:border-[#FFD400]/50 focus-within:shadow-[0_0_15px_rgba(255,212,0,0.1)]'
                    : theme === 'dark'
                      ? 'border-white/10 bg-white/5 focus-within:border-[#FFD400]/50'
                      : 'border-stone-200 bg-stone-50 focus-within:border-[#FFD400]/50',
                )}
              >
                <FaSearch className={classNames(
                  'transition-colors duration-300 flex-shrink-0',
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
                )} />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate('/products')
                      setSearchOpen(false)
                    }
                    if (e.key === 'Escape') {
                      setSearchOpen(false)
                      setSearchExpanded(false)
                    }
                  }}
                  type="text"
                  placeholder="Search entire store here..."
                  className={classNames(
                    'w-full bg-transparent text-sm font-medium placeholder:text-stone-400 focus:outline-none',
                    theme === 'dark' ? 'text-stone-100' : 'text-stone-800',
                  )}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery) {
                      setSearchQuery('')
                    } else {
                      setSearchOpen(false)
                      setSearchExpanded(false)
                    }
                  }}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-stone-200/50 transition-colors"
                  aria-label="Close search"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {searchExpanded && searchOpen && (
              <div
                className={classNames(
                  'absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl overflow-hidden z-30 animate-fadeIn',
                  theme === 'dark' ? 'border-white/10 bg-[#2A2A2A]' : 'border-stone-200 bg-white',
                )}
              >
                {/* Search header */}
                <div className={classNames(
                  'px-4 py-2.5 text-[10px] font-bold tracking-wider uppercase border-b',
                  theme === 'dark' ? 'text-stone-500 border-white/10' : 'text-stone-400 border-stone-100'
                )}>
                  {searchSuggestions.length > 0 ? `${searchSuggestions.length} product${searchSuggestions.length !== 1 ? 's' : ''} found` : 'No results'}
                </div>

                {searchSuggestions.length === 0 ? (
                  <div className={classNames('px-4 py-6 text-center text-sm', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
                    <div className="mb-2">
                      <FaSearch className="w-6 h-6 mx-auto opacity-30" />
                    </div>
                    No matching products found.
                  </div>
                ) : (
                  <ul className="py-1 max-h-[300px] overflow-y-auto">
                    {searchSuggestions.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handlePickSuggestion(p)}
                          className={classNames(
                            'w-full px-4 py-2.5 text-left transition-all duration-200 flex items-center gap-3',
                            theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-stone-50',
                          )}
                        >
                          {/* Product thumb */}
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                            {p.image ? (
                              <img src={p.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-stone-300">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={classNames('text-sm font-bold truncate', theme === 'dark' ? 'text-stone-100' : 'text-stone-900')}>
                              {p.name}
                            </div>
                            <div className={classNames('mt-0.5 text-[11px] font-semibold flex items-center gap-2', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
                              <span>{p.category}</span>
                              <span className="text-[10px]">•</span>
                              <span className="text-[#FFD400] font-bold">
                                Rs.{p.price?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Right-side icon group */}
          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">

            {/* Theme toggle — hidden on xs (lives inside drawer instead) */}
            <button
              type="button"
              onClick={toggleTheme}
              className={classNames(
                'hidden sm:inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 hover:rotate-12',
                showTransparent
                  ? 'text-white hover:bg-white/10'
                  : theme === 'dark'
                    ? 'text-stone-100 hover:bg-white/10 hover:text-[#FFD400]'
                    : 'text-[#222222] hover:bg-black/5 hover:text-[#FFD400]',
              )}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Sign in / Profile */}
            {isLoggedIn() ? (
              <button
                onClick={() => handleNavigate('profile')}
                className={classNames(
                  'inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-[0.98] motion-reduce:transform-none',
                  showTransparent
                    ? 'text-white hover:bg-white/10'
                    : theme === 'dark'
                      ? 'text-stone-100 hover:text-[#FFD400] hover:bg-white/10'
                      : 'text-[#222222] hover:text-[#FFD400] hover:bg-black/5',
                )}
                aria-label="Profile"
              >
                <FaUserAlt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className={classNames(
                  'inline-flex h-9 w-9 sm:h-10 sm:w-auto sm:px-4 items-center justify-center gap-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-[0.98] motion-reduce:transform-none',
                  showTransparent
                    ? 'text-white hover:bg-white/10'
                    : theme === 'dark'
                      ? 'text-stone-100 hover:text-[#FFD400] hover:bg-white/10'
                      : 'text-[#222222] hover:text-[#FFD400] hover:bg-black/5',
                )}
                aria-label="Sign In"
              >
                <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={navigateToWishlist}
              className={classNames(
                'relative inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-[0.98] motion-reduce:transform-none',
                showTransparent
                  ? 'text-white hover:bg-white/10'
                  : theme === 'dark'
                    ? 'text-stone-100 hover:text-[#FFD400] hover:bg-white/10'
                    : 'text-[#222222] hover:text-[#FFD400] hover:bg-black/5',
              )}
              aria-label="Wishlist"
            >
              <FaHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#E53935] to-rose-500 text-[9px] sm:text-[10px] font-bold text-white leading-none shadow-sm animate-pulse">
                  {wishlistItemsCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => handleNavigate('cart')}
              className={classNames(
                'relative inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-[0.98] motion-reduce:transform-none',
                showTransparent
                  ? 'text-white hover:bg-white/10'
                  : theme === 'dark'
                    ? 'text-stone-100 hover:text-[#FFD400] hover:bg-white/10'
                    : 'text-[#222222] hover:text-[#FFD400] hover:bg-black/5',
              )}
              aria-label="Cart"
            >
              <FaShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#5A2D0C] to-[#7A4A20] text-[9px] sm:text-[10px] font-bold text-white leading-none shadow-sm">
                {cartItemsCount}
              </span>
            </button>

          </div>
        </div>

        {/* ── Mobile bar (below lg): hamburger left, centered logo, search + cart right ── */}
        <div className="lg:hidden w-full px-3 h-16 sm:h-20 flex items-center justify-between relative">
          {/* Hamburger — left */}
          <button
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className={classNames(
              'inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-300',
              showTransparent
                ? 'text-white hover:bg-white/10'
                : theme === 'dark'
                  ? 'text-stone-100 hover:bg-white/10'
                  : 'text-[#222222] hover:bg-black/5',
            )}
            aria-label="Toggle navigation menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 transition-transform duration-300">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>

          {/* Logo — true center regardless of side icon widths */}
          <button
            onClick={() => handleNavigate('home')}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center group"
            aria-label="Go to home"
          >
            {logoError ? (
              <div className="h-[44px] w-[44px] p-2 transition-transform duration-300 group-hover:scale-105">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-[#FFD400] via-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">LG</span>
                </div>
              </div>
            ) : (
              <div className="h-[44px] w-[44px] p-2 transition-transform duration-300 group-hover:scale-105">
                <img
                  src='/logo.png'
                  alt="Lamp & Glow"
                  className="h-full w-full object-contain drop-shadow-sm"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
          </button>

          {/* Right icons — search + cart */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchExpanded((prev) => !prev)}
              className={classNames(
                'inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300',
                showTransparent
                  ? 'text-white hover:bg-white/10'
                  : theme === 'dark'
                    ? 'text-stone-100 hover:bg-white/10'
                    : 'text-[#222222] hover:bg-black/5',
              )}
              aria-label="Toggle search"
            >
              <FaSearch className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleNavigate('cart')}
              className={classNames(
                'relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-[0.98] motion-reduce:transform-none',
                showTransparent
                  ? 'text-white hover:bg-white/10'
                  : theme === 'dark'
                    ? 'text-stone-100 hover:text-[#FFD400] hover:bg-white/10'
                    : 'text-[#222222] hover:text-[#FFD400] hover:bg-black/5',
              )}
              aria-label="Cart"
            >
              <FaShoppingCart className="h-4 w-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#5A2D0C] to-[#7A4A20] text-[9px] font-bold text-white leading-none shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile search bar (below main bar, below lg) — toggled by the search icon ── */}
        {searchExpanded && (
        <div
          className={classNames(
            'lg:hidden border-t',
            theme === 'dark' ? 'border-white/10 bg-[#1F1F1F]' : 'border-stone-200 bg-white',
          )}
        >
          <div className="w-full px-3 sm:px-6 py-2.5">
            <div className="relative" data-search-root="true">
              <div
                className={classNames(
                  'flex items-center gap-3 rounded-full border px-4 py-2 transition-all duration-300',
                  theme === 'dark' ? 'border-white/10 bg-white/5 focus-within:border-[#FFD400]/50' : 'border-stone-200 bg-stone-50 focus-within:border-[#FFD400]/50',
                )}
              >
                <FaSearch className={classNames('flex-shrink-0', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')} />
                <input
                  ref={mobileSearchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate('/products')
                      setSearchOpen(false)
                    }
                    if (e.key === 'Escape') {
                      setSearchOpen(false)
                      setSearchExpanded(false)
                    }
                  }}
                  type="text"
                  placeholder="Search entire store here..."
                  className={classNames(
                    'w-full bg-transparent text-sm font-medium placeholder:text-stone-400 focus:outline-none',
                    theme === 'dark' ? 'text-stone-100' : 'text-stone-800',
                  )}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery) {
                      setSearchQuery('')
                    } else {
                      setSearchOpen(false)
                      setSearchExpanded(false)
                    }
                  }}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-stone-200/50 transition-colors"
                  aria-label="Close search"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {searchOpen && (
                <>
                  <div
                    className="fixed inset-x-0 top-[120px] sm:top-[136px] bottom-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSearchOpen(false)}
                  />
                  <div
                    className={classNames(
                      'absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto animate-fadeIn',
                      theme === 'dark' ? 'border-white/10 bg-[#2A2A2A]' : 'border-stone-200 bg-white',
                    )}
                  >
                    <div className={classNames(
                      'px-4 py-2.5 text-[10px] font-bold tracking-wider uppercase border-b',
                      theme === 'dark' ? 'text-stone-500 border-white/10' : 'text-stone-400 border-stone-100'
                    )}>
                      {searchSuggestions.length > 0 ? `${searchSuggestions.length} product${searchSuggestions.length !== 1 ? 's' : ''} found` : 'No results'}
                    </div>
                    {searchSuggestions.length === 0 ? (
                      <div className={classNames('px-4 py-6 text-center text-sm', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
                        <div className="mb-2"><FaSearch className="w-6 h-6 mx-auto opacity-30" /></div>
                        No matching products found.
                      </div>
                    ) : (
                      <ul className="py-1">
                        {searchSuggestions.map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handlePickSuggestion(p)}
                              className={classNames(
                                'w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3',
                                theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-stone-50',
                              )}
                            >
                              <div className="h-10 w-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                                {p.image ? (
                                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-stone-300">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={classNames('text-sm font-bold truncate', theme === 'dark' ? 'text-stone-100' : 'text-stone-900')}>
                                  {p.name}
                                </div>
                                <div className={classNames('mt-0.5 text-[11px] font-semibold', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
                                  {p.category}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        )}
      </header>

      {/* Drawer rendered via portal — outside <header> so it escapes its stacking context */}
      {mobileDrawer}

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
})

export default Header