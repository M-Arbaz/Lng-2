'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from '@/lib/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
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
    month: 'long',
    year: 'numeric',
  })
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function BlogDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true)
        setError('')

        const data =
          await blogsService.getBlogBySlug(slug)

        setBlog(data)
      } catch (err) {
        console.error(
          'Failed to load journal story:',
          err
        )

        setError(
          'This journal story could not be found.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBlog()
  }, [slug])

  const readingTime = useMemo(() => {
    const words = stripHtml(
      blog?.content || ''
    )
      .split(/\s+/)
      .filter(Boolean).length

    return Math.max(
      1,
      Math.ceil(words / 220)
    )
  }, [blog?.content])

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
              Loading story...
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !blog) {
    return (
      <main className="min-h-[70vh] bg-[#F7F4EF] px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-xl rounded-[28px] border border-[#3A2117]/10 bg-[#FFFEFC] px-6 py-14 text-center shadow-[0_14px_40px_rgba(58,33,23,0.05)]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
            <FileText
              size={22}
              strokeWidth={1.5}
            />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-[#281912]">
            Story not found
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#8A7569]">
            {error ||
              'This journal story is no longer available.'}
          </p>

          <Link
            to="/blogs"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#3A2117] px-6 text-xs font-semibold text-white transition-colors hover:bg-[#4A2B1F]"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.8}
            />

            Back to Journal
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full bg-[#F7F4EF] text-[#281912]">

      {/* ───────── TOP NAV ───────── */}
      <section className="border-b border-[#3A2117]/10 bg-[#EEE5DC]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex min-h-[40px] items-center gap-2
              rounded-full border border-[#3A2117]/12
              bg-[#FFFEFC] px-4
              text-[11px] font-semibold text-[#3A2117]
              transition-colors
              hover:border-[#6B4228]/30
              hover:bg-[#F7F4EF]
            "
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.8}
            />

            Back
          </button>

          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B4228] transition-colors hover:text-[#3A2117]"
          >
            The Journal

            <ArrowUpRight
              size={13}
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </section>

      {/* ───────── ARTICLE HEADER ───────── */}
      <section className="border-b border-[#3A2117]/10 bg-[#FFFEFC]">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-10 text-center sm:px-6 sm:py-12 lg:px-10 lg:py-14">

          <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#F2ECE5] text-[#6B4228]">
            <BookOpen
              size={16}
              strokeWidth={1.6}
            />
          </div>

          {blog.category && (
            <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#8A654D]">
              {blog.category}
            </p>
          )}

          <h1 className="mx-auto mt-3 max-w-4xl text-[clamp(2rem,5vw,4.3rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-[#281912]">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[#746359] sm:text-[15px]">
              {blog.excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {blog.publishedAt && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[#8A7569]">
                <CalendarDays
                  size={13}
                  strokeWidth={1.6}
                />

                {formatPublishedDate(
                  blog.publishedAt
                )}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 text-[10px] text-[#8A7569]">
              <Clock3
                size={13}
                strokeWidth={1.6}
              />

              {readingTime} min read
            </span>
          </div>

          {Array.isArray(blog.tags) &&
            blog.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#3A2117]/10 bg-[#F7F4EF] px-3 py-1.5 text-[9px] font-medium text-[#6B5A50]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
        </div>
      </section>

      {/* ───────── HERO IMAGE ───────── */}
      {blog.featuredImage && (
        <section className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-6 sm:pt-10 lg:px-10">
          <div className="relative overflow-hidden rounded-[28px] bg-[#E9E0D8] shadow-[0_18px_50px_rgba(58,33,23,0.08)]">
            <div className="aspect-[16/7] min-h-[260px] max-h-[620px]">
              <img
                src={blog.featuredImage}
                alt={
                  blog.imageAltText ||
                  blog.title
                }
                className="h-full w-full object-cover"
              />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#281912]/20 via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
              Lamp &amp; Glow Journal
            </div>
          </div>
        </section>
      )}

      {/* ───────── ARTICLE CONTENT ───────── */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        <article className="mx-auto max-w-[860px]">

          <div
            className="
              page-content
              max-w-none
              break-words
              text-[14px]
              leading-7
              text-[#5F4C42]
              sm:text-[15px]

              [&_*]:max-w-full

              [&_h1]:!mb-4
              [&_h1]:!mt-10
              [&_h1]:!text-3xl
              [&_h1]:!font-semibold
              [&_h1]:!leading-tight
              [&_h1]:!tracking-[-0.03em]
              [&_h1]:!text-[#281912]

              [&_h2]:!mb-3
              [&_h2]:!mt-9
              [&_h2]:!text-2xl
              [&_h2]:!font-semibold
              [&_h2]:!leading-tight
              [&_h2]:!tracking-[-0.025em]
              [&_h2]:!text-[#281912]

              [&_h3]:!mb-2
              [&_h3]:!mt-7
              [&_h3]:!text-lg
              [&_h3]:!font-semibold
              [&_h3]:!text-[#3A2117]

              [&_p]:!mb-5
              [&_p]:!leading-7

              [&_strong]:!font-semibold
              [&_strong]:!text-[#3A2117]

              [&_a]:!font-medium
              [&_a]:!text-[#6B4228]
              [&_a]:underline
              [&_a]:underline-offset-4

              [&_ul]:!my-5
              [&_ol]:!my-5
              [&_li]:!mb-2
              [&_li]:!leading-7

              [&_blockquote]:!my-8
              [&_blockquote]:!rounded-r-2xl
              [&_blockquote]:!border-l-4
              [&_blockquote]:!border-[#6B4228]
              [&_blockquote]:!bg-[#EEE5DC]
              [&_blockquote]:!px-6
              [&_blockquote]:!py-5
              [&_blockquote]:!text-[#5F4C42]

              [&_img]:!mx-auto
              [&_img]:!my-8
              [&_img]:!h-auto
              [&_img]:!rounded-[22px]

              [&_hr]:!my-10
              [&_hr]:!border-[#3A2117]/10

              [&_table]:block
              [&_table]:max-w-full
              [&_table]:overflow-x-auto
            "
            style={{
              overflowWrap: 'anywhere',
            }}
            dangerouslySetInnerHTML={{
              __html: blog.content || '',
            }}
          />

          {/* ───────── ARTICLE FOOTER ───────── */}
          <div className="mt-12 border-t border-[#3A2117]/10 pt-7">
            <div className="flex flex-col gap-5 rounded-[24px] bg-[#EEE5DC] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
                  Lamp &amp; Glow Journal
                </p>

                <p className="mt-1.5 text-sm font-semibold text-[#281912]">
                  More stories, ideas & inspiration
                </p>
              </div>

              <Link
                to="/blogs"
                className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#3A2117] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#4A2B1F]"
              >
                Explore Journal

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}