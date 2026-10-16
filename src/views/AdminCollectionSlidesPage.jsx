'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  EyeOff,
  GalleryHorizontal,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  MousePointerClick,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import collectionSlidesService from '../utils/collectionSlidesService.js'

const ACTION_TYPES = [
  {
    value: 'section',
    label: 'Navigate to Section',
  },
  {
    value: 'url',
    label: 'External URL',
  },
]

const SECTION_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'products', label: 'Products' },
  {
    value: 'categories',
    label: 'Categories',
  },
  { value: 'blogs', label: 'Blog' },
  { value: 'reels', label: 'Reels' },
  { value: 'about', label: 'About' },
  {
    value: 'contact',
    label: 'Contact',
  },
  { value: 'cart', label: 'Cart' },
]

const createInitialForm = () => ({
  title: '',
  eyebrow: 'Handpick Collection',
  description: '',

  image: '',
  alt: '',
  imageSide: 'left',

  buttonLabel: '',
  buttonActionType: 'section',
  buttonActionValue: 'products',

  displayOrder: 0,
  isActive: true,
})

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

function getActionLabel(action) {
  if (!action) {
    return 'No button destination'
  }

  if (action.type === 'section') {
    const section =
      SECTION_OPTIONS.find(
        (item) =>
          item.value === action.value
      )

    return section
      ? section.label
      : action.value || 'No section'
  }

  return action.value || 'No URL'
}

