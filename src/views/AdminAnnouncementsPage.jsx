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
  CalendarDays,
  CheckCircle,
  Clock3,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Megaphone,
  MonitorPlay,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Type,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'

import announcementService, {
  getAnnouncementState,
} from '../utils/announcementService.js'

const DEFAULT_COLORS = [
  '#3A2117',
  '#6B4228',
  '#281912',
  '#FFFEFC',
  '#F7F4EF',
  '#D8AD87',
  '#A87557',
  '#1F1F1F',
  '#FFFFFF',
  '#E53935',
  '#22C55E',
  '#2563EB',
]

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

function emptyForm() {
  return {
    message: '',
    isActive: true,
    displayStyle:
      'marquee',
    bgColor:
      '#3A2117',
    textColor:
      '#FFFEFC',
    scrollSpeed: 20,
    startDate: '',
    endDate: '',
  }
}

function stripHtml(value) {
  return String(
    value || ''
  )
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

  const pad = (number) =>
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
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(
      date.getMinutes()
    ),
  ].join('')
}

function toIsoOrNull(value) {
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

function StateBadge({
  announcement,
}) {
  const state =
    getAnnouncementState(
      announcement
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
        <Clock3 className="h-3 w-3" />
      ) : (
        <EyeOff className="h-3 w-3" />
      )}

      {state.label}
    </span>
  )
}

