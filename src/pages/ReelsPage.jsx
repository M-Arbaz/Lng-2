'use client'

import { useState, useEffect } from 'react'
import { FaHeart, FaRegHeart, FaShare } from 'react-icons/fa'
import { Loader2, AlertCircle } from 'lucide-react'
import { useParams, useNavigate } from '@/lib/navigation'
import reelsService from '../utils/reelsService'

export default function ReelsPage() {
  const { reelId } = useParams()
  const navigate = useNavigate()
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [liked, setLiked] = useState(() => new Set())

  useEffect(() => {
    const loadReels = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await reelsService.getAllReels()
        const activeReels = data.filter((r) => r.isActive !== false)
        setReels(activeReels)
      } catch (err) {
        console.error('Error loading reels:', err)
        setError('Failed to load reels')
      } finally {
        setLoading(false)
      }
    }
    loadReels()
  }, [])

  function toggleLike(id) {
    setLiked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleShare(reel) {
    const reelUrl = `${window.location.origin}/reels/${reel.id}`
    const shareData = {
      title: reel.title || 'Lamp & Glow Reel',
      text: reel.caption || 'Check out this reel from Lamp & Glow!',
      url: reelUrl,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') {
          fallbackCopy(shareData.url)
        }
      }
    } else {
      fallbackCopy(shareData.url)
    }
  }

  function fallbackCopy(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!')
    }).catch(() => {
      prompt('Copy this link:', text)
    })
  }

  if (loading) {
    return (
      <section className="w-full px-0 py-10 sm:py-14">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin mx-auto text-[#FFD400] mb-4" />
            <p className="text-stone-500">Loading reels...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="w-full px-0 py-10 sm:py-14">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center max-w-md px-4">
            <AlertCircle size={48} className="mx-auto text-[#E53935] mb-4" />
            <h2 className="text-xl font-bold text-stone-900 mb-2">Something went wrong</h2>
            <p className="text-stone-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (reels.length === 0) {
    return (
      <section className="w-full px-0 py-10 sm:py-14">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-900">
                Reels
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-2xl">
               ✨ Experience the artistry behind every handcrafted lamp. Timeless designs crafted to illuminate your space.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-stone-400">No reels available yet. Check back soon!</p>
        </div>
      </section>
    )
  }

  // If a specific reel is requested, show only that reel
  const displayReels = reelId ? reels.filter((r) => r.id === reelId) : reels

  return (
    <section className="w-full px-0 py-10 sm:py-14">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-900">
              Reels
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-2xl">
              Short videos featuring warm-light setups, styling ideas, and product highlights.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 px-4 sm:px-6 lg:px-8">
        {displayReels.map((reel) => {
          const isLiked = liked.has(reel.id)
          return (
            <article
              key={reel.id}
              className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="relative bg-black">
                <div className="aspect-[9/16]">
                  <video
                    className="h-full w-full object-cover"
                    src={reel.videoUrl}
                    poster={reel.poster}
                    controls
                    playsInline
                    preload="metadata"
                    autoPlay={!!reelId}
                    loop={!!reelId}
                  />
                </div>
                {reelId && (
                  <button
                    type="button"
                    onClick={() => navigate('/reels')}
                    className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/80 transition-colors"
                  >
                    ← All Reels
                  </button>
                )}
              </div>

              <div className="p-3">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-stone-900">{reel.title}</p>
                  <p className="mt-0.5 text-[11px] text-stone-500">{reel.caption}</p>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleLike(reel.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    {isLiked ? (
                      <FaHeart className="text-rose-600" />
                    ) : (
                      <FaRegHeart className="text-stone-500" />
                    )}
                    {isLiked ? 'Liked' : 'Like'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(reel)}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    <FaShare className="text-stone-500" />
                    Share
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
