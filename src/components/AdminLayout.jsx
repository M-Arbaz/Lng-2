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
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { adminUser, adminLogout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
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
      label: 'Social Links',
      icon: Share2,
      path: '/admin/social-links',
    },
    {
      label: 'Footer',
      icon: LayoutTemplate,
      path: '/admin/footer',
    },
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
      label: 'Onboarding',
      icon: Lightbulb,
      path: '/admin/onboarding',
    },
    {
      label: 'Website Popups',
      icon: Image,
      path: '/admin/website-popups',
    },
    {
      label: 'Announcement Bar',
      icon: Megaphone,
      path: '/admin/announcements',
    },
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
      label: 'Shipping Fees',
      icon: Truck,
      path: '/admin/shipping-fees',
    },
    {
      label: 'Pages',
      icon: FileText,
      path: '/admin/pages',
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
      label: 'About Page',
      icon: Info,
      path: '/admin/about',
    },
    {
      label: 'Bank Details',
      icon: Building2,
      path: '/admin/bank-details',
    },
    {
      label: 'Reviews',
      icon: MessageSquare,
      path: '/admin/reviews',
    },
    {
      label: 'Custom Orders',
      icon: Wand2,
      path: '/admin/custom-orders',
    },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Onboarding Popup - shown on all admin pages */}
      <OnboardingPopup />

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 fixed h-screen left-0 top-0 overflow-y-auto z-40`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-[#F5F1EA]0 rounded-lg flex items-center justify-center font-bold text-lg">
                LG
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">Lamp</span>
                <span className="font-bold text-sm leading-tight">Glow</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-20 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-[#F5F1EA]0 rounded-lg flex items-center justify-center text-white font-bold">
                {adminUser?.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{adminUser?.displayName}</p>
                <p className="text-xs text-gray-500">{adminUser?.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Logged in as</p>
                  <p className="font-semibold text-gray-900">{adminUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[#E53935] hover:bg-red-50 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