function AnnouncementPreview({
  data,
}) {
  const marquee =
    data.displayStyle ===
    'marquee'

  const speed =
    Math.min(
      60,
      Math.max(
        5,
        Number(
          data.scrollSpeed
        ) || 20
      )
    )

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-black/10 shadow-sm"
      style={{
        backgroundColor:
          data.bgColor ||
          '#3A2117',

        color:
          data.textColor ||
          '#FFFEFC',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />

      {marquee ? (
        <div className="overflow-hidden">
          <div
            className="flex w-max whitespace-nowrap"
            style={{
              animation:
                `adminAnnouncementMarquee ${speed}s linear infinite`,
            }}
          >
            {[0, 1].map(
              (copy) => (
                <div
                  key={copy}
                  className="flex shrink-0 items-center"
                >
                  {Array.from({
                    length: 6,
                  }).map(
                    (
                      _,
                      index
                    ) => (
                      <span
                        key={`${copy}-${index}`}
                        className="inline-flex min-h-[38px] items-center px-5 text-xs font-medium [&_a]:underline [&_a]:underline-offset-2"
                        dangerouslySetInnerHTML={{
                          __html:
                            `${data.message || 'Announcement preview'} <span style="opacity:.45;margin-left:2rem;">✦</span>`,
                        }}
                      />
                    )
                  )}
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div
          className="flex min-h-[42px] items-center justify-center px-5 py-2 text-center text-xs font-medium [&_a]:underline [&_a]:underline-offset-2"
          dangerouslySetInnerHTML={{
            __html:
              data.message ||
              'Announcement preview',
          }}
        />
      )}
    </div>
  )
}

export default function AdminAnnouncementsPage() {
  const [
    announcements,
    setAnnouncements,
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
    showForm,
    setShowForm,
  ] = useState(false)

  const [
    editingId,
    setEditingId,
  ] = useState(null)

  const [form, setForm] =
    useState(
      emptyForm
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
    reorderingId,
    setReorderingId,
  ] = useState(null)

  const [
    barEnabled,
    setBarEnabled,
  ] = useState(true)

  const [
    barLoading,
    setBarLoading,
  ] = useState(false)

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

  const loadData =
    async () => {
      try {
        setLoading(true)

        const [
          data,
          enabled,
        ] =
          await Promise.all([
            announcementService.getAllAnnouncements(),

            announcementService.getAnnouncementBarEnabled(),
          ])

        setAnnouncements(
          Array.isArray(data)
            ? data
            : []
        )

        setBarEnabled(
          enabled !== false
        )
      } catch (error) {
        console.error(
          'Announcements load failed:',
          error
        )

        showMessage(
          'error',
          'Failed to load announcements.'
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadData()
  }, [])

  const stats =
    useMemo(() => {
      const result = {
        total:
          announcements.length,

        live: 0,

        scheduled: 0,

        inactive: 0,
      }

      announcements.forEach(
        (announcement) => {
          const state =
            getAnnouncementState(
              announcement
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
      announcements,
    ])

  const filteredAnnouncements =
    useMemo(() => {
      const queryValue =
        searchQuery
          .trim()
          .toLowerCase()

      return announcements.filter(
        (announcement) => {
          const state =
            getAnnouncementState(
              announcement
            )

          const matchesStatus =
            statusFilter ===
            'all' ||
            state.key ===
            statusFilter

          const matchesSearch =
            !queryValue ||
            stripHtml(
              announcement.message
            )
              .toLowerCase()
              .includes(
                queryValue
              )

          return (
            matchesStatus &&
            matchesSearch
          )
        }
      )
    }, [
      announcements,
      searchQuery,
      statusFilter,
    ])

  const resetForm = () => {
    setEditingId(null)

    setForm(
      emptyForm()
    )

    setShowForm(false)
  }

  const openCreate = () => {
    setEditingId(null)

    setForm(
      emptyForm()
    )

    setShowForm(true)
  }

  const openEdit = (
    announcement
  ) => {
    setEditingId(
      announcement.id
    )

    setForm({
      message:
        announcement.message ||
        '',

      isActive:
        announcement.isActive !==
        false,

      displayStyle:
        announcement.displayStyle ===
          'static'
          ? 'static'
          : 'marquee',

      bgColor:
        announcement.bgColor ||
        '#3A2117',

      textColor:
        announcement.textColor ||
        '#FFFEFC',

      scrollSpeed:
        announcement.scrollSpeed ||
        20,

      startDate:
        toLocalInputValue(
          announcement.startDate
        ),

      endDate:
        toLocalInputValue(
          announcement.endDate
        ),
    })

    setShowForm(true)
  }

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setForm((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? Number(value)
            : value,
    }))
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      const announcementMessage =
        form.message.trim()

      if (
        !announcementMessage
      ) {
        showMessage(
          'error',
          'Announcement message is required.'
        )

        return
      }

      const startDate =
        toIsoOrNull(
          form.startDate
        )

      const endDate =
        toIsoOrNull(
          form.endDate
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
          message:
            announcementMessage,

          isActive:
            form.isActive,

          displayStyle:
            form.displayStyle,

          bgColor:
            form.bgColor,

          textColor:
            form.textColor,

          scrollSpeed:
            Number(
              form.scrollSpeed
            ) || 20,

          startDate,

          endDate,
        }

        if (editingId) {
          const current =
            announcements.find(
              (item) =>
                item.id ===
                editingId
            )

          const updated =
            await announcementService.updateAnnouncement(
              editingId,
              {
                ...current,
                ...payload,
              }
            )

          setAnnouncements(
            (prev) =>
              prev.map(
                (item) =>
                  item.id ===
                    editingId
                    ? {
                      ...item,
                      ...updated,
                    }
                    : item
              )
          )

          showMessage(
            'success',
            'Announcement updated.'
          )
        } else {
          const created =
            await announcementService.createAnnouncement(
              payload
            )

          setAnnouncements(
            (prev) => [
              ...prev,
              created,
            ]
          )

          showMessage(
            'success',
            'Announcement created.'
          )
        }

        resetForm()
      } catch (error) {
        console.error(
          'Announcement save failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to save announcement.'
        )
      } finally {
        setSaving(false)
      }
    }

  const toggleMasterBar =
    async () => {
      try {
        setBarLoading(true)

        const nextValue =
          !barEnabled

        await announcementService.setAnnouncementBarEnabled(
          nextValue
        )

        setBarEnabled(
          nextValue
        )

        showMessage(
          'success',
          nextValue
            ? 'Announcement bar enabled.'
            : 'Announcement bar disabled.'
        )
      } catch (error) {
        console.error(
          'Announcement bar toggle failed:',
          error
        )

        showMessage(
          'error',
          'Failed to update announcement bar.'
        )
      } finally {
        setBarLoading(false)
      }
    }

  const toggleAnnouncement =
    async (announcement) => {
      try {
        setUpdatingId(
          announcement.id
        )

        const updated =
          await announcementService.updateAnnouncement(
            announcement.id,
            {
              ...announcement,

              isActive:
                announcement.isActive ===
                false,
            }
          )

        setAnnouncements(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                  announcement.id
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
            ? 'Announcement activated.'
            : 'Announcement deactivated.'
        )
      } catch (error) {
        console.error(
          'Announcement status update failed:',
          error
        )

        showMessage(
          'error',
          'Failed to update announcement.'
        )
      } finally {
        setUpdatingId(null)
      }
    }

  const handleDelete =
    async (announcement) => {
      const confirmed =
        window.confirm(
          'Delete this announcement permanently?'
        )

      if (!confirmed) {
        return
      }

      try {
        setDeletingId(
          announcement.id
        )

        await announcementService.deleteAnnouncement(
          announcement.id
        )

        setAnnouncements(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                announcement.id
            )
        )

        showMessage(
          'success',
          'Announcement deleted.'
        )
      } catch (error) {
        console.error(
          'Announcement delete failed:',
          error
        )

        showMessage(
          'error',
          'Failed to delete announcement.'
        )
      } finally {
        setDeletingId(null)
      }
    }

  const moveAnnouncement =
    async (
      announcement,
      direction
    ) => {
      const sorted = [
        ...announcements,
      ].sort(
        (a, b) =>
          (a.displayOrder ||
            0) -
          (b.displayOrder ||
            0)
      )

      const currentIndex =
        sorted.findIndex(
          (item) =>
            item.id ===
            announcement.id
        )

      const targetIndex =
        currentIndex +
        direction

      if (
        currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >=
        sorted.length
      ) {
        return
      }

      const reordered = [
        ...sorted,
      ]

      const temp =
        reordered[
        currentIndex
        ]

      reordered[
        currentIndex
      ] =
        reordered[
        targetIndex
        ]

      reordered[
        targetIndex
      ] = temp

      try {
        setReorderingId(
          announcement.id
        )

        await announcementService.updateDisplayOrders(
          reordered.map(
            (item) =>
              item.id
          )
        )

        setAnnouncements(
          reordered.map(
            (item, index) => ({
              ...item,
              displayOrder:
                index,
            })
          )
        )
      } catch (error) {
        console.error(
          'Announcement reorder failed:',
          error
        )

        showMessage(
          'error',
          'Failed to reorder announcements.'
        )
      } finally {
        setReorderingId(null)
      }
    }

  return (
    <AdminLayout>
      <style>{`
        @keyframes adminAnnouncementMarquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-white">
                <Megaphone className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Communication
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Announcement Bar
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Create promotional
                  messages, schedule
                  campaigns and control
                  exactly how the top
                  website announcement
                  bar appears.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={
                  toggleMasterBar
                }
                disabled={
                  barLoading
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${barEnabled
                    ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                    : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                  }`}
              >
                {barLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : barEnabled ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}

                {barEnabled
                  ? 'Bar Enabled'
                  : 'Bar Disabled'}
              </button>

              <button
                type="button"
                onClick={
                  openCreate
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#281912]"
              >
                <Plus className="h-4 w-4" />

                Add Announcement
              </button>
            </div>
          </div>
        </section>

        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${message.type ===
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
            icon={Megaphone}
            label="Total"
            value={stats.total}
            text="All announcements"
          />

          <StatCard
            icon={Eye}
            label="Live Now"
            value={stats.live}
            text="Currently visible"
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
                placeholder="Search announcements..."
                className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
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
              onClick={loadData}
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

        {/* Announcements */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />
          </section>
        ) : filteredAnnouncements.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <Megaphone className="h-10 w-10 text-[#B9A79C]" />

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No announcements found
            </h3>
          </section>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {filteredAnnouncements.map(
              (
                announcement,
                index
              ) => (
                <article
                  key={
                    announcement.id
                  }
                  className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_10px_30px_rgba(58,33,23,0.05)] sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StateBadge
                        announcement={
                          announcement
                        }
                      />

                      <span className="rounded-full bg-[#F7F4EF] px-2.5 py-1 text-[10px] font-semibold text-[#75645A]">
                        {announcement.displayStyle ===
                          'static'
                          ? 'Static'
                          : 'Marquee'}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9A8478]">
                      Position{' '}
                      {index + 1}
                    </span>
                  </div>

                  <div className="mt-4">
                    <AnnouncementPreview
                      data={
                        announcement
                      }
                    />
                  </div>

                  <p className="mt-4 line-clamp-2 break-words text-sm leading-6 text-[#5F4C42]">
                    {stripHtml(
                      announcement.message
                    )}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <InfoBox
                      label="Starts"
                      value={
                        announcement.startDate
                          ? formatDate(
                            announcement.startDate
                          )
                          : 'Immediately'
                      }
                    />

                    <InfoBox
                      label="Ends"
                      value={
                        announcement.endDate
                          ? formatDate(
                            announcement.endDate
                          )
                          : 'No expiry'
                      }
                    />
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-[#EEE5DF] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        toggleAnnouncement(
                          announcement
                        )
                      }
                      disabled={
                        updatingId ===
                        announcement.id
                      }
                      className={`inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${announcement.isActive !==
                          false
                          ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                          : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                        }`}
                    >
                      {updatingId ===
                        announcement.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : announcement.isActive !==
                        false ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}

                      {announcement.isActive !==
                        false
                        ? 'Active'
                        : 'Inactive'}
                    </button>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          moveAnnouncement(
                            announcement,
                            -1
                          )
                        }
                        disabled={
                          reorderingId ===
                          announcement.id ||
                          index === 0
                        }
                        title="Move up"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          moveAnnouncement(
                            announcement,
                            1
                          )
                        }
                        disabled={
                          reorderingId ===
                          announcement.id ||
                          index ===
                          filteredAnnouncements.length -
                          1
                        }
                        title="Move down"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF] disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            announcement
                          )
                        }
                        title="Edit"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            announcement
                          )
                        }
                        disabled={
                          deletingId ===
                          announcement.id
                        }
                        title="Delete"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                      >
                        {deletingId ===
                          announcement.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </section>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed header */}
            <div className="shrink-0 border-b border-[#E8DDD5] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3A2117] text-white">
                    <Megaphone className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Announcement
                    </p>

                    <h3 className="text-lg font-semibold text-[#281912]">
                      {editingId
                        ? 'Edit Announcement'
                        : 'Create Announcement'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7B685D] hover:bg-[#F2ECE7]"
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
              {/* Scrollable */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
                <FormSection
                  icon={MonitorPlay}
                  title="Live Preview"
                >
                  <AnnouncementPreview
                    data={form}
                  />
                </FormSection>

                <FormSection
                  icon={Type}
                  title="Announcement Content"
                >
                  <label className="mb-2 block text-sm font-semibold text-[#4E3D34]">
                    Message *
                  </label>

                  <textarea
                    name="message"
                    value={
                      form.message
                    }
                    onChange={
                      handleChange
                    }
                    rows={4}
                    required
                    placeholder="Free shipping on orders above Rs. 10,000..."
                    className={`${inputClass} resize-none`}
                  />

                  <p className="mt-2 text-xs leading-5 text-[#9A8478]">
                    Basic HTML links are supported, e.g.
                    {' '}
                    &lt;a href="/shipping-policy"&gt;Learn more&lt;/a&gt;
                  </p>
                </FormSection>

                <FormSection
                  icon={MonitorPlay}
                  title="Display Style"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#4E3D34]">
                        Style
                      </label>

                      <select
                        name="displayStyle"
                        value={
                          form.displayStyle
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          inputClass
                        }
                      >
                        <option value="marquee">
                          Scrolling Marquee
                        </option>

                        <option value="static">
                          Static Centered
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#4E3D34]">
                        Scroll Speed
                      </label>

                      <input
                        type="number"
                        name="scrollSpeed"
                        min={5}
                        max={60}
                        value={
                          form.scrollSpeed
                        }
                        onChange={
                          handleChange
                        }
                        disabled={
                          form.displayStyle !==
                          'marquee'
                        }
                        className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                      />

                      <p className="mt-1 text-xs text-[#9A8478]">
                        5–60 seconds. Lower = faster.
                      </p>
                    </div>
                  </div>
                </FormSection>

                <FormSection
                  icon={Palette}
                  title="Colors"
                >
                  <ColorPicker
                    label="Background Color"
                    value={
                      form.bgColor
                    }
                    onChange={(value) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          bgColor:
                            value,
                        })
                      )
                    }
                  />

                  <div className="mt-5">
                    <ColorPicker
                      label="Text Color"
                      value={
                        form.textColor
                      }
                      onChange={(value) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            textColor:
                              value,
                          })
                        )
                      }
                    />
                  </div>
                </FormSection>

                <FormSection
                  icon={CalendarDays}
                  title="Schedule"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#4E3D34]">
                        Start Date / Time
                      </label>

                      <input
                        type="datetime-local"
                        name="startDate"
                        value={
                          form.startDate
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          inputClass
                        }
                      />

                      <p className="mt-1 text-xs text-[#9A8478]">
                        Empty = start immediately.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#4E3D34]">
                        End Date / Time
                      </label>

                      <input
                        type="datetime-local"
                        name="endDate"
                        value={
                          form.endDate
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          inputClass
                        }
                      />

                      <p className="mt-1 text-xs text-[#9A8478]">
                        Empty = no expiry.
                      </p>
                    </div>
                  </div>
                </FormSection>

                <label
                  className={`block cursor-pointer rounded-2xl border p-4 ${form.isActive
                      ? 'border-[#BFA995] bg-[#F5EEE8]'
                      : 'border-[#E6DCD5] bg-[#FFFEFC]'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#281912]">
                        Active
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#8A7467]">
                        Announcement will be eligible to appear during its scheduled window.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      name="isActive"
                      checked={
                        form.isActive
                      }
                      onChange={
                        handleChange
                      }
                      className="mt-1 h-4 w-4 accent-[#6B4228]"
                    />
                  </div>
                </label>
              </div>

              {/* Sticky footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      resetForm
                    }
                    disabled={saving}
                    className="rounded-xl border border-[#DCCFC6] px-5 py-2.5 text-sm font-semibold text-[#6B4228] hover:bg-[#F7F4EF]"
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
                        ? 'Update Announcement'
                        : 'Create Announcement'}
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
  title,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0E8E1] text-[#6B4228]">
          <Icon className="h-4 w-4" />
        </div>

        <h4 className="text-base font-semibold text-[#281912]">
          {title}
        </h4>
      </div>

      {children}
    </section>
  )
}

function ColorPicker({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#4E3D34]">
        {label}
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="h-11 w-14 cursor-pointer rounded-xl border border-[#DED1C8] bg-white p-1"
        />

        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="h-11 w-28 rounded-xl border border-[#DED1C8] px-3 font-mono text-xs text-[#281912] outline-none focus:border-[#6B4228]"
        />

        {DEFAULT_COLORS.map(
          (color) => (
            <button
              key={color}
              type="button"
              onClick={() =>
                onChange(color)
              }
              className={`h-7 w-7 rounded-full border-2 ${value
                  .toLowerCase() ===
                  color.toLowerCase()
                  ? 'border-[#6B4228] ring-2 ring-[#6B4228]/15'
                  : 'border-white shadow-sm'
                }`}
              style={{
                backgroundColor:
                  color,
              }}
              title={color}
            />
          )
        )}
      </div>
    </div>
  )
}