'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'

import onboardingService from '../utils/onboardingService.js'

const MODULE_OPTIONS = [
  {
    value:
      '/admin/dashboard',
    label: 'Dashboard',
  },
  {
    value:
      '/admin/products',
    label: 'Products',
  },
  {
    value:
      '/admin/categories',
    label: 'Categories',
  },
  {
    value:
      '/admin/orders',
    label: 'Orders',
  },
  {
    value:
      '/admin/customers',
    label: 'Customers',
  },
  {
    value:
      '/admin/coupons',
    label: 'Coupons',
  },
  {
    value:
      '/admin/payments',
    label: 'Payments',
  },
  {
    value:
      '/admin/custom-orders',
    label: 'Custom Orders',
  },
  {
    value:
      '/admin/hero-banners',
    label: 'Hero Banners',
  },
  {
    value:
      '/admin/collection-slides',
    label: 'Collection Slider',
  },
  {
    value:
      '/admin/instagram-grid',
    label: 'Instagram Grid',
  },
  {
    value:
      '/admin/reels',
    label: 'Reels',
  },
  {
    value:
      '/admin/blogs',
    label: 'Blogs',
  },
  {
    value:
      '/admin/reviews',
    label: 'Reviews',
  },
  {
    value:
      '/admin/about',
    label: 'About Page',
  },
  {
    value:
      '/admin/pages',
    label: 'Pages',
  },
  {
    value:
      '/admin/contact-submissions',
    label:
      'Contact Submissions',
  },
  {
    value:
      '/admin/contact-page',
    label: 'Contact Page',
  },
  {
    value:
      '/admin/newsletter',
    label: 'Newsletter',
  },
  {
    value:
      '/admin/announcements',
    label:
      'Announcement Bar',
  },
  {
    value:
      '/admin/website-popups',
    label: 'Website Popups',
  },
  {
    value:
      '/admin/onboarding',
    label: 'Onboarding',
  },
  {
    value:
      '/admin/shipping-fees',
    label: 'Shipping Fees',
  },
  {
    value:
      '/admin/bank-details',
    label: 'Bank Details',
  },
  {
    value:
      '/admin/social-links',
    label: 'Social Links',
  },
  {
    value:
      '/admin/footer',
    label: 'Footer',
  },
]

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

function createStep() {
  return {
    title: '',
    description: '',
    order: 0,
  }
}

function createForm() {
  return {
    modulePath:
      '/admin/dashboard',

    title: '',

    description: '',

    isActive: true,

    steps: [
      createStep(),
    ],
  }
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—'
  }

  return date.toLocaleString(
    'en-PK',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  )
}

function getModuleLabel(
  path
) {
  return (
    MODULE_OPTIONS.find(
      (item) =>
        item.value === path
    )?.label ||
    path ||
    'Unknown Module'
  )
}

