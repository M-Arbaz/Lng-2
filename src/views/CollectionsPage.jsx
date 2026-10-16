'use client'

import { useNavigate } from '@/lib/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Layers3,
  Loader2,
} from 'lucide-react'
import useCategories from '../hooks/useCategories.js'
import { slugify } from '../utils/slugify.js'

function stripHtml(html) {
  if (!html) return ''

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function CollectionsPage({
  theme = 'light',
}) {
  const navigate = useNavigate()
  const { categories, loading } = useCategories()

  const isDark = theme === 'dark'

  return (
    <main
      className={
        isDark
          ? 'min-h-screen w-full bg-[#1F1916] text-white'
          : 'min-h-screen w-full bg-[#F7F4EF] text-[#281912]'
      }
    >
      {/* ───────── HERO ───────── */}
      <section
        className={
          isDark
            ? 'border-b border-white/10 bg-[#241B17]'
            : 'border-b border-[#3A2117]/10 bg-[#EEE5DC]'
        }
      >
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:px-10 lg:pb-16">
          <button
            type="button"
            onClick={() => navigate('/')}
            className={
              isDark
                ? 'inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[11px] font-semibold text-stone-300 transition hover:bg-white/[0.08] hover:text-white'
                : 'inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#3A2117]/12 bg-[#FFFEFC] px-4 text-[11px] font-semibold text-[#3A2117] transition hover:border-[#6B4228]/30 hover:bg-[#F7F4EF]'
            }
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.8}
            />
            Back Home
          </button>

          <div className="mx-auto mt-10 max-w-3xl text-center sm:mt-12">
            <div
              className={
                isDark
                  ? 'mx-auto grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-[#D7A987]'
                  : 'mx-auto grid h-11 w-11 place-items-center rounded-full border border-[#6B4228]/10 bg-[#FFFEFC] text-[#6B4228]'
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
                  ? 'mt-5 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#D7A987]'
                  : 'mt-5 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8A654D]'
              }
            >
              Curated by Lamp & Glow
            </p>

            <h1
              className={
                isDark
                  ? 'mt-3 text-[clamp(2.2rem,5vw,4.3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-white'
                  : 'mt-3 text-[clamp(2.2rem,5vw,4.3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#281912]'
              }
            >
              Explore Our Collections
            </h1>

            <p
              className={
                isDark
                  ? 'mx-auto mt-5 max-w-2xl text-sm leading-6 text-stone-400 sm:text-[15px]'
                  : 'mx-auto mt-5 max-w-2xl text-sm leading-6 text-[#746359] sm:text-[15px]'
              }
            >
              Discover thoughtfully curated lighting and
              handcrafted pieces designed to bring warmth,
              character and timeless beauty into your space.
            </p>

            {!loading && categories.length > 0 && (
              <p
                className={
                  isDark
                    ? 'mt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500'
                    : 'mt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#9A8171]'
                }
              >
                {categories.length}{' '}
                {categories.length === 1
                  ? 'Collection'
                  : 'Collections'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ───────── COLLECTION GRID ───────── */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={28}
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
                Loading collections...
              </p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div
            className={
              isDark
                ? 'rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-16 text-center'
                : 'rounded-[28px] border border-[#3A2117]/10 bg-[#FFFEFC] px-6 py-16 text-center'
            }
          >
            <div
              className={
                isDark
                  ? 'mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/[0.05] text-[#D7A987]'
                  : 'mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]'
              }
            >
              <Layers3 size={22} strokeWidth={1.5} />
            </div>

            <h2
              className={
                isDark
                  ? 'mt-4 text-lg font-semibold text-white'
                  : 'mt-4 text-lg font-semibold text-[#281912]'
              }
            >
              Collections are coming soon
            </h2>

            <p
              className={
                isDark
                  ? 'mx-auto mt-2 max-w-md text-xs leading-5 text-stone-500'
                  : 'mx-auto mt-2 max-w-md text-xs leading-5 text-[#8A7569]'
              }
            >
              Our curated collections will appear here as
              soon as they are available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category, index) => {
              const description = stripHtml(
                category.description
              )

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/collections/${slugify(
                        category.id
                      )}`
                    )
                  }
                  className="
                    group relative overflow-hidden
                    rounded-[26px]
                    text-left
                    shadow-[0_12px_35px_rgba(58,33,23,0.06)]
                    ring-1 ring-[#3A2117]/10
                    transition-all duration-500
                    hover:-translate-y-1.5
                    hover:shadow-[0_20px_50px_rgba(58,33,23,0.13)]
                    active:scale-[0.99]
                  "
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#E9E0D8]">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center bg-[#EEE5DC] text-[#8A654D]">
                        <Layers3
                          size={30}
                          strokeWidth={1.3}
                        />
                      </div>
                    )}

                    {/* overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F120D]/95 via-[#281912]/25 to-transparent" />

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                      <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                        Collection{' '}
                        {String(index + 1).padStart(
                          2,
                          '0'
                        )}
                      </span>

                      <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-white group-hover:text-[#3A2117]">
                        <ArrowUpRight
                          size={15}
                          strokeWidth={1.8}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/65">
                        Lamp &amp; Glow
                      </p>

                      <h2 className="mt-1.5 text-xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[22px]">
                        {category.title}
                      </h2>

                      {description && (
                        <p className="mt-2 line-clamp-2 max-w-[34ch] text-[11px] leading-5 text-white/75">
                          {description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-white">
                        Explore Collection

                        <span className="h-px w-6 bg-white/40 transition-all duration-300 group-hover:w-10" />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}