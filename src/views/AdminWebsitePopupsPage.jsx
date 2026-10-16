'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  MonitorPlay,
  MousePointerClick,
  Plus,
  RefreshCw,
  Search,
  Timer,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'

import websitePopupsService, {
  getWebsitePopupState,
} from '../utils/websitePopupsService.js'

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

function emptyForm() {
  return {
    title: '',
    description: '',
    bannerImage: '',
    buttonText:
      'Learn More',
    buttonUrl: '',
    isActive: true,
    displayDelay: 2,
    startDate: '',
    endDate: '',
    showOncePerSession: true,
  }
}

function toLocalInputValue(
  value
) {
  if (!value) {
    return ''
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  const pad = (
    number
  ) =>
    String(number).padStart(
      2,
      '0'
    )

  return [
    date.getFullYear(),
    '-',
    pad(
      date.getMonth() + 1
    ),
    '-',
    pad(
      date.getDate()
    ),
    'T',
    pad(
      date.getHours()
    ),
    ':',
    pad(
      date.getMinutes()
    ),
  ].join('')
}

function toIsoOrNull(
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

function formatDate(
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

function StateBadge({
  popup,
}) {
  const state =
    getWebsitePopupState(
      popup
    )

  const classes = {
    live:
      'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]',

    scheduled:
      'border-[#D8C7B8] bg-[#F6EEE7] text-[#7A5139]',

    expired:
      'border-[#E2D9D3] bg-[#F7F4EF] text-[#7C6B61]',

    inactive:
      'border-[#DDD4CE] bg-[#F5F2EF] text-[#75645A]',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${classes[
        state.key
        ]
        }`}
    >
      {state.key ===
        'live' ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      ) : state.key ===
        'scheduled' ? (
        <Clock className="h-3 w-3" />
      ) : (
        <EyeOff className="h-3 w-3" />
      )}

      {state.label}
    </span>
  )
}

function PopupPreview({
  data,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#DFD3CA] bg-[#F7F4EF] p-3 sm:p-5">
      <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-[#E2D6CE] bg-[#FFFEFC] shadow-[0_18px_45px_rgba(58,33,23,0.14)]">
        {data.bannerImage ? (
          <div className="aspect-[16/8] overflow-hidden bg-[#EDE5DE]">
            <img
              src={
                data.bannerImage
              }
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/7] items-center justify-center bg-gradient-to-br from-[#E9DED5] to-[#D5C1B1]">
            <ImageIcon className="h-8 w-8 text-[#6B4228]/35" />
          </div>
        )}

        <div className="p-5 text-center">
          <p className="break-words text-lg font-semibold text-[#281912]">
            {data.title ||
              'Popup Title'}
          </p>

          <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-[#7B685D]">
            {data.description ||
              'Your popup description will appear here.'}
          </p>

          {data.buttonText && (
            <div className="mt-4 inline-flex min-h-[38px] items-center justify-center rounded-xl bg-[#3A2117] px-5 text-xs font-semibold text-white">
              {
                data.buttonText
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminWebsitePopupsPage() {
  const [
    popups,
    setPopups,
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
    emptyForm
  )

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    uploadingImage,
    setUploadingImage,
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
    imagePreview,
    setImagePreview,
  ] = useState('')

  const [
    message,
    setMessage,
  ] = useState({
    type: '',
    text: '',
  })

  const fileInputRef =
    useRef(null)

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

  const loadPopups =
    async () => {
      try {
        setLoading(true)

        const data =
          await websitePopupsService.getAllPopups()

        setPopups(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (error) {
        console.error(
          'Popup loading failed:',
          error
        )

        showMessage(
          'error',
          'Failed to load website popups.'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadPopups()
  }, [])

  const stats =
    useMemo(() => {
      const result = {
        total:
          popups.length,

        live: 0,

        scheduled: 0,

        inactive: 0,
      }

      popups.forEach(
        (popup) => {
          const state =
            getWebsitePopupState(
              popup
            )

          if (
            state.key ===
            'live'
          ) {
            result.live += 1
          } else if (
            state.key ===
            'scheduled'
          ) {
            result.scheduled +=
              1
          } else {
            result.inactive +=
              1
          }
        }
      )

      return result
    }, [
      popups,
    ])

  const filteredPopups =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      return popups.filter(
        (popup) => {
          const state =
            getWebsitePopupState(
              popup
            )

          const matchesStatus =
            statusFilter ===
            'all' ||
            state.key ===
            statusFilter

          const matchesSearch =
            !query ||
            [
              popup.title,
              popup.description,
              popup.buttonText,
              popup.buttonUrl,
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
      popups,
      searchQuery,
      statusFilter,
    ])

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
              : type ===
                'number'
                ? Number(
                  value
                )
                : value,
        })
      )
    }

  const handleImageUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      if (!file) {
        return
      }

      if (
        !String(
          file.type || ''
        ).startsWith(
          'image/'
        )
      ) {
        showMessage(
          'error',
          'Please select a valid image.'
        )

        return
      }

      const temporaryUrl =
        URL.createObjectURL(
          file
        )

      setImagePreview(
        temporaryUrl
      )

      try {
        setUploadingImage(
          true
        )

        const url =
          await websitePopupsService.uploadPopupImage(
            file
          )

        setFormData(
          (prev) => ({
            ...prev,
            bannerImage:
              url,
          })
        )

        setImagePreview(
          url
        )

        showMessage(
          'success',
          'Popup image uploaded successfully.'
        )
      } catch (error) {
        console.error(
          'Popup image upload failed:',
          error
        )

        setImagePreview(
          formData.bannerImage ||
          ''
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to upload popup image.'
        )
      } finally {
        URL.revokeObjectURL(
          temporaryUrl
        )

        setUploadingImage(
          false
        )

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
      setFormData(
        (prev) => ({
          ...prev,
          bannerImage: '',
        })
      )

      setImagePreview('')

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          ''
      }
    }

  const resetForm =
    () => {
      setFormData(
        emptyForm()
      )

      setImagePreview('')
      setEditingId(null)
      setShowForm(false)

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          ''
      }
    }

  const openCreate =
    () => {
      setEditingId(null)

      setFormData(
        emptyForm()
      )

      setImagePreview('')
      setShowForm(true)
    }

  const handleEdit = (
    popup
  ) => {
    setEditingId(
      popup.id
    )

    setFormData({
      title:
        popup.title ||
        '',

      description:
        popup.description ||
        '',

      bannerImage:
        popup.bannerImage ||
        '',

      buttonText:
        popup.buttonText ??
        'Learn More',

      buttonUrl:
        popup.buttonUrl ||
        '',

      isActive:
        popup.isActive !==
        false,

      displayDelay:
        Number(
          popup.displayDelay
        ) || 0,

      startDate:
        toLocalInputValue(
          popup.startDate
        ),

      endDate:
        toLocalInputValue(
          popup.endDate
        ),

      showOncePerSession:
        popup.showOncePerSession !==
        false,
    })

    setImagePreview(
      popup.bannerImage ||
      ''
    )

    setShowForm(true)
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      const title =
        formData.title.trim()

      if (!title) {
        showMessage(
          'error',
          'Popup title is required.'
        )

        return
      }

      const startDate =
        toIsoOrNull(
          formData.startDate
        )

      const endDate =
        toIsoOrNull(
          formData.endDate
        )

      if (
        startDate &&
        endDate &&
        new Date(
          startDate
        ).getTime() >=
        new Date(
          endDate
        ).getTime()
      ) {
        showMessage(
          'error',
          'End date must be after start date.'
        )

        return
      }

      try {
        setSaving(true)

        const payload = {
          title,

          description:
            formData.description.trim(),

          bannerImage:
            formData.bannerImage,

          buttonText:
            formData.buttonText.trim(),

          buttonUrl:
            formData.buttonUrl.trim(),

          isActive:
            formData.isActive,

          displayDelay:
            Math.max(
              0,
              Number(
                formData.displayDelay
              ) || 0
            ),

          startDate,

          endDate,

          showOncePerSession:
            formData.showOncePerSession,
        }

        if (editingId) {
          const current =
            popups.find(
              (popup) =>
                popup.id ===
                editingId
            )

          const updated =
            await websitePopupsService.updatePopup(
              editingId,
              {
                ...current,
                ...payload,
              }
            )

          setPopups(
            (prev) =>
              prev.map(
                (popup) =>
                  popup.id ===
                    editingId
                    ? {
                      ...popup,
                      ...updated,
                    }
                    : popup
              )
          )

          showMessage(
            'success',
            'Website popup updated successfully.'
          )
        } else {
          const created =
            await websitePopupsService.createPopup(
              payload
            )

          setPopups(
            (prev) => [
              created,
              ...prev,
            ]
          )

          showMessage(
            'success',
            'Website popup created successfully.'
          )
        }

        resetForm()
      } catch (error) {
        console.error(
          'Popup save failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to save popup.'
        )
      } finally {
        setSaving(false)
      }
    }

  const handleDelete =
    async (popup) => {
      const confirmed =
        window.confirm(
          `Delete "${popup.title || 'this popup'}"? This action cannot be undone.`
        )

      if (!confirmed) {
        return
      }

      try {
        setDeletingId(
          popup.id
        )

        await websitePopupsService.deletePopup(
          popup.id
        )

        setPopups(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                popup.id
            )
        )

        showMessage(
          'success',
          'Website popup deleted.'
        )
      } catch (error) {
        console.error(
          'Popup deletion failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to delete popup.'
        )
      } finally {
        setDeletingId(null)
      }
    }

  const handleToggleActive =
    async (popup) => {
      try {
        setUpdatingId(
          popup.id
        )

        const updated =
          await websitePopupsService.updatePopup(
            popup.id,
            {
              ...popup,

              isActive:
                popup.isActive ===
                false,
            }
          )

        setPopups(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                  popup.id
                  ? {
                    ...item,
                    ...updated,
                  }
                  : item
            )
        )

        showMessage(
          'success',
          updated.isActive
            ? 'Popup activated.'
            : 'Popup deactivated.'
        )
      } catch (error) {
        console.error(
          'Popup status update failed:',
          error
        )

        showMessage(
          'error',
          'Failed to update popup status.'
        )
      } finally {
        setUpdatingId(null)
      }
    }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-white">
                <MonitorPlay className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Communication
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Website Popups
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Create homepage
                  promotional popups,
                  schedule campaigns and
                  control how frequently
                  customers see them.
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

              Add Popup
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
            icon={MonitorPlay}
            label="Total Popups"
            value={stats.total}
            text="All popup campaigns"
          />

          <StatCard
            icon={Eye}
            label="Live Now"
            value={stats.live}
            text="Eligible to display"
          />

          <StatCard
            icon={CalendarDays}
            label="Scheduled"
            value={
              stats.scheduled
            }
            text="Starts later"
          />

          <StatCard
            icon={EyeOff}
            label="Not Live"
            value={
              stats.inactive
            }
            text="Inactive or expired"
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
                placeholder="Search title, description or button..."
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

              <option value="live">
                Live
              </option>

              <option value="scheduled">
                Scheduled
              </option>

              <option value="expired">
                Expired
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <button
              type="button"
              onClick={loadPopups}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] px-4 py-3 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading
                    ? 'animate-spin'
                    : ''
                  }`}
              />

              Refresh
            </button>
          </div>
        </section>

        {/* Popup List */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading popups...
              </p>
            </div>
          </section>
        ) : filteredPopups.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <MonitorPlay className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No popups found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#8A7467]">
              {searchQuery ||
                statusFilter !==
                'all'
                ? 'Try adjusting your search or status filter.'
                : 'Create your first homepage popup campaign.'}
            </p>
          </section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {filteredPopups.map(
              (popup) => (
                <article
                  key={
                    popup.id
                  }
                  className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_10px_30px_rgba(58,33,23,0.05)]"
                >
                  {popup.bannerImage ? (
                    <div className="aspect-[16/6] overflow-hidden bg-[#EDE5DE]">
                      <img
                        src={
                          popup.bannerImage
                        }
                        alt={
                          popup.title ||
                          'Popup'
                        }
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/5] items-center justify-center bg-gradient-to-br from-[#EEE6DF] to-[#DDCEC2]">
                      <ImageIcon className="h-10 w-10 text-[#6B4228]/25" />
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <StateBadge
                          popup={
                            popup
                          }
                        />

                        <h3 className="mt-3 break-words text-lg font-semibold text-[#281912]">
                          {popup.title ||
                            'Untitled Popup'}
                        </h3>
                      </div>

                      <span className="rounded-full bg-[#F7F4EF] px-2.5 py-1 text-[10px] font-semibold text-[#75645A]">
                        {popup.showOncePerSession !==
                          false
                          ? 'Once / Session'
                          : 'Every Visit'}
                      </span>
                    </div>

                    {popup.description && (
                      <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-[#6F5E54]">
                        {
                          popup.description
                        }
                      </p>
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <InfoBox
                        label="Delay"
                        value={`${Number(
                          popup.displayDelay
                        ) || 0}s`}
                      />

                      <InfoBox
                        label="Button"
                        value={
                          popup.buttonText ||
                          'No button'
                        }
                      />

                      <InfoBox
                        label="Starts"
                        value={
                          popup.startDate
                            ? formatDate(
                              popup.startDate
                            )
                            : 'Immediately'
                        }
                      />

                      <InfoBox
                        label="Ends"
                        value={
                          popup.endDate
                            ? formatDate(
                              popup.endDate
                            )
                            : 'No expiry'
                        }
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-[#EEE5DF] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleActive(
                            popup
                          )
                        }
                        disabled={
                          updatingId ===
                          popup.id
                        }
                        className={`inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${popup.isActive !==
                            false
                            ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                            : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                          }`}
                      >
                        {updatingId ===
                          popup.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : popup.isActive !==
                          false ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}

                        {popup.isActive !==
                          false
                          ? 'Active'
                          : 'Inactive'}
                      </button>

                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              popup
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                          title="Edit popup"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              popup
                            )
                          }
                          disabled={
                            deletingId ===
                            popup.id
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                          title="Delete popup"
                        >
                          {deletingId ===
                            popup.id ? (
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
                    <MonitorPlay className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Website Popup
                    </p>

                    <h3 className="mt-0.5 text-lg font-semibold text-[#281912] sm:text-xl">
                      {editingId
                        ? 'Edit Popup'
                        : 'Create Popup'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
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
              {/* Scrollable content */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
                {/* Live Preview */}
                <FormSection
                  icon={MonitorPlay}
                  eyebrow="Preview"
                  title="Customer Preview"
                  description="Approximate preview of how this popup will appear on the homepage."
                >
                  <PopupPreview
                    data={{
                      ...formData,

                      bannerImage:
                        imagePreview ||
                        formData.bannerImage,
                    }}
                  />
                </FormSection>

                {/* Content */}
                <FormSection
                  icon={MousePointerClick}
                  eyebrow="Content"
                  title="Popup Content"
                  description="Configure the heading, description and optional call-to-action."
                >
                  <div>
                    <FieldLabel>
                      Popup Title *
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
                      required
                      className={
                        inputClass
                      }
                      placeholder="Discover Our New Collection"
                    />
                  </div>

                  <div className="mt-4">
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
                      className={`${inputClass} resize-none`}
                      placeholder="Tell customers about your promotion, collection or update..."
                    />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>
                        Button Text
                      </FieldLabel>

                      <input
                        type="text"
                        name="buttonText"
                        value={
                          formData.buttonText
                        }
                        onChange={
                          handleInputChange
                        }
                        className={
                          inputClass
                        }
                        placeholder="Shop Now"
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Button URL
                      </FieldLabel>

                      <input
                        type="text"
                        name="buttonUrl"
                        value={
                          formData.buttonUrl
                        }
                        onChange={
                          handleInputChange
                        }
                        className={
                          inputClass
                        }
                        placeholder="/collections"
                      />

                      <p className="mt-1.5 text-xs text-[#9A8478]">
                        Internal URLs can
                        use /products or
                        /collections.
                      </p>
                    </div>
                  </div>
                </FormSection>

                {/* Image */}
                <FormSection
                  icon={ImageIcon}
                  eyebrow="Media"
                  title="Popup Banner"
                  description="Upload an optional popup image. Images are stored on XCDN."
                >
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

                  {imagePreview ||
                    formData.bannerImage ? (
                    <div className="overflow-hidden rounded-2xl border border-[#DFD3CA] bg-[#F7F4EF]">
                      <div className="aspect-[16/7] overflow-hidden">
                        <img
                          src={
                            imagePreview ||
                            formData.bannerImage
                          }
                          alt="Popup preview"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col gap-2 border-t border-[#E7DCD4] bg-[#FFFEFC] p-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={
                            uploadingImage
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#D8C9BF] px-4 py-2.5 text-xs font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF]"
                        >
                          {uploadingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}

                          Replace Image
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleRemoveImage
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E4CBC5] bg-[#FFF8F6] px-4 py-2.5 text-xs font-semibold text-[#954B42] transition hover:bg-[#FFF1EE]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
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
                      className="flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8C8BC] bg-[#FAF7F4] px-6 text-center transition hover:border-[#9F806C] hover:bg-[#F7F1EC] disabled:opacity-60"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />
                      ) : (
                        <Upload className="h-7 w-7 text-[#6B4228]" />
                      )}

                      <p className="mt-3 text-sm font-semibold text-[#3A2117]">
                        {uploadingImage
                          ? 'Uploading to XCDN...'
                          : 'Upload Popup Image'}
                      </p>

                      <p className="mt-1 text-xs text-[#8A7467]">
                        JPG, PNG, WebP,
                        GIF or AVIF
                      </p>
                    </button>
                  )}
                </FormSection>

                {/* Display */}
                <FormSection
                  icon={Timer}
                  eyebrow="Behavior"
                  title="Display Settings"
                  description="Control the popup delay and whether customers should see it again during the same browser session."
                >
                  <div>
                    <FieldLabel>
                      Display Delay
                    </FieldLabel>

                    <div className="relative">
                      <input
                        type="number"
                        name="displayDelay"
                        min={0}
                        max={120}
                        value={
                          formData.displayDelay
                        }
                        onChange={
                          handleInputChange
                        }
                        className={`${inputClass} pr-20`}
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8A7467]">
                        seconds
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-[#9A8478]">
                      Use 0 to show the
                      popup immediately.
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <ToggleCard
                      checked={
                        formData.showOncePerSession
                      }
                      name="showOncePerSession"
                      onChange={
                        handleInputChange
                      }
                      title="Show Once Per Session"
                      description="After the customer closes this popup, do not show the same popup again until a new browser session starts."
                    />

                    <ToggleCard
                      checked={
                        formData.isActive
                      }
                      name="isActive"
                      onChange={
                        handleInputChange
                      }
                      title="Popup Active"
                      description="The popup can appear only while this option is enabled and its schedule is valid."
                    />
                  </div>
                </FormSection>

                {/* Schedule */}
                <FormSection
                  icon={CalendarDays}
                  eyebrow="Schedule"
                  title="Campaign Schedule"
                  description="Optional start and end dates for automatic popup publishing."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>
                        Start Date / Time
                      </FieldLabel>

                      <input
                        type="datetime-local"
                        name="startDate"
                        value={
                          formData.startDate
                        }
                        onChange={
                          handleInputChange
                        }
                        className={
                          inputClass
                        }
                      />

                      <p className="mt-1.5 text-xs text-[#9A8478]">
                        Empty = available
                        immediately.
                      </p>
                    </div>

                    <div>
                      <FieldLabel>
                        End Date / Time
                      </FieldLabel>

                      <input
                        type="datetime-local"
                        name="endDate"
                        value={
                          formData.endDate
                        }
                        onChange={
                          handleInputChange
                        }
                        className={
                          inputClass
                        }
                      />

                      <p className="mt-1.5 text-xs text-[#9A8478]">
                        Empty = no expiry.
                      </p>
                    </div>
                  </div>
                </FormSection>
              </div>

              {/* Sticky Action Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="hidden text-xs text-[#8A7467] sm:block">
                    Popups currently display
                    on the homepage.
                  </p>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={
                        resetForm
                      }
                      disabled={saving}
                      className="rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:bg-[#F7F4EF]"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        uploadingImage
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}

                      {saving
                        ? 'Saving...'
                        : editingId
                          ? 'Update Popup'
                          : 'Create Popup'}
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
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0E8E1] text-[#6B4228]">
          <Icon className="h-4 w-4" />
        </div>

        <div>
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