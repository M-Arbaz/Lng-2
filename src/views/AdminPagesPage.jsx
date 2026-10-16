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
  Copy,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import RichTextEditor from '../components/RichTextEditor.jsx'

import pagesService, {
  normalizeSlug,
} from '../utils/pagesService'

const createInitialForm = () => ({
  title: '',
  slug: '',
  description: '',
  content: '',
  isPublished: false,
})

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

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

function stripHtml(value) {
  if (!value) {
    return ''
  }

  return String(value)
    .replace(
      /<[^>]*>/g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
}

export default function AdminPagesPage() {
  const [pages, setPages] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [showForm, setShowForm] =
    useState(false)

  const [
    editingId,
    setEditingId,
  ] = useState(null)

  const [formData, setFormData] =
    useState(
      createInitialForm
    )

  const [
    slugManuallyEdited,
    setSlugManuallyEdited,
  ] = useState(false)

  const [saving, setSaving] =
    useState(false)

  const [
    deletingId,
    setDeletingId,
  ] = useState(null)

  const [
    togglingId,
    setTogglingId,
  ] = useState(null)

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

  const loadPages = async () => {
    try {
      setLoading(true)

      const data =
        await pagesService.getAllPages()

      setPages(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Error loading pages:',
        error
      )

      showMessage(
        'error',
        'Failed to load pages.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [])

  const stats = useMemo(
    () => ({
      total:
        pages.length,

      published:
        pages.filter(
          (page) =>
            page.isPublished ===
            true
        ).length,

      drafts:
        pages.filter(
          (page) =>
            page.isPublished !==
            true
        ).length,
    }),
    [pages]
  )

  const filteredPages =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      return pages.filter(
        (page) => {
          const matchesSearch =
            !query ||
            [
              page.title,
              page.slug,
              page.description,
              stripHtml(
                page.content
              ),
            ].some((value) =>
              String(value || '')
                .toLowerCase()
                .includes(query)
            )

          const matchesStatus =
            statusFilter ===
            'all' ||
            (statusFilter ===
              'published'
              ? page.isPublished ===
              true
              : page.isPublished !==
              true)

          return (
            matchesSearch &&
            matchesStatus
          )
        }
      )
    }, [
      pages,
      searchQuery,
      statusFilter,
    ])

  const resetForm = () => {
    setFormData(
      createInitialForm()
    )

    setEditingId(null)

    setSlugManuallyEdited(
      false
    )
  }

  const openCreateForm = () => {
    resetForm()

    setShowForm(true)
  }

  const openEditForm = (
    page
  ) => {
    setEditingId(
      page.id
    )

    setFormData({
      title:
        page.title || '',

      slug:
        page.slug || '',

      description:
        page.description || '',

      content:
        page.content || '',

      isPublished:
        page.isPublished ===
        true,
    })

    /*
     * Existing page URLs should not
     * silently change when admin edits
     * the title.
     */
    setSlugManuallyEdited(
      true
    )

    setShowForm(true)
  }

  const closeForm = () => {
    if (saving) {
      return
    }

    setShowForm(false)
    resetForm()
  }

  const handleTitleChange = (
    event
  ) => {
    const title =
      event.target.value

    setFormData((prev) => ({
      ...prev,

      title,

      slug:
        !editingId &&
          !slugManuallyEdited
          ? normalizeSlug(
            title
          )
          : prev.slug,
    }))
  }

  const handleSlugChange = (
    event
  ) => {
    const raw =
      event.target.value

    setSlugManuallyEdited(
      true
    )

    setFormData((prev) => ({
      ...prev,

      slug:
        normalizeSlug(raw),
    }))
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

  const handleContentChange = (
    html
  ) => {
    setFormData((prev) => ({
      ...prev,
      content: html,
    }))
  }

  const handleSave = async (
    event
  ) => {
    event.preventDefault()

    const title =
      formData.title.trim()

    const slug =
      normalizeSlug(
        formData.slug
      )

    const content =
      String(
        formData.content || ''
      ).trim()

    if (!title) {
      showMessage(
        'error',
        'Page title is required.'
      )

      return
    }

    if (!slug) {
      showMessage(
        'error',
        'Page slug is required.'
      )

      return
    }

    if (!content) {
      showMessage(
        'error',
        'Page content is required.'
      )

      return
    }

    try {
      setSaving(true)

      const payload = {
        title,

        slug,

        description:
          formData.description.trim(),

        content,

        isPublished:
          formData.isPublished,
      }

      if (editingId) {
        const updated =
          await pagesService.updatePage(
            editingId,
            payload
          )

        setPages((prev) =>
          prev.map((page) =>
            page.id ===
              editingId
              ? {
                ...page,
                ...updated,
              }
              : page
          )
        )

        showMessage(
          'success',
          'Page updated successfully.'
        )
      } else {
        const created =
          await pagesService.createPage(
            payload
          )

        setPages((prev) => [
          created,
          ...prev,
        ])

        showMessage(
          'success',
          'Page created successfully.'
        )
      }

      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error(
        'Error saving page:',
        error
      )

      showMessage(
        'error',
        error?.message ||
        'Failed to save page.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    page
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${page.title || 'this page'}"? This action cannot be undone.`
      )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(
        page.id
      )

      await pagesService.deletePage(
        page.id
      )

      setPages((prev) =>
        prev.filter(
          (current) =>
            current.id !==
            page.id
        )
      )

      showMessage(
        'success',
        'Page deleted successfully.'
      )
    } catch (error) {
      console.error(
        'Error deleting page:',
        error
      )

      showMessage(
        'error',
        'Failed to delete page.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish =
    async (page) => {
      const nextStatus =
        page.isPublished !==
        true

      try {
        setTogglingId(
          page.id
        )

        const updated =
          await pagesService.togglePagePublish(
            page.id,
            nextStatus
          )

        setPages((prev) =>
          prev.map((item) =>
            item.id ===
              page.id
              ? {
                ...item,
                ...updated,
              }
              : item
          )
        )

        showMessage(
          'success',
          nextStatus
            ? 'Page published successfully.'
            : 'Page moved to draft.'
        )
      } catch (error) {
        console.error(
          'Publish update failed:',
          error
        )

        showMessage(
          'error',
          'Failed to update page visibility.'
        )
      } finally {
        setTogglingId(null)
      }
    }

  const copyPageUrl = async (
    slug
  ) => {
    try {
      const relativeUrl =
        `/${slug}`

      const url =
        typeof window !==
          'undefined'
          ? `${window.location.origin}${relativeUrl}`
          : relativeUrl

      await navigator.clipboard.writeText(
        url
      )

      showMessage(
        'success',
        'Page URL copied.'
      )
    } catch (error) {
      console.error(
        'Copy URL failed:',
        error
      )

      showMessage(
        'error',
        'Could not copy the page URL.'
      )
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
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Storefront
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Pages
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Create and manage
                  custom content,
                  information and policy
                  pages using the shared
                  Lamp & Glow content
                  layout.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                openCreateForm
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912] sm:w-auto"
            >
              <Plus className="h-4 w-4" />

              Add Page
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
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={FileText}
            label="Total Pages"
            value={stats.total}
            text="All custom pages"
          />

          <StatCard
            icon={Eye}
            label="Published"
            value={
              stats.published
            }
            text="Visible to customers"
          />

          <StatCard
            icon={EyeOff}
            label="Drafts"
            value={stats.drafts}
            text="Hidden from storefront"
          />
        </section>

        {/* Search / Filter */}
        <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-4 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
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
                placeholder="Search title, URL, description or content..."
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

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
            <p className="text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {
                  filteredPages.length
                }
              </span>{' '}
              of {pages.length} pages
            </p>

            <button
              type="button"
              onClick={loadPages}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B4228] transition hover:text-[#281912] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading
                    ? 'animate-spin'
                    : ''
                  }`}
              />

              Refresh
            </button>
          </div>
        </section>

        {/* Pages */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading pages...
              </p>
            </div>
          </section>
        ) : filteredPages.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <FileText className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No pages found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
              {searchQuery ||
                statusFilter !==
                'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first custom information or policy page.'}
            </p>
          </section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {filteredPages.map(
              (page) => {
                const published =
                  page.isPublished ===
                  true

                const preview =
                  page.description ||
                  stripHtml(
                    page.content
                  ) ||
                  'No page description.'

                return (
                  <article
                    key={page.id}
                    className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_10px_30px_rgba(58,33,23,0.05)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${published
                                ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                                : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                              }`}
                          >
                            {published ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}

                            {published
                              ? 'Published'
                              : 'Draft'}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F4EF] px-2.5 py-1 font-mono text-[10px] text-[#8A7467]">
                            <Globe2 className="h-3 w-3" />

                            /{page.slug}
                          </span>
                        </div>

                        <h3 className="mt-3 break-words text-lg font-semibold leading-6 text-[#281912]">
                          {page.title ||
                            'Untitled Page'}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#7B685D]">
                          {preview}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <InfoBox
                        label="Created"
                        value={formatDate(
                          page.createdAt
                        )}
                      />

                      <InfoBox
                        label="Last Updated"
                        value={formatDate(
                          page.updatedAt
                        )}
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-[#EEE5DF] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          handleTogglePublish(
                            page
                          )
                        }
                        disabled={
                          togglingId ===
                          page.id
                        }
                        className={`inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${published
                            ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                            : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                          }`}
                      >
                        {togglingId ===
                          page.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : published ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}

                        {published
                          ? 'Published'
                          : 'Draft'}
                      </button>

                      <div className="flex flex-wrap justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            copyPageUrl(
                              page.slug
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                          title="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        {published && (
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                            title="Open page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              page
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              page
                            )
                          }
                          disabled={
                            deletingId ===
                            page.id
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId ===
                            page.id ? (
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-white">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Storefront
                    </p>

                    <h3 className="mt-0.5 text-lg font-semibold text-[#281912] sm:text-xl">
                      {editingId
                        ? 'Edit Page'
                        : 'Create Page'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSave}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Scrollable Content */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
                <div className="space-y-5">
                  {/* Basic information */}
                  <FormSection
                    eyebrow="Page"
                    title="Page Information"
                    description="Configure the customer-facing page title, URL and introductory description."
                  >
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>
                          Page Title *
                        </FieldLabel>

                        <input
                          type="text"
                          value={
                            formData.title
                          }
                          onChange={
                            handleTitleChange
                          }
                          placeholder="e.g. Privacy Policy"
                          className={
                            inputClass
                          }
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          Page URL / Slug *
                        </FieldLabel>

                        <div className="flex overflow-hidden rounded-xl border border-[#DED1C8] bg-[#FFFEFC] focus-within:border-[#6B4228] focus-within:ring-2 focus-within:ring-[#6B4228]/10">
                          <span className="flex shrink-0 items-center border-r border-[#E7DCD4] bg-[#F7F4EF] px-4 text-sm font-medium text-[#8A7467]">
                            /
                          </span>

                          <input
                            type="text"
                            value={
                              formData.slug
                            }
                            onChange={
                              handleSlugChange
                            }
                            placeholder="privacy-policy"
                            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#281912] outline-none"
                          />
                        </div>

                        <p className="mt-1.5 text-xs leading-5 text-[#9A8478]">
                          Public URL:{' '}
                          <span className="font-mono font-medium text-[#6B4228]">
                            /
                            {formData.slug ||
                              'page-slug'}
                          </span>
                        </p>

                        {editingId && (
                          <p className="mt-1 text-xs text-[#A06C55]">
                            Changing the
                            slug changes the
                            public page URL.
                          </p>
                        )}
                      </div>

                      <div>
                        <FieldLabel>
                          Page Description /
                          Intro
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
                          placeholder="Short description shown below the page title..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>
                  </FormSection>

                  {/* Content */}
                  <FormSection
                    eyebrow="Content"
                    title="Page Content"
                    description="This content automatically uses the shared responsive policy/page layout on the storefront."
                  >
                    <RichTextEditor
                      value={
                        formData.content
                      }
                      onChange={
                        handleContentChange
                      }
                      placeholder="Write your page content here..."
                      minHeight={380}
                    />
                  </FormSection>

                  {/* Visibility */}
                  <FormSection
                    eyebrow="Publishing"
                    title="Page Visibility"
                    description="Draft pages remain available inside Admin but cannot be opened by customers."
                  >
                    <label
                      className={`block cursor-pointer rounded-xl border p-4 transition ${formData.isPublished
                          ? 'border-[#BFA995] bg-[#F5EEE8]'
                          : 'border-[#E6DCD5] bg-[#FAF7F4]'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                            {formData.isPublished ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#281912]">
                              Publish this
                              page
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#8A7467]">
                              {formData.isPublished
                                ? 'Customers can open this page from its public URL.'
                                : 'This page remains hidden until you publish it.'}
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          name="isPublished"
                          checked={
                            formData.isPublished
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

              {/* Sticky Action Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="hidden text-xs leading-5 text-[#8A7467] sm:block">
                    Title, unique URL and
                    page content are
                    required.
                  </p>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeForm}
                      disabled={saving}
                      className="rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}

                      {saving
                        ? 'Saving...'
                        : editingId
                          ? 'Update Page'
                          : 'Create Page'}
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