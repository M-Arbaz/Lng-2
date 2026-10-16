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
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  Monitor,
  MousePointerClick,
  Plus,
  Search,
  Smartphone,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import heroBannersService from '../utils/heroBannersService.js'

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
  { value: 'categories', label: 'Categories' },
  { value: 'blogs', label: 'Blog' },
  { value: 'reels', label: 'Reels' },
  { value: 'about', label: 'About' },
  { value: 'contact', label: 'Contact' },
  { value: 'cart', label: 'Cart' },
]

const createInitialForm = () => ({
  title: '',
  subtitle: '',
  badge: '',

  image: '',
  imageMobile: '',
  alt: '',

  primaryLabel: '',
  primaryActionType: 'section',
  primaryActionValue: '',

  secondaryLabel: '',
  secondaryActionType: 'section',
  secondaryActionValue: '',

  displayOrder: 0,

  isActive: true,
  fitToScreen: true,
  fullScreen: false,
})

function getActionLabel(action) {
  if (!action) return 'No action'

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

export default function AdminHeroBannersPage() {
  const [banners, setBanners] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [searchQuery, setSearchQuery] =
    useState('')

  const [showForm, setShowForm] =
    useState(false)

  const [editingId, setEditingId] =
    useState(null)

  const [saving, setSaving] =
    useState(false)

  const [deletingId, setDeletingId] =
    useState(null)

  const [togglingId, setTogglingId] =
    useState(null)

  const [reorderingId, setReorderingId] =
    useState(null)

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false)

  const [
    uploadingMobileImage,
    setUploadingMobileImage,
  ] = useState(false)

  const [imagePreview, setImagePreview] =
    useState('')

  const [
    mobileImagePreview,
    setMobileImagePreview,
  ] = useState('')

  const [formData, setFormData] =
    useState(createInitialForm)

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const fileInputRef = useRef(null)

  const mobileFileInputRef =
    useRef(null)

  const formBusy =
    saving ||
    uploadingImage ||
    uploadingMobileImage

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

  const loadBanners = async () => {
    try {
      setLoading(true)

      const data =
        await heroBannersService.getAllBanners()

      setBanners(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Error loading hero banners:',
        error
      )

      showMessage(
        'error',
        'Failed to load hero banners.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const filteredBanners =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      if (!query) {
        return banners
      }

      return banners.filter(
        (banner) =>
          [
            banner.title,
            banner.subtitle,
            banner.badge,
            banner.alt,
          ].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(query)
          )
      )
    }, [banners, searchQuery])

  const stats = useMemo(() => {
    return {
      total: banners.length,

      active: banners.filter(
        (banner) =>
          banner.isActive !== false
      ).length,

      inactive: banners.filter(
        (banner) =>
          banner.isActive === false
      ).length,

      mobileReady: banners.filter(
        (banner) =>
          Boolean(banner.imageMobile)
      ).length,
    }
  }, [banners])

  const resetFormState = () => {
    setFormData(
      createInitialForm()
    )

    setImagePreview('')
    setMobileImagePreview('')
    setEditingId(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if (
      mobileFileInputRef.current
    ) {
      mobileFileInputRef.current.value =
        ''
    }
  }

  const openCreateForm = () => {
    resetFormState()
    setShowForm(true)
  }

  const closeForm = () => {
    if (formBusy) return

    setShowForm(false)
    resetFormState()
  }

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title || '',
      subtitle:
        banner.subtitle || '',
      badge: banner.badge || '',

      image: banner.image || '',
      imageMobile:
        banner.imageMobile || '',
      alt: banner.alt || '',

      primaryLabel:
        banner.primaryLabel || '',

      primaryActionType:
        banner.primaryAction?.type ||
        'section',

      primaryActionValue:
        banner.primaryAction?.value ||
        '',

      secondaryLabel:
        banner.secondaryLabel || '',

      secondaryActionType:
        banner.secondaryAction?.type ||
        'section',

      secondaryActionValue:
        banner.secondaryAction?.value ||
        '',

      displayOrder:
        banner.displayOrder || 0,

      isActive:
        banner.isActive !== false,

      fitToScreen:
        banner.fitToScreen !== false,

      fullScreen:
        banner.fullScreen === true,
    })

    setImagePreview(
      banner.image || ''
    )

    setMobileImagePreview(
      banner.imageMobile || ''
    )

    setEditingId(banner.id)
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
          await heroBannersService.uploadBannerImage(
            file
          )

        setFormData((prev) => ({
          ...prev,
          image: url,
        }))

        setImagePreview(url)

        showMessage(
          'success',
          'Desktop banner image uploaded.'
        )
      } catch (error) {
        console.error(
          'Desktop banner upload failed:',
          error
        )

        setImagePreview(
          formData.image || ''
        )

        showMessage(
          'error',
          'Desktop image upload failed.'
        )
      } finally {
        setUploadingImage(false)
      }
    }

  const handleMobileImageUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      if (!file) return

      const reader =
        new FileReader()

      reader.onloadend = () => {
        setMobileImagePreview(
          reader.result
        )
      }

      reader.readAsDataURL(file)

      try {
        setUploadingMobileImage(
          true
        )

        const url =
          await heroBannersService.uploadBannerImage(
            file
          )

        setFormData((prev) => ({
          ...prev,
          imageMobile: url,
        }))

        setMobileImagePreview(url)

        showMessage(
          'success',
          'Mobile banner image uploaded.'
        )
      } catch (error) {
        console.error(
          'Mobile banner upload failed:',
          error
        )

        setMobileImagePreview(
          formData.imageMobile || ''
        )

        showMessage(
          'error',
          'Mobile image upload failed.'
        )
      } finally {
        setUploadingMobileImage(
          false
        )
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

  const handleRemoveMobileImage =
    () => {
      setFormData((prev) => ({
        ...prev,
        imageMobile: '',
      }))

      setMobileImagePreview('')

      if (
        mobileFileInputRef.current
      ) {
        mobileFileInputRef.current.value =
          ''
      }
    }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (!formData.image) {
      showMessage(
        'error',
        'Please upload a desktop banner image.'
      )

      return
    }

    try {
      setSaving(true)

      const payload = {
        title:
          formData.title.trim(),

        subtitle:
          formData.subtitle.trim(),

        badge:
          formData.badge.trim(),

        image: formData.image,

        imageMobile:
          formData.imageMobile || '',

        alt:
          formData.alt.trim() ||
          formData.title.trim(),

        primaryLabel:
          formData.primaryLabel.trim(),

        primaryAction:
          formData.primaryLabel.trim()
            ? {
              type:
                formData.primaryActionType,

              value:
                formData.primaryActionValue,
            }
            : null,

        secondaryLabel:
          formData.secondaryLabel.trim(),

        secondaryAction:
          formData.secondaryLabel.trim() &&
            formData.secondaryActionValue
            ? {
              type:
                formData.secondaryActionType,

              value:
                formData.secondaryActionValue,
            }
            : null,

        displayOrder:
          Number(
            formData.displayOrder
          ) || 0,

        isActive:
          formData.isActive,

        fitToScreen:
          formData.fitToScreen,

        fullScreen:
          formData.fullScreen,
      }

      if (editingId) {
        await heroBannersService.updateBanner(
          editingId,
          payload
        )

        setBanners((prev) =>
          prev
            .map((banner) =>
              banner.id === editingId
                ? {
                  ...banner,
                  ...payload,
                }
                : banner
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
          'Hero banner updated.'
        )
      } else {
        const newBanner =
          await heroBannersService.createBanner(
            payload
          )

        setBanners((prev) =>
          [
            ...prev,
            newBanner,
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
          'Hero banner created.'
        )
      }

      setShowForm(false)
      resetFormState()
    } catch (error) {
      console.error(
        'Error saving hero banner:',
        error
      )

      showMessage(
        'error',
        'Failed to save hero banner.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    banner
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${banner.title ||
        'this hero banner'
        }"? This action cannot be undone.`
      )

    if (!confirmed) return

    try {
      setDeletingId(banner.id)

      await heroBannersService.deleteBanner(
        banner.id
      )

      setBanners((prev) =>
        prev.filter(
          (item) =>
            item.id !== banner.id
        )
      )

      showMessage(
        'success',
        'Hero banner deleted.'
      )
    } catch (error) {
      console.error(
        'Error deleting banner:',
        error
      )

      showMessage(
        'error',
        'Failed to delete hero banner.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive =
    async (banner) => {
      const nextActive =
        banner.isActive === false

      try {
        setTogglingId(banner.id)

        await heroBannersService.updateBanner(
          banner.id,
          {
            isActive: nextActive,
          }
        )

        setBanners((prev) =>
          prev.map((item) =>
            item.id === banner.id
              ? {
                ...item,
                isActive: nextActive,
              }
              : item
          )
        )

        showMessage(
          'success',
          nextActive
            ? 'Banner activated.'
            : 'Banner deactivated.'
        )
      } catch (error) {
        console.error(
          'Error toggling banner:',
          error
        )

        showMessage(
          'error',
          'Failed to update banner visibility.'
        )
      } finally {
        setTogglingId(null)
      }
    }

  const moveBanner = async (
    bannerId,
    direction
  ) => {
    const currentIndex =
      banners.findIndex(
        (banner) =>
          banner.id === bannerId
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
      targetIndex >= banners.length
    ) {
      return
    }

    const current =
      banners[currentIndex]

    const target =
      banners[targetIndex]

    const currentOrder =
      Number(
        current.displayOrder || 0
      )

    const targetOrder =
      Number(
        target.displayOrder || 0
      )

    try {
      setReorderingId(bannerId)

      await heroBannersService.updateBanner(
        current.id,
        {
          displayOrder: targetOrder,
        }
      )

      await heroBannersService.updateBanner(
        target.id,
        {
          displayOrder: currentOrder,
        }
      )

      const updated =
        banners.map((banner) => {
          if (
            banner.id === current.id
          ) {
            return {
              ...banner,
              displayOrder:
                targetOrder,
            }
          }

          if (
            banner.id === target.id
          ) {
            return {
              ...banner,
              displayOrder:
                currentOrder,
            }
          }

          return banner
        })

      setBanners(
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
        'Banner order updated.'
      )
    } catch (error) {
      console.error(
        'Error reordering banners:',
        error
      )

      showMessage(
        'error',
        'Failed to reorder banners.'
      )

      loadBanners()
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-[#FFFEFC] shadow-sm">
                <LayoutTemplate className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Storefront
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Hero Banners
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Manage homepage hero
                  artwork, responsive images,
                  calls to action and banner
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
              Add Banner
            </button>
          </div>
        </section>

        {/* Message */}
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
            label="Total Banners"
            value={stats.total}
            text="Homepage slides"
            icon={ImageIcon}
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
            label="Mobile Ready"
            value={stats.mobileReady}
            text="Dedicated mobile image"
            icon={Smartphone}
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
              placeholder="Search title, subtitle, badge or alt text..."
              className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
            />
          </div>

          <div className="mt-4 border-t border-[#EEE5DF] pt-4">
            <p className="text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {
                  filteredBanners.length
                }
              </span>{' '}
              of {banners.length}{' '}
              banners
            </p>
          </div>
        </section>

        {/* Banners */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading hero banners...
              </p>
            </div>
          </section>
        ) : filteredBanners.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <ImageIcon className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No hero banners found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
              {searchQuery
                ? 'Try adjusting your search.'
                : 'Create your first homepage hero banner.'}
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredBanners.map(
              (banner) => {
                const fullIndex =
                  banners.findIndex(
                    (item) =>
                      item.id ===
                      banner.id
                  )

                const active =
                  banner.isActive !==
                  false

                const reorderBusy =
                  reorderingId ===
                  banner.id

                return (
                  <article
                    key={banner.id}
                    className={`overflow-hidden rounded-2xl border bg-[#FFFEFC] shadow-[0_10px_30px_rgba(58,33,23,0.05)] transition ${active
                        ? 'border-[#E7DCD4]'
                        : 'border-[#E6DDD7] opacity-75'
                      }`}
                  >
                    <div className="grid lg:grid-cols-[330px_1fr]">
                      {/* Image */}
                      <div className="relative min-h-[210px] overflow-hidden bg-[#EEE7E1]">
                        {banner.image ? (
                          <img
                            src={
                              banner.image
                            }
                            alt={
                              banner.alt ||
                              banner.title ||
                              'Hero banner'
                            }
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[210px] items-center justify-center text-[#AA978C]">
                            <ImageIcon className="h-9 w-9" />
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-[#281912]/70 to-transparent p-4 pt-10">
                          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#3A2117] shadow-sm">
                            Desktop
                          </span>

                          {banner.imageMobile && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#3A2117] shadow-sm">
                              <Smartphone className="h-3 w-3" />
                              Mobile
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {banner.badge && (
                                <span className="rounded-full border border-[#DCCCBD] bg-[#F6EFE8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B4228]">
                                  {
                                    banner.badge
                                  }
                                </span>
                              )}

                              <span className="rounded-full bg-[#F7F4EF] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#8A7467]">
                                Order{' '}
                                {Number(
                                  banner.displayOrder ||
                                  0
                                )}
                              </span>
                            </div>

                            <h3 className="mt-3 text-xl font-semibold text-[#281912]">
                              {banner.title ||
                                'Untitled Banner'}
                            </h3>

                            {banner.subtitle && (
                              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                                {
                                  banner.subtitle
                                }
                              </p>
                            )}
                          </div>

                          {/* Reorder */}
                          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#E2D6CE] bg-[#FAF7F4] p-1">
                            <button
                              type="button"
                              onClick={() =>
                                moveBanner(
                                  banner.id,
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
                                moveBanner(
                                  banner.id,
                                  'down'
                                )
                              }
                              disabled={
                                fullIndex ===
                                -1 ||
                                fullIndex >=
                                banners.length -
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

                        {/* Settings */}
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <MiniInfo
                            label="Primary CTA"
                            value={
                              banner.primaryLabel
                                ? `${banner.primaryLabel} → ${getActionLabel(
                                  banner.primaryAction
                                )}`
                                : 'None'
                            }
                          />

                          <MiniInfo
                            label="Secondary CTA"
                            value={
                              banner.secondaryLabel
                                ? `${banner.secondaryLabel} → ${getActionLabel(
                                  banner.secondaryAction
                                )}`
                                : 'None'
                            }
                          />

                          <MiniInfo
                            label="Image Fit"
                            value={
                              banner.fitToScreen !==
                                false
                                ? 'Cover screen'
                                : 'Original fit'
                            }
                          />

                          <MiniInfo
                            label="Height"
                            value={
                              banner.fullScreen ===
                                true
                                ? 'Full screen'
                                : 'Standard'
                            }
                          />
                        </div>

                        {/* Actions */}
                        <div className="mt-5 flex flex-col gap-3 border-t border-[#EEE5DF] pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleActive(
                                banner
                              )
                            }
                            disabled={
                              togglingId ===
                              banner.id
                            }
                            className={`inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${active
                                ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                                : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                              }`}
                          >
                            {togglingId ===
                              banner.id ? (
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
                                  banner
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
                                  banner
                                )
                              }
                              disabled={
                                deletingId ===
                                banner.id
                              }
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E1C8C3] bg-[#FFFEFC] px-4 py-2.5 text-sm font-semibold text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50 sm:flex-none"
                            >
                              {deletingId ===
                                banner.id ? (
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

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-[#FFFEFC]">
                    <LayoutTemplate className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Storefront
                    </p>

                    <h3 className="mt-0.5 text-lg font-semibold text-[#281912] sm:text-xl">
                      {editingId
                        ? 'Edit Hero Banner'
                        : 'Create Hero Banner'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={formBusy}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7] hover:text-[#3A2117] disabled:opacity-50"
                  aria-label="Close"
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
                  {/* Images */}
                  <FormSection
                    eyebrow="Media"
                    title="Responsive Banner Images"
                    description="Desktop artwork is required. A separate mobile image gives better control on smaller screens."
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      <BannerUploader
                        icon={Monitor}
                        title="Desktop Banner"
                        required
                        hint="Recommended 3780 × 1400 horizontal image"
                        preview={
                          imagePreview ||
                          formData.image
                        }
                        inputRef={
                          fileInputRef
                        }
                        uploading={
                          uploadingImage
                        }
                        onUpload={
                          handleImageUpload
                        }
                        onRemove={
                          handleRemoveImage
                        }
                      />

                      <BannerUploader
                        icon={Smartphone}
                        title="Mobile Banner"
                        hint="Optional dedicated mobile / square artwork"
                        preview={
                          mobileImagePreview ||
                          formData.imageMobile
                        }
                        inputRef={
                          mobileFileInputRef
                        }
                        uploading={
                          uploadingMobileImage
                        }
                        onUpload={
                          handleMobileImageUpload
                        }
                        onRemove={
                          handleRemoveMobileImage
                        }
                      />
                    </div>
                  </FormSection>

                  {/* Content */}
                  <FormSection
                    eyebrow="Content"
                    title="Banner Copy"
                    description="Control the text displayed over the hero artwork."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <FieldLabel>
                          Title
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
                          placeholder="e.g. Illuminate Your Home"
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <FieldLabel>
                          Subtitle
                        </FieldLabel>

                        <textarea
                          name="subtitle"
                          value={
                            formData.subtitle
                          }
                          onChange={
                            handleInputChange
                          }
                          rows={3}
                          placeholder="Add a short supporting message..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          Badge
                        </FieldLabel>

                        <input
                          type="text"
                          name="badge"
                          value={
                            formData.badge
                          }
                          onChange={
                            handleInputChange
                          }
                          placeholder="e.g. New Collection"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          Alt Text
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
                          className={inputClass}
                        />

                        <p className="mt-1.5 text-xs text-[#9A8478]">
                          If left empty,
                          banner title will be
                          used.
                        </p>
                      </div>
                    </div>
                  </FormSection>

                  {/* CTA */}
                  <FormSection
                    eyebrow="Actions"
                    title="Call to Action Buttons"
                    description="Buttons can navigate to a storefront section or an external URL."
                  >
                    <div className="space-y-4">
                      <ActionEditor
                        title="Primary Button"
                        prefix="primary"
                        formData={
                          formData
                        }
                        onChange={
                          handleInputChange
                        }
                      />

                      <ActionEditor
                        title="Secondary Button"
                        prefix="secondary"
                        formData={
                          formData
                        }
                        onChange={
                          handleInputChange
                        }
                      />
                    </div>
                  </FormSection>

                  {/* Display */}
                  <FormSection
                    eyebrow="Display"
                    title="Banner Presentation"
                    description="Control visibility, ordering and how the artwork fills the hero area."
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

                      <div className="rounded-xl border border-[#E5DAD2] bg-[#FAF7F4] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7A68]">
                          Current Preview
                        </p>

                        <p className="mt-2 text-base font-semibold text-[#281912]">
                          {formData.title ||
                            'Untitled Banner'}
                        </p>

                        <p className="mt-1 text-xs text-[#8A7467]">
                          Order #
                          {Number(
                            formData.displayOrder ||
                            0
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <ToggleCard
                        name="isActive"
                        checked={
                          formData.isActive
                        }
                        onChange={
                          handleInputChange
                        }
                        icon={Eye}
                        title="Active"
                        description="Show this banner on the storefront."
                      />

                      <ToggleCard
                        name="fitToScreen"
                        checked={
                          formData.fitToScreen
                        }
                        onChange={
                          handleInputChange
                        }
                        icon={Monitor}
                        title="Fit to Screen"
                        description="Use cover-style image fitting."
                      />

                      <ToggleCard
                        name="fullScreen"
                        checked={
                          formData.fullScreen
                        }
                        onChange={
                          handleInputChange
                        }
                        icon={
                          LayoutTemplate
                        }
                        title="Full Screen"
                        description="Display hero at full viewport height."
                      />
                    </div>
                  </FormSection>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="hidden text-xs text-[#8A7467] sm:block">
                    Desktop image is required
                    before saving.
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
                        : uploadingImage ||
                          uploadingMobileImage
                          ? 'Uploading...'
                          : editingId
                            ? 'Update Banner'
                            : 'Create Banner'}
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

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

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

      <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-5 text-[#4E3D34]">
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

function BannerUploader({
  icon: Icon,
  title,
  hint,
  required = false,
  preview,
  inputRef,
  uploading,
  onUpload,
  onRemove,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#6B4228]" />

        <label className="text-sm font-semibold text-[#4E3D34]">
          {title}
          {required && (
            <span className="ml-1 text-[#A45145]">
              *
            </span>
          )}
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-dashed border-[#D7C7BC] bg-[#FAF7F4]">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={`${title} preview`}
              className="h-56 w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-[#281912]/75 to-transparent p-3 pt-10">
              <button
                type="button"
                onClick={() =>
                  inputRef.current?.click()
                }
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#3A2117] shadow-sm disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                Replace
              </button>

              <button
                type="button"
                onClick={onRemove}
                disabled={uploading}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-[#954B42] shadow-sm disabled:opacity-50"
                aria-label={`Remove ${title}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            disabled={uploading}
            className="flex min-h-[224px] w-full flex-col items-center justify-center px-6 py-8 text-center transition hover:bg-[#F7F2ED] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#6B4228]" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                <Upload className="h-5 w-5" />
              </div>
            )}

            <p className="mt-3 text-sm font-semibold text-[#4E3D34]">
              {uploading
                ? 'Uploading to XCDN...'
                : `Upload ${title}`}
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-[#9A8478]">
              {hint}
            </p>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />
      </div>

      {uploading && preview && (
        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#6B4228]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Uploading to XCDN...
        </div>
      )}
    </div>
  )
}

function ActionEditor({
  title,
  prefix,
  formData,
  onChange,
}) {
  const labelName =
    `${prefix}Label`

  const typeName =
    `${prefix}ActionType`

  const valueName =
    `${prefix}ActionValue`

  const actionType =
    formData[typeName]

  return (
    <div className="rounded-xl border border-[#E6DCD5] bg-[#FAF7F4] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
          <MousePointerClick className="h-4 w-4" />
        </div>

        <div>
          <h5 className="text-sm font-semibold text-[#281912]">
            {title}
          </h5>

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
            name={labelName}
            value={
              formData[labelName]
            }
            onChange={onChange}
            placeholder={
              prefix === 'primary'
                ? 'e.g. Shop Now'
                : 'e.g. Learn More'
            }
            className={inputClass}
          />
        </div>

        <div>
          <FieldLabel>
            Action Type
          </FieldLabel>

          <select
            name={typeName}
            value={actionType}
            onChange={onChange}
            className={inputClass}
          >
            {ACTION_TYPES.map(
              (type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <FieldLabel>
            {actionType ===
              'section'
              ? 'Destination'
              : 'External URL'}
          </FieldLabel>

          {actionType ===
            'section' ? (
            <select
              name={valueName}
              value={
                formData[valueName]
              }
              onChange={onChange}
              className={inputClass}
            >
              <option value="">
                -- Select Section --
              </option>

              {SECTION_OPTIONS.map(
                (section) => (
                  <option
                    key={
                      section.value
                    }
                    value={
                      section.value
                    }
                  >
                    {section.label}
                  </option>
                )
              )}
            </select>
          ) : (
            <input
              type="text"
              name={valueName}
              value={
                formData[valueName]
              }
              onChange={onChange}
              placeholder="https://..."
              className={inputClass}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleCard({
  name,
  checked,
  onChange,
  icon: Icon,
  title,
  description,
}) {
  return (
    <label
      className={`cursor-pointer rounded-xl border p-4 transition ${checked
          ? 'border-[#BFA995] bg-[#F5EEE8]'
          : 'border-[#E6DCD5] bg-[#FAF7F4]'
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
          <Icon className="h-4 w-4" />
        </div>

        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 accent-[#6B4228]"
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-[#281912]">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-[#8A7467]">
        {description}
      </p>
    </label>
  )
}