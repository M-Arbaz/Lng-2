'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/lib/navigation'
import { Loader2, ArrowRight, BookOpen } from 'lucide-react'
import blogsService from '../utils/blogsService.js'

export default function HomeBlogs({
  onLoadComplete,
}) {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true)
        const data = await blogsService.getHomepageBlogs(4)
        setBlogs(data)
      } catch (e) {
        console.error('Error loading homepage blogs:', e)
      } finally {
        setLoading(false)

        if (typeof onLoadComplete === 'function') {
          onLoadComplete(true)
        }
      }
    }
    loadBlogs()
  }, [])

  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FFD400]" />
        </div>
      </section>
    )
  }

  if (blogs.length === 0) return null

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-[#FFD400]" />
              <span className="text-xs font-semibold text-[#FFD400] uppercase tracking-wider">From Our Blog</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-900">
              Latest Tips & Inspiration
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-xl">
              Discover lighting ideas, home decor inspiration, and expert advice from Lamp & Glow.
            </p>
          </div>
          <Link
            to="/blogs"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#FFD400] hover:text-[#5A2D0C] transition"
          >
            View all blogs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all hover:border-stone-300"
            >
              <Link
                to={`/blog/${blog.slug || blog.id}`}
                className="absolute inset-0 z-10"
                aria-label={`Read ${blog.title}`}
              />
              <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={blog.featuredImage || 'https://images.pexels.com/photos/112811/pexels-photo-112811.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={blog.imageAltText || blog.title}
                  className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                {blog.category && (
                  <span className="inline-block text-[10px] font-semibold text-[#5A2D0C] bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wide mb-2">
                    {blog.category}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug">
                  {blog.title}
                </h3>
                <p className="mt-2 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {blog.excerpt}
                </p>
                <div className="relative z-20 mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#FFD400]">
                  Read more
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#FFD400] hover:text-[#5A2D0C] transition"
          >
            View all blogs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}