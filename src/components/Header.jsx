'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react'
import { createPortal } from 'react-dom'
import {
  BookOpen,
  ChevronDown,
  Grid2X2,
  Heart,
  Home,
  Info,
  LogIn,
  Menu,
  Moon,
  Package,
  PlaySquare,
  Search,
  ShoppingBag,
  Sun,
  UserRound,
  X,
} from 'lucide-react'


import { useNavigate, useLocation } from '@/lib/navigation'
import { useAuth } from '../context/AuthContext'
import { slugify } from '../utils/slugify.js'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Header = forwardRef(function Header(
  {
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
  },
  ref,
) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuth()

  const [logoError, setLogoError] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [headerTranslate, setHeaderTranslate] = useState(0)
  const [hoveredNav, setHoveredNav] = useState(null)

  const searchInputRef = useRef(null)

  const showTransparent = transparentOverlay && !isScrolled

  useEffect(() => {
    let resizeObserver = null
    let observedBar = null

    const updatePosition = () => {
      const bar = document.querySelector(
        '[data-announcement-bar="true"]',
      )

      const barHeight = bar ? bar.offsetHeight : 0
      const scrollY = window.scrollY

      const translateY =
        scrollY < barHeight ? barHeight - scrollY : 0

      setHeaderTranslate(translateY)
      setIsScrolled(scrollY > barHeight)

      if (bar && bar !== observedBar) {
        if (resizeObserver) {
          resizeObserver.disconnect()
        }

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

    window.addEventListener('scroll', updatePosition, {
      passive: true,
    })

    updatePosition()

    const mutationObserver = new MutationObserver(updatePosition)

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      window.removeEventListener('scroll', updatePosition)

      if (resizeObserver) {
        resizeObserver.disconnect()
      }

      mutationObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!mobileNavOpen && !searchExpanded) return

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileNavOpen, searchExpanded])

  useEffect(() => {
    if (!searchExpanded) return

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)

    return () => window.clearTimeout(timer)
  }, [searchExpanded])

  useEffect(() => {
    if (!searchExpanded) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSearchExpanded(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [searchExpanded])

  const safeProducts = Array.isArray(products) ? products : []

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return safeProducts.slice(0, 6)
    }

    return safeProducts
      .filter((product) => {
        const name = String(product?.name ?? '').toLowerCase()
        const category = String(
          product?.category ?? '',
        ).toLowerCase()

        return (
          name.includes(query) ||
          category.includes(query)
        )
      })
      .slice(0, 6)
  }, [safeProducts, searchQuery])

  const trendingCategories = useMemo(() => {
    const values = safeProducts
      .map((product) => product?.category)
      .filter(Boolean)

    return [...new Set(values)].slice(0, 6)
  }, [safeProducts])

  const popularProducts = useMemo(() => {
    const preferred = safeProducts.filter(
      (product) =>
        product?.featured ||
        product?.isFeatured ||
        product?.bestSeller ||
        product?.isBestSeller,
    )

    if (preferred.length >= 4) {
      return preferred.slice(0, 4)
    }

    return safeProducts.slice(0, 4)
  }, [safeProducts])

  const navLinks = [
    {
      key: 'home',
      label: 'HOME',
    },
    {
      key: 'categories',
      label: 'COLLECTIONS',
    },
    {
      key: 'products',
      label: 'PRODUCTS',
    },
    {
      key: 'blogs',
      label: 'JOURNAL',
    },
    {
      key: 'reels',
      label: 'REELS',
    },
    {
      key: 'about',
      label: 'ABOUT',
    },
  ]

  const isNavActive = (key) => {
    if (key === 'categories') {
      return location.pathname.startsWith('/collections')
    }

    if (key === 'blogs') {
      return (
        location.pathname === '/blogs' ||
        location.pathname.startsWith('/blog/')
      )
    }

    if (key === 'reels') {
      return (
        location.pathname === '/reels' ||
        location.pathname.startsWith('/reels/')
      )
    }

    if (key === 'products') {
      return (
        location.pathname === '/products' ||
        location.pathname.startsWith('/products/')
      )
    }

    return activeSection === key
  }

  function closeMobileMenu() {
    setMobileNavOpen(false)
  }

  function navigateMobile(key) {
    closeMobileMenu()

    window.setTimeout(() => {
      if (key === 'products') {
        navigate('/products')
        return
      }

      handleNavigate(key)
    }, 50)
  }

  function openSearch() {
    setMobileNavOpen(false)
    setSearchExpanded(true)
  }

  function closeSearch() {
    setSearchExpanded(false)
  }

  function handleSearchSubmit(event) {
    event?.preventDefault()

    if (!searchQuery.trim()) return

    navigate('/products')
    closeSearch()
  }

  function handlePickSuggestion(product) {
    if (!product) return

    setSearchQuery(product.name ?? '')
    closeSearch()

    navigate(`/products/${slugify(product.name)}`)
  }

  function handleTrendingClick(category) {
    setSearchQuery(category)

    window.setTimeout(() => {
      searchInputRef.current?.focus()
    }, 0)
  }

  function openOrders() {
    closeMobileMenu()

    if (isLoggedIn()) {
      navigate('/profile')
    } else {
      navigate('/login')
    }
  }

  const iconButtonClass = classNames(
    'relative inline-flex h-10 w-10 items-center justify-center rounded-full',
    'transition-all duration-300',
    'hover:-translate-y-0.5 active:translate-y-0',
    showTransparent
      ? 'text-white hover:bg-white/10'
      : theme === 'dark'
        ? 'text-stone-100 hover:bg-white/10 hover:text-[#D7A85B]'
        : 'text-[#2A211B] hover:bg-[#F4EEE7] hover:text-[#8A562F]',
  )

  const mobileDrawer =
    mobileNavOpen && typeof document !== 'undefined'
      ? createPortal(
        <div className="fixed inset-0 z-[10020] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/45 backdrop-blur-[3px]"
          />

          <nav
            className={classNames(
              'absolute left-0 top-0 flex h-[100dvh] w-[88vw] max-w-[390px] flex-col overflow-hidden',
              'border-r shadow-[24px_0_80px_rgba(0,0,0,0.22)]',
              theme === 'dark'
                ? 'border-white/10 bg-[#1B1816]'
                : 'border-[#E8DED4] bg-[#FCFAF7]',
            )}
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#6E4325] via-[#B57A43] to-[#D7A85B]" />

            <div
              className={classNames(
                'flex min-h-[84px] items-center justify-between border-b px-5',
                theme === 'dark'
                  ? 'border-white/10'
                  : 'border-[#EAE1D8]',
              )}
            >
              <button
                type="button"
                onClick={() => navigateMobile('home')}
                className="flex items-center gap-3"
              >
                <div className="h-14 w-14 shrink-0">
                  {logoError ? (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#6E4325] text-sm font-semibold text-white">
                      LG
                    </div>
                  ) : (
                    <img
                      src="/logo.png"
                      alt="Lamp & Glow"
                      className="h-full w-full object-contain"
                      onError={() => setLogoError(true)}
                    />
                  )}
                </div>

                <div className="text-left">
                  <p
                    className={classNames(
                      'text-[10px] font-medium uppercase tracking-[0.24em]',
                      theme === 'dark'
                        ? 'text-stone-400'
                        : 'text-[#9A7B62]',
                    )}
                  >
                    Lamp & Glow
                  </p>

                  <p
                    className={classNames(
                      'mt-0.5 text-sm font-semibold',
                      theme === 'dark'
                        ? 'text-white'
                        : 'text-[#2A211B]',
                    )}
                  >
                    Explore
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className={classNames(
                  'flex h-10 w-10 items-center justify-center rounded-full border transition',
                  theme === 'dark'
                    ? 'border-white/10 text-white hover:bg-white/10'
                    : 'border-[#E3D7CC] bg-white text-[#4E392C] hover:bg-[#F5EEE7]',
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 pt-5">
              <button
                type="button"
                onClick={openSearch}
                className={classNames(
                  'flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
                  theme === 'dark'
                    ? 'border-white/10 bg-white/5 text-stone-300'
                    : 'border-[#E8DDD2] bg-white text-[#796657] shadow-sm',
                )}
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />

                <span className="flex-1 text-sm">
                  Search anything
                </span>

                <span className="text-[10px] uppercase tracking-[0.16em] opacity-60">
                  Search
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <p
                className={classNames(
                  'mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em]',
                  theme === 'dark'
                    ? 'text-stone-500'
                    : 'text-[#A58D79]',
                )}
              >
                Shop & Discover
              </p>

              <div className="space-y-1">
                <MobileMenuItem
                  icon={Home}
                  label="Home"
                  active={location.pathname === '/'}
                  theme={theme}
                  onClick={() => navigateMobile('home')}
                />

                <MobileMenuItem
                  icon={Grid2X2}
                  label="Collections"
                  active={isNavActive('categories')}
                  theme={theme}
                  onClick={() => navigateMobile('categories')}
                />

                <MobileMenuItem
                  icon={Package}
                  label="Products"
                  active={isNavActive('products')}
                  theme={theme}
                  onClick={() => navigateMobile('products')}
                />

                <MobileMenuItem
                  icon={BookOpen}
                  label="Journal"
                  active={isNavActive('blogs')}
                  theme={theme}
                  onClick={() => navigateMobile('blogs')}
                />

                <MobileMenuItem
                  icon={PlaySquare}
                  label="Reels"
                  active={isNavActive('reels')}
                  theme={theme}
                  onClick={() => navigateMobile('reels')}
                />
              </div>

              <div
                className={classNames(
                  'my-5 border-t',
                  theme === 'dark'
                    ? 'border-white/10'
                    : 'border-[#EAE1D8]',
                )}
              />

              <p
                className={classNames(
                  'mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em]',
                  theme === 'dark'
                    ? 'text-stone-500'
                    : 'text-[#A58D79]',
                )}
              >
                Your Account
              </p>

              <div className="space-y-1">
                <MobileMenuItem
                  icon={Heart}
                  label="Wishlist"
                  count={wishlistItemsCount}
                  theme={theme}
                  onClick={() => {
                    closeMobileMenu()

                    window.setTimeout(() => {
                      navigateToWishlist()
                    }, 50)
                  }}
                />

                <MobileMenuItem
                  icon={ShoppingBag}
                  label="My Orders"
                  theme={theme}
                  onClick={openOrders}
                />

                <MobileMenuItem
                  icon={UserRound}
                  label={
                    isLoggedIn()
                      ? 'My Account'
                      : 'Sign In'
                  }
                  active={activeSection === 'profile'}
                  theme={theme}
                  onClick={() => {
                    closeMobileMenu()

                    if (isLoggedIn()) {
                      handleNavigate('profile')
                    } else {
                      navigate('/login')
                    }
                  }}
                />

                <MobileMenuItem
                  icon={ShoppingBag}
                  label="Cart"
                  count={cartItemsCount}
                  active={activeSection === 'cart'}
                  theme={theme}
                  onClick={() => navigateMobile('cart')}
                />
              </div>
            </div>

            <div
              className={classNames(
                'border-t px-4 py-4',
                theme === 'dark'
                  ? 'border-white/10'
                  : 'border-[#EAE1D8]',
              )}
            >
              <button
                type="button"
                onClick={toggleTheme}
                className={classNames(
                  'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition',
                  theme === 'dark'
                    ? 'text-stone-300 hover:bg-white/5'
                    : 'text-[#5A4638] hover:bg-[#F5EEE7]',
                )}
              >
                <span>
                  {theme === 'dark'
                    ? 'Light mode'
                    : 'Dark mode'}
                </span>

                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </nav>
        </div>,
        document.body,
      )
      : null

  const searchOverlay =
    searchExpanded && typeof document !== 'undefined'
      ? createPortal(
        <div className="fixed inset-0 z-[10050]">
          <button
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          />

          <section
            className={classNames(
              'absolute inset-x-0 top-0 max-h-[88dvh] overflow-y-auto border-b shadow-[0_24px_70px_rgba(0,0,0,0.18)]',
              theme === 'dark'
                ? 'border-white/10 bg-[#1B1816]'
                : 'border-[#E9DED4] bg-[#FCFAF7]',
            )}
          >
            <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-7">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={classNames(
                      'text-[10px] font-semibold uppercase tracking-[0.24em]',
                      theme === 'dark'
                        ? 'text-[#D7A85B]'
                        : 'text-[#9B6A42]',
                    )}
                  >
                    Lamp & Glow
                  </p>

                  <h2
                    className={classNames(
                      'mt-1 text-lg font-semibold sm:text-xl',
                      theme === 'dark'
                        ? 'text-white'
                        : 'text-[#2B211B]',
                    )}
                  >
                    What are you looking for?
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className={classNames(
                    'flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:rotate-90',
                    theme === 'dark'
                      ? 'border-white/10 text-white hover:bg-white/10'
                      : 'border-[#E4D8CD] bg-white text-[#3F3026] hover:bg-[#F4EEE8]',
                  )}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="mx-auto mt-7 max-w-4xl"
              >
                <div
                  className={classNames(
                    'flex items-center gap-4 border-b-2 py-3 transition-colors',
                    theme === 'dark'
                      ? 'border-white/20 focus-within:border-[#D7A85B]'
                      : 'border-[#CFC0B3] focus-within:border-[#8A562F]',
                  )}
                >
                  <Search
                    className={classNames(
                      'h-4 w-4 shrink-0',
                      theme === 'dark'
                        ? 'text-stone-400'
                        : 'text-[#7E6959]',
                    )}
                  />

                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search anything"
                    className={classNames(
                      'min-w-0 flex-1 bg-transparent text-lg font-medium outline-none placeholder:font-normal sm:text-2xl',
                      theme === 'dark'
                        ? 'text-white placeholder:text-stone-500'
                        : 'text-[#2A211B] placeholder:text-[#A9998D]',
                    )}
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className={classNames(
                        'text-xs font-semibold uppercase tracking-[0.14em] transition',
                        theme === 'dark'
                          ? 'text-stone-400 hover:text-white'
                          : 'text-[#9A8270] hover:text-[#6E4325]',
                      )}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              <div className="mx-auto mt-8 max-w-6xl">
                {trendingCategories.length > 0 && (
                  <div>
                    <p
                      className={classNames(
                        'text-[11px] font-semibold uppercase tracking-[0.2em]',
                        theme === 'dark'
                          ? 'text-stone-400'
                          : 'text-[#8D7868]',
                      )}
                    >
                      Trending Now
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {trendingCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() =>
                            handleTrendingClick(category)
                          }
                          className={classNames(
                            'rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300',
                            theme === 'dark'
                              ? 'border-white/10 text-stone-300 hover:border-[#D7A85B]/50 hover:bg-[#D7A85B]/10 hover:text-[#E5C38D]'
                              : 'border-[#DED2C7] bg-white text-[#635044] hover:-translate-y-0.5 hover:border-[#B88353] hover:text-[#7A4B28] hover:shadow-sm',
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p
                        className={classNames(
                          'text-[11px] font-semibold uppercase tracking-[0.2em]',
                          theme === 'dark'
                            ? 'text-stone-400'
                            : 'text-[#8D7868]',
                        )}
                      >
                        {searchQuery.trim()
                          ? 'Search Results'
                          : 'Popular Products'}
                      </p>

                      {searchQuery.trim() && (
                        <p
                          className={classNames(
                            'mt-1 text-sm',
                            theme === 'dark'
                              ? 'text-stone-500'
                              : 'text-[#9B897B]',
                          )}
                        >
                          {searchSuggestions.length}{' '}
                          result
                          {searchSuggestions.length !== 1
                            ? 's'
                            : ''}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/products')
                        closeSearch()
                      }}
                      className={classNames(
                        'text-xs font-semibold uppercase tracking-[0.14em] transition',
                        theme === 'dark'
                          ? 'text-[#D7A85B] hover:text-[#E8C999]'
                          : 'text-[#8A562F] hover:text-[#5E381F]',
                      )}
                    >
                      View All
                    </button>
                  </div>

                  {searchQuery.trim() &&
                    searchSuggestions.length === 0 ? (
                    <div
                      className={classNames(
                        'mt-5 rounded-2xl border px-6 py-10 text-center',
                        theme === 'dark'
                          ? 'border-white/10 bg-white/[0.03]'
                          : 'border-[#E9DED5] bg-white',
                      )}
                    >
                      <Search
                        className={classNames(
                          'mx-auto h-6 w-6',
                          theme === 'dark'
                            ? 'text-stone-600'
                            : 'text-[#B5A79C]',
                        )}
                      />

                      <p
                        className={classNames(
                          'mt-3 text-sm font-medium',
                          theme === 'dark'
                            ? 'text-stone-300'
                            : 'text-[#5C4A3D]',
                        )}
                      >
                        No matching products found.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                      {(searchQuery.trim()
                        ? searchSuggestions
                        : popularProducts
                      ).map((product) => (
                        <button
                          key={product.id || product.name}
                          type="button"
                          onClick={() =>
                            handlePickSuggestion(product)
                          }
                          className={classNames(
                            'group overflow-hidden rounded-2xl border text-left transition-all duration-300',
                            'hover:-translate-y-1',
                            theme === 'dark'
                              ? 'border-white/10 bg-white/[0.04] hover:border-[#D7A85B]/30'
                              : 'border-[#E9DED5] bg-white hover:border-[#D7B18B] hover:shadow-[0_14px_40px_rgba(92,58,32,0.10)]',
                          )}
                        >
                          <div className="aspect-square overflow-hidden bg-[#F2EEE9]">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name || 'Product'}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-7 w-7 text-stone-300" />
                              </div>
                            )}
                          </div>

                          <div className="p-3 sm:p-4">
                            {product.category && (
                              <p
                                className={classNames(
                                  'truncate text-[9px] font-semibold uppercase tracking-[0.16em]',
                                  theme === 'dark'
                                    ? 'text-stone-500'
                                    : 'text-[#A58D79]',
                                )}
                              >
                                {product.category}
                              </p>
                            )}

                            <h3
                              className={classNames(
                                'mt-1 line-clamp-2 text-xs font-semibold leading-5 sm:text-sm',
                                theme === 'dark'
                                  ? 'text-white'
                                  : 'text-[#33271F]',
                              )}
                            >
                              {product.name}
                            </h3>

                            {product.price != null && (
                              <p
                                className={classNames(
                                  'mt-2 text-xs font-semibold sm:text-sm',
                                  theme === 'dark'
                                    ? 'text-[#D9B27B]'
                                    : 'text-[#8A562F]',
                                )}
                              >
                                PKR{' '}
                                {Number(
                                  product.price,
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>,
        document.body,
      )
      : null

  return (
    <>
      <header
        ref={ref}
        className={classNames(
          'fixed left-0 right-0 top-0 z-[150] transition-all duration-500',
          showTransparent
            ? 'border-b border-white/10 bg-gradient-to-b from-black/25 to-transparent'
            : isScrolled
              ? theme === 'dark'
                ? 'border-b border-white/10 bg-[#1B1816]/92 shadow-[0_10px_40px_rgba(0,0,0,0.20)] backdrop-blur-xl'
                : 'border-b border-[#E8DED4] bg-[#FCFAF7]/94 shadow-[0_10px_40px_rgba(80,48,25,0.08)] backdrop-blur-xl'
              : theme === 'dark'
                ? 'border-b border-white/10 bg-[#1B1816]'
                : 'border-b border-[#E8DED4] bg-[#FCFAF7]',
        )}
        style={{
          transform: `translateY(${headerTranslate}px)`,
        }}
      >
        <div
          className={classNames(
            'absolute inset-x-0 top-0 h-px',
            showTransparent
              ? 'bg-white/20'
              : 'bg-gradient-to-r from-transparent via-[#B88353]/70 to-transparent',
          )}
        />

        {/* ================= DESKTOP ================= */}

        <div className="relative hidden h-[88px] w-full items-center px-6 lg:flex lg:px-8 xl:px-12">
          {/* LEFT — MENU */}
          <nav
            className={classNames(
              'flex shrink-0 items-center',
              showTransparent
                ? 'text-white'
                : theme === 'dark'
                  ? 'text-stone-200'
                  : 'text-[#33271F]',
            )}
          >
            {navLinks.map(({ key, label }) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => setHoveredNav(key)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (key === 'products') {
                      navigate('/products')
                    } else {
                      handleNavigate(key)
                    }
                  }}
                  className={classNames(
                    'group relative px-3 py-8 text-[11px] font-semibold tracking-[0.13em] xl:px-4',
                    'transition-colors duration-300',
                    isNavActive(key)
                      ? showTransparent
                        ? 'text-white'
                        : theme === 'dark'
                          ? 'text-[#D7A85B]'
                          : 'text-[#704528]'
                      : showTransparent
                        ? 'text-white/85 hover:text-white'
                        : theme === 'dark'
                          ? 'text-stone-400 hover:text-white'
                          : 'text-[#66564B] hover:text-[#2E221B]',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {label}

                    {key === 'categories' && (
                      <ChevronDown
                        className={classNames(
                          'h-3 w-3 transition-transform duration-300',
                          hoveredNav === 'categories'
                            ? 'rotate-180'
                            : '',
                        )}
                      />
                    )}
                  </span>

                  <span
                    className={classNames(
                      'absolute bottom-[23px] left-1/2 h-px -translate-x-1/2 bg-current transition-all duration-300',
                      isNavActive(key)
                        ? 'w-7'
                        : 'w-0 group-hover:w-7',
                    )}
                  />
                </button>

                {/* COLLECTIONS GRID DROPDOWN */}
                {key === 'categories' &&
                  hoveredNav === 'categories' &&
                  categories?.length > 0 && (
                    <div className="absolute left-0 top-full z-50 w-[600px] pt-2">
                      <div
                        className={classNames(
                          'overflow-hidden rounded-2xl border p-2 shadow-[0_24px_70px_rgba(0,0,0,0.14)] backdrop-blur-xl',
                          theme === 'dark'
                            ? 'border-white/10 bg-[#201C19]/95'
                            : 'border-[#E6D9CD] bg-[#FCFAF7]/98',
                        )}
                      >
                        <div className="grid max-h-[420px] grid-cols-2 gap-2 overflow-y-auto p-1">
                          {categories.map((cat) => (
                            <button
                              key={cat.firestoreId || cat.id}
                              type="button"
                              onClick={() => {
                                navigate(
                                  `/collections/${slugify(
                                    cat.id,
                                  )}`,
                                )
                                setHoveredNav(null)
                              }}
                              className={classNames(
                                'group flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-300',
                                theme === 'dark'
                                  ? 'border-transparent hover:border-white/10 hover:bg-white/5'
                                  : 'border-transparent hover:border-[#E5D8CC] hover:bg-[#F7F1EB]',
                              )}
                            >
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#EFE8E1]">
                                {cat.image && (
                                  <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                                  />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p
                                  className={classNames(
                                    'line-clamp-2 text-sm font-medium leading-5',
                                    theme === 'dark'
                                      ? 'text-stone-200'
                                      : 'text-[#403126]',
                                  )}
                                >
                                  {cat.title}
                                </p>

                                <p
                                  className={classNames(
                                    'mt-1 text-[9px] font-medium uppercase tracking-[0.14em]',
                                    theme === 'dark'
                                      ? 'text-stone-500'
                                      : 'text-[#9E8978]',
                                  )}
                                >
                                  View Collection
                                </p>
                              </div>
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
                            'mt-2 flex w-full items-center justify-center rounded-xl border px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition',
                            theme === 'dark'
                              ? 'border-white/10 text-[#D7A85B] hover:bg-white/5'
                              : 'border-[#E3D5C8] text-[#7A4B28] hover:bg-[#F5EEE7]',
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

          {/* CENTER — LOGO */}
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            aria-label="Go to home"
            className="group absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center"
          >
            {logoError ? (
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#704528] to-[#B47A44] text-xl font-semibold text-white shadow-sm transition-transform duration-300 group-hover:scale-[1.03]">
                LG
              </div>
            ) : (
              <div
                className={classNames(
                  'flex h-[74px] w-[74px] items-center justify-center overflow-hidden rounded-full border p-2',
                  'backdrop-blur-md transition-all duration-300',
                  'group-hover:scale-[1.03]',
                  showTransparent
                    ? 'border-white/40 bg-[#FFF9F2]/95 shadow-[0_8px_28px_rgba(0,0,0,0.24)]'
                    : theme === 'dark'
                      ? 'border-white/10 bg-white/[0.06] shadow-[0_4px_18px_rgba(0,0,0,0.18)]'
                      : 'border-[#E5D8CC] bg-white/80 shadow-[0_4px_18px_rgba(80,48,25,0.10)]',
                )}
              >
                <img
                  src="/logo.png"
                  alt="Lamp & Glow"
                  className="h-full w-full object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
          </button>
          {/* RIGHT — ICONS */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              className={iconButtonClass}
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={iconButtonClass}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {isLoggedIn() ? (
              <button
                type="button"
                onClick={() => handleNavigate('profile')}
                aria-label="My account"
                className={iconButtonClass}
              >
                <UserRound className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className={classNames(
                  'hidden h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold transition lg:flex xl:px-4',
                  showTransparent
                    ? 'text-white hover:bg-white/10'
                    : theme === 'dark'
                      ? 'text-stone-200 hover:bg-white/10'
                      : 'text-[#49372C] hover:bg-[#F4EEE7]',
                )}
              >
                <LogIn className="h-4 w-4" />

                <span className="hidden xl:inline">
                  Sign In
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={navigateToWishlist}
              aria-label="Wishlist"
              className={iconButtonClass}
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.8} />

              {wishlistItemsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#8A562F] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                  {wishlistItemsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('cart')}
              aria-label="Cart"
              className={iconButtonClass}
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.8} />

              {cartItemsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#8A562F] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ================= MOBILE ================= */}

        <div className="relative flex h-[70px] w-full items-center justify-between px-3 sm:h-[76px] sm:px-5 lg:hidden">
          <button
            type="button"
            onClick={() =>
              setMobileNavOpen((previous) => !previous)
            }
            aria-label="Open navigation"
            className={iconButtonClass}
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('home')}
            aria-label="Go to home"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            {logoError ? (
              <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#704528] text-sm font-semibold text-white">
                LG
              </div>
            ) : (
              <div className="h-[58px] w-[58px] p-0.5 sm:h-[62px] sm:w-[62px]">
                <img
                  src="/logo.png"
                  alt="Lamp & Glow"
                  className="h-full w-full object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
          </button>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              className={iconButtonClass}
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('cart')}
              aria-label="Cart"
              className={iconButtonClass}
            >
              <ShoppingBag className="h-4 w-4" />

              {cartItemsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#8A562F] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileDrawer}
      {searchOverlay}
    </>
  )
})

export default Header

function MobileMenuItem({
  icon: Icon,
  label,
  count = 0,
  active = false,
  theme,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200',
        active
          ? theme === 'dark'
            ? 'bg-[#D7A85B]/10 text-[#E2BA83]'
            : 'bg-[#F1E7DD] text-[#6E4325]'
          : theme === 'dark'
            ? 'text-stone-300 hover:bg-white/5 hover:text-white'
            : 'text-[#4E3C31] hover:bg-[#F5EEE7] hover:text-[#2F231C]',
      )}
    >
      <span
        className={classNames(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition',
          active
            ? theme === 'dark'
              ? 'bg-[#D7A85B]/10'
              : 'bg-white'
            : theme === 'dark'
              ? 'bg-white/[0.04] group-hover:bg-white/[0.08]'
              : 'bg-white group-hover:shadow-sm',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="flex-1 text-sm font-medium">
        {label}
      </span>

      {count > 0 && (
        <span className="flex min-w-6 items-center justify-center rounded-full bg-[#8A562F] px-2 py-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}

      <ChevronDown className="h-3.5 w-3.5 -rotate-90 opacity-30 transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}