export default function AdminCollectionSlidesPage() {
  const [slides, setSlides] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [searchQuery, setSearchQuery] =
    useState('')

  const [showForm, setShowForm] =
    useState(false)

  const [editingId, setEditingId] =
    useState(null)

  const [formData, setFormData] =
    useState(createInitialForm)

  const [saving, setSaving] =
    useState(false)

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false)

  const [imagePreview, setImagePreview] =
    useState('')

  const [deletingId, setDeletingId] =
    useState(null)

  const [togglingId, setTogglingId] =
    useState(null)

  const [
    reorderingId,
    setReorderingId,
  ] = useState(null)

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const fileInputRef = useRef(null)

  const formBusy =
    saving || uploadingImage

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    })

    window.setTimeout(() => {
      setMessage({
        type: '',
        text: '',
      })
    }, 3500)
  }

  const loadSlides = async () => {
    try {
      setLoading(true)

      const data =
        await collectionSlidesService.getAllSlides()

      setSlides(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Error loading collection slides:',
        error
      )

      showMessage(
        'error',
        'Failed to load collection slides.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlides()
  }, [])

  const filteredSlides = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase()

    if (!query) {
      return slides
    }

    return slides.filter((slide) =>
      [
        slide.title,
        slide.description,
        slide.eyebrow,
        slide.buttonLabel,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(query)
      )
    )
  }, [slides, searchQuery])

  const stats = useMemo(() => {
    return {
      total: slides.length,

      active: slides.filter(
        (slide) =>
          slide.isActive !== false
      ).length,

      inactive: slides.filter(
        (slide) =>
          slide.isActive === false
      ).length,

      leftImages: slides.filter(
        (slide) =>
          slide.imageSide !== 'right'
      ).length,
    }
  }, [slides])

  const resetForm = () => {
    setFormData(
      createInitialForm()
    )

    setImagePreview('')
    setEditingId(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  const closeForm = () => {
    if (formBusy) return

    setShowForm(false)
    resetForm()
  }

  const handleEdit = (slide) => {
    setFormData({
      title:
        slide.title || '',

      eyebrow:
        slide.eyebrow ||
        'Handpick Collection',

      description:
        slide.description || '',

      image:
        slide.image || '',

      alt:
        slide.alt || '',

      imageSide:
        slide.imageSide ||
        'left',

      buttonLabel:
        slide.buttonLabel || '',

      buttonActionType:
        slide.buttonAction?.type ||
        'section',

      buttonActionValue:
        slide.buttonAction?.value ||
        'products',

      displayOrder:
        Number(
          slide.displayOrder || 0
        ),

      isActive:
        slide.isActive !== false,
    })

    setImagePreview(
      slide.image || ''
    )

    setEditingId(slide.id)
    setShowForm(true)
  }

  const handleInputChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const handleImageUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      if (!file) return

      const reader =
        new FileReader()

      reader.onloadend = () => {
        setImagePreview(
          reader.result
        )
      }

      reader.readAsDataURL(file)

      try {
        setUploadingImage(true)

        const url =
          await collectionSlidesService.uploadSlideImage(
            file
          )

        setFormData((prev) => ({
          ...prev,
          image: url,
        }))

        setImagePreview(url)

        showMessage(
          'success',
          'Collection image uploaded to XCDN.'
        )
      } catch (error) {
        console.error(
          'Collection image upload failed:',
          error
        )

        setImagePreview(
          formData.image || ''
        )

        showMessage(
          'error',
          'Collection image upload failed.'
        )
      } finally {
        setUploadingImage(false)
      }
    }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: '',
    }))

    setImagePreview('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (!formData.image) {
      showMessage(
        'error',
        'Please upload a collection image.'
      )

      return
    }

    if (!formData.title.trim()) {
      showMessage(
        'error',
        'Please enter a collection name.'
      )

      return
    }

    if (
      formData.buttonLabel.trim() &&
      !formData.buttonActionValue.trim()
    ) {
      showMessage(
        'error',
        'Please select or enter the button destination.'
      )

      return
    }

    try {
      setSaving(true)

      const payload = {
        title:
          formData.title.trim(),

        eyebrow:
          formData.eyebrow.trim(),

        description:
          formData.description.trim(),

        image:
          formData.image,

        alt:
          formData.alt.trim() ||
          formData.title.trim(),

        imageSide:
          formData.imageSide,

        buttonLabel:
          formData.buttonLabel.trim(),

        buttonAction:
          formData.buttonLabel.trim()
            ? {
              type:
                formData.buttonActionType,

              value:
                formData.buttonActionValue.trim(),
            }
            : null,

        displayOrder:
          Number(
            formData.displayOrder
          ) || 0,

        isActive:
          formData.isActive,
      }

      if (editingId) {
        await collectionSlidesService.updateSlide(
          editingId,
          payload
        )

        setSlides((prev) =>
          prev
            .map((slide) =>
              slide.id === editingId
                ? {
                  ...slide,
                  ...payload,
                }
                : slide
            )
            .sort(
              (a, b) =>
                Number(
                  a.displayOrder || 0
                ) -
                Number(
                  b.displayOrder || 0
                )
            )
        )

        showMessage(
          'success',
          'Collection slide updated.'
        )
      } else {
        const newSlide =
          await collectionSlidesService.createSlide(
            payload
          )

        setSlides((prev) =>
          [
            ...prev,
            newSlide,
          ].sort(
            (a, b) =>
              Number(
                a.displayOrder || 0
              ) -
              Number(
                b.displayOrder || 0
              )
          )
        )

        showMessage(
          'success',
          'Collection slide created.'
        )
      }

      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error(
        'Error saving collection slide:',
        error
      )

      showMessage(
        'error',
        'Failed to save collection slide.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    slide
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${slide.title ||
        'this collection slide'
        }"? This action cannot be undone.`
      )

    if (!confirmed) return

    try {
      setDeletingId(slide.id)

      await collectionSlidesService.deleteSlide(
        slide.id
      )

      setSlides((prev) =>
        prev.filter(
          (item) =>
            item.id !== slide.id
        )
      )

      showMessage(
        'success',
        'Collection slide deleted.'
      )
    } catch (error) {
      console.error(
        'Error deleting collection slide:',
        error
      )

      showMessage(
        'error',
        'Failed to delete collection slide.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive =
    async (slide) => {
      const nextActive =
        slide.isActive === false

      try {
        setTogglingId(slide.id)

        await collectionSlidesService.updateSlide(
          slide.id,
          {
            isActive: nextActive,
          }
        )

        setSlides((prev) =>
          prev.map((item) =>
            item.id === slide.id
              ? {
                ...item,
                isActive:
                  nextActive,
              }
              : item
          )
        )

        showMessage(
          'success',
          nextActive
            ? 'Collection slide activated.'
            : 'Collection slide hidden.'
        )
      } catch (error) {
        console.error(
          'Error toggling collection slide:',
          error
        )

        showMessage(
          'error',
          'Failed to update slide visibility.'
        )
      } finally {
        setTogglingId(null)
      }
    }

  const moveSlide = async (
    slideId,
    direction
  ) => {
    const currentIndex =
      slides.findIndex(
        (slide) =>
          slide.id === slideId
      )

    if (currentIndex === -1) {
      return
    }

    const targetIndex =
      direction === 'up'
        ? currentIndex - 1
        : currentIndex + 1

    if (
      targetIndex < 0 ||
      targetIndex >= slides.length
    ) {
      return
    }

    const current =
      slides[currentIndex]

    const target =
      slides[targetIndex]

    const currentOrder =
      Number(
        current.displayOrder || 0
      )

    const targetOrder =
      Number(
        target.displayOrder || 0
      )

    try {
      setReorderingId(slideId)

      await collectionSlidesService.updateSlide(
        current.id,
        {
          displayOrder:
            targetOrder,
        }
      )

      await collectionSlidesService.updateSlide(
        target.id,
        {
          displayOrder:
            currentOrder,
        }
      )

      const updated =
        slides.map((slide) => {
          if (
            slide.id === current.id
          ) {
            return {
              ...slide,
              displayOrder:
                targetOrder,
            }
          }

          if (
            slide.id === target.id
          ) {
            return {
              ...slide,
              displayOrder:
                currentOrder,
            }
          }

          return slide
        })

      setSlides(
        updated.sort(
          (a, b) =>
            Number(
              a.displayOrder || 0
            ) -
            Number(
              b.displayOrder || 0
            )
        )
      )

      showMessage(
        'success',
        'Collection order updated.'
      )
    } catch (error) {
      console.error(
        'Collection reorder failed:',
        error
      )

      showMessage(
        'error',
        'Failed to reorder collection slides.'
      )

      loadSlides()
    } finally {
      setReorderingId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-[#FFFEFC]">
                <GalleryHorizontal className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Storefront
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Collection Slider
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Manage featured collection
                  slides, artwork, content,
                  storefront actions and
                  display order.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-[#FFFEFC] shadow-sm transition hover:bg-[#281912] sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Slide
            </button>
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

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Slides"
            value={stats.total}
            text="Configured collections"
            icon={GalleryHorizontal}
          />

          <StatCard
            label="Active"
            value={stats.active}
            text="Visible on storefront"
            icon={Eye}
          />

          <StatCard
            label="Inactive"
            value={stats.inactive}
            text="Currently hidden"
            icon={EyeOff}
          />

          <StatCard
            label="Image Left"
            value={stats.leftImages}
            text="Desktop layouts"
            icon={LayoutTemplate}
          />
        </section>

        {/* Search */}
        <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search collection name, label, description or button..."
              className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
            />
          </div>

          <div className="mt-4 border-t border-[#EEE5DF] pt-4">
            <p className="text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {filteredSlides.length}
              </span>{' '}
              of {slides.length} slides
            </p>
          </div>
        </section>

        {/* Slides */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading collection
                slides...
              </p>
            </div>
          </section>
        ) : filteredSlides.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <GalleryHorizontal className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No collection slides
              found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
              {searchQuery
                ? 'Try adjusting your search.'
                : 'Create your first featured collection slide.'}
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredSlides.map(
              (slide) => {
                const active =
                  slide.isActive !==
                  false

                const fullIndex =
                  slides.findIndex(
                    (item) =>
                      item.id ===
                      slide.id
                  )

                const reorderBusy =
                  reorderingId ===
                  slide.id

                return (
                  <article
                    key={slide.id}
                    className={`overflow-hidden rounded-2xl border bg-[#FFFEFC] shadow-[0_10px_30px_rgba(58,33,23,0.05)] transition ${active
                        ? 'border-[#E7DCD4]'
                        : 'border-[#E6DDD7] opacity-75'
                      }`}
                  >
                    <div className="grid lg:grid-cols-[300px_1fr]">
                      {/* Preview */}
                      <div className="relative min-h-[220px] overflow-hidden bg-[#EEE7E1]">
                        {slide.image ? (
                          <img
                            src={
                              slide.image
                            }
                            alt={
                              slide.alt ||
                              slide.title ||
                              'Collection slide'
                            }
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[220px] items-center justify-center text-[#AA978C]">
                            <ImageIcon className="h-9 w-9" />
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-[#281912]/70 to-transparent p-4 pt-12">
                          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#3A2117]">
                            Image{' '}
                            {slide.imageSide ===
                              'right'
                              ? 'Right'
                              : 'Left'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {slide.eyebrow && (
                                <span className="rounded-full border border-[#DCCCBD] bg-[#F6EFE8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B4228]">
                                  {
                                    slide.eyebrow
                                  }
                                </span>
                              )}

                              <span className="rounded-full bg-[#F7F4EF] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#8A7467]">
                                Order{' '}
                                {Number(
                                  slide.displayOrder ||
                                  0
                                )}
                              </span>
                            </div>

                            <h3 className="mt-3 text-xl font-semibold text-[#281912]">
                              {slide.title ||
                                'Untitled Collection'}
                            </h3>

                            {slide.description && (
                              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                                {
                                  slide.description
                                }
                              </p>
                            )}
                          </div>

                          {/* Reorder */}
                          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#E2D6CE] bg-[#FAF7F4] p-1">
                            <button
                              type="button"
                              onClick={() =>
                                moveSlide(
                                  slide.id,
                                  'up'
                                )
                              }
                              disabled={
                                fullIndex <=
                                0 ||
                                Boolean(
                                  reorderingId
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move up"
                            >
                              {reorderBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                moveSlide(
                                  slide.id,
                                  'down'
                                )
                              }
                              disabled={
                                fullIndex ===
                                -1 ||
                                fullIndex >=
                                slides.length -
                                1 ||
                                Boolean(
                                  reorderingId
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                              title="Move down"
                            >
                              {reorderBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <MiniInfo
                            label="Image Position"
                            value={
                              slide.imageSide ===
                                'right'
                                ? 'Right side'
                                : 'Left side'
                            }
                          />

                          <MiniInfo
                            label="Button"
                            value={
                              slide.buttonLabel ||
                              'No button'
                            }
                          />

                          <MiniInfo
                            label="Destination"
                            value={
                              slide.buttonLabel
                                ? getActionLabel(
                                  slide.buttonAction
                                )
                                : 'None'
                            }
                          />
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-[#EEE5DF] pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleActive(
                                slide
                              )
                            }
                            disabled={
                              togglingId ===
                              slide.id
                            }
                            className={`inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${active
                                ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                                : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                              }`}
                          >
                            {togglingId ===
                              slide.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : active ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}

                            {active
                              ? 'Active'
                              : 'Inactive'}
                          </button>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  slide
                                )
                              }
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-4 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF] sm:flex-none"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  slide
                                )
                              }
                              disabled={
                                deletingId ===
                                slide.id
                              }
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E1C8C3] bg-[#FFFEFC] px-4 py-2.5 text-sm font-semibold text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50 sm:flex-none"
                            >
                              {deletingId ===
                                slide.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}

                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              }
            )}
          </section>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-[#FFFEFC]">
                    <GalleryHorizontal className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Storefront
                    </p>

                    <h3 className="mt-0.5 text-lg font-semibold text-[#281912] sm:text-xl">
                      {editingId
                        ? 'Edit Collection Slide'
                        : 'Create Collection Slide'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={formBusy}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7] hover:text-[#3A2117] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Scrollable Content */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
                <div className="space-y-5">
                  {/* Image */}
                  <FormSection
                    eyebrow="Media"
                    title="Collection Artwork"
                    description="Upload the main image displayed beside the collection content."
                  >
                    <div className="overflow-hidden rounded-xl border border-dashed border-[#D7C7BC] bg-[#FAF7F4]">
                      {imagePreview ||
                        formData.image ? (
                        <div className="relative">
                          <img
                            src={
                              imagePreview ||
                              formData.image
                            }
                            alt="Collection preview"
                            className="h-64 w-full object-cover sm:h-72"
                          />

                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-[#281912]/75 to-transparent p-4 pt-12">
                            <button
                              type="button"
                              onClick={() =>
                                fileInputRef.current?.click()
                              }
                              disabled={
                                uploadingImage
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#3A2117]"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              Replace Image
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleRemoveImage
                              }
                              disabled={
                                uploadingImage
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-[#954B42]"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={
                            uploadingImage
                          }
                          className="flex min-h-[250px] w-full flex-col items-center justify-center px-6 py-10 text-center transition hover:bg-[#F7F2ED]"
                        >
                          {uploadingImage ? (
                            <Loader2 className="h-8 w-8 animate-spin text-[#6B4228]" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                              <Upload className="h-5 w-5" />
                            </div>
                          )}

                          <p className="mt-3 text-sm font-semibold text-[#4E3D34]">
                            {uploadingImage
                              ? 'Uploading to XCDN...'
                              : 'Upload Collection Image'}
                          </p>

                          <p className="mt-1 text-xs text-[#9A8478]">
                            Recommended landscape
                            artwork without
                            baked-in text.
                          </p>
                        </button>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={
                          handleImageUpload
                        }
                        className="hidden"
                      />
                    </div>

                    {uploadingImage &&
                      (imagePreview ||
                        formData.image) && (
                        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#6B4228]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Uploading to XCDN...
                        </div>
                      )}
                  </FormSection>

                  {/* Content */}
                  <FormSection
                    eyebrow="Content"
                    title="Collection Content"
                    description="Configure the label, title and description shown with this collection."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>
                          Label
                        </FieldLabel>

                        <input
                          type="text"
                          name="eyebrow"
                          value={
                            formData.eyebrow
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="e.g. Handpick Collection"
                          className={
                            inputClass
                          }
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          Collection Name *
                        </FieldLabel>

                        <input
                          type="text"
                          name="title"
                          value={
                            formData.title
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="e.g. New Collection"
                          className={
                            inputClass
                          }
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel>
                          Description
                        </FieldLabel>

                        <textarea
                          name="description"
                          value={
                            formData.description
                          }
                          onChange={
                            handleInputChange
                          }
                          rows={4}
                          placeholder="Short collection description..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel>
                          Image Alt Text
                        </FieldLabel>

                        <input
                          type="text"
                          name="alt"
                          value={
                            formData.alt
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="SEO image description"
                          className={
                            inputClass
                          }
                        />

                        <p className="mt-1.5 text-xs text-[#9A8478]">
                          Collection name is used
                          automatically if left
                          empty.
                        </p>
                      </div>
                    </div>
                  </FormSection>

                  {/* CTA */}
                  <FormSection
                    eyebrow="Action"
                    title="Collection Button"
                    description="Optional button that links this slide to products, another section or an external URL."
                  >
                    <div className="rounded-xl border border-[#E6DCD5] bg-[#FAF7F4] p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                          <MousePointerClick className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#281912]">
                            CTA Button
                          </p>

                          <p className="text-xs text-[#9A8478]">
                            Optional
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-3">
                        <div>
                          <FieldLabel>
                            Button Text
                          </FieldLabel>

                          <input
                            type="text"
                            name="buttonLabel"
                            value={
                              formData.buttonLabel
                            }
                            onChange={
                              handleInputChange
                            }
                            placeholder="e.g. Shop Now"
                            className={
                              inputClass
                            }
                          />
                        </div>

                        <div>
                          <FieldLabel>
                            Action Type
                          </FieldLabel>

                          <select
                            name="buttonActionType"
                            value={
                              formData.buttonActionType
                            }
                            onChange={
                              handleInputChange
                            }
                            className={
                              inputClass
                            }
                          >
                            {ACTION_TYPES.map(
                              (type) => (
                                <option
                                  key={
                                    type.value
                                  }
                                  value={
                                    type.value
                                  }
                                >
                                  {
                                    type.label
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div>
                          <FieldLabel>
                            {formData.buttonActionType ===
                              'section'
                              ? 'Destination'
                              : 'External URL'}
                          </FieldLabel>

                          {formData.buttonActionType ===
                            'section' ? (
                            <select
                              name="buttonActionValue"
                              value={
                                formData.buttonActionValue
                              }
                              onChange={
                                handleInputChange
                              }
                              className={
                                inputClass
                              }
                            >
                              {SECTION_OPTIONS.map(
                                (
                                  section
                                ) => (
                                  <option
                                    key={
                                      section.value
                                    }
                                    value={
                                      section.value
                                    }
                                  >
                                    {
                                      section.label
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          ) : (
                            <input
                              type="text"
                              name="buttonActionValue"
                              value={
                                formData.buttonActionValue
                              }
                              onChange={
                                handleInputChange
                              }
                              placeholder="https://..."
                              className={
                                inputClass
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </FormSection>

                  {/* Display */}
                  <FormSection
                    eyebrow="Display"
                    title="Layout & Visibility"
                    description="Control image placement, storefront visibility and slide order."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>
                          Display Order
                        </FieldLabel>

                        <input
                          type="number"
                          min="0"
                          name="displayOrder"
                          value={
                            formData.displayOrder
                          }
                          onChange={
                            handleInputChange
                          }
                          className={
                            inputClass
                          }
                        />

                        <p className="mt-1.5 text-xs text-[#9A8478]">
                          Lower numbers appear
                          first.
                        </p>
                      </div>

                      <div>
                        <FieldLabel>
                          Image Side
                        </FieldLabel>

                        <select
                          name="imageSide"
                          value={
                            formData.imageSide
                          }
                          onChange={
                            handleInputChange
                          }
                          className={
                            inputClass
                          }
                        >
                          <option value="left">
                            Left
                          </option>

                          <option value="right">
                            Right
                          </option>
                        </select>
                      </div>
                    </div>

                    <label
                      className={`mt-4 block cursor-pointer rounded-xl border p-4 transition ${formData.isActive
                          ? 'border-[#BFA995] bg-[#F5EEE8]'
                          : 'border-[#E6DCD5] bg-[#FAF7F4]'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                            {formData.isActive ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#281912]">
                              Active Slide
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#8A7467]">
                              Show this collection
                              slide on the
                              storefront.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          name="isActive"
                          checked={
                            formData.isActive
                          }
                          onChange={
                            handleInputChange
                          }
                          className="mt-1 h-4 w-4 accent-[#6B4228]"
                        />
                      </div>
                    </label>
                  </FormSection>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="hidden text-xs text-[#8A7467] sm:block">
                    Image and collection name are
                    required.
                  </p>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeForm}
                      disabled={formBusy}
                      className="rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={formBusy}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 py-2.5 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {formBusy && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}

                      {saving
                        ? 'Saving...'
                        : uploadingImage
                          ? 'Uploading...'
                          : editingId
                            ? 'Update Slide'
                            : 'Create Slide'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function StatCard({
  label,
  value,
  text,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8A7467]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#281912]">
            {value}
          </p>

          <p className="mt-1 text-xs text-[#9A8478]">
            {text}
          </p>
        </div>

        <div className="rounded-xl bg-[#F0E8E1] p-2.5 text-[#6B4228]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function MiniInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#E9E0DA] bg-[#FAF7F4] p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9A8478]">
        {label}
      </p>

      <p className="mt-1.5 line-clamp-2 break-words text-xs font-semibold leading-5 text-[#4E3D34]">
        {value}
      </p>
    </div>
  )
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
          {eyebrow}
        </p>

        <h4 className="mt-1 text-lg font-semibold text-[#281912]">
          {title}
        </h4>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[#8A7467]">
            {description}
          </p>
        )}
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