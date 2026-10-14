'use client'

import { useState } from 'react'
import { Link } from '@/lib/navigation'
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle,
  FileText,
  Grid3x3,
  Hash,
  Home,
  Image as ImageIcon,
  Loader2,
  Package,
  Palette,
  Ruler,
  Send,
  Sparkles,
  TreePine,
  Upload,
  Wallet,
  Wand2,
  X,
} from 'lucide-react'

import customOrdersService from '../utils/customOrdersService.js'

const PRODUCT_TYPES = [
  'Table Lamp',
  'Floor Lamp',
  'Wall Lamp',
  'Hanging Lamp',
  'Ceiling Lamp',
  'Wooden Craft',
  'Other',
]

const WOOD_TYPES = [
  'Sheesham',
  'Pine Wood',
  'Oak',
  'Walnut',
  'Not Sure',
]

const FINISHES = [
  'Natural',
  'Matte',
  'Glossy',
  'Rustic',
  'Dark Walnut',
]

const BUDGET_RANGES = [
  'Under PKR 10,000',
  'PKR 10,000–20,000',
  'PKR 20,000–40,000',
  'Above PKR 40,000',
]

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  productType: '',
  woodType: '',
  finish: '',
  color: '',
  size: '',
  quantity: 1,
  budgetRange: '',
  deadline: '',
  description: '',
}

const fieldClass =
  'h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-[14px] text-stone-900 outline-none transition-all duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.07]'

const labelClass =
  'mb-2 block text-[11px] font-semibold uppercase tracking-[0.11em] text-stone-500'