export default function AdminOnboardingPage() {
  const [
    guides,
    setGuides,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [
    showForm,
    setShowForm,
  ] = useState(false)

  const [
    editingId,
    setEditingId,
  ] = useState(null)

  const [
    formData,
    setFormData,
  ] = useState(
    createForm
  )

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    deletingId,
    setDeletingId,
  ] = useState(null)

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null)

  const [
    previewGuide,
    setPreviewGuide,
  ] = useState(null)

  const [
    previewStep,
    setPreviewStep,
  ] = useState(0)

  const [
    message,
    setMessage,
  ] = useState({
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
      window.setTimeout(
        () => {
          setMessage({
            type: '',
            text: '',
          })
        },
        3500
      )
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

  const loadGuides =
    async ({
      silent = false,
    } = {}) => {
      try {
        if (!silent) {
          setLoading(true)
        }

        const data =
          await onboardingService.getAllGuides()

        setGuides(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (error) {
        console.error(
          'Onboarding guides load failed:',
          error
        )

        showMessage(
          'error',
          'Failed to load onboarding guides.'
        )
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    }

  useEffect(() => {
    loadGuides()
  }, [])

  const stats =
    useMemo(() => {
      const active =
        guides.filter(
          (guide) =>
            guide.isActive !==
            false
        ).length

      const inactive =
        guides.length -
        active

      const coveredModules =
        new Set(
          guides
            .filter(
              (guide) =>
                guide.isActive !==
                false
            )
            .map(
              (guide) =>
                guide.modulePath
            )
        ).size

      return {
        total:
          guides.length,

        active,

        inactive,

        coveredModules,
      }
    }, [
      guides,
    ])

  const filteredGuides =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      return guides.filter(
        (guide) => {
          const active =
            guide.isActive !==
            false

          const matchesStatus =
            statusFilter ===
              'all' ||
            (statusFilter ===
              'active'
              ? active
              : !active)

          const matchesSearch =
            !query ||
            [
              guide.title,
              guide.description,
              guide.modulePath,
              getModuleLabel(
                guide.modulePath
              ),
            ].some((value) =>
              String(
                value || ''
              )
                .toLowerCase()
                .includes(query)
            )

          return (
            matchesStatus &&
            matchesSearch
          )
        }
      )
    }, [
      guides,
      searchQuery,
      statusFilter,
    ])

  const resetForm =
    () => {
      setFormData(
        createForm()
      )

      setEditingId(null)
      setShowForm(false)
    }

  const openCreate =
    () => {
      setEditingId(null)

      setFormData(
        createForm()
      )

      setShowForm(true)
    }

  const handleEdit = (
    guide
  ) => {
    const steps =
      Array.isArray(
        guide.steps
      ) &&
      guide.steps.length
        ? [...guide.steps]
            .sort(
              (a, b) =>
                (a.order || 0) -
                (b.order || 0)
            )
            .map(
              (
                step,
                index
              ) => ({
                title:
                  step.title ||
                  '',

                description:
                  step.description ||
                  '',

                order:
                  index,
              })
            )
        : [
            createStep(),
          ]

    setFormData({
      modulePath:
        guide.modulePath ||
        '/admin/dashboard',

      title:
        guide.title || '',

      description:
        guide.description ||
        '',

      isActive:
        guide.isActive !==
        false,

      steps,
    })

    setEditingId(
      guide.id
    )

    setShowForm(true)
  }

  const handleInputChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target

      setFormData(
        (prev) => ({
          ...prev,

          [name]:
            type ===
            'checkbox'
              ? checked
              : value,
        })
      )
    }

  const handleStepChange =
    (
      index,
      field,
      value
    ) => {
      setFormData(
        (prev) => {
          const steps =
            [...prev.steps]

          steps[index] = {
            ...steps[index],
            [field]: value,
          }

          return {
            ...prev,
            steps,
          }
        }
      )
    }

  const addStep = () => {
    setFormData(
      (prev) => ({
        ...prev,

        steps: [
          ...prev.steps,

          {
            ...createStep(),

            order:
              prev.steps.length,
          },
        ],
      })
    )
  }

  const removeStep = (
    index
  ) => {
    setFormData(
      (prev) => {
        if (
          prev.steps.length <=
          1
        ) {
          return prev
        }

        const steps =
          prev.steps
            .filter(
              (
                _,
                stepIndex
              ) =>
                stepIndex !==
                index
            )
            .map(
              (
                step,
                stepIndex
              ) => ({
                ...step,
                order:
                  stepIndex,
              })
            )

        return {
          ...prev,
          steps,
        }
      }
    )
  }

  const moveStep = (
    index,
    direction
  ) => {
    setFormData(
      (prev) => {
        const targetIndex =
          index + direction

        if (
          targetIndex < 0 ||
          targetIndex >=
            prev.steps.length
        ) {
          return prev
        }

        const steps =
          [...prev.steps]

        const current =
          steps[index]

        steps[index] =
          steps[
            targetIndex
          ]

        steps[
          targetIndex
        ] = current

        return {
          ...prev,

          steps:
            steps.map(
              (
                step,
                stepIndex
              ) => ({
                ...step,
                order:
                  stepIndex,
              })
            ),
        }
      }
    )
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      const title =
        formData.title.trim()

      if (!title) {
        showMessage(
          'error',
          'Guide title is required.'
        )

        return
      }

      if (
        !formData.modulePath
      ) {
        showMessage(
          'error',
          'Please select a module.'
        )

        return
      }

      if (
        !formData.steps.length
      ) {
        showMessage(
          'error',
          'Please add at least one step.'
        )

        return
      }

      const invalidStep =
        formData.steps.some(
          (step) =>
            !step.title.trim() ||
            !step.description.trim()
        )

      if (invalidStep) {
        showMessage(
          'error',
          'Every step needs a title and description.'
        )

        return
      }

      try {
        setSaving(true)

        const payload = {
          modulePath:
            formData.modulePath,

          title,

          description:
            formData.description.trim(),

          isActive:
            formData.isActive,

          steps:
            formData.steps.map(
              (
                step,
                index
              ) => ({
                title:
                  step.title.trim(),

                description:
                  step.description.trim(),

                order:
                  index,
              })
            ),
        }

        if (editingId) {
          await onboardingService.updateGuide(
            editingId,
            payload
          )

          showMessage(
            'success',
            'Onboarding guide updated successfully.'
          )
        } else {
          await onboardingService.createGuide(
            payload
          )

          showMessage(
            'success',
            'Onboarding guide created successfully.'
          )
        }

        resetForm()

        await loadGuides({
          silent: true,
        })
      } catch (error) {
        console.error(
          'Onboarding guide save failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
            'Failed to save onboarding guide.'
        )
      } finally {
        setSaving(false)
      }
    }

  const handleToggleActive =
    async (guide) => {
      try {
        setUpdatingId(
          guide.id
        )

        await onboardingService.updateGuide(
          guide.id,
          {
            ...guide,

            isActive:
              guide.isActive ===
              false,
          }
        )

        await loadGuides({
          silent: true,
        })

        showMessage(
          'success',
          guide.isActive ===
          false
            ? 'Guide activated.'
            : 'Guide deactivated.'
        )
      } catch (error) {
        console.error(
          'Onboarding guide status update failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
            'Failed to update guide.'
        )
      } finally {
        setUpdatingId(null)
      }
    }

  const handleDelete =
    async (guide) => {
      const confirmed =
        window.confirm(
          `Delete "${guide.title || 'this guide'}"? This action cannot be undone.`
        )

      if (!confirmed) {
        return
      }

      try {
        setDeletingId(
          guide.id
        )

        await onboardingService.deleteGuide(
          guide.id
        )

        setGuides(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                guide.id
            )
        )

        showMessage(
          'success',
          'Onboarding guide deleted.'
        )
      } catch (error) {
        console.error(
          'Onboarding guide delete failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
            'Failed to delete guide.'
        )
      } finally {
        setDeletingId(null)
      }
    }

  const openPreview = (
    guide
  ) => {
    const steps =
      [...(guide.steps || [])]
        .sort(
          (a, b) =>
            (a.order || 0) -
            (b.order || 0)
        )

    setPreviewGuide({
      ...guide,
      steps,
    })

    setPreviewStep(0)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-white">
                <Lightbulb className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Admin Experience
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Onboarding Guides
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Create step-by-step
                  guidance for Admin
                  modules so team members
                  can understand important
                  workflows directly
                  inside the panel.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                openCreate
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#281912]"
            >
              <Plus className="h-4 w-4" />

              Add Guide
            </button>
          </div>
        </section>

        {/* Feedback */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${
              message.type ===
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
            icon={Lightbulb}
            label="Total Guides"
            value={stats.total}
            text="All onboarding guides"
          />

          <StatCard
            icon={Eye}
            label="Active"
            value={stats.active}
            text="Available to Admin users"
          />

          <StatCard
            icon={EyeOff}
            label="Inactive"
            value={stats.inactive}
            text="Currently hidden"
          />

          <StatCard
            icon={CheckCircle}
            label="Modules Covered"
            value={
              stats.coveredModules
            }
            text={`of ${MODULE_OPTIONS.length} modules`}
          />
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8478]" />

              <input
                type="text"
                value={
                  searchQuery
                }
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search title, module or description..."
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
              />
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="all">
                All Statuses
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <button
              type="button"
              onClick={() =>
                loadGuides()
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] px-4 py-3 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? 'animate-spin'
                    : ''
                }`}
              />

              Refresh
            </button>
          </div>

          <p className="mt-4 border-t border-[#EEE5DF] pt-4 text-sm text-[#7B685D]">
            Showing{' '}
            <span className="font-semibold text-[#3A2117]">
              {
                filteredGuides.length
              }
            </span>{' '}
            of {guides.length}{' '}
            guides
          </p>
        </section>

        {/* Guides */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading onboarding
                guides...
              </p>
            </div>
          </section>
        ) : filteredGuides.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <Lightbulb className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No guides found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
              {searchQuery ||
              statusFilter !==
                'all'
                ? 'Try adjusting your search or status filter.'
                : 'Create your first Admin onboarding guide.'}
            </p>
          </section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {filteredGuides.map(
              (guide) => {
                const active =
                  guide.isActive !==
                  false

                return (
                  <article
                    key={
                      guide.id
                    }
                    className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_10px_30px_rgba(58,33,23,0.05)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#F0E8E1] px-2.5 py-1 text-[10px] font-semibold text-[#6B4228]">
                            {getModuleLabel(
                              guide.modulePath
                            )}
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                              active
                                ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                                : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                            }`}
                          >
                            {active
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </div>

                        <h3 className="mt-3 break-words text-lg font-semibold text-[#281912]">
                          {guide.title ||
                            'Untitled Guide'}
                        </h3>

                        {guide.description && (
                          <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-[#7B685D]">
                            {
                              guide.description
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            openPreview(
                              guide
                            )
                          }
                          title="Preview guide"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              guide
                            )
                          }
                          title="Edit guide"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              guide
                            )
                          }
                          disabled={
                            deletingId ===
                            guide.id
                          }
                          title="Delete guide"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                        >
                          {deletingId ===
                          guide.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <InfoBox
                        label="Steps"
                        value={`${guide.steps?.length || 0} step(s)`}
                      />

                      <InfoBox
                        label="Last Updated"
                        value={formatDate(
                          guide.updatedAt ||
                            guide.createdAt
                        )}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
                      <code className="min-w-0 truncate text-[10px] text-[#9A8478]">
                        {
                          guide.modulePath
                        }
                      </code>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleActive(
                            guide
                          )
                        }
                        disabled={
                          updatingId ===
                          guide.id
                        }
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                          active
                            ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                            : 'border-[#D8C8BC] bg-[#F7F4EF] text-[#6B4228]'
                        }`}
                      >
                        {updatingId ===
                        guide.id ? (
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
                    </div>
                  </article>
                )
              }
            )}
          </section>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-white">
                    <Lightbulb className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Admin Guidance
                    </p>

                    <h3 className="text-lg font-semibold text-[#281912]">
                      {editingId
                        ? 'Edit Guide'
                        : 'Create Guide'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  disabled={saving}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Scrollable Content */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
                <FormSection
                  title="Guide Information"
                  description="Choose which Admin module this guide belongs to."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>
                        Admin Module *
                      </FieldLabel>

                      <select
                        name="modulePath"
                        value={
                          formData.modulePath
                        }
                        onChange={
                          handleInputChange
                        }
                        className={
                          inputClass
                        }
                      >
                        {MODULE_OPTIONS.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                      </select>

                      <p className="mt-1.5 text-xs leading-5 text-[#9A8478]">
                        One active guide
                        per module. Activating
                        another guide for
                        the same module will
                        disable the previous
                        one automatically.
                      </p>
                    </div>

                    <div>
                      <FieldLabel>
                        Guide Title *
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
                        className={
                          inputClass
                        }
                        placeholder="Welcome to Products"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <FieldLabel>
                      Guide Description
                    </FieldLabel>

                    <textarea
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={
                        handleInputChange
                      }
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder="Short introduction to this Admin module..."
                    />
                  </div>

                  <div className="mt-4">
                    <ToggleCard
                      checked={
                        formData.isActive
                      }
                      name="isActive"
                      onChange={
                        handleInputChange
                      }
                      title="Guide Active"
                      description="Show this onboarding guide to Admin users when they open the matching module."
                    />
                  </div>
                </FormSection>

                <FormSection
                  title="Tour Steps"
                  description="Add the instructions that Admin users will move through one by one."
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm text-[#7B685D]">
                      {
                        formData.steps.length
                      }{' '}
                      step(s)
                    </p>

                    <button
                      type="button"
                      onClick={
                        addStep
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-4 py-2.5 text-xs font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF]"
                    >
                      <Plus className="h-4 w-4" />
                      Add Step
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.steps.map(
                      (
                        step,
                        index
                      ) => (
                        <div
                          key={
                            index
                          }
                          className="rounded-2xl border border-[#E3D8D0] bg-[#FAF7F4] p-4 sm:p-5"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3A2117] text-xs font-semibold text-white">
                                {index +
                                  1}
                              </div>

                              <p className="text-sm font-semibold text-[#281912]">
                                Step{' '}
                                {index +
                                  1}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  moveStep(
                                    index,
                                    -1
                                  )
                                }
                                disabled={
                                  index ===
                                  0
                                }
                                title="Move up"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#EEE5DF] disabled:opacity-25"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  moveStep(
                                    index,
                                    1
                                  )
                                }
                                disabled={
                                  index ===
                                  formData
                                    .steps
                                    .length -
                                    1
                                }
                                title="Move down"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#EEE5DF] disabled:opacity-25"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeStep(
                                    index
                                  )
                                }
                                disabled={
                                  formData
                                    .steps
                                    .length <=
                                  1
                                }
                                title="Remove step"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF1EE] disabled:opacity-25"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <FieldLabel>
                              Step Title *
                            </FieldLabel>

                            <input
                              type="text"
                              value={
                                step.title
                              }
                              onChange={(
                                event
                              ) =>
                                handleStepChange(
                                  index,
                                  'title',
                                  event
                                    .target
                                    .value
                                )
                              }
                              className={
                                inputClass
                              }
                              placeholder="Add a Product"
                            />
                          </div>

                          <div className="mt-4">
                            <FieldLabel>
                              Step Description *
                            </FieldLabel>

                            <textarea
                              value={
                                step.description
                              }
                              onChange={(
                                event
                              ) =>
                                handleStepChange(
                                  index,
                                  'description',
                                  event
                                    .target
                                    .value
                                )
                              }
                              rows={4}
                              className={`${inputClass} resize-none`}
                              placeholder="Explain what the Admin should do on this step..."
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </FormSection>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="hidden text-xs text-[#8A7467] sm:block">
                    Saving an updated
                    guide will allow users
                    who completed the old
                    version to see the
                    updated tour again.
                  </p>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        resetForm
                      }
                      disabled={saving}
                      className="rounded-xl border border-[#DCCFC6] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF]"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:opacity-50"
                    >
                      {saving && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}

                      {saving
                        ? 'Saving...'
                        : editingId
                          ? 'Update Guide'
                          : 'Create Guide'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview */}
      {previewGuide &&
        previewGuide.steps?.length >
          0 && (
          <GuidePreview
            guide={
              previewGuide
            }
            currentStep={
              previewStep
            }
            setCurrentStep={
              setPreviewStep
            }
            onClose={() => {
              setPreviewGuide(
                null
              )
              setPreviewStep(0)
            }}
          />
        )}
    </AdminLayout>
  )
}

function GuidePreview({
  guide,
  currentStep,
  setCurrentStep,
  onClose,
}) {
  const steps =
    guide.steps || []

  const step =
    steps[currentStep]

  const last =
    currentStep ===
    steps.length - 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#281912]/65 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_30px_90px_rgba(40,25,18,0.35)]">
        <div className="flex items-center justify-between bg-[#3A2117] px-5 py-4 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <Lightbulb className="h-5 w-5 shrink-0 text-[#D8AD87]" />

            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.15em] text-[#D8AD87]">
                Preview
              </p>

              <p className="truncate text-sm font-semibold">
                {guide.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center gap-1.5">
            {steps.map(
              (
                _,
                index
              ) => (
                <span
                  key={
                    index
                  }
                  className={`h-1.5 rounded-full transition-all ${
                    index <=
                    currentStep
                      ? 'w-7 bg-[#6B4228]'
                      : 'w-4 bg-[#E4DAD3]'
                  }`}
                />
              )
            )}

            <span className="ml-auto text-xs font-medium text-[#9A8478]">
              {currentStep +
                1}{' '}
              / {steps.length}
            </span>
          </div>

          <h4 className="break-words text-xl font-semibold text-[#281912]">
            {step?.title}
          </h4>

          <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#6F5E54]">
            {step?.description}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[#E8DDD5] bg-[#F7F4EF] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#8A7467] transition hover:text-[#3A2117]"
          >
            Close Preview
          </button>

          <div className="flex items-center gap-2">
            {currentStep >
              0 && (
              <button
                type="button"
                onClick={() =>
                  setCurrentStep(
                    (prev) =>
                      prev - 1
                  )
                }
                className="inline-flex items-center gap-1 rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-3 py-2 text-xs font-semibold text-[#6B4228]"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (last) {
                  onClose()
                } else {
                  setCurrentStep(
                    (prev) =>
                      prev + 1
                  )
                }
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-[#3A2117] px-4 py-2 text-xs font-semibold text-white"
            >
              {last
                ? 'Finish'
                : 'Next'}

              {!last && (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  text,
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

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#E9E0DA] bg-[#FAF7F4] p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9A8478]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-xs font-semibold leading-5 text-[#4E3D34]">
        {value}
      </p>
    </div>
  )
}

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h4 className="text-lg font-semibold text-[#281912]">
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

function ToggleCard({
  checked,
  name,
  onChange,
  title,
  description,
}) {
  return (
    <label
      className={`block cursor-pointer rounded-xl border p-4 transition ${
        checked
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