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
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Instagram,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import instagramGridService from '../utils/instagramGridService.js'

const createInitialForm = () => ({
  image: '',
  url: '',
  imageSource: 'auto',
  alt: '',
  displayOrder: 0,
  isActive: true,
})

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

function isSupportedInstagramUrl(
  value
) {
  const raw =
    String(value || '').trim()

  if (!raw) {
    return false
  }

  try {
    const parsed =
      new URL(raw)

    const hostname =
      parsed.hostname
        .toLowerCase()
        .replace(/^www\./, '')

    if (
      hostname !== 'instagram.com'
    ) {
      return false
    }

    const parts =
      parsed.pathname
        .split('/')
        .filter(Boolean)

    return (
      [
        'p',
        'reel',
        'reels',
        'tv',
      ].includes(parts[0]) &&
      Boolean(parts[1])
    )
  } catch {
    return false
  }
}

export default function AdminInstagramGridPage() {
  const [items, setItems] =
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
    fetchingPreview,
    setFetchingPreview,
  ] = useState(false)

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false)

  const [imagePreview, setImagePreview] =
    useState('')

  const [
    previewError,
    setPreviewError,
  ] = useState('')

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

  const fileInputRef =
    useRef(null)

  const messageTimerRef =
    useRef(null)

  const lastPreviewUrlRef =
    useRef('')

  const previewRequestRef =
    useRef(0)

  const formBusy =
    saving ||
    uploadingImage ||
    fetchingPreview

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

  const loadItems = async () => {
    try {
      setLoading(true)

      const data =
        await instagramGridService.getAllItems()

      setItems(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Error loading Instagram grid:',
        error
      )

      showMessage(
        'error',
        'Failed to load Instagram grid images.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const filteredItems =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      if (!query) {
        return items
      }

      return items.filter(
        (item) =>
          [
            item.url,
            item.alt,
          ].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(query)
          )
      )
    }, [items, searchQuery])

  const stats = useMemo(
    () => ({
      total: items.length,

      active:
        items.filter(
          (item) =>
            item.isActive !== false
        ).length,

      inactive:
        items.filter(
          (item) =>
            item.isActive === false
        ).length,

      linked:
        items.filter((item) =>
          Boolean(
            String(
              item.url || ''
            ).trim()
          )
        ).length,
    }),
    [items]
  )

  const resetFormState = () => {
    previewRequestRef.current += 1

    setFormData(
      createInitialForm()
    )

    setImagePreview('')
    setPreviewError('')
    setEditingId(null)

    setFetchingPreview(false)
    setUploadingImage(false)

    lastPreviewUrlRef.current =
      ''

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

  const handleEdit = (item) => {
    previewRequestRef.current += 1

    const source =
      item.imageSource === 'auto'
        ? 'auto'
        : 'custom'

    setFormData({
      image:
        item.image || '',

      url:
        item.url || '',

      /*
       * Legacy existing items are
       * treated as custom images so
       * they are never silently replaced.
       */
      imageSource:
        item.imageSource
          ? source
          : 'custom',

      alt:
        item.alt || '',

      displayOrder:
        Number(
          item.displayOrder || 0
        ),

      isActive:
        item.isActive !== false,
    })

    setImagePreview(
      item.image || ''
    )

    setPreviewError('')
    setEditingId(item.id)

    /*
     * Don't refetch the same saved URL
     * as soon as Edit opens.
     */
    lastPreviewUrlRef.current =
      item.image
        ? String(
          item.url || ''
        ).trim()
        : ''

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

    if (name === 'url') {
      setPreviewError('')
    }

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const fetchInstagramPreview =
    async (
      value = formData.url,
      {
        showSuccess = true,
      } = {}
    ) => {
      const instagramUrl =
        String(
          value || ''
        ).trim()

      if (!instagramUrl) {
        setPreviewError(
          'Paste an Instagram post or reel URL first.'
        )

        return null
      }

      const requestId =
        previewRequestRef.current +
        1

      previewRequestRef.current =
        requestId

      try {
        setFetchingPreview(true)
        setPreviewError('')

        const result =
          await instagramGridService.fetchInstagramPreview(
            instagramUrl
          )

        /*
         * Ignore an old request if
         * another preview/custom upload
         * started while it was loading.
         */
        if (
          requestId !==
          previewRequestRef.current
        ) {
          return null
        }

        const finalUrl =
          result.url ||
          instagramUrl

        lastPreviewUrlRef.current =
          finalUrl

        setFormData(
          (prev) => ({
            ...prev,

            url:
              finalUrl,

            image:
              result.imageUrl,

            imageSource:
              'auto',
          })
        )

        setImagePreview(
          result.imageUrl
        )

        if (showSuccess) {
          showMessage(
            'success',
            'Instagram preview fetched and saved to XCDN.'
          )
        }

        return result
      } catch (error) {
        if (
          requestId !==
          previewRequestRef.current
        ) {
          return null
        }

        console.error(
          'Instagram preview fetch failed:',
          error
        )

        setPreviewError(
          error?.message ||
          'Preview could not be fetched. Upload a custom image instead.'
        )

        return null
      } finally {
        if (
          requestId ===
          previewRequestRef.current
        ) {
          setFetchingPreview(false)
        }
      }
    }

  /*
   * URL-first flow:
   *
   * User pastes a valid Instagram
   * post/reel URL, waits briefly,
   * preview automatically downloads
   * to XCDN.
   */
  useEffect(() => {
    if (!showForm) {
      return
    }

    const url =
      formData.url.trim()

    if (
      !url ||
      formData.imageSource ===
      'custom' ||
      !isSupportedInstagramUrl(
        url
      )
    ) {
      return
    }

    if (
      url ===
      lastPreviewUrlRef.current
    ) {
      return
    }

    const timer =
      window.setTimeout(() => {
        fetchInstagramPreview(
          url,
          {
            showSuccess: false,
          }
        )
      }, 800)

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    formData.url,
    formData.imageSource,
    showForm,
  ])

  const handleImageUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      if (!file) {
        return
      }

      /*
       * Invalidate any Instagram
       * preview currently downloading.
       */
      previewRequestRef.current += 1
      setFetchingPreview(false)
      setPreviewError('')

      const previousImage =
        formData.image

      const previousSource =
        formData.imageSource

      const reader =
        new FileReader()

      reader.onloadend = () => {
        setImagePreview(
          reader.result
        )
      }

      reader.readAsDataURL(file)

      /*
       * Switch to custom mode immediately
       * so auto-fetch cannot overwrite it.
       */
      setFormData((prev) => ({
        ...prev,
        imageSource:
          'custom',
      }))

      try {
        setUploadingImage(true)

        const url =
          await instagramGridService.uploadItemImage(
            file
          )

        setFormData((prev) => ({
          ...prev,

          image: url,

          imageSource:
            'custom',
        }))

        setImagePreview(url)

        showMessage(
          'success',
          'Custom Instagram image uploaded to XCDN.'
        )
      } catch (error) {
        console.error(
          'Custom Instagram image upload failed:',
          error
        )

        setFormData((prev) => ({
          ...prev,

          image:
            previousImage,

          imageSource:
            previousSource,
        }))

        setImagePreview(
          previousImage || ''
        )

        showMessage(
          'error',
          'Custom image upload failed.'
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

  const handleUseAutoPreview =
    async () => {
      /*
       * Explicit admin action:
       * custom image can be replaced
       * with Instagram auto preview.
       */
      lastPreviewUrlRef.current =
        ''

      await fetchInstagramPreview(
        formData.url,
        {
          showSuccess: true,
        }
      )
    }

  const handleRemoveImage = () => {
    previewRequestRef.current += 1

    setFetchingPreview(false)
    setPreviewError('')

    setFormData((prev) => ({
      ...prev,

      image: '',

      /*
       * Return to URL-first mode.
       * If URL is valid, auto fetch
       * will run again.
       */
      imageSource:
        'auto',
    }))

    setImagePreview('')

    lastPreviewUrlRef.current =
      ''

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        ''
    }
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    const instagramUrl =
      formData.url.trim()

    if (!instagramUrl) {
      showMessage(
        'error',
        'Instagram post or reel URL is required.'
      )

      return
    }

    if (
      !isSupportedInstagramUrl(
        instagramUrl
      )
    ) {
      showMessage(
        'error',
        'Please enter a valid Instagram post or reel URL.'
      )

      return
    }

    try {
      setSaving(true)

      let finalImage =
        formData.image

      let finalImageSource =
        formData.imageSource

      let finalInstagramUrl =
        instagramUrl

      /*
       * If admin pastes URL and presses
       * Save before debounce preview has
       * finished, fetch it here.
       */
      if (!finalImage) {
        const result =
          await instagramGridService.fetchInstagramPreview(
            instagramUrl
          )

        finalImage =
          result.imageUrl

        finalInstagramUrl =
          result.url ||
          instagramUrl

        finalImageSource =
          'auto'
      }

      if (!finalImage) {
        throw new Error(
          'Instagram preview could not be loaded. Please upload a custom image.'
        )
      }

      const payload = {
        image:
          finalImage,

        imageSource:
          finalImageSource,

        url:
          finalInstagramUrl,

        alt:
          formData.alt.trim(),

        displayOrder:
          Number(
            formData.displayOrder
          ) || 0,

        isActive:
          formData.isActive,
      }

      if (editingId) {
        await instagramGridService.updateItem(
          editingId,
          payload
        )

        setItems((prev) =>
          prev
            .map((item) =>
              item.id ===
                editingId
                ? {
                  ...item,
                  ...payload,
                }
                : item
            )
            .sort(
              (a, b) =>
                Number(
                  a.displayOrder ||
                  0
                ) -
                Number(
                  b.displayOrder ||
                  0
                )
            )
        )

        showMessage(
          'success',
          'Instagram grid item updated.'
        )
      } else {
        const created =
          await instagramGridService.createItem(
            payload
          )

        setItems((prev) =>
          [
            ...prev,
            created,
          ].sort(
            (a, b) =>
              Number(
                a.displayOrder ||
                0
              ) -
              Number(
                b.displayOrder ||
                0
              )
          )
        )

        showMessage(
          'success',
          'Instagram image added.'
        )
      }

      setShowForm(false)
      resetFormState()
    } catch (error) {
      console.error(
        'Error saving Instagram item:',
        error
      )

      showMessage(
        'error',
        error?.message ||
        'Failed to save Instagram image.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    item
  ) => {
    const confirmed =
      window.confirm(
        'Delete this Instagram image? This action cannot be undone.'
      )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(item.id)

      await instagramGridService.deleteItem(
        item.id
      )

      setItems((prev) =>
        prev.filter(
          (current) =>
            current.id !==
            item.id
        )
      )

      showMessage(
        'success',
        'Instagram image deleted.'
      )
    } catch (error) {
      console.error(
        'Instagram delete failed:',
        error
      )

      showMessage(
        'error',
        'Failed to delete Instagram image.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive =
    async (item) => {
      const nextActive =
        item.isActive === false

      try {
        setTogglingId(item.id)

        await instagramGridService.updateItem(
          item.id,
          {
            isActive:
              nextActive,
          }
        )

        setItems((prev) =>
          prev.map((current) =>
            current.id ===
              item.id
              ? {
                ...current,

                isActive:
                  nextActive,
              }
              : current
          )
        )

        showMessage(
          'success',
          nextActive
            ? 'Instagram image activated.'
            : 'Instagram image hidden.'
        )
      } catch (error) {
        console.error(
          'Instagram visibility update failed:',
          error
        )

        showMessage(
          'error',
          'Failed to update image visibility.'
        )
      } finally {
        setTogglingId(null)
      }
    }

  /*
   * Uses item ID, not filtered
   * array index. This prevents
   * wrong-item reorder while search
   * is active.
   */
  const moveItem = async (
    itemId,
    direction
  ) => {
    const currentIndex =
      items.findIndex(
        (item) =>
          item.id === itemId
      )

    if (
      currentIndex === -1
    ) {
      return
    }

    const targetIndex =
      direction === 'up'
        ? currentIndex - 1
        : currentIndex + 1

    if (
      targetIndex < 0 ||
      targetIndex >=
      items.length
    ) {
      return
    }

    const current =
      items[currentIndex]

    const target =
      items[targetIndex]

    const currentOrder =
      Number(
        current.displayOrder ||
        0
      )

    const targetOrder =
      Number(
        target.displayOrder ||
        0
      )

    try {
      setReorderingId(itemId)

      await instagramGridService.updateItem(
        current.id,
        {
          displayOrder:
            targetOrder,
        }
      )

      await instagramGridService.updateItem(
        target.id,
        {
          displayOrder:
            currentOrder,
        }
      )

      const updated =
        items.map((item) => {
          if (
            item.id ===
            current.id
          ) {
            return {
              ...item,

              displayOrder:
                targetOrder,
            }
          }

          if (
            item.id ===
            target.id
          ) {
            return {
              ...item,

              displayOrder:
                currentOrder,
            }
          }

          return item
        })

      setItems(
        updated.sort(
          (a, b) =>
            Number(
              a.displayOrder ||
              0
            ) -
            Number(
              b.displayOrder ||
              0
            )
        )
      )

      showMessage(
        'success',
        'Instagram display order updated.'
      )
    } catch (error) {
      console.error(
        'Instagram reorder failed:',
        error
      )

      showMessage(
        'error',
        'Failed to reorder Instagram images.'
      )

      loadItems()
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
                <Instagram className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Storefront
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Instagram Grid
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Paste an Instagram
                  post or reel URL and
                  its preview will be
                  fetched automatically.
                  You can also override
                  it with your own
                  custom image.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                openCreateForm
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-[#FFFEFC] shadow-sm transition hover:bg-[#281912] sm:w-auto"
            >
              <Plus className="h-4 w-4" />

              Add Instagram Post
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
            icon={ImageIcon}
            label="Total Images"
            value={stats.total}
            text="Configured gallery posts"
          />

          <StatCard
            icon={Eye}
            label="Active"
            value={stats.active}
            text="Visible on storefront"
          />

          <StatCard
            icon={EyeOff}
            label="Inactive"
            value={stats.inactive}
            text="Currently hidden"
          />

          <StatCard
            icon={Link2}
            label="Linked Posts"
            value={stats.linked}
            text="Instagram URLs added"
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
              placeholder="Search Instagram URL or alt text..."
              className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
            <p className="text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {
                  filteredItems.length
                }
              </span>{' '}
              of {items.length} images
            </p>

            <button
              type="button"
              onClick={loadItems}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B4228] transition hover:text-[#3A2117] disabled:opacity-50"
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

        {/* Content */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading Instagram
                images...
              </p>
            </div>
          </section>
        ) : filteredItems.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <Instagram className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No Instagram images
              found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
              {searchQuery
                ? 'Try adjusting your search.'
                : 'Paste your first Instagram post or reel URL.'}
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map(
              (item) => {
                const active =
                  item.isActive !==
                  false

                const fullIndex =
                  items.findIndex(
                    (current) =>
                      current.id ===
                      item.id
                  )

                const reorderBusy =
                  reorderingId ===
                  item.id

                const source =
                  item.imageSource ===
                    'auto'
                    ? 'Auto Preview'
                    : 'Custom Image'

                return (
                  <article
                    key={item.id}
                    className={`overflow-hidden rounded-2xl border bg-[#FFFEFC] shadow-[0_10px_30px_rgba(58,33,23,0.05)] transition ${active
                        ? 'border-[#E7DCD4]'
                        : 'border-[#E6DDD7] opacity-75'
                      }`}
                  >
                    {/* Image */}
                    <div className="group relative aspect-square overflow-hidden bg-[#EEE7E1]">
                      {item.image ? (
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.alt ||
                            'Instagram post'
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#AA978C]">
                          <ImageIcon className="h-9 w-9" />
                        </div>
                      )}

                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#6B4228] shadow-sm">
                          {source}
                        </span>
                      </div>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-[#3A2117] shadow-md transition hover:scale-105"
                          title="Open Instagram post"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-[#F7F4EF] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#8A7467]">
                          Order{' '}
                          {Number(
                            item.displayOrder ||
                            0
                          )}
                        </span>

                        <div className="flex items-center gap-1 rounded-lg border border-[#E2D6CE] bg-[#FAF7F4] p-1">
                          <button
                            type="button"
                            onClick={() =>
                              moveItem(
                                item.id,
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
                            className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B4228] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                            title="Move up"
                          >
                            {reorderBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveItem(
                                item.id,
                                'down'
                              )
                            }
                            disabled={
                              fullIndex ===
                              -1 ||
                              fullIndex >=
                              items.length -
                              1 ||
                              Boolean(
                                reorderingId
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B4228] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                            title="Move down"
                          >
                            {reorderBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 truncate text-sm font-medium text-[#4E3D34]">
                        {item.alt ||
                          'Instagram post'}
                      </p>

                      <p
                        className="mt-1 truncate text-xs text-[#9A8478]"
                        title={
                          item.url || ''
                        }
                      >
                        {item.url ||
                          'No Instagram URL'}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleActive(
                              item
                            )
                          }
                          disabled={
                            togglingId ===
                            item.id
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${active
                              ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                              : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                            }`}
                        >
                          {togglingId ===
                            item.id ? (
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

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                item
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
                                item
                              )
                            }
                            disabled={
                              deletingId ===
                              item.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId ===
                              item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
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

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-[#FFFEFC]">
                    <Instagram className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Storefront
                    </p>

                    <h3 className="mt-0.5 text-lg font-semibold text-[#281912] sm:text-xl">
                      {editingId
                        ? 'Edit Instagram Post'
                        : 'Add Instagram Post'}
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
                  {/* Instagram URL */}
                  <FormSection
                    eyebrow="Instagram"
                    title="Post / Reel URL"
                    description="Paste a public Instagram post or reel URL. The preview image will be fetched automatically and copied to XCDN."
                  >
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="url"
                        name="url"
                        value={
                          formData.url
                        }
                        onChange={
                          handleInputChange
                        }
                        placeholder="https://www.instagram.com/p/... or /reel/..."
                        className={
                          inputClass
                        }
                      />

                      <button
                        type="button"
                        onClick={
                          handleUseAutoPreview
                        }
                        disabled={
                          fetchingPreview ||
                          uploadingImage ||
                          !formData.url.trim()
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-4 py-3 text-sm font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {fetchingPreview ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}

                        {fetchingPreview
                          ? 'Fetching...'
                          : formData.image
                            ? 'Refresh Preview'
                            : 'Fetch Preview'}
                      </button>
                    </div>

                    {fetchingPreview && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#DED1C8] bg-[#FAF7F4] px-4 py-3 text-xs font-medium text-[#6B4228]">
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Fetching Instagram
                        preview and saving it
                        to XCDN...
                      </div>
                    )}

                    {previewError && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#E8C9C3] bg-[#FFF4F1] px-4 py-3 text-xs leading-5 text-[#93483C]">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>
                          {previewError}
                          {' '}
                          You can still
                          upload a custom
                          image below.
                        </span>
                      </div>
                    )}
                  </FormSection>

                  {/* Image */}
                  <FormSection
                    eyebrow="Media"
                    title="Instagram Preview"
                    description="Normally this image is fetched automatically. A custom image can be uploaded whenever you want to override it."
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
                            alt="Instagram preview"
                            className="aspect-square max-h-[520px] w-full object-cover"
                          />

                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-[#281912]/80 via-[#281912]/20 to-transparent p-4 pt-16">
                            <button
                              type="button"
                              onClick={() =>
                                fileInputRef.current?.click()
                              }
                              disabled={
                                uploadingImage ||
                                fetchingPreview
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#3A2117] shadow-sm disabled:opacity-50"
                            >
                              {uploadingImage ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}

                              Upload Custom
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleRemoveImage
                              }
                              disabled={
                                uploadingImage ||
                                fetchingPreview
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-[#954B42] shadow-sm disabled:opacity-50"
                              title="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-h-[290px] flex-col items-center justify-center px-6 py-10 text-center">
                          {fetchingPreview ? (
                            <Loader2 className="h-8 w-8 animate-spin text-[#6B4228]" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                              <Instagram className="h-5 w-5" />
                            </div>
                          )}

                          <p className="mt-3 text-sm font-semibold text-[#4E3D34]">
                            {fetchingPreview
                              ? 'Fetching Instagram preview...'
                              : 'Paste an Instagram URL above'}
                          </p>

                          <p className="mt-1 max-w-sm text-xs leading-5 text-[#9A8478]">
                            Preview will
                            normally appear
                            automatically. If
                            Instagram blocks it,
                            use the custom upload
                            option.
                          </p>

                          {!fetchingPreview && (
                            <button
                              type="button"
                              onClick={() =>
                                fileInputRef.current?.click()
                              }
                              disabled={
                                uploadingImage
                              }
                              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#D8C9BF] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B4228] transition hover:border-[#6B4228]"
                            >
                              {uploadingImage ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}

                              Upload Custom
                              Image
                            </button>
                          )}
                        </div>
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

                    {/* Image source */}
                    {formData.image && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${formData.imageSource ===
                              'custom'
                              ? 'border-[#D9CBE3] bg-[#F8F3FB] text-[#705180]'
                              : 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                            }`}
                        >
                          {formData.imageSource ===
                            'custom' ? (
                            <ImageIcon className="h-3.5 w-3.5" />
                          ) : (
                            <Instagram className="h-3.5 w-3.5" />
                          )}

                          {formData.imageSource ===
                            'custom'
                            ? 'Custom Image'
                            : 'Auto-fetched from Instagram'}
                        </span>

                        {formData.imageSource ===
                          'custom' &&
                          formData.url && (
                            <button
                              type="button"
                              onClick={
                                handleUseAutoPreview
                              }
                              disabled={
                                fetchingPreview ||
                                uploadingImage
                              }
                              className="text-xs font-semibold text-[#6B4228] underline underline-offset-4 disabled:opacity-50"
                            >
                              Use Instagram
                              Preview Instead
                            </button>
                          )}
                      </div>
                    )}

                    {uploadingImage && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#6B4228]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />

                        Uploading custom
                        image to XCDN...
                      </div>
                    )}
                  </FormSection>

                  {/* Details */}
                  <FormSection
                    eyebrow="Details"
                    title="Gallery Settings"
                    description="Add accessible image text, control ordering and choose whether the image is visible on the storefront."
                  >
                    <div className="space-y-4">
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
                          placeholder="e.g. Walnut floor lamp in modern living room"
                          className={
                            inputClass
                          }
                        />

                        <p className="mt-1.5 text-xs text-[#9A8478]">
                          Helps accessibility
                          and image SEO.
                        </p>
                      </div>

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

                      <label
                        className={`block cursor-pointer rounded-xl border p-4 transition ${formData.isActive
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
                                Active Image
                              </p>

                              <p className="mt-1 text-xs leading-5 text-[#8A7467]">
                                Display this
                                post in the
                                homepage
                                Instagram
                                gallery.
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
                    </div>
                  </FormSection>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="hidden max-w-sm text-xs leading-5 text-[#8A7467] sm:block">
                    Instagram URL is
                    required. Preview image
                    can be fetched
                    automatically or replaced
                    with a custom upload.
                  </p>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeForm}
                      disabled={formBusy}
                      className="rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50"
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
                        : fetchingPreview
                          ? 'Fetching Preview...'
                          : uploadingImage
                            ? 'Uploading...'
                            : editingId
                              ? 'Update Post'
                              : 'Add Post'}
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