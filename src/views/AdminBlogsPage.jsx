'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Home,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import RichTextEditor from '../components/RichTextEditor.jsx'
import blogsService from '../utils/blogsService.js'

const STATUS_OPTIONS = [
  {
    value: 'draft',
    label: 'Draft',
    description:
      'Only visible inside Admin.',
    className:
      'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]',
  },
  {
    value: 'published',
    label: 'Published',
    description:
      'Visible to customers immediately.',
    className:
      'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]',
  },
  {
    value: 'scheduled',
    label: 'Scheduled',
    description:
      'Automatically becomes visible at the selected date.',
    className:
      'border-[#CBD7E7] bg-[#F2F6FB] text-[#536E8A]',
  },
]

const ITEMS_PER_PAGE = 10

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

function createInitialForm() {
  return {
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    imageAltText: '',
    status: 'draft',
    publishedAt: '',
    category: '',
    tags: [],
    showOnHomepage: false,
  }
}

function generateSlug(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
}

function formatDateTimeLocal(
  isoString
) {
  if (!isoString) {
    return ''
  }

  const date =
    new Date(isoString)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  const pad = (number) =>
    String(number).padStart(
      2,
      '0'
    )

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`
}

function formatDisplayDate(
  value
) {
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

function normalizeDateToIso(
  value
) {
  if (!value) {
    return null
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null
  }

  return date.toISOString()
}

function getStatusMeta(status) {
  return (
    STATUS_OPTIONS.find(
      (item) =>
        item.value === status
    ) ||
    STATUS_OPTIONS[0]
  )
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] =
    useState([])

  const [
    categories,
    setCategories,
  ] = useState([])

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

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

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
    activeTab,
    setActiveTab,
  ] = useState('content')

  const [tagInput, setTagInput] =
    useState('')

  const [saving, setSaving] =
    useState(false)

  const [
    uploadingImage,
    setUploadingImage,
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
    showCategoryManager,
    setShowCategoryManager,
  ] = useState(false)

  const [
    newCategoryName,
    setNewCategoryName,
  ] = useState('')

  const [
    categorySaving,
    setCategorySaving,
  ] = useState(false)

  const [
    deletingCategoryId,
    setDeletingCategoryId,
  ] = useState(null)

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const fileInputRef =
    useRef(null)

  const messageTimerRef =
    useRef(null)

  const formBusy =
    saving ||
    uploadingImage

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

  const loadBlogs =
    useCallback(async () => {
      try {
        setLoading(true)

        const data =
          await blogsService.getAllBlogs()

        setBlogs(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (error) {
        console.error(
          'Failed to load blogs:',
          error
        )

        showMessage(
          'error',
          'Failed to load blogs.'
        )
      } finally {
        setLoading(false)
      }
    }, [])

  const loadCategories =
    useCallback(async () => {
      try {
        const data =
          await blogsService.getAllCategories()

        setCategories(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (error) {
        console.error(
          'Failed to load blog categories:',
          error
        )
      }
    }, [])

  useEffect(() => {
    loadBlogs()
    loadCategories()
  }, [
    loadBlogs,
    loadCategories,
  ])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchQuery,
    statusFilter,
  ])

  const stats = useMemo(
    () => ({
      total:
        blogs.length,

      published:
        blogs.filter(
          (blog) =>
            blog.status ===
            'published'
        ).length,

      drafts:
        blogs.filter(
          (blog) =>
            blog.status ===
            'draft'
        ).length,

      homepage:
        blogs.filter(
          (blog) =>
            blog.showOnHomepage ===
            true &&
            blog.status ===
            'published'
        ).length,
    }),
    [blogs]
  )

  const filteredBlogs =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      return blogs.filter(
        (blog) => {
          const matchesSearch =
            !query ||
            [
              blog.title,
              blog.excerpt,
              blog.slug,
              blog.category,
              ...(Array.isArray(
                blog.tags
              )
                ? blog.tags
                : []),
            ].some((value) =>
              String(
                value || ''
              )
                .toLowerCase()
                .includes(query)
            )

          const matchesStatus =
            statusFilter ===
            'all' ||
            blog.status ===
            statusFilter

          return (
            matchesSearch &&
            matchesStatus
          )
        }
      )
    }, [
      blogs,
      searchQuery,
      statusFilter,
    ])

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredBlogs.length /
        ITEMS_PER_PAGE
      )
    )

  const paginatedBlogs =
    filteredBlogs.slice(
      (currentPage - 1) *
      ITEMS_PER_PAGE,
      currentPage *
      ITEMS_PER_PAGE
    )

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      )
    }
  }, [
    currentPage,
    totalPages,
  ])

  const resetFormState = () => {
    setFormData(
      createInitialForm()
    )

    setActiveTab('content')
    setTagInput('')
    setEditingId(null)

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        ''
    }
  }

  const openCreateForm = () => {
    resetFormState()
    setShowForm(true)
  }

  const closeForm = () => {
    if (formBusy) {
      return
    }

    setShowForm(false)
    resetFormState()
  }

  const handleEdit = (blog) => {
    setFormData({
      title:
        blog.title || '',

      excerpt:
        blog.excerpt || '',

      content:
        blog.content || '',

      featuredImage:
        blog.featuredImage ||
        '',

      slug:
        blog.slug || '',

      metaTitle:
        blog.metaTitle || '',

      metaDescription:
        blog.metaDescription ||
        '',

      imageAltText:
        blog.imageAltText ||
        '',

      status:
        blog.status ||
        'draft',

      publishedAt:
        formatDateTimeLocal(
          blog.publishedAt
        ),

      category:
        blog.category || '',

      tags:
        Array.isArray(
          blog.tags
        )
          ? blog.tags
          : [],

      showOnHomepage:
        blog.showOnHomepage ===
        true,
    })

    setEditingId(blog.id)
    setActiveTab('content')
    setTagInput('')
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

    setFormData((prev) => {
      const next = {
        ...prev,

        [name]:
          type ===
            'checkbox'
            ? checked
            : value,
      }

      if (
        name === 'title' &&
        !editingId
      ) {
        next.slug =
          generateSlug(value)
      }

      return next
    })
  }

  const handleContentChange = (
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }))
  }

  const handleImageUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      if (!file) return

      try {
        setUploadingImage(true)

        const url =
          await blogsService.uploadImage(
            file
          )

        setFormData((prev) => ({
          ...prev,

          featuredImage:
            url,
        }))

        showMessage(
          'success',
          'Featured image uploaded to XCDN.'
        )
      } catch (error) {
        console.error(
          'Blog image upload failed:',
          error
        )

        showMessage(
          'error',
          'Featured image upload failed.'
        )
      } finally {
        setUploadingImage(false)

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            ''
        }
      }
    }

  const handleRemoveImage =
    () => {
      setFormData((prev) => ({
        ...prev,
        featuredImage: '',
      }))

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          ''
      }
    }

  const addTag = () => {
    const tag =
      tagInput
        .trim()
        .replace(/,/g, '')

    if (!tag) {
      return
    }

    if (
      formData.tags.some(
        (currentTag) =>
          currentTag.toLowerCase() ===
          tag.toLowerCase()
      )
    ) {
      setTagInput('')
      return
    }

    setFormData((prev) => ({
      ...prev,
      tags: [
        ...prev.tags,
        tag,
      ],
    }))

    setTagInput('')
  }

  const handleTagKeyDown = (
    event
  ) => {
    if (
      event.key ===
      'Enter' ||
      event.key === ','
    ) {
      event.preventDefault()
      addTag()
    }
  }

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,

      tags:
        prev.tags.filter(
          (current) =>
            current !== tag
        ),
    }))
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    const title =
      formData.title.trim()

    const slug =
      formData.slug.trim()

    if (!title) {
      showMessage(
        'error',
        'Blog title is required.'
      )

      setActiveTab('content')
      return
    }

    if (!slug) {
      showMessage(
        'error',
        'Blog slug is required.'
      )

      setActiveTab('seo')
      return
    }

    if (
      formData.status ===
      'scheduled' &&
      !formData.publishedAt
    ) {
      showMessage(
        'error',
        'Please select the scheduled publish date and time.'
      )

      setActiveTab('settings')
      return
    }

    let publishedAt =
      normalizeDateToIso(
        formData.publishedAt
      )

    if (
      formData.status ===
      'published' &&
      !publishedAt
    ) {
      publishedAt =
        new Date().toISOString()
    }

    if (
      formData.status ===
      'scheduled' &&
      !publishedAt
    ) {
      showMessage(
        'error',
        'Invalid scheduled publish date.'
      )

      setActiveTab('settings')
      return
    }

    const payload = {
      title,

      excerpt:
        formData.excerpt.trim(),

      content:
        formData.content,

      featuredImage:
        formData.featuredImage,

      slug,

      metaTitle:
        formData.metaTitle.trim(),

      metaDescription:
        formData.metaDescription.trim(),

      imageAltText:
        formData.imageAltText.trim(),

      status:
        formData.status,

      publishedAt,

      category:
        formData.category,

      tags:
        formData.tags,

      showOnHomepage:
        formData.showOnHomepage,
    }

    try {
      setSaving(true)

      if (editingId) {
        const updated =
          await blogsService.updateBlog(
            editingId,
            payload
          )

        setBlogs((prev) =>
          prev.map((blog) =>
            blog.id ===
              editingId
              ? {
                ...blog,
                ...updated,
              }
              : blog
          )
        )

        showMessage(
          'success',
          'Blog updated successfully.'
        )
      } else {
        const created =
          await blogsService.createBlog(
            payload
          )

        setBlogs((prev) => [
          created,
          ...prev,
        ])

        showMessage(
          'success',
          'Blog created successfully.'
        )
      }

      setShowForm(false)
      resetFormState()
    } catch (error) {
      console.error(
        'Blog save failed:',
        error
      )

      showMessage(
        'error',
        error?.message ||
        'Failed to save blog.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    blog
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${blog.title ||
        'this blog'
        }"? This action cannot be undone.`
      )

    if (!confirmed) return

    try {
      setDeletingId(blog.id)

      await blogsService.deleteBlog(
        blog.id
      )

      setBlogs((prev) =>
        prev.filter(
          (item) =>
            item.id !== blog.id
        )
      )

      showMessage(
        'success',
        'Blog deleted.'
      )
    } catch (error) {
      console.error(
        'Blog delete failed:',
        error
      )

      showMessage(
        'error',
        'Failed to delete blog.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus =
    async (blog) => {
      const nextStatus =
        blog.status ===
          'published'
          ? 'draft'
          : 'published'

      const nextPublishedAt =
        nextStatus ===
          'published'
          ? new Date().toISOString()
          : blog.publishedAt ||
          null

      try {
        setTogglingId(blog.id)

        const updated =
          await blogsService.updateBlog(
            blog.id,
            {
              status:
                nextStatus,

              publishedAt:
                nextPublishedAt,
            }
          )

        setBlogs((prev) =>
          prev.map((item) =>
            item.id ===
              blog.id
              ? {
                ...item,
                ...updated,
              }
              : item
          )
        )

        showMessage(
          'success',
          nextStatus ===
            'published'
            ? 'Blog published.'
            : 'Blog moved to draft.'
        )
      } catch (error) {
        console.error(
          'Blog status update failed:',
          error
        )

        showMessage(
          'error',
          'Failed to update blog status.'
        )
      } finally {
        setTogglingId(null)
      }
    }

  const handleCreateCategory =
    async (event) => {
      event.preventDefault()

      const name =
        newCategoryName.trim()

      if (!name) {
        return
      }

      try {
        setCategorySaving(true)

        const created =
          await blogsService.createCategory(
            name
          )

        setCategories((prev) =>
          [
            ...prev,
            created,
          ].sort((a, b) =>
            String(
              a.name || ''
            ).localeCompare(
              String(
                b.name || ''
              )
            )
          )
        )

        setNewCategoryName('')

        showMessage(
          'success',
          'Blog category created.'
        )
      } catch (error) {
        console.error(
          'Category create failed:',
          error
        )

        showMessage(
          'error',
          'Failed to create category.'
        )
      } finally {
        setCategorySaving(false)
      }
    }

  const handleDeleteCategory =
    async (category) => {
      const confirmed =
        window.confirm(
          `Delete category "${category.name}"? Existing blogs will keep their saved category name.`
        )

      if (!confirmed) return

      try {
        setDeletingCategoryId(
          category.id
        )

        await blogsService.deleteCategory(
          category.id
        )

        setCategories((prev) =>
          prev.filter(
            (item) =>
              item.id !==
              category.id
          )
        )

        showMessage(
          'success',
          'Blog category deleted.'
        )
      } catch (error) {
        console.error(
          'Category delete failed:',
          error
        )

        showMessage(
          'error',
          'Failed to delete category.'
        )
      } finally {
        setDeletingCategoryId(
          null
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
                <BookOpen className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Storefront
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Blogs
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Create editorial
                  content, manage SEO,
                  categories, publishing,
                  scheduling and homepage
                  visibility.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  setShowCategoryManager(
                    true
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-4 py-3 text-sm font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF]"
              >
                <FolderOpen className="h-4 w-4" />

                Categories
              </button>

              <button
                type="button"
                onClick={
                  openCreateForm
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-[#FFFEFC] transition hover:bg-[#281912]"
              >
                <Plus className="h-4 w-4" />

                Add Blog
              </button>
            </div>
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
            label="Total Blogs"
            value={stats.total}
            text="All editorial content"
            icon={BookOpen}
          />

          <StatCard
            label="Published"
            value={
              stats.published
            }
            text="Currently live"
            icon={Eye}
          />

          <StatCard
            label="Drafts"
            value={stats.drafts}
            text="Work in progress"
            icon={FileText}
          />

          <StatCard
            label="Homepage"
            value={stats.homepage}
            text="Featured live blogs"
            icon={Home}
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
                placeholder="Search title, excerpt, category, slug or tags..."
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

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={
                      status.value
                    }
                    value={
                      status.value
                    }
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
            <p className="text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {
                  filteredBlogs.length
                }
              </span>{' '}
              of {blogs.length} blogs
            </p>

            <button
              type="button"
              onClick={loadBlogs}
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

        {/* List */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading blogs...
              </p>
            </div>
          </section>
        ) : paginatedBlogs.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <BookOpen className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No blogs found
            </h3>

            <p className="mt-1 text-sm text-[#8A7467]">
              Try adjusting the
              current filters or
              create a new blog.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {paginatedBlogs.map(
              (blog) => {
                const status =
                  getStatusMeta(
                    blog.status
                  )

                return (
                  <article
                    key={blog.id}
                    className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_10px_30px_rgba(58,33,23,0.05)]"
                  >
                    <div className="grid sm:grid-cols-[220px_1fr]">
                      <div className="relative min-h-[190px] overflow-hidden bg-[#EEE7E1]">
                        {blog.featuredImage ? (
                          <img
                            src={
                              blog.featuredImage
                            }
                            alt={
                              blog.imageAltText ||
                              blog.title ||
                              'Blog image'
                            }
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-[190px] items-center justify-center text-[#A89285]">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-col p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                          >
                            {blog.status ===
                              'published' ? (
                              <Eye className="h-3 w-3" />
                            ) : blog.status ===
                              'scheduled' ? (
                              <Clock className="h-3 w-3" />
                            ) : (
                              <FileText className="h-3 w-3" />
                            )}

                            {
                              status.label
                            }
                          </span>

                          {blog.showOnHomepage && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#DCCCBD] bg-[#F6EFE8] px-2.5 py-1 text-[10px] font-semibold text-[#6B4228]">
                              <Home className="h-3 w-3" />
                              Homepage
                            </span>
                          )}

                          {blog.category && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F4EF] px-2.5 py-1 text-[10px] font-semibold text-[#7B685D]">
                              <FolderOpen className="h-3 w-3" />
                              {
                                blog.category
                              }
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-6 text-[#281912]">
                          {blog.title ||
                            'Untitled Blog'}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#7B685D]">
                          {blog.excerpt ||
                            'No excerpt added.'}
                        </p>

                        {Array.isArray(
                          blog.tags
                        ) &&
                          blog.tags.length >
                          0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {blog.tags
                                .slice(
                                  0,
                                  4
                                )
                                .map(
                                  (
                                    tag
                                  ) => (
                                    <span
                                      key={
                                        tag
                                      }
                                      className="inline-flex items-center gap-1 rounded-full bg-[#F7F4EF] px-2 py-1 text-[10px] text-[#8A7467]"
                                    >
                                      <Tag className="h-2.5 w-2.5" />
                                      {
                                        tag
                                      }
                                    </span>
                                  )
                                )}
                            </div>
                          )}

                        {blog.publishedAt && (
                          <p className="mt-3 flex items-center gap-1.5 text-xs text-[#9A8478]">
                            <Calendar className="h-3.5 w-3.5" />

                            {blog.status ===
                              'scheduled'
                              ? 'Scheduled'
                              : 'Published'}

                            {' · '}

                            {formatDisplayDate(
                              blog.publishedAt
                            )}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                blog
                              )
                            }
                            disabled={
                              togglingId ===
                              blog.id
                            }
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${blog.status ===
                                'published'
                                ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                                : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                              }`}
                          >
                            {togglingId ===
                              blog.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : blog.status ===
                              'published' ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}

                            {blog.status ===
                              'published'
                              ? 'Unpublish'
                              : 'Publish'}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  blog
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
                                  blog
                                )
                              }
                              disabled={
                                deletingId ===
                                blog.id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId ===
                                blog.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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

        {/* Pagination */}
        {filteredBlogs.length >
          ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] text-[#6B4228] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-3 text-sm font-medium text-[#7B685D]">
                Page {currentPage} of{' '}
                {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] text-[#6B4228] disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
      </div>

      {/* Add / Edit Blog Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC]">
              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Editorial
                    </p>

                    <h3 className="text-lg font-semibold text-[#281912] sm:text-xl">
                      {editingId
                        ? 'Edit Blog'
                        : 'Create Blog'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={formBusy}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Fixed Tabs */}
              <div className="flex overflow-x-auto border-t border-[#EEE5DF] px-4 sm:px-6">
                {[
                  {
                    key: 'content',
                    label:
                      'Content',
                  },
                  {
                    key: 'seo',
                    label: 'SEO',
                  },
                  {
                    key: 'settings',
                    label:
                      'Settings',
                  },
                ].map((tab) => (
                  <button
                    key={
                      tab.key
                    }
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        tab.key
                      )
                    }
                    className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab ===
                        tab.key
                        ? 'border-[#6B4228] text-[#3A2117]'
                        : 'border-transparent text-[#8A7467] hover:text-[#3A2117]'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Scrollable content */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
                {activeTab ===
                  'content' && (
                    <div className="space-y-5">
                      <FormSection
                        eyebrow="Article"
                        title="Blog Content"
                        description="Create the customer-facing article content and featured artwork."
                      >
                        <div className="space-y-5">
                          <div>
                            <FieldLabel>
                              Blog Title *
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
                              placeholder="Enter blog title..."
                              className={
                                inputClass
                              }
                            />
                          </div>

                          {/* Image */}
                          <div>
                            <FieldLabel>
                              Featured Image
                            </FieldLabel>

                            <div className="overflow-hidden rounded-xl border border-dashed border-[#D7C7BC] bg-[#FAF7F4]">
                              {formData.featuredImage ? (
                                <div className="relative">
                                  <img
                                    src={
                                      formData.featuredImage
                                    }
                                    alt="Featured image preview"
                                    className="h-64 w-full object-cover sm:h-72"
                                  />

                                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#281912]/80 to-transparent p-4 pt-12">
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
                                      {uploadingImage ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Upload className="h-3.5 w-3.5" />
                                      )}

                                      Replace
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
                                  className="flex min-h-[210px] w-full flex-col items-center justify-center px-6 py-8 text-center"
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
                                      : 'Upload Featured Image'}
                                  </p>

                                  <p className="mt-1 text-xs text-[#9A8478]">
                                    Landscape
                                    image
                                    recommended
                                  </p>
                                </button>
                              )}

                              <input
                                ref={
                                  fileInputRef
                                }
                                type="file"
                                accept="image/*"
                                onChange={
                                  handleImageUpload
                                }
                                className="hidden"
                              />
                            </div>
                          </div>

                          <div>
                            <FieldLabel>
                              Short Description
                              / Excerpt
                            </FieldLabel>

                            <textarea
                              name="excerpt"
                              value={
                                formData.excerpt
                              }
                              onChange={
                                handleInputChange
                              }
                              rows={3}
                              placeholder="Brief summary shown on blog cards..."
                              className={`${inputClass} resize-none`}
                            />
                          </div>

                          <div>
                            <FieldLabel>
                              Blog Content
                            </FieldLabel>

                            <RichTextEditor
                              value={
                                formData.content
                              }
                              onChange={
                                handleContentChange
                              }
                              placeholder="Write your blog content here..."
                              minHeight={
                                320
                              }
                            />
                          </div>
                        </div>
                      </FormSection>
                    </div>
                  )}

                {activeTab ===
                  'seo' && (
                    <FormSection
                      eyebrow="Search"
                      title="SEO Settings"
                      description="Configure the customer-facing URL and search engine metadata."
                    >
                      <div className="space-y-5">
                        <div>
                          <FieldLabel>
                            SEO Slug *
                          </FieldLabel>

                          <div className="flex items-center rounded-xl border border-[#DED1C8] bg-[#FFFEFC]">
                            <span className="shrink-0 border-r border-[#E7DCD4] px-4 py-3 text-sm text-[#9A8478]">
                              /blog/
                            </span>

                            <input
                              type="text"
                              name="slug"
                              value={
                                formData.slug
                              }
                              onChange={
                                handleInputChange
                              }
                              placeholder="your-blog-slug"
                              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#281912] outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <FieldLabel>
                            Meta Title
                          </FieldLabel>

                          <input
                            type="text"
                            name="metaTitle"
                            value={
                              formData.metaTitle
                            }
                            onChange={
                              handleInputChange
                            }
                            placeholder="Search engine title..."
                            className={
                              inputClass
                            }
                          />
                        </div>

                        <div>
                          <FieldLabel>
                            Meta Description
                          </FieldLabel>

                          <textarea
                            name="metaDescription"
                            value={
                              formData.metaDescription
                            }
                            onChange={
                              handleInputChange
                            }
                            rows={4}
                            placeholder="Description shown in search results..."
                            className={`${inputClass} resize-none`}
                          />
                        </div>

                        <div>
                          <FieldLabel>
                            Featured Image Alt
                            Text
                          </FieldLabel>

                          <input
                            type="text"
                            name="imageAltText"
                            value={
                              formData.imageAltText
                            }
                            onChange={
                              handleInputChange
                            }
                            placeholder="Describe the featured image..."
                            className={
                              inputClass
                            }
                          />
                        </div>
                      </div>
                    </FormSection>
                  )}

                {activeTab ===
                  'settings' && (
                    <div className="space-y-5">
                      <FormSection
                        eyebrow="Publishing"
                        title="Publishing Settings"
                        description="Control status, schedule, category and homepage placement."
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel>
                              Status
                            </FieldLabel>

                            <select
                              name="status"
                              value={
                                formData.status
                              }
                              onChange={
                                handleInputChange
                              }
                              className={
                                inputClass
                              }
                            >
                              {STATUS_OPTIONS.map(
                                (
                                  status
                                ) => (
                                  <option
                                    key={
                                      status.value
                                    }
                                    value={
                                      status.value
                                    }
                                  >
                                    {
                                      status.label
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <FieldLabel>
                              Category
                            </FieldLabel>

                            <select
                              name="category"
                              value={
                                formData.category
                              }
                              onChange={
                                handleInputChange
                              }
                              className={
                                inputClass
                              }
                            >
                              <option value="">
                                No Category
                              </option>

                              {categories.map(
                                (
                                  category
                                ) => (
                                  <option
                                    key={
                                      category.id
                                    }
                                    value={
                                      category.name
                                    }
                                  >
                                    {
                                      category.name
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>

                        {formData.status ===
                          'scheduled' && (
                            <div className="mt-4">
                              <FieldLabel>
                                Publish Date &
                                Time *
                              </FieldLabel>

                              <input
                                type="datetime-local"
                                name="publishedAt"
                                value={
                                  formData.publishedAt
                                }
                                onChange={
                                  handleInputChange
                                }
                                className={
                                  inputClass
                                }
                              />

                              <p className="mt-1.5 text-xs text-[#9A8478]">
                                Blog will
                                automatically
                                become visible
                                after this time.
                              </p>
                            </div>
                          )}

                        <label
                          className={`mt-4 block cursor-pointer rounded-xl border p-4 transition ${formData.showOnHomepage
                              ? 'border-[#BFA995] bg-[#F5EEE8]'
                              : 'border-[#E6DCD5] bg-[#FAF7F4]'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                                <Home className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-[#281912]">
                                  Show on
                                  Homepage
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#8A7467]">
                                  Include this
                                  blog in the
                                  homepage blog
                                  section when it
                                  is live.
                                </p>
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              name="showOnHomepage"
                              checked={
                                formData.showOnHomepage
                              }
                              onChange={
                                handleInputChange
                              }
                              className="mt-1 h-4 w-4 accent-[#6B4228]"
                            />
                          </div>
                        </label>
                      </FormSection>

                      <FormSection
                        eyebrow="Taxonomy"
                        title="Blog Tags"
                        description="Add searchable labels to help organize blog content."
                      >
                        <div className="rounded-xl border border-[#DED1C8] bg-[#FFFEFC] p-3">
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map(
                              (tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 rounded-full bg-[#F3EAE3] px-2.5 py-1 text-xs font-semibold text-[#6B4228]"
                                >
                                  {tag}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeTag(
                                        tag
                                      )
                                    }
                                    className="rounded-full hover:text-[#954B42]"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              )
                            )}
                          </div>

                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={
                                tagInput
                              }
                              onChange={(event) =>
                                setTagInput(
                                  event.target.value
                                )
                              }
                              onKeyDown={
                                handleTagKeyDown
                              }
                              placeholder="Type tag and press Enter..."
                              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-[#281912] outline-none"
                            />

                            <button
                              type="button"
                              onClick={
                                addTag
                              }
                              className="rounded-lg bg-[#F0E8E1] px-3 py-2 text-xs font-semibold text-[#6B4228]"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </FormSection>
                    </div>
                  )}
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="hidden text-xs text-[#8A7467] sm:block">
                    Title and SEO slug are
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
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {formBusy && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}

                      {saving
                        ? 'Saving...'
                        : uploadingImage
                          ? 'Uploading...'
                          : editingId
                            ? (
                              <>
                                <Save className="h-4 w-4" />
                                Update Blog
                              </>
                            )
                            : (
                              <>
                                <Plus className="h-4 w-4" />
                                Create Blog
                              </>
                            )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px]">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E8DDD5] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3A2117] text-white">
                  <FolderOpen className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                    Blogs
                  </p>

                  <h3 className="text-lg font-semibold text-[#281912]">
                    Categories
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCategoryManager(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7B685D] hover:bg-[#F2ECE7]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scroll Content */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/70 p-5">
              <form
                onSubmit={
                  handleCreateCategory
                }
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={
                    newCategoryName
                  }
                  onChange={(event) =>
                    setNewCategoryName(
                      event.target.value
                    )
                  }
                  placeholder="New category name..."
                  className={
                    inputClass
                  }
                />

                <button
                  type="submit"
                  disabled={
                    categorySaving ||
                    !newCategoryName.trim()
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {categorySaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}

                  Add
                </button>
              </form>

              <div className="mt-5 space-y-2">
                {categories.length ===
                  0 ? (
                  <div className="rounded-xl border border-[#E7DCD4] bg-[#FFFEFC] py-8 text-center text-sm text-[#9A8478]">
                    No blog categories
                    yet.
                  </div>
                ) : (
                  categories.map(
                    (category) => (
                      <div
                        key={
                          category.id
                        }
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#E7DCD4] bg-[#FFFEFC] p-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#3A2117]">
                            {
                              category.name
                            }
                          </p>

                          <p className="mt-0.5 truncate text-xs text-[#9A8478]">
                            /
                            {
                              category.slug
                            }
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteCategory(
                              category
                            )
                          }
                          disabled={
                            deletingCategoryId ===
                            category.id
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#954B42] hover:bg-[#FFF2EF] disabled:opacity-50"
                        >
                          {deletingCategoryId ===
                            category.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] p-4">
              <button
                type="button"
                onClick={() =>
                  setShowCategoryManager(
                    false
                  )
                }
                className="w-full rounded-xl border border-[#DCCFC6] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF]"
              >
                Close
              </button>
            </div>
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