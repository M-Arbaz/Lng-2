'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Globe2,
  Link2,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import socialLinksService from '../utils/socialLinksService.js'

const PLATFORM_OPTIONS = [
  {
    value: 'facebook',
    label: 'Facebook',
    shortLabel: 'FB',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    shortLabel: 'IG',
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    shortLabel: 'TT',
  },
  {
    value: 'youtube',
    label: 'YouTube',
    shortLabel: 'YT',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    shortLabel: 'IN',
  },
  {
    value: 'x',
    label: 'X (Twitter)',
    shortLabel: 'X',
  },
  {
    value: 'pinterest',
    label: 'Pinterest',
    shortLabel: 'PI',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    shortLabel: 'WA',
  },
]

const INITIAL_FORM = {
  platform: 'facebook',
  url: '',
  displayOrder: 0,
  isActive: true,
}

const inputClass =
  'w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A49388] focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.06]'

const labelClass =
  'mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4C3A31]'

function getPlatformInfo(value) {
  return (
    PLATFORM_OPTIONS.find(
      (platform) =>
        platform.value === value
    ) || {
      value,
      label:
        value || 'Unknown',
      shortLabel: '?',
    }
  )
}

function normalizeUrl(value) {
  const trimmed =
    String(value || '').trim()

  if (!trimmed) {
    return ''
  }

  if (
    /^https?:\/\//i.test(
      trimmed
    )
  ) {
    return trimmed
  }

  return `https://${trimmed}`
}

function isValidUrl(value) {
  try {
    const parsed =
      new URL(value)

    return (
      parsed.protocol ===
      'http:' ||
      parsed.protocol ===
      'https:'
    )
  } catch {
    return false
  }
}

