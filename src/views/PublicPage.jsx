'use client'

import { useState, useEffect } from 'react'
import { useParams, Link } from '@/lib/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import pagesService from '../utils/pagesService'
import PublicContentLayout from '../components/PublicContentLayout'
export default function PublicPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true)
        setError(null)
        const pageData = await pagesService.getPageBySlug(slug)
        if (!pageData) {
          setError('Page not found')
          setPage(null)
        } else {
          setPage(pageData)
        }
      } catch (err) {
        console.error('Error loading page:', err)
        setError('Failed to load page')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto text-[#FFD400] mb-4" />
          <p className="text-stone-500">Loading page...</p>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-[#E53935] mb-4" />
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Page Not Found</h1>
          <p className="text-stone-600 mb-6">{error || 'The page you are looking for does not exist.'}</p>
          <Link
            to="/"
            className="inline-block bg-[#5A2D0C] hover:bg-[#FFD400] text-white font-semibold py-2 px-6 rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PublicContentLayout
      title={page.title}
      description={page.description}
      content={page.content}
      emptyMessage="This page does not have any published content yet."
    />
  )
}