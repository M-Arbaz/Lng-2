'use client'

import ReviewsSection from '@/sections/ReviewsSection'
import { useAppState } from '@/context/AppStateContext'

export default function ReviewsRoute() {
  const app =
    useAppState()

  return (
    <ReviewsSection
      products={app.products}
      reviewForm={app.reviewForm}
      reviewSortBy={
        app.reviewSortBy
      }
      setReviewForm={
        app.setReviewForm
      }
      setReviewSortBy={
        app.setReviewSortBy
      }
      sortedReviews={
        app.sortedReviews
      }
      handleSubmitReview={
        app.handleSubmitReview
      }
      user={app.user}
      isLoggedIn={
        app.isLoggedIn()
      }
    />
  )
}