export default function AdminSocialLinksPage() {
  const [
    links,
    setLinks,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    deletingId,
    setDeletingId,
  ] = useState(null)

  const [
    togglingId,
    setTogglingId,
  ] = useState(null)

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')

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
  ] = useState(INITIAL_FORM)

  const [
    message,
    setMessage,
  ] = useState({
    type: '',
    text: '',
  })

  useEffect(() => {
    let active = true

    const loadLinks =
      async () => {
        try {
          setLoading(true)

          const data =
            await socialLinksService.getAllSocialLinks()

          if (active) {
            setLinks(
              Array.isArray(data)
                ? data
                : []
            )
          }
        } catch (error) {
          console.error(
            'Error loading social links:',
            error
          )

          if (active) {
            setMessage({
              type: 'error',
              text:
                'Failed to load social links.',
            })
          }
        } finally {
          if (active) {
            setLoading(false)
          }
        }
      }

    loadLinks()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!showForm) {
      return undefined
    }

    const originalOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        'Escape' &&
        !saving
      ) {
        closeForm()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      document.body.style.overflow =
        originalOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [showForm, saving])

  const flashMessage = (
    type,
    text
  ) => {
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

  const sortedLinks =
    useMemo(() => {
      return [...links].sort(
        (a, b) => {
          const orderA =
            Number(
              a.displayOrder
            ) || 0

          const orderB =
            Number(
              b.displayOrder
            ) || 0

          if (
            orderA !== orderB
          ) {
            return (
              orderA -
              orderB
            )
          }

          return String(
            a.platform || ''
          ).localeCompare(
            String(
              b.platform ||
              ''
            )
          )
        }
      )
    }, [links])

  const filteredLinks =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      if (!query) {
        return sortedLinks
      }

      return sortedLinks.filter(
        (link) => {
          const platform =
            getPlatformInfo(
              link.platform
            )

          return (
            platform.label
              .toLowerCase()
              .includes(
                query
              ) ||
            String(
              link.url || ''
            )
              .toLowerCase()
              .includes(
                query
              )
          )
        }
      )
    }, [
      sortedLinks,
      searchQuery,
    ])

  const activeLinks =
    useMemo(
      () =>
        sortedLinks.filter(
          (link) =>
            link.isActive !==
            false
        ),
      [sortedLinks]
    )

  const inactiveCount =
    links.length -
    activeLinks.length

  const nextDisplayOrder =
    () => {
      if (!links.length) {
        return 0
      }

      const highest =
        Math.max(
          ...links.map(
            (link) =>
              Number(
                link.displayOrder
              ) || 0
          )
        )

      return highest + 1
    }

  const openCreateForm =
    () => {
      setEditingId(null)

      setFormData({
        ...INITIAL_FORM,
        displayOrder:
          nextDisplayOrder(),
      })

      setShowForm(true)
    }

  const openEditForm = (
    link
  ) => {
    setEditingId(link.id)

    setFormData({
      platform:
        link.platform ||
        'facebook',

      url:
        link.url || '',

      displayOrder:
        link.displayOrder ??
        0,

      isActive:
        link.isActive !==
        false,
    })

    setShowForm(true)
  }

  const closeForm = () => {
    if (saving) {
      return
    }

    setShowForm(false)
    setEditingId(null)

    setFormData(
      INITIAL_FORM
    )
  }

  const updateField = (
    name,
    value
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    )
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      const url =
        normalizeUrl(
          formData.url
        )

      if (!url) {
        setMessage({
          type: 'error',
          text:
            'Please enter a social profile URL.',
        })
        return
      }

      if (
        !isValidUrl(url)
      ) {
        setMessage({
          type: 'error',
          text:
            'Please enter a valid website URL.',
        })
        return
      }

      const parsedOrder =
        Number.parseInt(
          formData.displayOrder,
          10
        )

      const payload = {
        platform:
          formData.platform,

        url,

        displayOrder:
          Number.isFinite(
            parsedOrder
          )
            ? Math.max(
              0,
              parsedOrder
            )
            : 0,

        isActive:
          formData.isActive ===
          true,
      }

      try {
        setSaving(true)

        if (editingId) {
          const updated =
            await socialLinksService.updateSocialLink(
              editingId,
              payload
            )

          setLinks(
            (previous) =>
              previous.map(
                (link) =>
                  link.id ===
                    editingId
                    ? {
                      ...link,
                      ...updated,
                    }
                    : link
              )
          )

          flashMessage(
            'success',
            'Social link updated successfully.'
          )
        } else {
          const created =
            await socialLinksService.createSocialLink(
              payload
            )

          setLinks(
            (previous) => [
              ...previous,
              created,
            ]
          )

          flashMessage(
            'success',
            'Social link added successfully.'
          )
        }

        setShowForm(false)
        setEditingId(null)
        setFormData(
          INITIAL_FORM
        )
      } catch (error) {
        console.error(
          'Error saving social link:',
          error
        )

        setMessage({
          type: 'error',
          text:
            'Failed to save social link. Please try again.',
        })
      } finally {
        setSaving(false)
      }
    }

  const handleToggleActive =
    async (link) => {
      const currentlyActive =
        link.isActive !== false

      const nextActive =
        !currentlyActive

      try {
        setTogglingId(
          link.id
        )

        await socialLinksService.updateSocialLink(
          link.id,
          {
            isActive:
              nextActive,
          }
        )

        setLinks(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                  link.id
                  ? {
                    ...item,
                    isActive:
                      nextActive,
                  }
                  : item
            )
        )

        flashMessage(
          'success',
          nextActive
            ? 'Social link activated.'
            : 'Social link deactivated.'
        )
      } catch (error) {
        console.error(
          'Error toggling social link:',
          error
        )

        flashMessage(
          'error',
          'Failed to update social link status.'
        )
      } finally {
        setTogglingId(null)
      }
    }

  const handleDelete =
    async (link) => {
      const platform =
        getPlatformInfo(
          link.platform
        )

      const confirmed =
        window.confirm(
          `Delete ${platform.label} social link?`
        )

      if (!confirmed) {
        return
      }

      try {
        setDeletingId(
          link.id
        )

        await socialLinksService.deleteSocialLink(
          link.id
        )

        setLinks(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                link.id
            )
        )

        flashMessage(
          'success',
          'Social link deleted successfully.'
        )
      } catch (error) {
        console.error(
          'Error deleting social link:',
          error
        )

        flashMessage(
          'error',
          'Failed to delete social link.'
        )
      } finally {
        setDeletingId(null)
      }
    }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border border-[#4C3429] bg-[#3A2117] shadow-[0_20px_60px_rgba(58,33,23,0.14)]">
          <div className="relative px-5 py-7 sm:px-7">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/[0.04]" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
                  <Globe2 className="h-6 w-6 text-[#F7F4EF]" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D6BBA9]">
                    Store Settings
                  </p>

                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                    Social Links
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                    Manage the social
                    profiles displayed
                    across the storefront
                    while controlling
                    visibility and order.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  openCreateForm
                }
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#FFFEFC] px-5 text-sm font-semibold text-[#3A2117] transition hover:bg-[#F7F4EF]"
              >
                <Plus className="h-4 w-4" />
                Add Social Link
              </button>
            </div>
          </div>
        </section>

        {/* Message */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ${message.type ===
                'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
          >
            {message.type ===
              'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <span>
              {message.text}
            </span>
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
              Total Links
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#281912]">
              {links.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
              Active
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#281912]">
              {activeLinks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
              Hidden
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#281912]">
              {inactiveCount}
            </p>
          </div>
        </section>

        {/* Search + List */}
        <section className="overflow-hidden rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
          <div className="border-b border-[#ECE2DB] p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#281912]">
                  Social Profiles
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#806C60]">
                  Lower display
                  numbers appear first
                  on the storefront.
                </p>
              </div>

              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8171]" />

                <input
                  type="search"
                  value={
                    searchQuery
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchQuery(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search platform or URL..."
                  className="w-full rounded-xl border border-[#DCCFC6] bg-[#F7F4EF] py-3 pl-10 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A49388] focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.06]"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

                <p className="mt-3 text-sm text-[#806C60]">
                  Loading social
                  links...
                </p>
              </div>
            </div>
          ) : filteredLinks.length ===
            0 ? (
            <div className="flex min-h-[280px] items-center justify-center p-6 text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F2EAE4] text-[#6B4228]">
                  <Link2 className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#281912]">
                  No social links
                  found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#806C60]">
                  {searchQuery
                    ? 'Try a different search term.'
                    : 'Add your first social profile to display it on the storefront.'}
                </p>

                {!searchQuery && (
                  <button
                    type="button"
                    onClick={
                      openCreateForm
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3A2117] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#281912]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Link
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="divide-y divide-[#EEE4DD] md:hidden">
                {filteredLinks.map(
                  (link) => {
                    const platform =
                      getPlatformInfo(
                        link.platform
                      )

                    const active =
                      link.isActive !==
                      false

                    return (
                      <article
                        key={
                          link.id
                        }
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-xs font-bold text-[#6B4228]">
                              {
                                platform.shortLabel
                              }
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-[#281912]">
                                {
                                  platform.label
                                }
                              </p>

                              <a
                                href={
                                  link.url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 flex max-w-full items-center gap-1 truncate text-xs text-[#6B4228] hover:underline"
                              >
                                <span className="truncate">
                                  {
                                    link.url
                                  }
                                </span>

                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            </div>
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={
                              active
                            }
                            disabled={
                              togglingId ===
                              link.id
                            }
                            onClick={() =>
                              handleToggleActive(
                                link
                              )
                            }
                            className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${active
                                ? 'bg-[#3A2117]'
                                : 'bg-[#C9BDB5]'
                              }`}
                          >
                            <span
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${active
                                  ? 'left-6'
                                  : 'left-1'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[#EEE4DD] pt-4">
                          <span className="text-xs text-[#806C60]">
                            Order:{' '}
                            <strong className="text-[#281912]">
                              {link.displayOrder ??
                                0}
                            </strong>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  link
                                )
                              }
                              className="grid h-9 w-9 place-items-center rounded-lg border border-[#E3D7CE] text-[#6B4228] transition hover:bg-[#F7F4EF]"
                              aria-label={`Edit ${platform.label}`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                link.id
                              }
                              onClick={() =>
                                handleDelete(
                                  link
                                )
                              }
                              className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                              aria-label={`Delete ${platform.label}`}
                            >
                              {deletingId ===
                                link.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  }
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-[#E8DDD5] bg-[#F7F4EF]">
                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#806C60]">
                        Platform
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#806C60]">
                        URL
                      </th>

                      <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#806C60]">
                        Order
                      </th>

                      <th className="px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#806C60]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#806C60]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EEE4DD]">
                    {filteredLinks.map(
                      (link) => {
                        const platform =
                          getPlatformInfo(
                            link.platform
                          )

                        const active =
                          link.isActive !==
                          false

                        return (
                          <tr
                            key={
                              link.id
                            }
                            className="transition hover:bg-[#F7F4EF]/60"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#F2EAE4] text-[11px] font-bold text-[#6B4228]">
                                  {
                                    platform.shortLabel
                                  }
                                </div>

                                <span className="text-sm font-semibold text-[#281912]">
                                  {
                                    platform.label
                                  }
                                </span>
                              </div>
                            </td>

                            <td className="max-w-[360px] px-6 py-4">
                              <a
                                href={
                                  link.url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-[#6B4228] transition hover:text-[#281912] hover:underline"
                              >
                                <span className="truncate">
                                  {
                                    link.url
                                  }
                                </span>

                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              </a>
                            </td>

                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex min-w-[38px] justify-center rounded-lg bg-[#F2EAE4] px-2.5 py-1 text-xs font-semibold text-[#6B4228]">
                                {link.displayOrder ??
                                  0}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={
                                  active
                                }
                                disabled={
                                  togglingId ===
                                  link.id
                                }
                                onClick={() =>
                                  handleToggleActive(
                                    link
                                  )
                                }
                                className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${active
                                    ? 'bg-[#3A2117]'
                                    : 'bg-[#C9BDB5]'
                                  }`}
                              >
                                <span
                                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${active
                                      ? 'left-6'
                                      : 'left-1'
                                    }`}
                                />
                              </button>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(
                                      link
                                    )
                                  }
                                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#E3D7CE] text-[#6B4228] transition hover:bg-[#F7F4EF]"
                                  title="Edit"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    deletingId ===
                                    link.id
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      link
                                    )
                                  }
                                  className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                                  title="Delete"
                                >
                                  {deletingId ===
                                    link.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Preview */}
        {!loading && (
          <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] p-5 shadow-[0_12px_35px_rgba(58,33,23,0.05)] sm:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A8171]">
                Storefront Preview
              </p>

              <h2 className="mt-1 text-base font-semibold text-[#281912]">
                Active Social Links
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#806C60]">
                Only enabled links
                appear on the
                storefront.
              </p>
            </div>

            {activeLinks.length >
              0 ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {activeLinks.map(
                  (link) => {
                    const platform =
                      getPlatformInfo(
                        link.platform
                      )

                    return (
                      <a
                        key={
                          link.id
                        }
                        href={
                          link.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#DCCFC6] bg-[#F7F4EF] px-4 py-2.5 text-sm font-semibold text-[#3A2117] transition hover:border-[#6B4228] hover:bg-[#F2EAE4]"
                      >
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-[#3A2117] text-[9px] font-bold text-white">
                          {
                            platform.shortLabel
                          }
                        </span>

                        {
                          platform.label
                        }

                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                      </a>
                    )
                  }
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-[#DCCFC6] bg-[#F7F4EF] p-5 text-sm text-[#806C60]">
                No active social
                links are currently
                visible.
              </div>
            )}
          </section>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Close social link form"
            onClick={
              closeForm
            }
            className="absolute inset-0 bg-[#281912]/65 backdrop-blur-[2px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-link-modal-title"
            className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#FFFEFC] shadow-[0_30px_100px_rgba(40,25,18,0.35)]"
          >
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#3A2117] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D6BBA9]">
                    Social Links
                  </p>

                  <h2
                    id="social-link-modal-title"
                    className="mt-1 text-xl font-semibold text-white"
                  >
                    {editingId
                      ? 'Edit Social Link'
                      : 'Add Social Link'}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-white/60">
                    Configure the
                    platform, profile URL,
                    order and storefront
                    visibility.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving
                  }
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/75 transition hover:bg-white/[0.12] hover:text-white disabled:opacity-50"
                  aria-label="Close"
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
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-[#F7F4EF] p-5 sm:p-6">
                <div>
                  <label
                    htmlFor="social-platform"
                    className={
                      labelClass
                    }
                  >
                    Platform *
                  </label>

                  <select
                    id="social-platform"
                    value={
                      formData.platform
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'platform',
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  >
                    {PLATFORM_OPTIONS.map(
                      (
                        platform
                      ) => (
                        <option
                          key={
                            platform.value
                          }
                          value={
                            platform.value
                          }
                        >
                          {
                            platform.label
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="social-url"
                    className={
                      labelClass
                    }
                  >
                    Profile URL *
                  </label>

                  <input
                    id="social-url"
                    type="text"
                    inputMode="url"
                    value={
                      formData.url
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'url',
                        event.target
                          .value
                      )
                    }
                    placeholder="https://instagram.com/lampandglow"
                    className={
                      inputClass
                    }
                    autoComplete="url"
                  />

                  <p className="mt-2 text-[11px] leading-5 text-[#8A7569]">
                    You may enter the
                    complete URL or omit
                    https:// — it will be
                    added automatically.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="social-order"
                    className={
                      labelClass
                    }
                  >
                    Display Order
                  </label>

                  <input
                    id="social-order"
                    type="number"
                    min="0"
                    step="1"
                    value={
                      formData.displayOrder
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        'displayOrder',
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  />

                  <p className="mt-2 text-[11px] leading-5 text-[#8A7569]">
                    Lower numbers appear
                    first on the
                    storefront.
                  </p>
                </div>

                <div>
                  <p
                    className={
                      labelClass
                    }
                  >
                    Visibility
                  </p>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={
                      formData.isActive
                    }
                    onClick={() =>
                      updateField(
                        'isActive',
                        !formData.isActive
                      )
                    }
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${formData.isActive
                        ? 'border-[#6B4228]/25 bg-[#F2EAE4]'
                        : 'border-[#DDD1C8] bg-[#FFFEFC]'
                      }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#281912]">
                        {formData.isActive
                          ? 'Visible on storefront'
                          : 'Hidden from storefront'}
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#806C60]">
                        {formData.isActive
                          ? 'Customers can access this social profile from the website.'
                          : 'The link remains saved but will not be shown publicly.'}
                      </p>
                    </div>

                    <span
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${formData.isActive
                          ? 'bg-[#3A2117]'
                          : 'bg-[#C9BDB5]'
                        }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${formData.isActive
                            ? 'left-6'
                            : 'left-1'
                          }`}
                      />
                    </span>
                  </button>
                </div>

                <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9A8171]">
                    Preview
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#3A2117] text-xs font-bold text-white">
                      {
                        getPlatformInfo(
                          formData.platform
                        ).shortLabel
                      }
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#281912]">
                        {
                          getPlatformInfo(
                            formData.platform
                          ).label
                        }
                      </p>

                      <p className="truncate text-xs text-[#806C60]">
                        {formData.url ||
                          'Profile URL'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="shrink-0 border-t border-[#E3D7CE] bg-[#FFFEFC] p-4 sm:px-6 sm:py-5">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeForm
                    }
                    disabled={
                      saving
                    }
                    className="min-h-[46px] rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 text-sm font-semibold text-[#4C3A31] transition hover:bg-[#F7F4EF] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {saving
                      ? 'Saving...'
                      : editingId
                        ? 'Update Link'
                        : 'Add Link'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}