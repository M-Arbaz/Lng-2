'use client'

const AVATAR_COLORS = [
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
]

// Slight alternating tilt so the list reads as a cascading stack of cards,
// echoing the reference screenshot, without growing more extreme as the list gets long.
const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0', '-rotate-3']

function getInitials(name) {
  if (!name || !name.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function getAvatarColor(name) {
  const seed = (name || '?').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[seed % AVATAR_COLORS.length]
}

function getRelativeTime(dateString) {
  const date = new Date(dateString)
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function isNew(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime()
  return diffMs < 7 * 24 * 60 * 60 * 1000
}

export default function ReviewsSection({
  products,
  reviewForm,
  reviewSortBy,
  setReviewForm,
  setReviewSortBy,
  sortedReviews,
  handleSubmitReview,
  user,
  isLoggedIn,
}) {
  const submitReview = async (
    event
  ) => {
    event.preventDefault()

    if (
      !isLoggedIn ||
      !user?.uid
    ) {
      window.alert(
        'Please log in to submit a review.'
      )

      return
    }

    if (
      !reviewForm.comment
        .trim() ||
      !reviewForm.productId
    ) {
      return
    }

    const success =
      await handleSubmitReview({
        productId:
          reviewForm.productId,

        userId:
          user.uid,

        name:
          reviewForm.name.trim() ||
          user.displayName ||
          user.email ||
          'Anonymous',

        rating:
          Number(
            reviewForm.rating
          ) || 5,

        comment:
          reviewForm.comment.trim(),

        createdAt:
          new Date().toISOString(),

        isActive: true,
      })

    if (success) {
      setReviewForm(
        (prev) => ({
          ...prev,

          rating: 5,
          comment: '',
        })
      )
    }
  }
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-[#F5F1EA]">
      <div className="rounded-3xl border border-[#E5E5E5] bg-white shadow-sm overflow-hidden">
        <div className="relative px-5 sm:px-8 py-6 sm:py-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F1EA] via-white to-[#F5F1EA]" />
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
                Reviews &amp; Ratings
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-xl">
                Share your experience with Lamp &amp; Glow products and explore what other customers are saying.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-600">Sort by:</span>
              <select
                value={reviewSortBy}
                onChange={(e) => setReviewSortBy(e.target.value)}
                className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
              >
                <option value="recent">Most recent</option>
                <option value="rating">Highest rating</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1.8fr] gap-6 items-start">
            <form
              onSubmit={submitReview}
              className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4 text-xs sm:text-sm shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-stone-900">Leave a Review</h2>
                <span className="hidden sm:inline-flex rounded-full bg-[#F5F1EA] px-3 py-1 text-[11px] font-semibold text-[#5A2D0C] ring-1 ring-[#FFD400]/30">
                  We read every review
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1" htmlFor="productId">
                  Product
                </label>
                <select
                  id="productId"
                  value={reviewForm.productId}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      productId: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-[11px] font-medium text-stone-600 mb-1"
                    htmlFor="reviewerName"
                  >
                    Your name
                  </label>
                  <input
                    id="reviewerName"
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1" htmlFor="rating">
                    Rating
                  </label>
                  <select
                    id="rating"
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        rating: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} star{value > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1" htmlFor="comment">
                  Your review
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#FFD400]"
                />
              </div>
              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center rounded-full bg-[#5A2D0C] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#FFD400] hover:text-[#222222] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
              >
                Submit Review
              </button>
              <p className="text-[11px] text-stone-500">
                Reviews are saved to your Lamp & Glow account and product history.
              </p>
            </form>

            <div>
              {sortedReviews.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-xs sm:text-sm text-stone-600">
                  <p>No reviews yet. Be the first to share your Lamp &amp; Glow experience.</p>
                </div>
              ) : (
                <ul className="py-2">
                  {sortedReviews.map((review, index) => {
                    const product = products.find((p) => p.id === review.productId)
                    const tilt = TILTS[index % TILTS.length]
                    const initials = getInitials(review.name)
                    const avatarColor = getAvatarColor(review.name)
                    const showNew = isNew(review.createdAt)

                    return (
                      <li
                        key={review.id}
                        style={{ zIndex: index + 1 }}
                        className={`group relative ${index === 0 ? '' : '-mt-4'} ${tilt} rounded-3xl border border-stone-200 bg-white p-5 text-xs sm:text-sm shadow-sm transition-all duration-300 hover:rotate-0 hover:-translate-y-1 hover:shadow-lg hover:z-50 motion-reduce:transform-none motion-reduce:transition-none`}
                      >
                        {/* decorative report-style marker, like a verified-listing icon */}
                        <span className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border border-stone-300 text-[10px] font-semibold text-stone-400">
                          !
                        </span>

                        <div className="flex items-start gap-3 pr-6">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor}`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-blue-700 truncate">
                              {review.name || 'Anonymous'}
                            </p>
                            <p className="text-[11px] text-stone-500 truncate">
                              {product?.name ?? 'Lamp & Glow product'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[#FFD400] text-sm leading-none">
                            {'★'.repeat(review.rating)}
                            <span className="text-stone-300">{'★'.repeat(5 - review.rating)}</span>
                          </span>
                          <span className="text-[11px] text-stone-500">{getRelativeTime(review.createdAt)}</span>
                          {showNew && (
                            <span className="inline-flex items-center rounded-md border border-stone-300 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600">
                              NEW
                            </span>
                          )}
                        </div>

                        {review.adminReply && (
                          <div className="mt-4 rounded-2xl border border-[#DCCCBD] bg-[#F7F4EF] p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3A2117] text-[9px] font-bold text-white">
                                L&G
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#3A2117]">
                                  Lamp & Glow Reply
                                </p>

                                <p className="mt-1.5 text-xs leading-5 text-[#5F4C42]">
                                  {review.adminReply}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}