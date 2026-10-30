'use client'

import HomeSection from '@/sections/HomeSection'
import { TESTIMONIALS } from '@/data/testimonials'
import { useAppState } from '@/context/AppStateContext'

export default function HomeRoute() {
  const app = useAppState()
  return (
    <HomeSection
      homeContentReady={
        !app.loading &&
        app.homeDynamicSectionsReady.hero &&
        app.homeDynamicSectionsReady.collections &&
        app.homeDynamicSectionsReady.instagram
      }
      theme={app.theme}
      categories={app.dynamicCategories}
      heroSlides={app.heroSlides}
      onHeroAction={app.handleHeroAction}
      headerHeight={app.headerHeight}
      collectionSlides={app.collectionSlides}
      onCollectionAction={app.handleHeroAction}
      instagramImages={app.instagramImages}
      products={app.products}
      testimonials={TESTIMONIALS}
      onViewAllProducts={() => app.handleNavigate('products')}
      onAddToCart={app.handleAddToCart}
      onToggleWishlist={app.handleToggleWishlist}
      isInWishlist={app.isInWishlist}
      reviews={app.sortedReviews}
    />
  )
}
