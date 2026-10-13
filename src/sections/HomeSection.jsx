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
      className="hero-gradient-bg min-w-0 overflow-x-hidden"
      style={{ marginTop: headerHeight ? `-${headerHeight}px` : 0 }}
    >
      <HeroSlider slides={heroSlides} onPrimaryAction={onHeroAction} />

      <HomeHandpickCollection slides={collectionSlides} onAction={onCollectionAction} />

      <HomeFeaturedProducts
        products={products}
        onViewAll={onViewAllProducts}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        isInWishlist={isInWishlist}
        theme={theme}
      />

      <HomeBlogs />

      <HomeInstagramGrid images={instagramImages} />

      <HomeStats />

      <HomeTestimonials products={products} reviews={reviews} />
    </section>
  )
}
