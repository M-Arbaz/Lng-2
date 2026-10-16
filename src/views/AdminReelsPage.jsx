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
  Clapperboard,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Link2,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import reelsService from '../utils/reelsService'

const createInitialForm = () => ({
  title: '',
  caption: '',
  videoUrl: '',
  poster: '',
  isActive: true,
})

const createInitialModes = () => ({
  video: 'url',
  poster: 'url',
})

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

export default function AdminReelsPage() {
  const [reels, setReels] =
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

  const [inputMode, setInputMode] =
    useState(createInitialModes)

  const [saving, setSaving] =
    useState(false)

  const [
    uploadingVideo,
    setUploadingVideo,
  ] = useState(false)

  const [
    uploadingPoster,
    setUploadingPoster,
  ] = useState(false)

  const [deletingId, setDeletingId] =
    useState(null)

  const [togglingId, setTogglingId] =
    useState(null)

  const [previewReel, setPreviewReel] =
    useState(null)

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const videoFileRef =
    useRef(null)

  const posterFileRef =
    useRef(null)

  const messageTimerRef =
    useRef(null)

  const formBusy =
    saving ||
    uploadingVideo ||
    uploadingPoster

  const showMessage = (
    type,
    text
  ) => {
    if (messageTimerRef.current) {
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

  const loadReels = async () => {
    try {
      setLoading(true)

      const data =
        await reelsService.getAllReels()

      setReels(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      console.error(
        'Error loading reels:',
        error
      )

      showMessage(
        'error',
        'Failed to load reels.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReels()
  }, [])

  const filteredReels =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase()

      if (!query) {
        return reels
      }

      return reels.filter(
        (reel) =>
          [
            reel.title,
            reel.caption,
            reel.videoUrl,
          ].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(query)
          )
      )
    }, [
      reels,
      searchQuery,
    ])

  const stats =
    useMemo(() => ({
      total:
        reels.length,

      active:
        reels.filter(
          (reel) =>
            reel.isActive !== false
        ).length,

      inactive:
        reels.filter(
          (reel) =>
            reel.isActive === false
        ).length,

      posters:
        reels.filter(
          (reel) =>
            Boolean(reel.poster)
        ).length,
    }), [reels])

  const resetFormState = () => {
    setFormData(
      createInitialForm()
    )

    setInputMode(
      createInitialModes()
    )

    setEditingId(null)

    if (videoFileRef.current) {
      videoFileRef.current.value =
        ''
    }

    if (posterFileRef.current) {
      posterFileRef.current.value =
        ''
    }
  }

  const openCreateForm = () => {
    resetFormState()
    setShowForm(true)
  }

  const handleEdit = (reel) => {
    setEditingId(reel.id)

    setFormData({
      title:
        reel.title || '',

      caption:
        reel.caption || '',

      videoUrl:
        reel.videoUrl || '',

      poster:
        reel.poster || '',

      isActive:
        reel.isActive !== false,
    })

    setInputMode(
      createInitialModes()
    )

    setShowForm(true)
  }

  const closeForm = () => {
    if (formBusy) return

    setShowForm(false)
    resetFormState()
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

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const handleVideoUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      if (!file) return

      try {
        setUploadingVideo(true)

        const url =
          await reelsService.uploadVideo(
            file
          )

        setFormData((prev) => ({
          ...prev,
          videoUrl: url,
        }))

        showMessage(
          'success',
          'Reel video uploaded to XCDN.'
        )
      } catch (error) {
        console.error(
          'Reel video upload failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to upload reel video.'
        )
      } finally {
        setUploadingVideo(false)

        if (videoFileRef.current) {
          videoFileRef.current.value =
            ''
        }
      }
    }

  const handlePosterUpload =
    async (event) => {
      const file =
        event.target.files?.[0]

      if (!file) return

      try {
        setUploadingPoster(true)

        const url =
          await reelsService.uploadPoster(
            file
          )

        setFormData((prev) => ({
          ...prev,
          poster: url,
        }))

        showMessage(
          'success',
          'Reel poster uploaded to XCDN.'
        )
      } catch (error) {
        console.error(
          'Reel poster upload failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Failed to upload reel poster.'
        )
      } finally {
        setUploadingPoster(false)

        if (posterFileRef.current) {
          posterFileRef.current.value =
            ''
        }
      }
    }

  const handleSave = async (
    event
  ) => {
    event.preventDefault()

    const title =
      formData.title.trim()

    const videoUrl =
      formData.videoUrl.trim()

    if (!title) {
      showMessage(
        'error',
        'Reel title is required.'
      )

      return
    }

    if (!videoUrl) {
      showMessage(
        'error',
        'Reel video is required.'
      )

      return
    }

    const payload = {
      title,

      caption:
        formData.caption.trim(),

      videoUrl,

      poster:
        formData.poster.trim(),

      isActive:
        formData.isActive,
    }

    try {
      setSaving(true)

      if (editingId) {
        const updated =
          await reelsService.updateReel(
            editingId,
            payload
          )

        setReels((prev) =>
          prev.map((reel) =>
            reel.id === editingId
              ? {
                ...reel,
                ...updated,
              }
              : reel
          )
        )

        showMessage(
          'success',
          'Reel updated successfully.'
        )
      } else {
        const created =
          await reelsService.createReel(
            payload
          )

        setReels((prev) => [
          created,
          ...prev,
        ])

        showMessage(
          'success',
          'Reel created successfully.'
        )
      }

      setShowForm(false)
      resetFormState()
    } catch (error) {
      console.error(
        'Error saving reel:',
        error
      )

      showMessage(
        'error',
        error?.message ||
        'Failed to save reel.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    reel
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${reel.title ||
        'this reel'
        }"? This action cannot be undone.`
      )

    if (!confirmed) return

    try {
      setDeletingId(reel.id)

      await reelsService.deleteReel(
        reel.id
      )

      setReels((prev) =>
        prev.filter(
          (item) =>
            item.id !== reel.id
        )
      )

      if (
        previewReel?.id ===
        reel.id
      ) {
        setPreviewReel(null)
      }

      showMessage(
        'success',
        'Reel deleted successfully.'
      )
    } catch (error) {
      console.error(
        'Error deleting reel:',
        error
      )

      showMessage(
        'error',
        'Failed to delete reel.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive =
    async (reel) => {
      const nextActive =
        reel.isActive === false

      try {
        setTogglingId(reel.id)

        await reelsService.toggleReelActive(
          reel.id,
          nextActive
        )

        setReels((prev) =>
          prev.map((item) =>
            item.id === reel.id
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
            ? 'Reel activated.'
            : 'Reel hidden from storefront.'
        )
      } catch (error) {
        console.error(
          'Error updating reel visibility:',
          error
        )

        showMessage(
          'error',
          'Failed to update reel visibility.'
        )
      } finally {
        setTogglingId(null)
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
                <Clapperboard className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Storefront
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  Reels
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Create and manage
                  short-form videos,
                  posters, captions and
                  storefront visibility.
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

              Add Reel
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
            icon={Video}
            label="Total Reels"
            value={stats.total}
            text="Configured videos"
          />

          <StatCard
            icon={Eye}
            label="Active"
            value={stats.active}
            text="Visible to customers"
          />

          <StatCard
            icon={EyeOff}
            label="Inactive"
            value={stats.inactive}
            text="Currently hidden"
          />

          <StatCard
            icon={ImageIcon}
            label="With Poster"
            value={stats.posters}
            text="Thumbnail configured"
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
              placeholder="Search reel title, caption or video URL..."
              className="w-full rounded-xl border border-[#DED1C8] bg-[#FDFBF8] py-3 pl-11 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
            <p className="text-sm text-[#7B685D]">
              Showing{' '}
              <span className="font-semibold text-[#3A2117]">
                {
                  filteredReels.length
                }
              </span>{' '}
              of {reels.length} reels
            </p>

            <button
              type="button"
              onClick={loadReels}
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

        {/* Reel list */}
        {loading ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

              <p className="mt-3 text-sm font-medium text-[#7B685D]">
                Loading reels...
              </p>
            </div>
          </section>
        ) : filteredReels.length ===
          0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E8E1] text-[#6B4228]">
              <Clapperboard className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#281912]">
              No reels found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#8A7467]">
              {searchQuery
                ? 'Try adjusting your search.'
                : 'Add your first Lamp & Glow reel.'}
            </p>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredReels.map(
              (reel) => {
                const active =
                  reel.isActive !==
                  false

                return (
                  <article
                    key={reel.id}
                    className={`overflow-hidden rounded-2xl border bg-[#FFFEFC] shadow-[0_10px_30px_rgba(58,33,23,0.05)] transition ${active
                      ? 'border-[#E7DCD4]'
                      : 'border-[#E6DDD7] opacity-75'
                      }`}
                  >
                    {/* Media */}
                    <div className="group relative aspect-[9/16] w-full max-h-[430px] overflow-hidden bg-[#1E1714]">
                      {reel.poster ? (
                        <img
                          src={
                            reel.poster
                          }
                          alt={
                            reel.title ||
                            'Reel poster'
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <video
                          src={
                            reel.videoUrl
                          }
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C100B]/65 via-transparent to-black/10" />

                      <button
                        type="button"
                        onClick={() =>
                          setPreviewReel(
                            reel
                          )
                        }
                        className="absolute inset-0 flex items-center justify-center"
                        aria-label={`Preview ${reel.title ||
                          'reel'
                          }`}
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/90 text-[#3A2117] shadow-lg transition group-hover:scale-110">
                          <Play className="ml-0.5 h-5 w-5 fill-current" />
                        </span>
                      </button>

                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
                          Reel
                        </span>
                      </div>

                      <div className="absolute right-3 top-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${active
                            ? 'border-emerald-200/40 bg-emerald-950/45 text-emerald-100'
                            : 'border-white/20 bg-black/45 text-white/80'
                            }`}
                        >
                          {active
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Information */}
                    <div className="p-4">
                      <h3 className="truncate text-base font-semibold text-[#281912]">
                        {reel.title ||
                          'Untitled Reel'}
                      </h3>

                      <p className="mt-1.5 min-h-[40px] line-clamp-2 text-xs leading-5 text-[#7B685D]">
                        {reel.caption ||
                          'No caption added.'}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EEE5DF] pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleActive(
                              reel
                            )
                          }
                          disabled={
                            togglingId ===
                            reel.id
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${active
                            ? 'border-[#C5DBC9] bg-[#EFF8F0] text-[#44704B]'
                            : 'border-[#DDD4CE] bg-[#F7F4EF] text-[#75645A]'
                            }`}
                        >
                          {togglingId ===
                            reel.id ? (
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
                              setPreviewReel(
                                reel
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B4228] transition hover:bg-[#F7F4EF]"
                            title="Preview"
                          >
                            <Play className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                reel
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
                                reel
                              )
                            }
                            disabled={
                              deletingId ===
                              reel.id
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#954B42] transition hover:bg-[#FFF2EF] disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId ===
                              reel.id ? (
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

      {/* Preview modal */}
      {previewReel && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#281912]/75 p-3 backdrop-blur-[3px] sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#FFFEFC] shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E8DDD5] px-5 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                  Reel Preview
                </p>

                <h3 className="mt-1 truncate text-base font-semibold text-[#281912]">
                  {previewReel.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewReel(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7B685D] transition hover:bg-[#F2ECE7]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto bg-[#F7F4EF] p-4">
              <div className="mx-auto overflow-hidden rounded-2xl bg-black">
                <video
                  key={
                    previewReel.videoUrl
                  }
                  src={
                    previewReel.videoUrl
                  }
                  poster={
                    previewReel.poster ||
                    undefined
                  }
                  controls
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] max-h-[72vh] w-full object-cover"
                />
              </div>

              {previewReel.caption && (
                <p className="mt-4 text-sm leading-6 text-[#6F5E54]">
                  {
                    previewReel.caption
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[2px] sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_28px_80px_rgba(40,25,18,0.30)]">
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3A2117] text-white">
                    <Clapperboard className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
                      Storefront
                    </p>

                    <h3 className="mt-0.5 text-lg font-semibold text-[#281912] sm:text-xl">
                      {editingId
                        ? 'Edit Reel'
                        : 'Add Reel'}
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
            </div>

            <form
              onSubmit={handleSave}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Scrollable form */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F4EF]/70 p-4 sm:p-6">
                <div className="space-y-5">
                  {/* Information */}
                  <FormSection
                    eyebrow="Content"
                    title="Reel Information"
                    description="Add a clear reel title and an optional supporting caption."
                  >
                    <div className="space-y-4">
                      <div>
                        <FieldLabel>
                          Reel Title *
                        </FieldLabel>

                        <input
                          type="text"
                          name="title"
                          value={
                            formData.title
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="e.g. Warm Glow Corner Setup"
                          className={
                            inputClass
                          }
                        />
                      </div>

                      <div>
                        <FieldLabel>
                          Caption / Description
                        </FieldLabel>

                        <textarea
                          name="caption"
                          value={
                            formData.caption
                          }
                          onChange={
                            handleChange
                          }
                          rows={4}
                          placeholder="Short description for this reel..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>
                  </FormSection>

                  {/* Video */}
                  <FormSection
                    eyebrow="Video"
                    title="Reel Video"
                    description="Use an existing direct video URL or upload the video directly to Lamp & Glow XCDN."
                  >
                    <ModeButtons
                      value={
                        inputMode.video
                      }
                      onChange={(mode) =>
                        setInputMode(
                          (prev) => ({
                            ...prev,
                            video:
                              mode,
                          })
                        )
                      }
                      uploadLabel="Upload Video"
                    />

                    {inputMode.video ===
                      'url' ? (
                      <div className="mt-4">
                        <FieldLabel>
                          Video URL *
                        </FieldLabel>

                        <input
                          type="url"
                          name="videoUrl"
                          value={
                            formData.videoUrl
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="https://.../video.mp4"
                          className={
                            inputClass
                          }
                        />
                      </div>
                    ) : (
                      <div className="mt-4">
                        <input
                          ref={
                            videoFileRef
                          }
                          type="file"
                          accept="video/*"
                          onChange={
                            handleVideoUpload
                          }
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            videoFileRef.current?.click()
                          }
                          disabled={
                            uploadingVideo
                          }
                          className="flex min-h-[130px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#D7C7BC] bg-[#FAF7F4] p-5 text-center transition hover:bg-[#F5EFEA] disabled:opacity-60"
                        >
                          {uploadingVideo ? (
                            <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                              <Upload className="h-5 w-5" />
                            </div>
                          )}

                          <p className="mt-3 text-sm font-semibold text-[#4E3D34]">
                            {uploadingVideo
                              ? 'Uploading video to XCDN...'
                              : formData.videoUrl
                                ? 'Replace Reel Video'
                                : 'Upload Reel Video'}
                          </p>
                        </button>
                      </div>
                    )}

                    {formData.videoUrl && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-[#E0D4CB] bg-black">
                        <video
                          key={
                            formData.videoUrl
                          }
                          src={
                            formData.videoUrl
                          }
                          poster={
                            formData.poster ||
                            undefined
                          }
                          controls
                          playsInline
                          preload="metadata"
                          className="mx-auto aspect-[9/16] max-h-[420px] w-full object-contain"
                        />
                      </div>
                    )}
                  </FormSection>

                  {/* Poster */}
                  <FormSection
                    eyebrow="Thumbnail"
                    title="Poster Image"
                    description="Optional poster image shown before the video starts loading."
                  >
                    <ModeButtons
                      value={
                        inputMode.poster
                      }
                      onChange={(mode) =>
                        setInputMode(
                          (prev) => ({
                            ...prev,
                            poster:
                              mode,
                          })
                        )
                      }
                      uploadLabel="Upload Poster"
                    />

                    {inputMode.poster ===
                      'url' ? (
                      <div className="mt-4">
                        <FieldLabel>
                          Poster URL
                        </FieldLabel>

                        <input
                          type="url"
                          name="poster"
                          value={
                            formData.poster
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="https://.../poster.jpg"
                          className={
                            inputClass
                          }
                        />
                      </div>
                    ) : (
                      <div className="mt-4">
                        <input
                          ref={
                            posterFileRef
                          }
                          type="file"
                          accept="image/*"
                          onChange={
                            handlePosterUpload
                          }
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            posterFileRef.current?.click()
                          }
                          disabled={
                            uploadingPoster
                          }
                          className="flex min-h-[120px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#D7C7BC] bg-[#FAF7F4] p-5 text-center transition hover:bg-[#F5EFEA] disabled:opacity-60"
                        >
                          {uploadingPoster ? (
                            <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}

                          <p className="mt-3 text-sm font-semibold text-[#4E3D34]">
                            {uploadingPoster
                              ? 'Uploading poster to XCDN...'
                              : formData.poster
                                ? 'Replace Poster Image'
                                : 'Upload Poster Image'}
                          </p>
                        </button>
                      </div>
                    )}

                    {formData.poster && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-[#E0D4CB] bg-[#EEE7E1]">
                        <img
                          src={
                            formData.poster
                          }
                          alt="Reel poster preview"
                          className="mx-auto aspect-[9/16] max-h-[420px] w-full object-cover"
                        />
                      </div>
                    )}
                  </FormSection>

                  {/* Visibility */}
                  <FormSection
                    eyebrow="Display"
                    title="Storefront Visibility"
                    description="Choose whether this reel should be visible to customers."
                  >
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
                              Active Reel
                            </p>

                            <p className="mt-1 text-xs leading-5 text-[#8A7467]">
                              Display this
                              reel on the
                              customer-facing
                              Reels page.
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
                            handleChange
                          }
                          className="mt-1 h-4 w-4 accent-[#6B4228]"
                        />
                      </div>
                    </label>
                  </FormSection>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#FFFEFC] px-4 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="hidden text-xs text-[#8A7467] sm:block">
                    Reel title and video
                    are required.
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
                        : uploadingVideo
                          ? 'Uploading Video...'
                          : uploadingPoster
                            ? 'Uploading Poster...'
                            : editingId
                              ? 'Update Reel'
                              : 'Create Reel'}
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

function ModeButtons({
  value,
  onChange,
  uploadLabel,
}) {
  return (
    <div className="inline-flex rounded-xl border border-[#DED1C8] bg-[#F7F4EF] p-1">
      <button
        type="button"
        onClick={() =>
          onChange('url')
        }
        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${value === 'url'
          ? 'bg-[#FFFEFC] text-[#3A2117] shadow-sm'
          : 'text-[#8A7467] hover:text-[#3A2117]'
          }`}
      >
        <Link2 className="h-3.5 w-3.5" />
        URL
      </button>

      <button
        type="button"
        onClick={() =>
          onChange('upload')
        }
        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${value === 'upload'
          ? 'bg-[#FFFEFC] text-[#3A2117] shadow-sm'
          : 'text-[#8A7467] hover:text-[#3A2117]'
          }`}
      >
        <Upload className="h-3.5 w-3.5" />
        {uploadLabel}
      </button>
    </div>
  )
}