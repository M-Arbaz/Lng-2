'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Clapperboard,
  Heart,
  Loader2,
  Play,
  Share2,
  TriangleAlert,
} from 'lucide-react'
import {
  useNavigate,
  useParams,
} from '@/lib/navigation'

import reelsService from '../utils/reelsService'

export default function ReelsPage() {
  const { reelId } = useParams()
  const navigate = useNavigate()

  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(
    () => new Set()
  )

  useEffect(() => {
    const loadReels = async () => {
      try {
        setLoading(true)
        setError('')

        const data =
          await reelsService.getAllReels()

        setReels(
          data.filter(
            (reel) =>
              reel.isActive !== false
          )
        )
      } catch (err) {
        console.error(
          'Error loading reels:',
          err
        )

        setError(
          'We could not load the reels right now.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadReels()
  }, [])

  const toggleLike = (
    event,
    id
  ) => {
    event.preventDefault()
    event.stopPropagation()

    setLiked((prev) => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  const fallbackCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Link copied to clipboard!')
      })
      .catch(() => {
        prompt(
          'Copy this link:',
          text
        )
      })
  }

  const handleShare = async (
    event,
    reel
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const reelUrl =
      `${window.location.origin}/reels/${reel.id}`

    const shareData = {
      title:
        reel.title ||
        'Lamp & Glow Reel',
      text:
        reel.caption ||
        'Discover this reel from Lamp & Glow.',
      url: reelUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(
          shareData
        )
      } catch (err) {
        if (
          err.name !== 'AbortError'
        ) {
          fallbackCopy(
            shareData.url
          )
        }
      }

      return
    }

    fallbackCopy(
      shareData.url
    )
  }

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#F7F4EF]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={28}
              className="mx-auto animate-spin text-[#6B4228]"
            />

            <p className="mt-3 text-xs text-[#8A7569]">
              Loading reels...
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-[70vh] bg-[#F7F4EF] px-4 py-12">
        <div className="mx-auto max-w-xl rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-14 text-center">
          <TriangleAlert
            size={26}
            className="mx-auto text-rose-600"
          />

          <h1 className="mt-4 text-lg font-semibold text-rose-900">
            Something went wrong
          </h1>

          <p className="mt-2 text-xs leading-5 text-rose-700">
            {error}
          </p>
        </div>
      </main>
    )
  }

  /*
   * Keep the existing reel-detail route functional for now.
   * We'll redesign this inner view in the next step.
   */
  if (reelId) {
    const reel = reels.find(
      (item) =>
        item.id === reelId
    )

    if (!reel) {
      return (
        <main className="min-h-[70vh] bg-[#F7F4EF] px-4 py-12">
          <div className="mx-auto max-w-xl rounded-[28px] border border-[#3A2117]/10 bg-[#FFFEFC] px-6 py-14 text-center">
            <Clapperboard
              size={24}
              className="mx-auto text-[#6B4228]"
            />

            <h1 className="mt-4 text-lg font-semibold text-[#281912]">
              Reel not found
            </h1>

            <button
              type="button"
              onClick={() =>
                navigate('/reels')
              }
              className="mt-6 inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#3A2117] px-6 text-xs font-semibold text-white"
            >
              <ArrowLeft
                size={14}
              />
              All Reels
            </button>
          </div>
        </main>
      )
    }

    const isLiked =
      liked.has(reel.id)

    return (
      <main className="min-h-screen bg-[#F7F4EF] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[520px]">
          <button
            type="button"
            onClick={() =>
              navigate('/reels')
            }
            className="mb-5 inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#3A2117]/10 bg-[#FFFEFC] px-4 text-[11px] font-semibold text-[#3A2117]"
          >
            <ArrowLeft
              size={14}
            />
            All Reels
          </button>

          <article className="overflow-hidden rounded-[28px] border border-[#3A2117]/10 bg-[#FFFEFC] shadow-[0_18px_48px_rgba(58,33,23,0.09)]">
            <div className="bg-black">
              <div className="aspect-[9/16]">
                <video
                  src={reel.videoUrl}
                  poster={
                    reel.poster ||
                    undefined
                  }
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="p-5">
              <h1 className="text-lg font-semibold text-[#281912]">
                {reel.title}
              </h1>

              {reel.caption && (
                <p className="mt-2 text-xs leading-5 text-[#746359]">
                  {reel.caption}
                </p>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={(event) =>
                    toggleLike(
                      event,
                      reel.id
                    )
                  }
                  className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] text-xs font-semibold text-[#3A2117]"
                >
                  <Heart
                    size={15}
                    className={
                      isLiked
                        ? 'fill-rose-600 text-rose-600'
                        : ''
                    }
                  />

                  {isLiked
                    ? 'Liked'
                    : 'Like'}
                </button>

                <button
                  type="button"
                  onClick={(event) =>
                    handleShare(
                      event,
                      reel
                    )
                  }
                  className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] text-xs font-semibold text-[#3A2117]"
                >
                  <Share2
                    size={15}
                  />
                  Share
                </button>
              </div>
            </div>
          </article>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F4EF] text-[#281912]">

      {/* ───────── HERO ───────── */}
      <section className="border-b border-[#3A2117]/10 bg-[#EEE5DC]">
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-11 pt-11 text-center sm:px-6 sm:pb-13 sm:pt-13 lg:px-10 lg:pb-14 lg:pt-14">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-[#6B4228]/10 bg-[#FFFEFC] text-[#6B4228]">
            <Clapperboard
              size={18}
              strokeWidth={1.6}
            />
          </div>

          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8A654D]">
            Lamp &amp; Glow
          </p>

          <h1 className="mt-2.5 text-[clamp(2.3rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#281912]">
            Reels
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#746359] sm:text-[15px]">
            A closer look at our
            craftsmanship, warm-light
            styling, product details and
            moments behind Lamp &amp; Glow.
          </p>

          {reels.length > 0 && (
            <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#9A8171]">
              {reels.length}{' '}
              {reels.length === 1
                ? 'Reel'
                : 'Reels'}
            </p>
          )}
        </div>
      </section>

      {/* ───────── REELS ───────── */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        {reels.length === 0 ? (
          <div className="rounded-[28px] border border-[#3A2117]/10 bg-[#FFFEFC] px-6 py-16 text-center shadow-[0_12px_36px_rgba(58,33,23,0.04)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
              <Clapperboard
                size={22}
                strokeWidth={1.5}
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#281912]">
              Reels are coming soon
            </h2>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#8A7569]">
              New product stories and
              behind-the-scenes moments
              will appear here soon.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8A654D]">
                  Watch &amp; discover
                </p>

                <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]">
                  Latest Reels
                </h2>
              </div>

              <p className="hidden text-xs text-[#8A7569] sm:block">
                Tap a reel to watch
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {reels.map((reel) => {
                const isLiked =
                  liked.has(reel.id)

                return (
                  <article
                    key={reel.id}
                    onClick={() =>
                      navigate(
                        `/reels/${reel.id}`
                      )
                    }
                    className="
                      group cursor-pointer
                      overflow-hidden
                      rounded-[24px]
                      border border-[#3A2117]/10
                      bg-[#FFFEFC]
                      shadow-[0_10px_30px_rgba(58,33,23,0.045)]
                      transition-all duration-500
                      hover:-translate-y-1.5
                      hover:shadow-[0_20px_46px_rgba(58,33,23,0.11)]
                    "
                  >
                    {/* VIDEO / POSTER */}
                    <div className="relative aspect-[9/16] overflow-hidden bg-[#1F1916]">
                      <video
                        src={reel.videoUrl}
                        poster={
                          reel.poster ||
                          undefined
                        }
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F120D]/70 via-transparent to-black/10" />

                      {/* PLAY */}
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-[#3A2117]">
                          <Play
                            size={18}
                            strokeWidth={1.8}
                            className="ml-0.5 fill-current"
                          />
                        </div>
                      </div>

                      {/* NUMBER */}
                      <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                        Reel
                      </span>

                      {/* ACTIONS */}
                      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={(event) =>
                            toggleLike(
                              event,
                              reel.id
                            )
                          }
                          aria-label={
                            isLiked
                              ? 'Unlike reel'
                              : 'Like reel'
                          }
                          className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-[#3A2117]"
                        >
                          <Heart
                            size={14}
                            strokeWidth={1.8}
                            className={
                              isLiked
                                ? 'fill-rose-500 text-rose-500'
                                : ''
                            }
                          />
                        </button>

                        <button
                          type="button"
                          onClick={(event) =>
                            handleShare(
                              event,
                              reel
                            )
                          }
                          aria-label="Share reel"
                          className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-white hover:text-[#3A2117]"
                        >
                          <Share2
                            size={14}
                            strokeWidth={1.8}
                          />
                        </button>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#281912] transition-colors group-hover:text-[#6B4228]">
                        {reel.title ||
                          'Lamp & Glow Reel'}
                      </h3>

                      {reel.caption && (
                        <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-[#7A6A60]">
                          {reel.caption}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-[#3A2117]/10 pt-3">
                        <span className="text-[9px] font-semibold text-[#3A2117]">
                          Watch Reel
                        </span>

                        <ArrowUpRight
                          size={13}
                          strokeWidth={1.8}
                          className="text-[#8A654D] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>
    </main>
  )
}