'use client'

import { useNavigate } from '@/lib/navigation'
import { ArrowLeft, Heart, Sparkles } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'

export default function WishlistPage({
  wishlist = [],
  handleToggleWishlist,
  handleAddToCart,
  theme = 'light',
}) {
  const navigate = useNavigate()

  const isDark = theme === 'dark'

  return (
    <main
      className={
        isDark
          ? 'min-h-screen bg-[#1F1F1F]'
          : 'min-h-screen bg-[#F7F4EF]'
      }
    >
      {/* HERO */}
      <section
        className={
          isDark
            ? 'border-b border-white/10 bg-[#241A15]'
            : 'border-b border-[#3A2117]/10 bg-[#F7F4EF]'
        }
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={
              isDark
                ? 'inline-flex items-center gap-2 text-xs font-medium text-stone-400 transition-colors hover:text-white'
                : 'inline-flex items-center gap-2 text-xs font-medium text-[#7A6559] transition-colors hover:text-[#3A2117]'
            }
          >
            <ArrowLeft size={15} strokeWidth={1.8} />
            Back
          </button>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div
                className={
                  isDark
                    ? 'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5'
                    : 'inline-flex items-center gap-2 rounded-full border border-[#3A2117]/10 bg-[#FFFEFC] px-3 py-1.5'
                }
              >
                <Heart
                  size={13}
                  strokeWidth={1.8}
                  className={
                    isDark ? 'text-[#D7A987]' : 'text-[#6B4228]'
                  }
                />

                <span
                  className={
                    isDark
                      ? 'text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-300'
                      : 'text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A5945]'
                  }
                >
                  Saved Collection
                </span>
              </div>

              <h1
                className={
                  isDark
                    ? 'mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-[44px]'
                    : 'mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#281912] sm:text-4xl lg:text-[44px]'
                }
              >
                My Wishlist
              </h1>

              <p
                className={
                  isDark
                    ? 'mt-3 max-w-xl text-sm leading-6 text-stone-400'
                    : 'mt-3 max-w-xl text-sm leading-6 text-[#7A6A60]'
                }
              >
                A curated collection of pieces you love. Keep your favourites
                close and return whenever you're ready.
              </p>
            </div>

            {wishlist.length > 0 && (
              <div
                className={
                  isDark
                    ? 'w-fit rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3'
                    : 'w-fit rounded-2xl border border-[#3A2117]/10 bg-[#FFFEFC] px-5 py-3 shadow-[0_8px_28px_rgba(58,33,23,0.05)]'
                }
              >
                <p
                  className={
                    isDark
                      ? 'text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500'
                      : 'text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]'
                  }
                >
                  Saved Items
                </p>

                <p
                  className={
                    isDark
                      ? 'mt-0.5 text-xl font-semibold text-white'
                      : 'mt-0.5 text-xl font-semibold text-[#281912]'
                  }
                >
                  {wishlist.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {wishlist.length === 0 ? (
          /* EMPTY STATE */
          <div
            className={
              isDark
                ? 'mx-auto max-w-2xl overflow-hidden rounded-[30px] border border-white/10 bg-[#29221E]'
                : 'mx-auto max-w-2xl overflow-hidden rounded-[30px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_22px_70px_rgba(58,33,23,0.07)]'
            }
          >
            <div
              className={
                isDark
                  ? 'border-b border-white/10 bg-white/[0.03] px-6 py-10 text-center sm:px-10'
                  : 'border-b border-[#3A2117]/10 bg-[#F2ECE5] px-6 py-10 text-center sm:px-10'
              }
            >
              <div
                className={
                  isDark
                    ? 'mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[#D7A987]'
                    : 'mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#3A2117]/10 bg-[#FFFEFC] text-[#6B4228] shadow-sm'
                }
              >
                <Heart size={27} strokeWidth={1.5} />
              </div>

              <h2
                className={
                  isDark
                    ? 'mt-5 text-2xl font-semibold tracking-[-0.03em] text-white'
                    : 'mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]'
                }
              >
                Your wishlist is waiting
              </h2>

              <p
                className={
                  isDark
                    ? 'mx-auto mt-3 max-w-md text-sm leading-6 text-stone-400'
                    : 'mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6A60]'
                }
              >
                Save the pieces that catch your eye and they'll appear here
                whenever you want to revisit them.
              </p>
            </div>

            <div className="px-6 py-7 text-center sm:px-10 sm:py-8">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="
                  inline-flex min-h-[48px] items-center justify-center
                  gap-2 rounded-full bg-[#3A2117]
                  px-7 py-3 text-sm font-semibold text-white
                  shadow-[0_10px_28px_rgba(58,33,23,0.18)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:bg-[#4A2B1F]
                  hover:shadow-[0_14px_34px_rgba(58,33,23,0.23)]
                "
              >
                <Sparkles size={16} strokeWidth={1.8} />
                Explore Collection
              </button>

              <p
                className={
                  isDark
                    ? 'mt-4 text-[11px] text-stone-500'
                    : 'mt-4 text-[11px] text-[#9A8B82]'
                }
              >
                Tap the heart on any product to save it here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* SECTION HEADING */}
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p
                  className={
                    isDark
                      ? 'text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D7A987]'
                      : 'text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]'
                  }
                >
                  Your Selection
                </p>

                <h2
                  className={
                    isDark
                      ? 'mt-1 text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl'
                      : 'mt-1 text-xl font-semibold tracking-[-0.02em] text-[#281912] sm:text-2xl'
                  }
                >
                  Saved Favourites
                </h2>
              </div>

              <button
                type="button"
                onClick={() => navigate('/products')}
                className={
                  isDark
                    ? 'hidden text-xs font-semibold text-stone-400 transition-colors hover:text-white sm:block'
                    : 'hidden text-xs font-semibold text-[#6B5A50] transition-colors hover:text-[#3A2117] sm:block'
                }
              >
                Continue Shopping →
              </button>
            </div>

            {/* PRODUCTS */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {wishlist.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isInWishlist={() => true}
                />
              ))}
            </div>

            {/* MOBILE CONTINUE SHOPPING */}
            <div className="mt-8 text-center sm:hidden">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="
                  inline-flex min-h-[44px] items-center justify-center
                  rounded-full border border-[#3A2117]/15
                  bg-[#FFFEFC] px-6 py-2.5
                  text-xs font-semibold text-[#3A2117]
                  transition-colors hover:bg-[#F2ECE5]
                "
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}