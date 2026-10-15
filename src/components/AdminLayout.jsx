'use client'

import { useState } from 'react'
import { useNavigate, useLocation } from '@/lib/navigation'
import { useAdminAuth } from '../context/AdminAuthContext'
import OnboardingPopup from './OnboardingPopup'
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  ChevronDown,
  Users,
  Ticket,
  DollarSign,
  FolderOpen,
  Share2,
  Lightbulb,
  Image,
  Megaphone,
  Tv,
  Truck,
  FileText,
  Clapperboard,
  BookOpen,
  LayoutTemplate,
  Mail,
  Contact,
  Building2,
  Info,
  MessageSquare,
  GalleryHorizontal,
  Instagram,
  Wand2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { adminUser, adminLogout } = useAdminAuth()

  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const menuSections = [
    {
      label: 'Overview',
      items: [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/admin/dashboard',
        },
      ],
    },
    {
      label: 'Commerce',
      items: [
        {
          label: 'Products',
          icon: Package,
          path: '/admin/products',
        },
        {
          label: 'Categories',
          icon: FolderOpen,
          path: '/admin/categories',
        },
        {
          label: 'Orders',
          icon: ShoppingCart,
          path: '/admin/orders',
        },
        {
          label: 'Customers',
          icon: Users,
          path: '/admin/customers',
        },
        {
          label: 'Coupons',
          icon: Ticket,
          path: '/admin/coupons',
        },
        {
          label: 'Payments',
          icon: DollarSign,
          path: '/admin/payments',
        },
        {
          label: 'Custom Orders',
          icon: Wand2,
          path: '/admin/custom-orders',
        },
      ],
    },
    {
      label: 'Storefront',
      items: [
        {
          label: 'Hero Banners',
          icon: Tv,
          path: '/admin/hero-banners',
        },
        {
          label: 'Collection Slider',
          icon: GalleryHorizontal,
          path: '/admin/collection-slides',
        },
        {
          label: 'Instagram Grid',
          icon: Instagram,
          path: '/admin/instagram-grid',
        },
        {
          label: 'Reels',
          icon: Clapperboard,
          path: '/admin/reels',
        },
        {
          label: 'Blogs',
          icon: BookOpen,
          path: '/admin/blogs',
        },
        {
          label: 'Reviews',
          icon: MessageSquare,
          path: '/admin/reviews',
        },
        {
          label: 'About Page',
          icon: Info,
          path: '/admin/about',
        },
        {
          label: 'Pages',
          icon: FileText,
          path: '/admin/pages',
        },
      ],
    },
    {
      label: 'Communication',
      items: [
        {
          label: 'Contact Submissions',
          icon: Mail,
          path: '/admin/contact-submissions',
        },
        {
          label: 'Contact Page',
          icon: Contact,
          path: '/admin/contact-page',
        },
        {
          label: 'Newsletter',
          icon: Mail,
          path: '/admin/newsletter',
        },
        {
          label: 'Announcement Bar',
          icon: Megaphone,
          path: '/admin/announcements',
        },
        {
          label: 'Website Popups',
          icon: Image,
          path: '/admin/website-popups',
        },
        {
          label: 'Onboarding',
          icon: Lightbulb,
          path: '/admin/onboarding',
        },
      ],
    },
    {
      label: 'Store Settings',
      items: [
        {
          label: 'Shipping Fees',
          icon: Truck,
          path: '/admin/shipping-fees',
        },
        {
          label: 'Bank Details',
          icon: Building2,
          path: '/admin/bank-details',
        },
        {
          label: 'Social Links',
          icon: Share2,
          path: '/admin/social-links',
        },
        {
          label: 'Footer',
          icon: LayoutTemplate,
          path: '/admin/footer',
        },
      ],
    },
  ]

  const allMenuItems = menuSections.flatMap((section) => section.items)

  const currentItem =
    allMenuItems.find((item) => location.pathname === item.path) ||
    allMenuItems.find(
      (item) =>
        item.path !== '/admin/dashboard' &&
        location.pathname?.startsWith(`${item.path}/`)
    )

  const currentPageTitle = currentItem?.label || 'Admin Panel'

  const isActive = (path) => {
    if (location.pathname === path) return true

    return (
      path !== '/admin/dashboard' &&
      location.pathname?.startsWith(`${path}/`)
    )
  }

  const handleNavigate = (path) => {
    navigate(path)
    setMobileSidebarOpen(false)
    setUserMenuOpen(false)
  }

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div
        className={`flex h-[88px] flex-shrink-0 items-center border-b border-white/10 ${desktopCollapsed && !mobile
            ? 'justify-center px-3'
            : 'justify-between px-5'
          }`}
      >
        {(!desktopCollapsed || mobile) && (
          <button
            type="button"
            onClick={() => handleNavigate('/admin/dashboard')}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-sm">
              <span className="text-sm font-bold tracking-[0.14em] text-[#F7F4EF]">
                L&G
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-[0.02em] text-white">
                Lamp & Glow
              </p>
              <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.18em] text-[#D9C9BD]">
                Admin Console
              </p>
            </div>
          </button>
        )}

        {mobile ? (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white transition hover:bg-white/10"
            aria-label="Close admin menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDesktopCollapsed((prev) => !prev)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#EADFD7] transition hover:bg-white/10 hover:text-white"
            aria-label={
              desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
          >
            {desktopCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {menuSections.map((section) => (
            <div key={section.label}>
              {(!desktopCollapsed || mobile) && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A99080]">
                  {section.label}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)

                  return (
                    <button
                      type="button"
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      title={desktopCollapsed && !mobile ? item.label : ''}
                      className={`group flex w-full items-center rounded-xl transition-all duration-200 ${desktopCollapsed && !mobile
                          ? 'justify-center px-2 py-3'
                          : 'gap-3 px-3 py-2.5'
                        } ${active
                          ? 'bg-[#F7F4EF] text-[#3A2117] shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
                          : 'text-[#E7DAD1] hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <Icon
                        className={`h-[18px] w-[18px] flex-shrink-0 ${active
                            ? 'text-[#6B4228]'
                            : 'text-[#CDB9AC] group-hover:text-white'
                          }`}
                      />

                      {(!desktopCollapsed || mobile) && (
                        <span className="min-w-0 truncate text-[13px] font-medium">
                          {item.label}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="flex-shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          title={desktopCollapsed && !mobile ? 'Logout' : ''}
          className={`flex w-full items-center rounded-xl text-[#F2CEC8] transition hover:bg-[#7A302A]/35 hover:text-white ${desktopCollapsed && !mobile
              ? 'justify-center px-2 py-3'
              : 'gap-3 px-3 py-2.5'
            }`}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />

          {(!desktopCollapsed || mobile) && (
            <span className="text-[13px] font-medium">Logout</span>
          )}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#281912]">
      <OnboardingPopup />

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden flex-col overflow-hidden bg-[#3A2117] shadow-[12px_0_35px_rgba(58,33,23,0.08)] transition-[width] duration-300 lg:flex ${desktopCollapsed ? 'w-20' : 'w-72'
          }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-[60] bg-[#281912]/45 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[86vw] max-w-[320px] flex-col overflow-hidden bg-[#3A2117] shadow-2xl transition-transform duration-300 lg:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <SidebarContent mobile />
      </aside>

      {/* Main admin area */}
      <div
        className={`min-h-screen transition-[margin] duration-300 ${desktopCollapsed ? 'lg:ml-20' : 'lg:ml-72'
          }`}
      >
        {/* Top header */}
        <header className="sticky top-0 z-40 border-b border-[#E7DED6] bg-[#FFFEFC]/95 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#DED2C9] bg-white text-[#3A2117] shadow-sm transition hover:border-[#BFA99A] hover:bg-[#F7F4EF] lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A6C5C]">
                  Lamp & Glow
                </p>

                <h1 className="truncate text-lg font-semibold text-[#281912] sm:text-xl">
                  {currentPageTitle}
                </h1>
              </div>
            </div>

            {/* Admin user */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-2xl border border-transparent px-2 py-1.5 transition hover:border-[#E5DAD1] hover:bg-[#F7F4EF] sm:gap-3 sm:px-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-sm font-semibold text-white shadow-sm">
                  {(adminUser?.email?.charAt(0) || 'A').toUpperCase()}
                </div>

                <div className="hidden max-w-[180px] text-left sm:block">
                  <p className="truncate text-sm font-semibold text-[#281912]">
                    {adminUser?.displayName || 'Administrator'}
                  </p>

                  <p className="truncate text-xs text-[#8A7467]">
                    {adminUser?.email || 'Admin account'}
                  </p>
                </div>

                <ChevronDown
                  className={`hidden h-4 w-4 flex-shrink-0 text-[#8A7467] transition-transform sm:block ${userMenuOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {userMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close account menu"
                    onClick={() => setUserMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  <div className="absolute right-0 z-50 mt-2 w-[260px] overflow-hidden rounded-2xl border border-[#E7DED6] bg-[#FFFEFC] shadow-[0_18px_50px_rgba(58,33,23,0.16)]">
                    <div className="border-b border-[#EEE5DE] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8172]">
                        Signed in as
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-[#281912]">
                        {adminUser?.email || 'Administrator'}
                      </p>
                    </div>

                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#A33B32] transition hover:bg-[#FFF1EF]"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-76px)] bg-[#F7F4EF] p-4 sm:p-6 xl:p-8">
          <div className="mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}