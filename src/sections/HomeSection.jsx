'use client'

import HeroSlider from '../components/HeroSlider.jsx'
import HomeFeaturedProducts from './HomeFeaturedProducts.jsx'
import HomeHandpickCollection from './HomeHandpickCollection.jsx'
import HomeTestimonials from './HomeTestimonials.jsx'
import HomeBlogs from './HomeBlogs.jsx'
import HomeInstagramGrid from './HomeInstagramGrid.jsx'
import HomeStats from './HomeStats.jsx'

export default function HomeSection({
  heroSlides,
  onHeroAction,
  headerHeight,
  collectionSlides,
  onCollectionAction,
  instagramImages,
  products,
  testimonials,
  theme,
  onViewAllProducts,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  reviews,
}) {
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

      <HomeBlogs theme={theme} />

      <HomeInstagramGrid images={instagramImages} theme={theme} />

      <HomeStats theme={theme} />

      <HomeTestimonials products={products} reviews={reviews} theme={theme} />
    </section>
  )
}