function SectionTitle({
  number,
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3A2117] text-[11px] font-semibold tracking-wider text-white">
        {number}
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
          {eyebrow}
        </p>

        <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#241710] sm:text-2xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-stone-500">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export default function CustomOrderPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [files, setFiles] = useState([])
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFilesSelected = (e) => {
    const incoming = Array.from(e.target.files || [])

    e.target.value = ''

    if (incoming.length === 0) return

    setFileError('')

    const valid = []

    for (const file of incoming) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFileError(
          'Only JPG, PNG, or WebP images are allowed.'
        )
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError(
          'Each image must be smaller than 5MB.'
        )
        continue
      }

      valid.push(file)
    }

    setFiles((prev) => {
      const combined = [
        ...prev,
        ...valid,
      ]

      if (combined.length > MAX_FILES) {
        setFileError(
          `You can upload a maximum of ${MAX_FILES} images.`
        )

        return combined.slice(
          0,
          MAX_FILES
        )
      }

      return combined
    })
  }

  const removeFile = (index) => {
    setFiles((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    )

    setFileError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.productType) {
      setError(
        'Please select a product type.'
      )
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const imageUrls = files.length
        ? await Promise.all(
          files.map((file) =>
            customOrdersService.uploadOrderImage(
              file
            )
          )
        )
        : []

      await customOrdersService.createOrder({
        ...form,
        quantity:
          Number(form.quantity) || 1,
        images: imageUrls,
      })

      setForm(EMPTY_FORM)
      setFiles([])
      setShowSuccess(true)
    } catch (err) {
      console.error(
        'Error submitting custom order:',
        err
      )

      setError(
        'Something went wrong. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF] text-[#241710]">

      {/* ====================================================== */}
      {/* HERO */}
      {/* ====================================================== */}

      <section className="relative overflow-hidden border-b border-[#3A2117]/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(110,72,48,0.12),transparent_40%)]" />

        <div className="relative mx-auto max-w-[1400px] px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_360px]">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6B4228]/20 bg-white/60 px-4 py-2 backdrop-blur">
                <Wand2 className="h-3.5 w-3.5 text-[#6B4228]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B4228]">
                  Custom Craft
                </span>
              </div>

              <h1 className="max-w-4xl text-[42px] font-medium leading-[0.98] tracking-[-0.045em] text-[#281912] sm:text-6xl lg:text-[74px]">
                Made for your space.
                <br />

                <span className="font-serif italic text-[#77533C]">
                  Built around your idea.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-[15px] leading-7 text-stone-600 sm:text-base">
                Share your vision with us and
                our team will help turn it into
                a thoughtfully crafted Lamp
                &amp; Glow piece made around
                your requirements.
              </p>
            </div>

            <div className="border-t border-[#3A2117]/15 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                Bespoke process
              </p>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                Tell us the style, dimensions,
                wood, finish and budget you
                have in mind. Reference images
                are welcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
        <div className="grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[390px_minmax(0,1fr)]">

          {/* ================================================== */}
          {/* LEFT PANEL */}
          {/* ================================================== */}

          <aside className="lg:sticky lg:top-[110px] lg:h-fit lg:self-start">
            <div className="relative overflow-hidden rounded-[28px] bg-[#321E16] p-7 text-white shadow-[0_24px_70px_rgba(50,30,22,0.18)] sm:p-8">
              <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-[#A87855]/15 blur-3xl" />

              <div className="relative">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D8BBA5]">
                  How it works
                </span>

                <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.035em]">
                  From an idea
                  <br />
                  to your space.
                </h2>

                <p className="mt-4 text-sm leading-6 text-white/60">
                  A simple process designed to
                  understand your requirements
                  before crafting begins.
                </p>

                <div className="mt-9 space-y-7">
                  {[
                    {
                      number: '01',
                      title: 'Share your idea',
                      text: 'Tell us what you want to create and upload visual references.',
                    },
                    {
                      number: '02',
                      title: 'We review the brief',
                      text: 'Our team reviews the design, material, size and feasibility.',
                    },
                    {
                      number: '03',
                      title: 'We contact you',
                      text: 'We discuss details, quotation and the next steps with you.',
                    },
                  ].map((step) => (
                    <div
                      key={step.number}
                      className="flex gap-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[10px] font-semibold text-[#D8BBA5]">
                        {step.number}
                      </span>

                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {step.title}
                        </h3>

                        <p className="mt-1.5 text-xs leading-5 text-white/50">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="my-8 h-px bg-white/10" />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-white/65">
                    <Check className="h-3.5 w-3.5 text-[#D8BBA5]" />
                    Crafted around your brief
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/65">
                    <Check className="h-3.5 w-3.5 text-[#D8BBA5]" />
                    Material &amp; finish guidance
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/65">
                    <Check className="h-3.5 w-3.5 text-[#D8BBA5]" />
                    Personal follow-up
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D8BBA5]">
                    Need help deciding?
                  </p>

                  <p className="mt-2 text-xs leading-5 text-white/55">
                    Choose “Not Sure” where
                    available and tell us your
                    idea. Our team can guide
                    you through the options.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ================================================== */}
          {/* FORM */}
          {/* ================================================== */}

          <div className="overflow-hidden rounded-[28px] border border-stone-200/80 bg-[#FFFEFC] shadow-[0_20px_70px_rgba(60,38,24,0.07)]">
            <div className="border-b border-stone-200/70 px-6 py-6 sm:px-8 lg:px-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                Design request
              </p>

              <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#281912] sm:text-3xl">
                  Tell us what you have in mind.
                </h2>

                <p className="text-xs text-stone-400">
                  <span className="text-[#9B342B]">
                    *
                  </span>{' '}
                  Required fields
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="divide-y divide-stone-200/70"
            >

              {/* ============================================== */}
              {/* 01 PERSONAL INFO */}
              {/* ============================================== */}

              <div className="px-6 py-9 sm:px-8 lg:px-10 lg:py-11">
                <SectionTitle
                  number="01"
                  eyebrow="Your details"
                  title="Let’s start with you."
                  description="Share the best details for our team to contact you about your request."
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Full Name{' '}
                      <span className="text-[#9B342B]">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="Your full name"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Email Address{' '}
                      <span className="text-[#9B342B]">
                        *
                      </span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Phone Number{' '}
                      <span className="text-[#9B342B]">
                        *
                      </span>
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                      placeholder="+92 300 1234567"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      City{' '}
                      <span className="text-[#9B342B]">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      autoComplete="address-level2"
                      placeholder="Lahore"
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>

              {/* ============================================== */}
              {/* 02 DESIGN DIRECTION */}
              {/* ============================================== */}

              <div className="px-6 py-9 sm:px-8 lg:px-10 lg:py-11">
                <SectionTitle
                  number="02"
                  eyebrow="Design direction"
                  title="Shape the piece."
                  description="The more detail you share, the better we can understand the direction you have in mind."
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      <Package className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                      Product Type{' '}
                      <span className="text-[#9B342B]">
                        *
                      </span>
                    </label>

                    <select
                      name="productType"
                      value={form.productType}
                      onChange={handleChange}
                      required
                      className={fieldClass}
                    >
                      <option value="">
                        Select product type
                      </option>

                      {PRODUCT_TYPES.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <TreePine className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                      Wood Type
                    </label>

                    <select
                      name="woodType"
                      value={form.woodType}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="">
                        Select wood type
                      </option>

                      {WOOD_TYPES.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Sparkles className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                      Preferred Finish
                    </label>

                    <select
                      name="finish"
                      value={form.finish}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="">
                        Select finish
                      </option>

                      {FINISHES.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Palette className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                      Colour
                    </label>

                    <input
                      type="text"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      placeholder="Brown / Black / Custom"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Ruler className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                      Approximate Size
                    </label>

                    <input
                      type="text"
                      name="size"
                      value={form.size}
                      onChange={handleChange}
                      placeholder="e.g. H 3 ft × W 12 in"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Hash className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                      Quantity
                    </label>

                    <input
                      type="number"
                      name="quantity"
                      min={1}
                      value={form.quantity}
                      onChange={handleChange}
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Wallet className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                      Budget Range
                    </label>

                    <select
                      name="budgetRange"
                      value={form.budgetRange}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="">
                        Select budget range
                      </option>

                      {BUDGET_RANGES.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Calendar className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                      Preferred Deadline
                    </label>

                    <input
                      type="date"
                      name="deadline"
                      value={form.deadline}
                      onChange={handleChange}
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>

              {/* ============================================== */}
              {/* 03 REFERENCES */}
              {/* ============================================== */}

              <div className="px-6 py-9 sm:px-8 lg:px-10 lg:py-11">
                <SectionTitle
                  number="03"
                  eyebrow="References"
                  title="Show us the direction."
                  description="Upload inspirations, sketches or reference images that help explain your idea."
                />

                <label
                  htmlFor="customOrderFiles"
                  className={`group flex cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed px-6 py-10 text-center transition-all duration-300 ${files.length >= MAX_FILES
                    ? 'cursor-not-allowed border-stone-200 bg-stone-50 opacity-60'
                    : 'border-[#8A654D]/35 bg-[#FBF8F4] hover:border-[#6B4228] hover:bg-[#F8F2EC]'
                    }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#6B4228]/10 bg-white shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                    <Upload className="h-5 w-5 text-[#6B4228]" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#332018]">
                    Upload reference images
                  </p>

                  <p className="mt-1.5 max-w-sm text-xs leading-5 text-stone-500">
                    Click to browse JPG, PNG or
                    WebP images. You can upload
                    up to {MAX_FILES} files.
                  </p>

                  <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                    Maximum 5MB each
                  </span>
                </label>

                <input
                  id="customOrderFiles"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleFilesSelected
                  }
                  disabled={
                    files.length >= MAX_FILES
                  }
                  className="hidden"
                />

                {fileError && (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                    {fileError}
                  </p>
                )}

                {files.length > 0 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {files.map(
                      (file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="group flex min-w-0 items-center gap-3 rounded-xl border border-stone-200 bg-white p-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F4EEE8]">
                            <ImageIcon className="h-4 w-4 text-[#6B4228]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-stone-700">
                              {file.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-stone-400">
                              {(
                                file.size /
                                1024 /
                                1024
                              ).toFixed(2)}{' '}
                              MB
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFile(index)
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* ============================================== */}
              {/* 04 DESCRIPTION */}
              {/* ============================================== */}

              <div className="px-6 py-9 sm:px-8 lg:px-10 lg:py-11">
                <SectionTitle
                  number="04"
                  eyebrow="Your vision"
                  title="Tell us the story behind it."
                  description="Anything useful that is not covered above can be shared here."
                />

                <div>
                  <label className={labelClass}>
                    <FileText className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
                    Design Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us about the style, shape, dimensions, colours, placement or any special requirements you have in mind..."
                    className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-4 text-[14px] leading-6 text-stone-900 outline-none transition-all duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.07]"
                  />
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-4 border-t border-stone-200/70 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-md text-xs leading-5 text-stone-400">
                    By submitting this request,
                    you allow our team to
                    contact you regarding your
                    custom design inquiry.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex h-13 min-h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#3A2117] px-7 text-[12px] font-semibold uppercase tracking-[0.11em] text-white shadow-[0_12px_30px_rgba(58,33,23,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4A2B1F] hover:shadow-[0_16px_36px_rgba(58,33,23,0.24)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Send Design Request

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* SUCCESS MODAL */}
      {/* ====================================================== */}

      {showSuccess && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B110C]/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-order-success-title"
        >
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-[#FFFEFC] shadow-[0_35px_100px_rgba(0,0,0,0.28)]">
            <button
              type="button"
              onClick={() =>
                setShowSuccess(false)
              }
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-7 pb-8 pt-10 text-center sm:px-10 sm:pb-10 sm:pt-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3A2117] shadow-[0_12px_30px_rgba(58,33,23,0.18)]">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>

              <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
                Request received
              </p>

              <h3
                id="custom-order-success-title"
                className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#281912] sm:text-4xl"
              >
                Thank You!
              </h3>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-stone-600">
                Your custom design request has
                been submitted successfully.
                Our team will review your
                details and contact you to
                discuss the next steps.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#3A2117] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#4A2B1F]"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>

                <Link
                  to="/collections"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#3A2117] transition hover:border-[#6B4228] hover:bg-[#F8F4F0]"
                >
                  <Grid3x3 className="h-4 w-4" />
                  Browse Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}