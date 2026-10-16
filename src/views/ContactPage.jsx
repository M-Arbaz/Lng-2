'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Headphones,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react'

import {
  useNavigate,
} from '@/lib/navigation'

import contactSubmissionsService from '../utils/contactSubmissionsService'

import contactPageService, {
  normalizeContactPage,
} from '../utils/contactPageService'

export default function ContactPage({
  theme = 'light',
}) {
  const navigate =
    useNavigate()

  const isDark =
    theme === 'dark'

  const [
    content,
    setContent,
  ] = useState(() =>
    normalizeContactPage()
  )

  const [
    settingsLoading,
    setSettingsLoading,
  ] = useState(true)

  const [form, setForm] =
    useState({
      name: '',
      email: '',
      phone: '',
      message: '',
    })

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    submitMessage,
    setSubmitMessage,
  ] = useState({
    type: '',
    text: '',
  })

  useEffect(() => {
    const unsubscribe =
      contactPageService.subscribeContactPage(
        (data) => {
          setContent(
            normalizeContactPage(
              data
            )
          )

          setSettingsLoading(
            false
          )
        },

        (error) => {
          console.error(
            'Contact page settings error:',
            error
          )

          /*
           * Defaults remain visible if
           * Firestore settings cannot load.
           */
          setSettingsLoading(
            false
          )
        }
      )

    return unsubscribe
  }, [])

  const phoneHref =
    useMemo(() => {
      const clean =
        String(
          content.phoneText ||
          ''
        )
          .replace(
            /[^\d+]/g,
            ''
          )
          .trim()

      return clean
        ? `tel:${clean}`
        : ''
    }, [
      content.phoneText,
    ])

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (
      submitMessage.text
    ) {
      setSubmitMessage({
        type: '',
        text: '',
      })
    }
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      const name =
        form.name.trim()

      const email =
        form.email.trim()

      const phone =
        form.phone.trim()

      const comment =
        form.message.trim()

      if (
        !name ||
        !email ||
        !comment
      ) {
        setSubmitMessage({
          type: 'error',

          text:
            'Please enter your name, email and message.',
        })

        return
      }

      try {
        setSubmitting(true)

        setSubmitMessage({
          type: '',
          text: '',
        })

        await contactSubmissionsService.createSubmission({
          name,
          email,
          phone,
          comment,

          source:
            'contact-page',
        })

        setForm({
          name: '',
          email: '',
          phone: '',
          message: '',
        })

        setSubmitMessage({
          type: 'success',

          text:
            content.successMessage ||
            'Thank you. Your message has been sent successfully.',
        })
      } catch (error) {
        console.error(
          'Contact form submission failed:',
          error
        )

        setSubmitMessage({
          type: 'error',

          text:
            error?.message ||
            'Your message could not be sent. Please try again.',
        })
      } finally {
        setSubmitting(false)
      }
    }

  const inputClass =
    isDark
      ? 'h-11 w-full rounded-xl border border-[#4B3930] bg-[#251A15] px-4 text-sm text-[#FFF8F1] outline-none transition placeholder:text-[#806F65] focus:border-[#D8AD87] focus:ring-2 focus:ring-[#D8AD87]/15'
      : 'h-11 w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

  const textAreaClass =
    isDark
      ? 'w-full resize-none rounded-xl border border-[#4B3930] bg-[#251A15] px-4 py-3 text-sm leading-6 text-[#FFF8F1] outline-none transition placeholder:text-[#806F65] focus:border-[#D8AD87] focus:ring-2 focus:ring-[#D8AD87]/15'
      : 'w-full resize-none rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm leading-6 text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

  const labelClass =
    isDark
      ? 'text-[#D7C8BE]'
      : 'text-[#4E3D34]'

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${isDark
          ? 'bg-[#171310]'
          : 'bg-[#F7F4EF]'
        }`}
    >
      <section className="w-full px-0 py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className={`inline-flex items-center gap-2 text-xs font-semibold transition ${isDark
                ? 'text-[#D8AD87] hover:text-[#F1CBA9]'
                : 'text-[#6B4228] hover:text-[#3A2117]'
              }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {settingsLoading && (
            <div
              className={`mt-5 inline-flex items-center gap-2 text-xs ${isDark
                  ? 'text-[#A99487]'
                  : 'text-[#8A7467]'
                }`}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />

              Loading contact information...
            </div>
          )}

          <div className="mt-7 grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-10">
            {/* LEFT */}
            <div className="min-w-0">
              {content.subtitle && (
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark
                      ? 'text-[#D8AD87]'
                      : 'text-[#8A654D]'
                    }`}
                >
                  {content.subtitle}
                </p>
              )}

              <h1
                className={`mt-3 break-words text-3xl font-semibold tracking-[-0.035em] sm:text-4xl ${isDark
                    ? 'text-[#FFF8F1]'
                    : 'text-[#281912]'
                  }`}
              >
                {content.pageTitle}
              </h1>

              {content.description && (
                <p
                  className={`mt-4 max-w-xl whitespace-pre-line break-words text-sm leading-7 sm:text-[15px] ${isDark
                      ? 'text-[#BDAEA5]'
                      : 'text-[#6F5E54]'
                    }`}
                >
                  {content.description}
                </p>
              )}

              {/* Support Card */}
              <div
                className={`mt-7 rounded-3xl border p-5 shadow-[0_12px_35px_rgba(58,33,23,0.05)] sm:p-6 ${isDark
                    ? 'border-[#49352B] bg-[#251A15]'
                    : 'border-[#E2D6CE] bg-[#FFFEFC]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark
                        ? 'bg-[#35251E] text-[#D8AD87]'
                        : 'bg-[#F0E8E1] text-[#6B4228]'
                      }`}
                  >
                    <Headphones className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`break-words text-sm font-semibold ${isDark
                          ? 'text-[#FFF8F1]'
                          : 'text-[#281912]'
                        }`}
                    >
                      {content.supportTitle}
                    </p>

                    {content.supportSubtitle && (
                      <p
                        className={`mt-0.5 text-xs ${isDark
                            ? 'text-[#9F8F85]'
                            : 'text-[#8A7467]'
                          }`}
                      >
                        {content.supportSubtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {content.email && (
                    <ContactDetail
                      icon={Mail}
                      label="Email"
                      value={content.email}
                      href={`mailto:${content.email}`}
                      isDark={isDark}
                    />
                  )}

                  {content.phoneText && (
                    <ContactDetail
                      icon={Phone}
                      label="Phone / WhatsApp"
                      value={content.phoneText}
                      href={phoneHref}
                      isDark={isDark}
                    />
                  )}

                  {content.address && (
                    <ContactDetail
                      icon={MapPin}
                      label="Location"
                      value={content.address}
                      isDark={isDark}
                    />
                  )}
                </div>

                {/* Opening Hours */}
                {content.showOpeningHours &&
                  content.openingHours && (
                    <div
                      className={`mt-6 border-t pt-5 ${isDark
                          ? 'border-[#49352B]'
                          : 'border-[#EEE5DF]'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock
                          className={`h-4 w-4 ${isDark
                              ? 'text-[#D8AD87]'
                              : 'text-[#6B4228]'
                            }`}
                        />

                        <p
                          className={`text-sm font-semibold ${isDark
                              ? 'text-[#FFF8F1]'
                              : 'text-[#281912]'
                            }`}
                        >
                          Opening Hours
                        </p>
                      </div>

                      <p
                        className={`mt-3 whitespace-pre-line text-xs leading-6 ${isDark
                            ? 'text-[#A99487]'
                            : 'text-[#7B685D]'
                          }`}
                      >
                        {content.openingHours}
                      </p>
                    </div>
                  )}

                {/* Live Help */}
                {content.showLiveHelp && (
                  <div
                    className={`mt-6 border-t pt-5 ${isDark
                        ? 'border-[#49352B]'
                        : 'border-[#EEE5DF]'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare
                        className={`h-4 w-4 ${isDark
                            ? 'text-[#D8AD87]'
                            : 'text-[#6B4228]'
                          }`}
                      />

                      <h2
                        className={`text-sm font-semibold ${isDark
                            ? 'text-[#FFF8F1]'
                            : 'text-[#281912]'
                          }`}
                      >
                        {content.liveHelpTitle}
                      </h2>
                    </div>

                    {content.liveHelpText && (
                      <p
                        className={`mt-2 whitespace-pre-line break-words text-xs leading-6 ${isDark
                            ? 'text-[#A99487]'
                            : 'text-[#7B685D]'
                          }`}
                      >
                        {content.liveHelpText}
                      </p>
                    )}

                    {content.whatsappLink && (
                      <a
                        href={content.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 text-sm font-semibold text-white transition hover:bg-[#281912]"
                      >
                        <MessageSquare className="h-4 w-4" />

                        {content.whatsappButtonText ||
                          'Message Us'}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* FORM */}
            <div
              className={`rounded-3xl border p-5 shadow-[0_18px_50px_rgba(58,33,23,0.07)] sm:p-7 lg:p-8 ${isDark
                  ? 'border-[#49352B] bg-[#211711]'
                  : 'border-[#E2D6CE] bg-[#FFFEFC]'
                }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark
                      ? 'bg-[#35251E] text-[#D8AD87]'
                      : 'bg-[#F0E8E1] text-[#6B4228]'
                    }`}
                >
                  <Send className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h2
                    className={`break-words text-lg font-semibold ${isDark
                        ? 'text-[#FFF8F1]'
                        : 'text-[#281912]'
                      }`}
                  >
                    {content.formTitle}
                  </h2>

                  {content.formSubtitle && (
                    <p
                      className={`mt-1 break-words text-xs leading-5 ${isDark
                          ? 'text-[#9F8F85]'
                          : 'text-[#8A7467]'
                        }`}
                    >
                      {content.formSubtitle}
                    </p>
                  )}
                </div>
              </div>

              <form
                className="mt-6 grid grid-cols-1 gap-4"
                onSubmit={handleSubmit}
              >
                <label className="grid gap-2">
                  <span
                    className={`text-xs font-semibold ${labelClass}`}
                  >
                    Name *
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    disabled={submitting}
                    className={inputClass}
                    placeholder="Your name"
                  />
                </label>

                <label className="grid gap-2">
                  <span
                    className={`text-xs font-semibold ${labelClass}`}
                  >
                    Email *
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    disabled={submitting}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </label>

                <label className="grid gap-2">
                  <span
                    className={`text-xs font-semibold ${labelClass}`}
                  >
                    Phone / WhatsApp
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    disabled={submitting}
                    className={inputClass}
                    placeholder="+92 300 0000000"
                  />
                </label>

                <label className="grid gap-2">
                  <span
                    className={`text-xs font-semibold ${labelClass}`}
                  >
                    Message *
                  </span>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    disabled={submitting}
                    className={textAreaClass}
                    placeholder="Tell us how we can help..."
                  />
                </label>

                {submitMessage.text && (
                  <div
                    className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 ${submitMessage.type ===
                        'success'
                        ? isDark
                          ? 'border-[#31523A] bg-[#1E3024] text-[#A9D3B1]'
                          : 'border-[#CFE1D1] bg-[#F3F9F3] text-[#426649]'
                        : isDark
                          ? 'border-[#633A34] bg-[#301F1C] text-[#E3ADA4]'
                          : 'border-[#E8C9C3] bg-[#FFF4F1] text-[#93483C]'
                      }`}
                  >
                    {submitMessage.type ===
                      'success' ? (
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}

                    <p className="text-xs font-medium leading-5">
                      {submitMessage.text}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${isDark
                      ? 'bg-[#D8AD87] text-[#281912] hover:bg-[#E8C09E]'
                      : 'bg-[#3A2117] text-[#FFFEFC] hover:bg-[#281912]'
                    }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />

                      {content.submitButtonText ||
                        'Send Message'}
                    </>
                  )}
                </button>

                {content.formNote && (
                  <p
                    className={`text-center text-[10px] leading-5 ${isDark
                        ? 'text-[#84756D]'
                        : 'text-[#9A8478]'
                      }`}
                  >
                    {content.formNote}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ContactDetail({
  icon: Icon,
  label,
  value,
  href,
  isDark,
}) {
  const content = (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isDark
            ? 'bg-[#33231C] text-[#D8AD87]'
            : 'bg-[#F7F4EF] text-[#6B4228]'
          }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${isDark
              ? 'text-[#8F8077]'
              : 'text-[#9A8478]'
            }`}
        >
          {label}
        </p>

        <p
          className={`mt-0.5 whitespace-pre-line break-words text-sm font-medium leading-6 ${isDark
              ? 'text-[#DCCDC4]'
              : 'text-[#4E3D34]'
            }`}
        >
          {value}
        </p>
      </div>
    </div>
  )

  if (!href) {
    return content
  }

  return (
    <a
      href={href}
      className={`block rounded-xl p-1 transition ${isDark
          ? 'hover:bg-white/[0.03]'
          : 'hover:bg-[#FAF7F4]'
        }`}
    >
      {content}
    </a>
  )
}