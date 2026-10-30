'use client'

import { useState } from 'react'
import HeroSlider from '../components/HeroSlider.jsx'
import HomeFeaturedProducts from './HomeFeaturedProducts.jsx'
import HomeHandpickCollection from './HomeHandpickCollection.jsx'
import HomeTestimonials from './HomeTestimonials.jsx'
import HomeBlogs from './HomeBlogs.jsx'
import HomeInstagramGrid from './HomeInstagramGrid.jsx'
import HomeStats from './HomeStats.jsx'
import HomeShopByCategory from './HomeShopByCategory.jsx'

export default function HomeSection({
  homeContentReady = false,
  heroSlides,
  onHeroAction,
  headerHeight,
  collectionSlides,
  onCollectionAction,
  instagramImages,
  products,
  testimonials,
  theme,
  categories,
  onViewAllProducts,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  reviews,
}) {
  const [blogsLoaded, setBlogsLoaded] = useState(false)
  return (
    <section
      className={
        theme === 'dark'
          ? 'min-w-0 overflow-x-hidden bg-[#171310] text-stone-100'
          : 'hero-gradient-bg min-w-0 overflow-x-hidden'
      }
      style={{ marginTop: headerHeight ? `-${headerHeight}px` : 0 }}
    >
      <HeroSlider slides={heroSlides} onPrimaryAction={onHeroAction} />
      <HomeShopByCategory
        categories={categories}
        theme={theme}
      />
      <HomeHandpickCollection slides={collectionSlides} onAction={onCollectionAction} theme={theme}
      />

      <HomeFeaturedProducts
        products={products}
        onViewAll={onViewAllProducts}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        isInWishlist={isInWishlist}
        theme={theme}
      />

      <HomeBlogs
        theme={theme}
        onLoadComplete={setBlogsLoaded}
      />
      <HomeInstagramGrid images={instagramImages} theme={theme} />

      {homeContentReady && blogsLoaded && (
        <HomeStats theme={theme} />
      )}

      <HomeTestimonials products={products} reviews={reviews} theme={theme} />
    </section>
  )
}
