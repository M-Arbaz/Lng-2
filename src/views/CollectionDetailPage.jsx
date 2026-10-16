'use client'

import { useParams, useNavigate } from '@/lib/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Layers3,
  Loader2,
  PackageSearch,
} from 'lucide-react'

import useCategories from '../hooks/useCategories.js'
import useProducts from '../hooks/useProducts.js'
import {
  findCategoryBySlug,
} from '../utils/slugify.js'

import ProductCard from '../components/ProductCard.jsx'

function stripHtml(html) {
  if (!html) return ''

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function CollectionDetailPage({
  theme = 'light',
  onAddToCart,
  handleToggleWishlist,
  isInWishlist,
}) {
  const { slug } = useParams()
  const navigate = useNavigate()

  const {
    categories,
    loading: catsLoading,
  } = useCategories()

  const {
    products,
    loading: prodsLoading,
  } = useProducts()

  const category = findCategoryBySlug(
    categories,
    slug
  )

  const filteredProducts = category
    ? products.filter(
      (product) =>
        product.category === category.id
    )
    : []

  const loading =
    catsLoading || prodsLoading

  const isDark = theme === 'dark'

  const description = stripHtml(
    category?.description
  )

  return (
    <main
      className={
        isDark
          ? 'min-h-screen w-full bg-[#1F1916] text-white'
          : 'min-h-screen w-full bg-[#F7F4EF] text-[#281912]'
      }
    >
      {/* ───────── LOADING ───────── */}
      {loading ? (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <Loader2
              size={30}
              className={
                isDark
                  ? 'mx-auto animate-spin text-[#D7A987]'
                  : 'mx-auto animate-spin text-[#6B4228]'
              }
            />

            <p
              className={
                isDark
                  ? 'mt-3 text-xs text-stone-500'
                  : 'mt-3 text-xs text-[#8A7569]'
              }
            >
              Loading collection...
            </p>
          </div>
        </div>
      ) : !category ? (
        /* ───────── NOT FOUND ───────── */
        <section className="mx-auto flex min-h-[70vh] w-full max-w-[1400px] items-center justify-center px-4 sm:px-6 lg:px-10">
          <div
            className={
              isDark
                ? 'w-full max-w-xl rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-14 text-center'
                : 'w-full max-w-xl rounded-[28px] border border-[#3A2117]/10 bg-[#FFFEFC] px-6 py-14 text-center shadow-[0_14px_40px_rgba(58,33,23,0.05)]'
            }
          >
            <div
              className={
                isDark
                  ? 'mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/[0.05] text-[#D7A987]'
                  : 'mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]'
              }
            >
              <Layers3
                size={22}
                strokeWidth={1.5}
              />
            </div>

            <h1
              className={
                isDark
                  ? 'mt-5 text-xl font-semibold text-white'
                  : 'mt-5 text-xl font-semibold text-[#281912]'
              }
            >
              Collection not found
            </h1>

            <p
              className={
                isDark
                  ? 'mx-auto mt-2 max-w-sm text-xs leading-5 text-stone-500'
                  : 'mx-auto mt-2 max-w-sm text-xs leading-5 text-[#8A7569]'
              }
            >
              The collection you are looking for may no longer
              be available.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/collections')
              }
              className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#3A2117] px-6 text-xs font-semibold text-white transition-colors hover:bg-[#4A2B1F]"
            >
              <ArrowLeft
                size={14}
                strokeWidth={1.8}
              />

              Browse Collections
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* ───────── COLLECTION HERO ───────── */}
          <section
            className={
              isDark
                ? 'border-b border-white/10 bg-[#241B17]'
                : 'border-b border-[#3A2117]/10 bg-[#EEE5DC]'
            }
          >
            <div className="mx-auto w-full max-w-[1400px] px-4 pb-10 pt-7 sm:px-6 sm:pb-12 sm:pt-9 lg:px-10 lg:pb-14">
              <button
                type="button"
                onClick={() =>
                  navigate('/collections')
                }
                className={
                  isDark
                    ? 'inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[11px] font-semibold text-stone-300 transition-colors hover:bg-white/[0.08] hover:text-white'
                    : 'inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#3A2117]/12 bg-[#FFFEFC] px-4 text-[11px] font-semibold text-[#3A2117] transition-colors hover:border-[#6B4228]/30 hover:bg-[#F7F4EF]'
                }
              >
                <ArrowLeft
                  size={14}
                  strokeWidth={1.8}
                />

                All Collections
              </button>

              <div className="mt-7 grid overflow-hidden rounded-[30px] lg:grid-cols-[1.05fr_0.95fr]">
                {/* HERO CONTENT */}
                <div
                  className={
                    isDark
                      ? 'flex min-h-[360px] flex-col justify-center bg-[#2A201B] p-7 sm:p-10 lg:min-h-[440px] lg:p-12'
                      : 'flex min-h-[360px] flex-col justify-center bg-[#FFFEFC] p-7 sm:p-10 lg:min-h-[440px] lg:p-12'
                  }
                >
                  <div
                    className={
                      isDark
                        ? 'grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-[#D7A987]'
                        : 'grid h-11 w-11 place-items-center rounded-full border border-[#6B4228]/10 bg-[#F2ECE5] text-[#6B4228]'
                    }
                  >
                    <Layers3
                      size={18}
                      strokeWidth={1.6}
                    />
                  </div>

                  <p
                    className={
                      isDark
                        ? 'mt-6 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#D7A987]'
                        : 'mt-6 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8A654D]'
                    }
                  >
                    Lamp &amp; Glow Collection
                  </p>

                  <h1
                    className={
                      isDark
                        ? 'mt-3 max-w-xl text-[clamp(2.2rem,5vw,4.3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-white'
                        : 'mt-3 max-w-xl text-[clamp(2.2rem,5vw,4.3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#281912]'
                    }
                  >
                    {category.title}
                  </h1>

                  {description && (
                    <p
                      className={
                        isDark
                          ? 'mt-5 max-w-xl text-sm leading-6 text-stone-400 sm:text-[15px]'
                          : 'mt-5 max-w-xl text-sm leading-6 text-[#746359] sm:text-[15px]'
                      }
                    >
                      {description}
                    </p>
                  )}

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <span
                      className={
                        isDark
                          ? 'rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[10px] font-semibold text-stone-300'
                          : 'rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] px-4 py-2 text-[10px] font-semibold text-[#6B5A50]'
                      }
                    >
                      {filteredProducts.length}{' '}
                      {filteredProducts.length === 1
                        ? 'Product'
                        : 'Products'}
                    </span>

                    {filteredProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          document
                            .getElementById(
                              'collection-products'
                            )
                            ?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            })
                        }}
                        className="inline-flex min-h-[38px] items-center gap-2 rounded-full bg-[#3A2117] px-4 text-[10px] font-semibold text-white transition-colors hover:bg-[#4A2B1F]"
                      >
                        Shop Collection

                        <ArrowUpRight
                          size={13}
                          strokeWidth={1.8}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* HERO IMAGE */}
                <div className="relative min-h-[320px] overflow-hidden bg-[#E9E0D8] sm:min-h-[400px] lg:min-h-[440px]">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={
                        isDark
                          ? 'absolute inset-0 grid place-items-center bg-[#30251F] text-[#D7A987]'
                          : 'absolute inset-0 grid place-items-center bg-[#E7DDD4] text-[#8A654D]'
                      }
                    >
                      <Layers3
                        size={42}
                        strokeWidth={1.2}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#281912]/30 via-transparent to-transparent" />

                  <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                    Curated Collection
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ───────── PRODUCTS ───────── */}
          <section
            id="collection-products"
            className="scroll-mt-28"
          >
            <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
              <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p
                    className={
                      isDark
                        ? 'text-[9px] font-semibold uppercase tracking-[0.22em] text-[#D7A987]'
                        : 'text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8A654D]'
                    }
                  >
                    Explore the collection
                  </p>

                  <h2
                    className={
                      isDark
                        ? 'mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-white'
                        : 'mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]'
                    }
                  >
                    {category.title} Products
                  </h2>
                </div>

                {filteredProducts.length > 0 && (
                  <p
                    className={
                      isDark
                        ? 'text-xs text-stone-500'
                        : 'text-xs text-[#8A7569]'
                    }
                  >
                    {filteredProducts.length}{' '}
                    {filteredProducts.length === 1
                      ? 'piece'
                      : 'pieces'}{' '}
                    available
                  </p>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div
                  className={
                    isDark
                      ? 'rounded-[26px] border border-white/10 bg-white/[0.03] px-6 py-16 text-center'
                      : 'rounded-[26px] border border-[#3A2117]/10 bg-[#FFFEFC] px-6 py-16 text-center shadow-[0_10px_30px_rgba(58,33,23,0.04)]'
                  }
                >
                  <div
                    className={
                      isDark
                        ? 'mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/[0.05] text-[#D7A987]'
                        : 'mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]'
                    }
                  >
                    <PackageSearch
                      size={22}
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3
                    className={
                      isDark
                        ? 'mt-4 text-base font-semibold text-white'
                        : 'mt-4 text-base font-semibold text-[#281912]'
                    }
                  >
                    No products in this collection yet
                  </h3>

                  <p
                    className={
                      isDark
                        ? 'mx-auto mt-2 max-w-md text-xs leading-5 text-stone-500'
                        : 'mx-auto mt-2 max-w-md text-xs leading-5 text-[#8A7569]'
                    }
                  >
                    New pieces will appear here as soon as
                    they are added to this collection.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('/products')
                    }
                    className="mt-6 min-h-[42px] rounded-full bg-[#3A2117] px-6 text-xs font-semibold text-white transition-colors hover:bg-[#4A2B1F]"
                  >
                    Browse All Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                  {filteredProducts.map(
                    (product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                        onToggleWishlist={
                          handleToggleWishlist
                        }
                        isInWishlist={isInWishlist}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ───────── BACK TO COLLECTIONS ───────── */}
          <section
            className={
              isDark
                ? 'border-t border-white/10 bg-[#241B17]'
                : 'border-t border-[#3A2117]/10 bg-[#EEE5DC]'
            }
          >
            <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-5 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left lg:px-10">
              <div>
                <p
                  className={
                    isDark
                      ? 'text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D7A987]'
                      : 'text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]'
                  }
                >
                  Keep exploring
                </p>

                <p
                  className={
                    isDark
                      ? 'mt-1 text-sm font-semibold text-white'
                      : 'mt-1 text-sm font-semibold text-[#281912]'
                  }
                >
                  Discover more Lamp &amp; Glow
                  collections
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('/collections')
                }
                className={
                  isDark
                    ? 'inline-flex min-h-[42px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 text-xs font-semibold text-white transition hover:bg-white/[0.1]'
                    : 'inline-flex min-h-[42px] items-center gap-2 rounded-full border border-[#3A2117]/15 bg-[#FFFEFC] px-5 text-xs font-semibold text-[#3A2117] transition hover:bg-[#F7F4EF]'
                }
              >
                <ArrowLeft
                  size={14}
                  strokeWidth={1.8}
                />

                All Collections
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  )
}