'use client'

import { Link } from '@/lib/navigation'
import { useEffect, useRef, useState } from 'react'
import aboutService from '../utils/aboutService'
import { Loader2 } from 'lucide-react'

/* ────────── Animated counter ────────── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true
          const start = Date.now()
          const tick = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}

/* ────────── Floating particle backgrounds ────────── */
function Particles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth
      canvas.height = canvas.parentElement.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 218, 3, ${p.alpha})`
        ctx.fill()
      })
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}

/* ────────── Team member card ────────── */
const team = [
  {
    name: 'Ayesha Khan',
    role: 'Founder & Creative Director',
    img: null,
    bio: 'With a passion for handcrafted design, Ayesha founded Lamp & Glow to bring warm, soulful lighting into every home.',
    color: 'from-[#F5F1EA]0/30',
  },
  {
    name: 'Usman Ali',
    role: 'Head of Craftsmanship',
    img: null,
    bio: '20+ years of woodworking experience. Usman ensures every piece meets the highest standards of quality.',
    color: 'from-amber-400/30',
  },
  {
    name: 'Zara Tariq',
    role: 'Customer Experience Lead',
    img: null,
    bio: 'Zara makes sure every customer feels valued, heard, and delighted from order to delivery.',
    color: 'from-yellow-500/30',
  },
]

/* ────────── Timeline milestones ────────── */
const milestones = [
  { year: '2021', title: 'The Spark', desc: 'Lamp & Glow was born in a small workshop, crafting the very first wooden lamp by hand.' },
  { year: '2022', title: 'First 100 Orders', desc: 'Word spread fast. We shipped our first 100 orders — each one packed with care and gratitude.' },
  { year: '2023', title: 'Expanded Collection', desc: 'From lamps to tables and decor, our collection grew alongside our community of makers.' },
  { year: '2024', title: '5,000+ Happy Homes', desc: 'Over 5,000 homes now glow with our handcrafted pieces. We partnered with local artisans.' },
  { year: '2025', title: 'Online Store Launch', desc: 'We launched lampandglow.pk to share our craft with the world — one carefully lit room at a time.' },
]

/* ────────── Brand values ────────── */
const values = [
  { icon: '🪵', title: 'Authentic Craft', desc: 'Every piece is thoughtfully handcrafted with natural materials, celebrating the beauty of imperfection.' },
  { icon: '🎨', title: 'Timeless Design', desc: 'We design for longevity — pieces that transcend trends and feel right at home for years.' },
  { icon: '🤝', title: 'Community First', desc: 'We collaborate with local artisans and invest in the people who bring our vision to life.' },
  { icon: '🌱', title: 'Sustainable Mindset', desc: 'From responsibly sourced wood to minimal waste packaging, we care for the planet as much as our craft.' },
]

/* ────────── Main component ────────── */
export default function AboutPage({ theme }) {
  const isDark = theme === 'dark'
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await aboutService.getAboutPage()
        if (data) setPageData(data)
      } catch (e) {
        console.error('Error loading about page:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD400]" />
      </div>
    )
  }

  return (
    <div className={isDark ? 'bg-[#1F1F1F] text-stone-100' : 'bg-[#FAFAF8] text-stone-900'}>

      {/* ════════════════════ HERO SECTION ════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/70 via-[#5A2D0C] to-stone-900" />
        <Particles />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold text-[#FFD400] border border-amber-400/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Our Story
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              We Believe Every{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                Home Deserves Warmth
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl">
              Lamp & Glow is more than a brand — it's a celebration of craftsmanship, light, and the
              beauty of natural materials. We create handcrafted wooden decor that turns houses into
              warm, inviting homes.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 rounded-full bg-[#F5F1EA]0 hover:bg-[#FFD400] text-stone-900 font-bold px-6 py-3 text-sm transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98]"
              >
                Explore Collection
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:border-white/40 text-white/80 hover:text-white px-6 py-3 text-sm font-semibold transition-all duration-200"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative bottom curve */}
        <div className="relative z-10 -mb-1">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto">
            <path d="M0 80V40C240 0 480 20 720 40C960 60 1200 40 1440 20V80H0Z" className="fill-[#FAFAF8] dark:fill-[#1F1F1F]" />
          </svg>
        </div>
      </section>

      {/* ════════════════════ STATS SECTION ════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { end: 8, suffix: 'K+', label: 'Happy Customers' },
              { end: 5, suffix: '00+', label: 'Products Crafted' },
              { end: 4, suffix: '.9★', label: 'Average Rating' },
              { end: 3, suffix: '+', label: 'Years of Craft' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-amber-600 to-amber-400 bg-clip-text text-transparent">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ STORY SECTION ════════════════════ */}
      <section className="py-16 sm:py-20 bg-white/50 dark:bg-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image side */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-amber-200 to-amber-600 shadow-2xl">
                <div className="h-full w-full flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI4MCIgc3Ryb2tlPSIjZmZkYTAzIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMyIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNjAiIHN0cm9rZT0iI2ZmZGEwMyIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjIiLz48cGF0aCBkPSJNMTAwIDIwbC0zMCAyMGwxMCAzMGwtMjAgMTBsMTAgMzAgLTIwIDEwaDMwbDEwIDMwaDMwbDEwIC0zMGgzMGwtMjAgLTEwIDEwIC0zMCAtMjAgLTEwIDEwIC0zMCAtMzAgLTIweiIgZmlsbD0iI2ZmZGEwMyIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] bg-repeat opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-white/10 backdrop-blur border-2 border-amber-400/30 flex items-center justify-center shadow-2xl">
                      <span className="text-4xl sm:text-5xl">💡</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-[#F5F1EA]0 text-stone-900 rounded-2xl px-5 py-3 shadow-xl">
                <p className="text-xs font-bold">Handcrafted</p>
                <p className="text-lg font-black">with ❤️</p>
              </div>
            </div>

            {/* Text side */}
            <div>
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#FFD400]">Our Journey</span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight">
                From a Small Workshop to{' '}
                <span className="text-[#FFD400]">Your Living Room</span>
              </h2>
              <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300">
                <p>
                  Lamp & Glow started with a simple idea: that light is more than illumination — it's atmosphere,
                  mood, and the soul of a room. Our founder, Ayesha, began shaping wooden lamp bases in her small
                  workshop in Lahore, driven by a love for natural materials and timeless design.
                </p>
                <p>
                  What began as a personal project quickly turned into a community. Friends, family, and eventually
                  strangers fell in love with the warmth of our handcrafted pieces. Each lamp, table, and decor item
                  tells a story — of skilled hands, careful attention, and a deep respect for the materials.
                </p>
                <p>
                  Today, we work with a team of passionate artisans across Pakistan, creating pieces that
                  blend traditional woodworking techniques with contemporary design sensibilities. Every order
                  is a collaboration between our makers and your home.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-stone-800 bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-xs font-bold text-white shadow-md"
                    >
                      {['A', 'U', 'Z', 'K'][i - 1]}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-200">4 passionate</span> team members
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ VALUES SECTION ════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#FFD400]">What We Stand For</span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold">Our Core Values</h2>
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
              Every decision we make is guided by these principles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="group relative rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-400/40"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="text-sm font-bold">{v.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ TIMELINE ════════════════════ */}
      <section className="py-16 sm:py-20 bg-white/50 dark:bg-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#FFD400]">Our Milestones</span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold">The Journey So Far</h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400 via-[#F5F1EA]0 to-amber-400/20" />

            {milestones.map((m, idx) => (
              <div
                key={m.year}
                className={`relative flex items-start gap-6 sm:gap-12 mb-12 last:mb-0 ${
                  idx % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#F5F1EA]0 border-4 border-white dark:border-stone-800 z-10 shadow-md" />

                {/* Content */}
                <div className={`ml-12 sm:ml-0 sm:w-1/2 ${idx % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'}`}>
                  <span className="text-xs font-bold text-[#FFD400]">{m.year}</span>
                  <h3 className="mt-1 text-base font-bold">{m.title}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{m.desc}</p>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden sm:block sm:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ TEAM SECTION ════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#FFD400]">The People</span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold">Meet the Team</h2>
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
              A small, passionate team behind every piece that reaches your home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="group relative rounded-2xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Avatar */}
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${member.color} to-amber-200 flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="mt-4 text-sm font-bold">{member.name}</h3>
                <p className="text-xs font-medium text-[#FFD400]">{member.role}</p>
                <p className="mt-3 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CTA SECTION ════════════════════ */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-[#5A2D0C] to-stone-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffda03\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Ready to Bring Warmth{' '}
            <span className="text-amber-400">Into Your Home?</span>
          </h2>
          <p className="mt-4 text-base text-white/70 max-w-xl mx-auto">
            Explore our handcrafted collection and find the perfect piece to light up your space.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 rounded-full bg-[#F5F1EA]0 hover:bg-[#FFD400] text-stone-900 font-bold px-7 py-3.5 text-sm transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98]"
            >
              Shop Now
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white px-7 py-3.5 text-sm font-semibold transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}