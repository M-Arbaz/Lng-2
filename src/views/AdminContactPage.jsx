'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Headphones,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Send,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'

import contactPageService, {
  CONTACT_PAGE_DEFAULTS,
  normalizeContactPage,
} from '../utils/contactPageService'

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

export default function AdminContactPage() {
  const [
    form,
    setForm,
  ] = useState(() =>
    normalizeContactPage(
      CONTACT_PAGE_DEFAULTS
    )
  )

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const messageTimerRef =
    useRef(null)

  const showMessage = (
    type,
    text
  ) => {
    if (
      messageTimerRef.current
    ) {
      window.clearTimeout(
        messageTimerRef.current
      )
    }

    setMessage({
      type,
      text,
    })

    messageTimerRef.current =
      window.setTimeout(() => {
        setMessage({
          type: '',
          text: '',
        })
      }, 3500)
  }

  useEffect(() => {
    return () => {
      if (
        messageTimerRef.current
      ) {
        window.clearTimeout(
          messageTimerRef.current
        )
      }
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        const data =
          await contactPageService.getContactPage()

        setForm(
          normalizeContactPage(
            data
          )
        )
      } catch (error) {
        console.error(
          'Contact settings load failed:',
          error
        )

        showMessage(
          'error',
          'Failed to load Contact page settings.'
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setForm((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const handleSave = async (
    event
  ) => {
    event.preventDefault()

    try {
      setSaving(true)

      const updated =
        await contactPageService.updateContactPage(
          form
        )

      setForm(
        normalizeContactPage(
          updated
        )
      )

      showMessage(
        'success',
        'Contact page updated successfully.'
      )
    } catch (error) {
      console.error(
        'Contact page save failed:',
        error
      )

      showMessage(
        'error',
        error?.message ||
        'Failed to save Contact page.'
      )
    } finally {
      setSaving(false)
    }
  }

  const openPreview = () => {
    window.open(
      '/contact',
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
          <div className="text-center">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

            <p className="mt-3 text-sm font-medium text-[#7B685D]">
              Loading Contact page...
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <form
        onSubmit={handleSave}
        className="space-y-6 pb-4"
      >
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-white">
                <MessageSquare className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Storefront
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Contact Page
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Manage the content shown
                  on both /contact and
                  /contact-us from one
                  place.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={openPreview}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-4 py-3 text-sm font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF]"
              >
                <ExternalLink className="h-4 w-4" />

                Preview Page
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </section>

        {/* Feedback */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${message.type ===
                'success'
                ? 'border-[#CFE1D1] bg-[#F3F9F3] text-[#426649]'
                : 'border-[#E8C9C3] bg-[#FFF4F1] text-[#93483C]'
              }`}
          >
            {message.type ===
              'success' ? (
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="text-sm font-medium">
              {message.text}
            </p>
          </div>
        )}

        {/* Hero */}
        <FormSection
          icon={MessageSquare}
          eyebrow="Page Header"
          title="Contact Introduction"
          description="Controls the heading and introduction shown at the top of the customer Contact page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Page Title"
              name="pageTitle"
              value={form.pageTitle}
              onChange={handleChange}
              placeholder="Contact Us"
            />

            <InputField
              label="Small Heading / Eyebrow"
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              placeholder="Get in Touch"
            />
          </div>

          <div className="mt-4">
            <FieldLabel>
              Page Description
            </FieldLabel>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Contact page introduction..."
            />
          </div>
        </FormSection>

        {/* Support */}
        <FormSection
          icon={Headphones}
          eyebrow="Support"
          title="Support Card"
          description="Manage the support card shown next to the customer message form."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Support Title"
              name="supportTitle"
              value={form.supportTitle}
              onChange={handleChange}
              placeholder="Lamp & Glow Support"
            />

            <InputField
              label="Support Subtitle"
              name="supportSubtitle"
              value={form.supportSubtitle}
              onChange={handleChange}
              placeholder="We're here to help."
            />
          </div>
        </FormSection>

        {/* Contact details */}
        <FormSection
          icon={Phone}
          eyebrow="Contact"
          title="Contact Details"
          description="These details appear directly on the public Contact page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Phone / WhatsApp Text"
              name="phoneText"
              value={form.phoneText}
              onChange={handleChange}
              placeholder="+92 300 0000000"
            />

            <InputField
              label="Support Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="support@lampandglow.com"
            />
          </div>

          <div className="mt-4">
            <FieldLabel>
              Address
            </FieldLabel>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Business address..."
            />

            <p className="mt-1.5 text-xs text-[#9A8478]">
              Multiple lines are supported.
            </p>
          </div>
        </FormSection>

        {/* Form */}
        <FormSection
          icon={Mail}
          eyebrow="Form"
          title="Customer Message Form"
          description="Control the text displayed around the form. Customer submissions still save to Firestore Contact Submissions."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Form Title"
              name="formTitle"
              value={form.formTitle}
              onChange={handleChange}
              placeholder="Send a Message"
            />

            <InputField
              label="Submit Button Text"
              name="submitButtonText"
              value={form.submitButtonText}
              onChange={handleChange}
              placeholder="Send Message"
            />
          </div>

          <div className="mt-4">
            <FieldLabel>
              Form Subtitle
            </FieldLabel>

            <textarea
              name="formSubtitle"
              value={form.formSubtitle}
              onChange={handleChange}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="mt-4">
            <FieldLabel>
              Text Below Submit Button
            </FieldLabel>

            <textarea
              name="formNote"
              value={form.formNote}
              onChange={handleChange}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="mt-4">
            <FieldLabel>
              Successful Submission Message
            </FieldLabel>

            <textarea
              name="successMessage"
              value={form.successMessage}
              onChange={handleChange}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        </FormSection>

        {/* WhatsApp */}
        <FormSection
          icon={Send}
          eyebrow="Live Help"
          title="WhatsApp Support"
          description="Configure the optional quick-support section."
        >
          <ToggleCard
            checked={
              form.showLiveHelp
            }
            name="showLiveHelp"
            onChange={handleChange}
            title="Show WhatsApp Support"
            description="Display the WhatsApp support block on the Contact page."
          />

          {form.showLiveHelp && (
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Section Title"
                  name="liveHelpTitle"
                  value={form.liveHelpTitle}
                  onChange={handleChange}
                  placeholder="WhatsApp Support"
                />

                <InputField
                  label="Button Text"
                  name="whatsappButtonText"
                  value={
                    form.whatsappButtonText
                  }
                  onChange={handleChange}
                  placeholder="Message Us"
                />
              </div>

              <div>
                <FieldLabel>
                  Support Description
                </FieldLabel>

                <textarea
                  name="liveHelpText"
                  value={form.liveHelpText}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <InputField
                label="WhatsApp Link"
                name="whatsappLink"
                type="url"
                value={form.whatsappLink}
                onChange={handleChange}
                placeholder="https://wa.me/..."
              />
            </div>
          )}
        </FormSection>

        {/* Opening Hours */}
        <FormSection
          icon={Clock}
          eyebrow="Availability"
          title="Opening Hours"
          description="Show customers when your support team is normally available."
        >
          <ToggleCard
            checked={
              form.showOpeningHours
            }
            name="showOpeningHours"
            onChange={handleChange}
            title="Show Opening Hours"
            description="Display business/support hours on the public Contact page."
          />

          {form.showOpeningHours && (
            <div className="mt-5">
              <FieldLabel>
                Opening Hours
              </FieldLabel>

              <textarea
                name="openingHours"
                value={form.openingHours}
                onChange={handleChange}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder={'MON to SAT: 9:00AM - 10:00PM\nSUN: 10:00AM - 6:00PM'}
              />

              <p className="mt-1.5 text-xs text-[#9A8478]">
                Put each schedule on a new line.
              </p>
            </div>
          )}
        </FormSection>

        {/* Sticky Save */}
        <div className="sticky bottom-4 z-30 rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC]/95 p-4 shadow-[0_18px_50px_rgba(58,33,23,0.16)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[#8A7467]">
              Saved changes are used by
              both /contact and
              /contact-us.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving
                ? 'Saving...'
                : 'Save All Changes'}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}

function FormSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0E8E1] text-[#6B4228]">
          <Icon className="h-4.5 w-4.5" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-[#281912]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[#8A7467]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  )
}

function FieldLabel({
  children,
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-[#4E3D34]">
      {children}
    </label>
  )
}

function InputField({
  label,
  type = 'text',
  ...props
}) {
  return (
    <div>
      <FieldLabel>
        {label}
      </FieldLabel>

      <input
        {...props}
        type={type}
        className={inputClass}
      />
    </div>
  )
}

function ToggleCard({
  checked,
  name,
  onChange,
  title,
  description,
}) {
  return (
    <label
      className={`block cursor-pointer rounded-xl border p-4 transition ${checked
          ? 'border-[#BFA995] bg-[#F5EEE8]'
          : 'border-[#E6DCD5] bg-[#FAF7F4]'
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#281912]">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-[#8A7467]">
            {description}
          </p>
        </div>

        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="mt-1 h-4 w-4 accent-[#6B4228]"
        />
      </div>
    </label>
  )
}