'use client'

import { useState, useEffect, useRef } from 'react'
import { Link } from '@/lib/navigation'
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ChevronRight,
  Send,
  CheckCircle,
  Loader2,
  Smartphone,
} from 'lucide-react'
import contactSubmissionsService from '../utils/contactSubmissionsService.js'
import contactPageService from '../utils/contactPageService.js'

const DEFAULT_CONTENT = {
  pageTitle: 'CONTACT US',
  subtitle: 'GET IN TOUCH',
  description:
    "We love to hear from our valuable customers. Contact us today and let us show you how our incredible pieces of art helping you out to lighten up your homes.",
  formTitle: 'Send us an email',
  formSubtitle: "Ask us anything! We're here to help.",
  liveHelpTitle: 'Live Help',
  liveHelpText:
    "If you have an issue or question that requires immediate assistance, you can click the button below to chat live with a Customer Service representative. If we aren't available, drop us an email to the left and we will get back to you within 20-36 hours!",
  whatsappLink: 'https://wa.me/3020521000',
  phoneText: 'TEXT: 302-052-1000',
  email: 'support@lampandglow.com',
  address: '45 West Road\nNewcastle Upon Tyne, NE4 9PX\nUnited Kingdom',
  showOpeningHours: true,
  openingHours: 'MON to SAT: 9:00AM - 10:00PM\nSUN: 10:00AM - 6:00PM',
  whatsappButtonText: 'Message Us',
  submitButtonText: 'Submit Comment!',
}

/* ────────── Floating particles background ────────── */
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

    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.3 + 0.1,
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

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
}

export default function ContactUsPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    comment: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [contentLoading, setContentLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await contactPageService.getContactPage()
        if (data) {
          setContent((prev) => ({ ...prev, ...data }))
        }
      } catch (err) {
        console.error('Error loading contact page content:', err)
      } finally {
        setContentLoading(false)
      }
    }
    loadContent()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await contactSubmissionsService.createSubmission(form)
      setSubmitted(true)
      setForm({ name: '', phone: '', email: '', comment: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error('Error submitting contact form:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderAddress = () => {
    if (!content.address) return null
    return content.address.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.address.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  const renderOpeningHours = () => {
    if (!content.openingHours) return null
    return content.openingHours.split('\n').map((line, i) => (
      <p key={i}>{line}</p>
    ))
  }

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: content.phoneText, href: `tel:${content.phoneText?.replace(/\D/g, '')}` },
    { icon: Mail, label: 'Email', value: content.email, href: `mailto:${content.email}` },
    { icon: MapPin, label: 'Address', value: renderAddress(), href: null },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900/70 via-[#5A2D0C] to-stone-900 py-20 sm:py-28">
        <Particles />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold text-[#FFD400] border border-amber-400/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {content.pageTitle}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {content.subtitle}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>
        {/* Bottom curve */}
        <div className="relative z-10 -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60V30C240 0 480 15 720 30C960 45 1200 30 1440 15V60H0Z" className="fill-[#FAFAF8]" />
          </svg>
        </div>
      </section>

      {/* ════════════════════ CONTACT CARDS ════════════════════ */}
      <section className="-mt-10 relative z-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {contactInfo.map((info) => (
              info.value ? (
                <div
                  key={info.label}
                  className="group bg-white rounded-2xl shadow-lg border border-stone-200 p-5 sm:p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#F5F1EA] flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <info.icon className="w-5 h-5 text-[#FFD400]" />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="mt-1 text-sm font-bold text-stone-900 hover:text-[#5A2D0C] transition block">
                      {info.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-bold text-stone-900">{info.value}</p>
                  )}
                </div>
              ) : null
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ MAIN CONTENT ════════════════════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

            {/* ─── Form (3/5 width) ─── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#F5F1EA] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[#FFD400]" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">{content.formTitle}</h3>
                </div>
                <p className="text-sm text-stone-500 ml-11">{content.formSubtitle}</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full h-12 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full h-12 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-all"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full h-12 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-all"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="comment"
                      value={form.comment}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-all resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {submitted && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                      <p className="text-sm text-green-700 font-medium">
                        Thank you! Your message has been sent successfully. We'll get back to you within 20-36 hours.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5F1EA]0 to-amber-400 px-8 text-sm font-bold text-stone-900 shadow-md transition-all duration-200 hover:shadow-lg hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : submitted ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Sent!
                      </>
                    ) : (
                      <>
                        {content.submitButtonText}
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* ─── Right Sidebar (2/5 width) ─── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Help Card */}
              <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-6 sm:p-8">
                <div className="w-14 h-14 rounded-full bg-[#F5F1EA] flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-[#FFD400]" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">{content.liveHelpTitle}</h3>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">
                  {content.liveHelpText}
                </p>

                {content.whatsappLink && (
                  <a
                    href={content.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:from-emerald-400 hover:to-emerald-300 active:scale-[0.98]"
                  >
                    <Smartphone className="w-4 h-4" />
                    {content.whatsappButtonText}
                  </a>
                )}

                <div className="mt-8 space-y-4 pt-6 border-t border-stone-100">
                  {content.phoneText && (
                    <div className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F1EA] flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                        <Phone className="w-4 h-4 text-[#FFD400]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Phone</p>
                        <p className="text-sm font-medium text-stone-800">{content.phoneText}</p>
                      </div>
                    </div>
                  )}

                  {content.email && (
                    <div className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F1EA] flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                        <Mail className="w-4 h-4 text-[#FFD400]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Email</p>
                        <a href={`mailto:${content.email}`} className="text-sm font-medium text-[#5A2D0C] hover:underline">
                          {content.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {content.address && (
                    <div className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F1EA] flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                        <MapPin className="w-4 h-4 text-[#FFD400]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Address</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{renderAddress()}</p>
                      </div>
                    </div>
                  )}
                </div>

                {content.showOpeningHours && content.openingHours && (
                  <div className="mt-6 pt-6 border-t border-stone-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-[#FFD400]" />
                      <span className="text-sm font-bold text-stone-800">
                        Opening Hours
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-stone-600 leading-relaxed">
                      {renderOpeningHours()}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Links Card */}
              <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-6 sm:p-8">
                <h3 className="text-sm font-bold text-stone-900 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: 'About Us', to: '/about-us' },
                    { label: 'Our Collections', to: '/collections' },
                    { label: 'Shipping Policy', to: '/shipping-policy' },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center justify-between group px-4 py-3 rounded-xl hover:bg-[#F5F1EA] transition-colors"
                    >
                      <span className="text-sm font-medium text-stone-700 group-hover:text-[#5A2D0C] transition-colors">
                        {link.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#FFD400] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}