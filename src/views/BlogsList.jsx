'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/lib/navigation'
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  FileText,
  Loader2,
} from 'lucide-react'

import blogsService from '../utils/blogsService.js'

function formatPublishedDate(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function BlogsList() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true)
        setError('')

        const data =
          await blogsService.getPublishedBlogs(50)

        setBlogs(data)
      } catch (err) {
        console.error(
          'Failed to load journal:',
          err
        )

        setError(
          'Failed to load the journal. Please try again later.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()
  }, [])

  return (
    <main className="min-h-screen w-full bg-[#F7F4EF] text-[#281912]">

      {/* ───────── HERO ───────── */}
      <section className="border-b border-[#3A2117]/10 bg-[#EEE5DC]">
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-11 pt-11 text-center sm:px-6 sm:pb-13 sm:pt-13 lg:px-10 lg:pb-14 lg:pt-14">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-[#6B4228]/10 bg-[#FFFEFC] text-[#6B4228]">
            <BookOpen
              size={18}
              strokeWidth={1.6}
            />
          </div>

          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8A654D]">
            Lamp &amp; Glow
          </p>

          <h1 className="mt-2.5 text-[clamp(2.3rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#281912]">
            The Journal
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#746359] sm:text-[15px]">
            Stories, inspiration and thoughtful ideas for
            warmer spaces, beautiful lighting and timeless
            interiors.
          </p>

          {!loading && blogs.length > 0 && (
            <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#9A8171]">
              {blogs.length}{' '}
              {blogs.length === 1
                ? 'Story'
                : 'Stories'}
            </p>
          )}
        </div>
      </section>

      {/* ───────── JOURNAL GRID ───────── */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-[#6B4228]"
              />

              <p className="mt-3 text-xs text-[#8A7569]">
                Loading journal...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-xl rounded-[26px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
            <FileText
              size={24}
              className="mx-auto text-rose-600"
            />

            <p className="mt-4 text-sm font-semibold text-rose-900">
              Unable to load the journal
            </p>

            <p className="mt-2 text-xs leading-5 text-rose-700">
              {error}
            </p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-[28px] border border-[#3A2117]/10 bg-[#FFFEFC] px-6 py-16 text-center shadow-[0_12px_36px_rgba(58,33,23,0.04)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
              <BookOpen
                size={22}
                strokeWidth={1.5}
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#281912]">
              Journal stories are coming soon
            </h2>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#8A7569]">
              New stories and inspiration will appear here
              as soon as they are published.
            </p>
          </div>
        ) : (
          <>
            {/* GRID HEADING */}
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8A654D]">
                  Explore the journal
                </p>

                <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-[#281912]">
                  Latest Stories
                </h2>
              </div>

              <p className="hidden text-xs text-[#8A7569] sm:block">
                Ideas worth reading
              </p>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="
                    group
                    overflow-hidden
                    rounded-[24px]
                    border border-[#3A2117]/10
                    bg-[#FFFEFC]
                    shadow-[0_10px_30px_rgba(58,33,23,0.045)]
                    transition-all duration-500
                    hover:-translate-y-1.5
                    hover:shadow-[0_20px_46px_rgba(58,33,23,0.10)]
                  "
                >
                  <Link
                    to={`/blog/${blog.slug || blog.id}`}
                    className="flex h-full flex-col"
                  >

                    {/* IMAGE */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#E9E0D8]">
                      {blog.featuredImage ? (
                        <img
                          src={blog.featuredImage}
                          alt={
                            blog.imageAltText ||
                            blog.title
                          }
                          className="
                            h-full w-full
                            object-cover
                            transition-transform
                            duration-700
                            ease-out
                            group-hover:scale-[1.05]
                          "
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-[#E7DDD4] text-[#8A654D]">
                          <BookOpen
                            size={30}
                            strokeWidth={1.3}
                          />
                        </div>
                      )}

                      {/* CATEGORY ON IMAGE */}
                      {blog.category && (
                        <span
                          className="
                            absolute left-4 top-4
                            rounded-full
                            border border-white/25
                            bg-black/25
                            px-3 py-1.5
                            text-[8px] font-semibold
                            uppercase tracking-[0.14em]
                            text-white
                            backdrop-blur-md
                          "
                        >
                          {blog.category}
                        </span>
                      )}

                      {/* ARROW */}
                      <div
                        className="
                          absolute right-4 top-4
                          grid h-9 w-9
                          place-items-center
                          rounded-full
                          border border-white/25
                          bg-black/20
                          text-white
                          backdrop-blur-md
                          transition-all duration-300
                          group-hover:bg-white
                          group-hover:text-[#3A2117]
                        "
                      >
                        <ArrowUpRight
                          size={15}
                          strokeWidth={1.8}
                          className="
                            transition-transform
                            duration-300
                            group-hover:-translate-y-0.5
                            group-hover:translate-x-0.5
                          "
                        />
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex flex-1 flex-col p-5">

                      {blog.publishedAt && (
                        <div className="flex items-center gap-1.5 text-[9px] text-[#9A8171]">
                          <CalendarDays
                            size={12}
                            strokeWidth={1.6}
                          />

                          {formatPublishedDate(
                            blog.publishedAt
                          )}
                        </div>
                      )}

                      <h2
                        className="
                          mt-2.5
                          line-clamp-2
                          text-[17px]
                          font-semibold
                          leading-[1.35]
                          tracking-[-0.025em]
                          text-[#281912]
                          transition-colors
                          group-hover:text-[#6B4228]
                        "
                      >
                        {blog.title}
                      </h2>

                      {blog.excerpt && (
                        <p className="mt-2.5 line-clamp-3 text-[11px] leading-5 text-[#746359]">
                          {blog.excerpt}
                        </p>
                      )}

                      {/* PUSH CTA TO BOTTOM */}
                      <div className="mt-auto pt-5">
                        <div className="flex items-center justify-between border-t border-[#3A2117]/10 pt-4">
                          <span className="text-[10px] font-semibold text-[#3A2117]">
                            Read Story
                          </span>

                          <span
                            className="
                              inline-flex items-center gap-1.5
                              text-[9px] font-medium
                              text-[#8A654D]
                            "
                          >
                            Journal
                            <ArrowUpRight
                              size={11}
                              strokeWidth={1.8}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}