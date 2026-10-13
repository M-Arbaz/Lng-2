'use client'

import { usePathname } from 'next/navigation'
import AnnouncementBar from './AnnouncementBar'
import Header from './Header'
import Footer from './Footer'
import WebsitePopup from './WebsitePopup'
import RecentPurchasePopup from './RecentPurchasePopup'
import ProgressLoader from './ProgressLoader'
import { useAppState } from '@/context/AppStateContext'

export default function SiteChrome({ children }) {
  const pathname = usePathname()
  const app = useAppState()
  const isAdminRoute = pathname.startsWith('/admin')
  const isHomeHero = pathname === '/'

  if (isAdminRoute) {
    return (
      <>
        {app.loading && <ProgressLoader progress={app.loadingProgress} />}
        {children}
      </>
    )
  }

  return (
    <div className={
      app.theme === 'dark'
        ? 'min-h-screen bg-[#1F1F1F] text-stone-100 flex flex-col'
        : isHomeHero
          ? 'min-h-screen hero-gradient-bg text-[#222222] flex flex-col'
          : 'min-h-screen bg-[#FAFAF8] text-[#222222] flex flex-col'
    }>
      {app.loading && <ProgressLoader progress={app.loadingProgress} />}
      <AnnouncementBar />
      <Header
        ref={app.headerRef}
        activeSection={app.activeSection}
        cartItemsCount={app.cartItemsCount}
        categories={app.dynamicCategories}
        handleNavigate={app.handleNavigate}
        mobileNavOpen={app.mobileNavOpen}
        navigateToWishlist={app.navigateToWishlist}
        products={app.products}
        searchQuery={app.searchQuery}
        setMobileNavOpen={app.setMobileNavOpen}
        setSearchQuery={app.setSearchQuery}
        theme={app.theme}
        toggleTheme={app.toggleTheme}
        transparentOverlay={isHomeHero}
        wishlistItemsCount={app.wishlist.length}
      />
      <main className="flex-1" style={{ paddingTop: `${app.headerHeight}px` }}>
        {children}
      </main>
      <WebsitePopup />
      <RecentPurchasePopup products={app.products} />
      <Footer theme={app.theme} />
    </div>
  )
}
