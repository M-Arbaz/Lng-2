'use client'

import { useState } from 'react'
import { Link } from '@/lib/navigation'
import {
  Wand2,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  TreePine,
  Sparkles,
  Palette,
  Ruler,
  Hash,
  Wallet,
  Calendar,
  Upload,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  X,
  Loader2,
  CheckCircle,
  Send,
  Home,
  Grid3x3,
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

const WOOD_TYPES = ['Sheesham', 'Pine Wood', 'Oak', 'Walnut', 'Not Sure']

const FINISHES = ['Natural', 'Matte', 'Glossy', 'Rustic', 'Dark Walnut']

const BUDGET_RANGES = [
  'Under PKR 10,000',
  'PKR 10,000–20,000',
  'PKR 20,000–40,000',
  'Above PKR 40,000',
]

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

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
  'w-full h-12 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-all'
const labelClass = 'block text-xs font-semibold text-stone-700 mb-1.5'

export default function CustomOrderPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [files, setFiles] = useState([])
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilesSelected = (e) => {
    const incoming = Array.from(e.target.files || [])
    e.target.value = ''
    if (incoming.length === 0) return

    setFileError('')
    const valid = []
    for (const file of incoming) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFileError('Only JPG, PNG, or PDF files are allowed.')
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError('Each file must be smaller than 5MB.')
        continue
      }
      valid.push(file)
    }

    setFiles((prev) => {
      const combined = [...prev, ...valid]
      if (combined.length > MAX_FILES) {
        setFileError(`You can upload a maximum of ${MAX_FILES} files.`)
        return combined.slice(0, MAX_FILES)
      }
      return combined
    })
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.productType) {
      setError('Please select a product type.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const imageUrls = files.length
        ? await Promise.all(files.map((file) => customOrdersService.uploadOrderImage(file)))
        : []

      await customOrdersService.createOrder({
        ...form,
        quantity: Number(form.quantity) || 1,
        images: imageUrls,
      })

      setForm(EMPTY_FORM)
      setFiles([])
      setShowSuccess(true)
    } catch (err) {
      console.error('Error submitting custom order:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900/70 via-[#5A2D0C] to-stone-900 py-16 sm:py-24">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold text-[#FFD400] border border-amber-400/20 mb-6">
            <Wand2 className="w-3.5 h-3.5" />
            CUSTOM DESIGN REQUEST
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Custom Design Request
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Tell us about your custom lamp idea. Fill out the form below, and our team will
            review your request and contact you shortly.
          </p>
        </div>
        <div className="relative z-10 -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60V30C240 0 480 15 720 30C960 45 1200 30 1440 15V60H0Z" className="fill-[#FAFAF8]" />
          </svg>
        </div>
      </section>

      {/* Form */}
      <section className="-mt-6 relative z-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-lg border border-stone-200 p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Personal Information */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#F5F1EA] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#FFD400]" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+92 300 1234567"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      placeholder="Lahore"
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>

              {/* Design Details */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#F5F1EA] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#FFD400]" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">Design Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      <Package className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      Product Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="productType"
                      value={form.productType}
                      onChange={handleChange}
                      required
                      className={fieldClass}
                    >
                      <option value="">Select product type</option>
                      {PRODUCT_TYPES.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <TreePine className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      Preferred Wood Type
                    </label>
                    <select
                      name="woodType"
                      value={form.woodType}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="">Select wood type</option>
                      {WOOD_TYPES.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Sparkles className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      Preferred Finish
                    </label>
                    <select
                      name="finish"
                      value={form.finish}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="">Select finish</option>
                      {FINISHES.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Palette className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      Lamp Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      placeholder="Brown / Black / White / Custom"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Ruler className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      Approximate Size
                    </label>
                    <input
                      type="text"
                      name="size"
                      value={form.size}
                      onChange={handleChange}
                      placeholder="Height: 3 ft, Width: 12 inches"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Hash className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
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
                      <Wallet className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      Budget Range
                    </label>
                    <select
                      name="budgetRange"
                      value={form.budgetRange}
                      onChange={handleChange}
                      className={fieldClass}
                    >
                      <option value="">Select budget range</option>
                      {BUDGET_RANGES.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Calendar className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                      Project Deadline
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

                {/* Upload Reference Images */}
                <div className="mt-5">
                  <label className={labelClass}>
                    <Upload className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                    Upload Reference Images
                  </label>
                  <label
                    htmlFor="customOrderFiles"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/40 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-stone-400" />
                    <span className="text-sm text-stone-600">
                      <span className="font-semibold text-[#5A2D0C]">Click to upload</span> JPG, PNG, or PDF
                    </span>
                    <span className="text-xs text-stone-400">Maximum 5 files, up to 5MB each</span>
                  </label>
                  <input
                    id="customOrderFiles"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFilesSelected}
                    disabled={files.length >= MAX_FILES}
                    className="hidden"
                  />

                  {fileError && (
                    <p className="mt-2 text-xs text-red-600">{fileError}</p>
                  )}

                  {files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {files.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="relative flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 pl-2 pr-8 py-2"
                        >
                          {file.type === 'application/pdf' ? (
                            <FileIcon className="w-4 h-4 text-stone-500 flex-shrink-0" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-stone-500 flex-shrink-0" />
                          )}
                          <span className="text-xs text-stone-700 max-w-[140px] truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-red-500 rounded-full hover:bg-red-50 transition"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-5">
                  <label className={labelClass}>
                    <FileText className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                    Describe Your Design
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us about your idea, preferred style, dimensions, colors, or any special requirements."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5F1EA]0 to-amber-400 px-8 text-sm font-bold text-stone-900 shadow-md transition-all duration-200 hover:shadow-lg hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative">
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="absolute right-4 top-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-[#22C55E]" />
            </div>

            <h3 className="text-2xl font-bold text-stone-900">🎉 Thank You!</h3>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              Your custom design request has been submitted successfully.
            </p>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Our design team will review your request and contact you as soon as possible to
              discuss the details.
            </p>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Thank you for trusting Lamp &amp; Glow. We look forward to creating something
              special just for you!
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F5F1EA]0 to-amber-400 px-4 text-sm font-bold text-stone-900 shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
              <Link
                to="/collections"
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-700 transition-all duration-200 hover:bg-stone-50 active:scale-[0.98]"
              >
                <Grid3x3 className="w-4 h-4" />
                Browse Collection
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
