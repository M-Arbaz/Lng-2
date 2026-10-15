'use client'

import { useNavigate } from '@/lib/navigation'
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa'
import { slugify } from '../utils/slugify.js'

export default function WishlistPage({ wishlist = [], handleToggleWishlist, handleAddToCart, theme = 'light' }) {
  const navigate = useNavigate()

  return (
    <section className={theme === 'dark' ? 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-[#1F1F1F]' : 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14'}>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-xs font-medium text-[#FFD400] hover:text-[#FFE566]"
      >
        <span aria-hidden>←</span>
        Back
      </button>

      <div className="mt-6">
        <h1 className={theme === 'dark' ? 'text-xl sm:text-2xl font-semibold tracking-tight text-[#FFD400]' : 'text-xl sm:text-2xl font-semibold tracking-tight text-stone-900'}>
          My Wishlist
        </h1>
        <p className={theme === 'dark' ? 'mt-1 text-xs sm:text-sm text-stone-400' : 'mt-1 text-xs sm:text-sm text-stone-500'}>
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className={theme === 'dark' ? 'mt-8 rounded-2xl border border-stone-700 bg-[#2A2A2A] p-10 text-center' : 'mt-8 rounded-2xl border border-stone-200 bg-white p-10 text-center'}>
          <FaRegHeart className={theme === 'dark' ? 'mx-auto text-4xl text-stone-500 mb-4' : 'mx-auto text-4xl text-stone-300 mb-4'} />
          <p className={theme === 'dark' ? 'text-sm text-stone-400' : 'text-sm text-stone-500'}>Your wishlist is empty.</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#5A2D0C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#FFD400]"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className={theme === 'dark' ? 'rounded-2xl border border-stone-700 bg-[#2A2A2A] shadow-sm overflow-hidden' : 'rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden'}
            >
              <div
                className="aspect-square bg-stone-100 cursor-pointer"
                onClick={() => navigate(`/products/${slugify(product.name)}`)}              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400 text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3
                  className={theme === 'dark' ? 'text-sm font-semibold text-stone-100 truncate cursor-pointer hover:text-[#FFD400]' : 'text-sm font-semibold text-stone-900 truncate cursor-pointer hover:text-[#5A2D0C]'}
                  onClick={() => navigate(`/products/${slugify(product.name)}`)}                >
                  {product.name}
                </h3>
                <p className={theme === 'dark' ? 'mt-1 text-sm font-bold text-[#FFD400]' : 'mt-1 text-sm font-bold text-[#5A2D0C]'}>
                  Rs {Number(product.price).toLocaleString()}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#5A2D0C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#FFD400]"
                  >
                    <FaShoppingCart className="text-[11px]" />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => handleToggleWishlist(product)}
                    className={theme === 'dark' ? 'inline-flex items-center justify-center rounded-full border border-stone-600 bg-[#2A2A2A] p-2 text-rose-500 hover:bg-stone-700' : 'inline-flex items-center justify-center rounded-full border border-stone-200 bg-white p-2 text-rose-600 hover:bg-stone-50'}
                    aria-label="Remove from wishlist"
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}