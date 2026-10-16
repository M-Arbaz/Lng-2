'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import RichTextEditor from '../components/RichTextEditor.jsx'

import aboutService, {
  createAboutItemId,
  normalizeAboutData,
} from '../utils/aboutService'

const SECTION_META = {
  hero: {
    label: 'Hero',
    icon: Sparkles,
  },

  stats: {
    label: 'Statistics',
    icon: BarChart3,
  },

  story: {
    label: 'Company Story',
    icon: FileText,
  },

  mission: {
    label: 'Mission & Vision',
    icon: Target,
  },

  values: {
    label: 'Core Values',
    icon: Sparkles,
  },

  milestones: {
    label: 'Milestones',
    icon: Flag,
  },

  team: {
    label: 'Team',
    icon: Users,
  },

  cta: {
    label: 'Call to Action',
    icon: Megaphone,
  },
}

const inputClass =
  'w-full rounded-xl border border-[#DED1C8] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A6978F] focus:border-[#6B4228] focus:ring-2 focus:ring-[#6B4228]/10'

export default function AdminAboutPage() {
  const [
    formData,
    setFormData,
  ] = useState(() =>
    normalizeAboutData({})
  )

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [
    uploadingKey,
    setUploadingKey,
  ] = useState('')

  const [message, setMessage] =
    useState({
      type: '',
      text: '',
    })

  const messageTimerRef =
    useRef(null)

  const formBusy =
    saving ||
    Boolean(uploadingKey)

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const data =
          await aboutService.getAboutPage()

        setFormData(
          normalizeAboutData(
            data
          )
        )
      } catch (error) {
        console.error(
          'Error loading About page:',
          error
        )

        showMessage(
          'error',
          'Failed to load About page data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateField = (
    name,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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

    updateField(
      name,

      type === 'checkbox'
        ? checked
        : value
    )
  }

  const toggleSection = (
    section
  ) => {
    setFormData((prev) => ({
      ...prev,

      sectionVisibility: {
        ...prev.sectionVisibility,

        [section]:
          !prev
            .sectionVisibility[
          section
          ],
      },
    }))
  }

  const moveSection = (
    index,
    direction
  ) => {
    setFormData((prev) => {
      const order = [
        ...prev.sectionOrder,
      ]

      const target =
        direction === 'up'
          ? index - 1
          : index + 1

      if (
        target < 0 ||
        target >= order.length
      ) {
        return prev
      }

      ;[
        order[index],
        order[target],
      ] = [
          order[target],
          order[index],
        ]

      return {
        ...prev,
        sectionOrder: order,
      }
    })
  }

  const updateArrayItem = (
    field,
    index,
    patch
  ) => {
    setFormData((prev) => ({
      ...prev,

      [field]:
        prev[field].map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                ...item,
                ...patch,
              }
              : item
        ),
    }))
  }

  const removeArrayItem = (
    field,
    index
  ) => {
    setFormData((prev) => ({
      ...prev,

      [field]:
        prev[field].filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    }))
  }

  const moveArrayItem = (
    field,
    index,
    direction
  ) => {
    setFormData((prev) => {
      const items = [
        ...prev[field],
      ]

      const target =
        direction === 'up'
          ? index - 1
          : index + 1

      if (
        target < 0 ||
        target >= items.length
      ) {
        return prev
      }

      ;[
        items[index],
        items[target],
      ] = [
          items[target],
          items[index],
        ]

      return {
        ...prev,
        [field]: items,
      }
    })
  }

  const uploadFieldImage =
    async (field, file) => {
      if (!file) return

      const key = field

      try {
        setUploadingKey(key)

        const url =
          await aboutService.uploadImage(
            file
          )

        updateField(
          field,
          url
        )

        showMessage(
          'success',
          'About page image uploaded to XCDN.'
        )
      } catch (error) {
        console.error(
          'About image upload failed:',
          error
        )

        showMessage(
          'error',
          error?.message ||
          'Image upload failed.'
        )
      } finally {
        setUploadingKey('')
      }
    }

  const uploadTeamImage =
    async (index, file) => {
      if (!file) return

      const key =
        `team-${index}`

      try {
        setUploadingKey(key)

        const url =
          await aboutService.uploadImage(
            file
          )

        updateArrayItem(
          'team',
          index,
          {
            image: url,
          }
        )

        showMessage(
          'success',
          'Team image uploaded to XCDN.'
        )
      } catch (error) {
        console.error(
          'Team image upload failed:',
          error
        )

        showMessage(
          'error',
          'Team image upload failed.'
        )
      } finally {
        setUploadingKey('')
      }
    }

  const handleSave = async (
    event
  ) => {
    event.preventDefault()

    try {
      setSaving(true)

      const updated =
        await aboutService.updateAboutPage(
          formData
        )

      setFormData(
        normalizeAboutData(
          updated
        )
      )

      showMessage(
        'success',
        'About page updated successfully.'
      )
    } catch (error) {
      console.error(
        'About page save failed:',
        error
      )

      showMessage(
        'error',
        error?.message ||
        'Failed to save About page.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC]">
          <div className="text-center">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#6B4228]" />

            <p className="mt-3 text-sm font-medium text-[#7B685D]">
              Loading About page...
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <form
        onSubmit={handleSave}
        className="space-y-6"
      >
        {/* Header */}
        <section className="overflow-hidden rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.06)]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3A2117] text-white">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7A68]">
                  Storefront
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-[#281912] sm:text-3xl">
                  About Page
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B685D]">
                  Manage every major
                  customer-facing About
                  section, content,
                  imagery, ordering and
                  visibility.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={formBusy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>
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

        {/* Section ordering */}
        <FormSection
          eyebrow="Layout"
          title="Section Order & Visibility"
          description="Move sections up or down and hide sections that are not required."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {formData.sectionOrder.map(
              (
                section,
                index
              ) => {
                const meta =
                  SECTION_META[
                  section
                  ]

                const Icon =
                  meta?.icon ||
                  FileText

                const visible =
                  formData
                    .sectionVisibility[
                  section
                  ] !== false

                return (
                  <div
                    key={section}
                    className={`rounded-xl border p-4 ${visible
                        ? 'border-[#D8C9BF] bg-[#FAF7F4]'
                        : 'border-[#E5DDD7] bg-[#F7F4EF] opacity-65'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDE4DC] text-[#6B4228]">
                          <Icon className="h-4 w-4" />
                        </div>

                        <span className="text-sm font-semibold text-[#3A2117]">
                          {meta?.label}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          toggleSection(
                            section
                          )
                        }
                        className="text-[#6B4228]"
                      >
                        {visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="mt-4 flex gap-1">
                      <MoveButtons
                        index={index}
                        total={
                          formData
                            .sectionOrder
                            .length
                        }
                        onMove={(
                          direction
                        ) =>
                          moveSection(
                            index,
                            direction
                          )
                        }
                      />
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </FormSection>

        {/* Editors follow actual order */}
        {formData.sectionOrder.map(
          (section) => (
            <div key={section}>
              {section === 'hero' && (
                <FormSection
                  eyebrow="Hero"
                  title="Hero Section"
                  description="Control the main About page title, artwork and primary navigation."
                >
                  <ImageUploader
                    label="Hero Background Image"
                    value={
                      formData.heroImage
                    }
                    uploading={
                      uploadingKey ===
                      'heroImage'
                    }
                    onUpload={(file) =>
                      uploadFieldImage(
                        'heroImage',
                        file
                      )
                    }
                    onRemove={() =>
                      updateField(
                        'heroImage',
                        ''
                      )
                    }
                  />

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Hero Badge"
                      name="heroBadge"
                      value={
                        formData.heroBadge
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Image Alt Text"
                      name="heroImageAlt"
                      value={
                        formData.heroImageAlt
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <div className="sm:col-span-2">
                      <InputField
                        label="Page / Hero Title"
                        name="heroTitle"
                        value={
                          formData.heroTitle
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <FieldLabel>
                      Hero Description
                    </FieldLabel>

                    <RichTextEditor
                      value={
                        formData.heroDescription
                      }
                      onChange={(html) =>
                        updateField(
                          'heroDescription',
                          html
                        )
                      }
                      minHeight={130}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Primary Button"
                      name="heroPrimaryLabel"
                      value={
                        formData.heroPrimaryLabel
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Primary Link"
                      name="heroPrimaryLink"
                      value={
                        formData.heroPrimaryLink
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Secondary Button"
                      name="heroSecondaryLabel"
                      value={
                        formData.heroSecondaryLabel
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Secondary Link"
                      name="heroSecondaryLink"
                      value={
                        formData.heroSecondaryLink
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>
                </FormSection>
              )}

              {section === 'stats' && (
                <FormSection
                  eyebrow="Statistics"
                  title="Statistics / Counters"
                  description="Add, remove, reorder or hide individual statistics."
                >
                  <div className="space-y-3">
                    {formData.stats.map(
                      (
                        stat,
                        index
                      ) => (
                        <ArrayCard
                          key={
                            stat.id ||
                            index
                          }
                          index={index}
                          total={
                            formData
                              .stats
                              .length
                          }
                          active={
                            stat.isActive !==
                            false
                          }
                          onToggle={() =>
                            updateArrayItem(
                              'stats',
                              index,
                              {
                                isActive:
                                  stat.isActive ===
                                  false,
                              }
                            )
                          }
                          onMove={(
                            direction
                          ) =>
                            moveArrayItem(
                              'stats',
                              index,
                              direction
                            )
                          }
                          onDelete={() =>
                            removeArrayItem(
                              'stats',
                              index
                            )
                          }
                        >
                          <div className="grid gap-3 sm:grid-cols-3">
                            <InputField
                              label="Value"
                              value={
                                stat.value
                              }
                              onChange={(e) =>
                                updateArrayItem(
                                  'stats',
                                  index,
                                  {
                                    value:
                                      e
                                        .target
                                        .value,
                                  }
                                )
                              }
                            />

                            <InputField
                              label="Suffix"
                              value={
                                stat.suffix
                              }
                              onChange={(e) =>
                                updateArrayItem(
                                  'stats',
                                  index,
                                  {
                                    suffix:
                                      e
                                        .target
                                        .value,
                                  }
                                )
                              }
                            />

                            <InputField
                              label="Label"
                              value={
                                stat.label
                              }
                              onChange={(e) =>
                                updateArrayItem(
                                  'stats',
                                  index,
                                  {
                                    label:
                                      e
                                        .target
                                        .value,
                                  }
                                )
                              }
                            />
                          </div>
                        </ArrayCard>
                      )
                    )}
                  </div>

                  <AddButton
                    label="Add Statistic"
                    onClick={() =>
                      updateField(
                        'stats',
                        [
                          ...formData.stats,
                          {
                            id:
                              createAboutItemId(
                                'stat'
                              ),
                            value:
                              '100',
                            suffix:
                              '+',
                            label:
                              'Statistic',
                            isActive:
                              true,
                          },
                        ]
                      )
                    }
                  />
                </FormSection>
              )}

              {section === 'story' && (
                <FormSection
                  eyebrow="Story"
                  title="Company Story"
                  description="Manage the brand story and supporting image."
                >
                  <ImageUploader
                    label="Story Image"
                    value={
                      formData.storyImage
                    }
                    uploading={
                      uploadingKey ===
                      'storyImage'
                    }
                    onUpload={(file) =>
                      uploadFieldImage(
                        'storyImage',
                        file
                      )
                    }
                    onRemove={() =>
                      updateField(
                        'storyImage',
                        ''
                      )
                    }
                  />

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Section Label"
                      name="storyEyebrow"
                      value={
                        formData.storyEyebrow
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Image Alt Text"
                      name="storyImageAlt"
                      value={
                        formData.storyImageAlt
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <div className="sm:col-span-2">
                      <InputField
                        label="Story Title"
                        name="storyTitle"
                        value={
                          formData.storyTitle
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <FieldLabel>
                      Story Content
                    </FieldLabel>

                    <RichTextEditor
                      value={
                        formData.storyContent
                      }
                      onChange={(html) =>
                        updateField(
                          'storyContent',
                          html
                        )
                      }
                      minHeight={240}
                    />
                  </div>
                </FormSection>
              )}

              {section ===
                'mission' && (
                  <FormSection
                    eyebrow="Direction"
                    title="Mission & Vision"
                    description="Manage Lamp & Glow's mission, vision and supporting artwork."
                  >
                    <ImageUploader
                      label="Mission / Vision Image"
                      value={
                        formData.missionImage
                      }
                      uploading={
                        uploadingKey ===
                        'missionImage'
                      }
                      onUpload={(file) =>
                        uploadFieldImage(
                          'missionImage',
                          file
                        )
                      }
                      onRemove={() =>
                        updateField(
                          'missionImage',
                          ''
                        )
                      }
                    />

                    <div className="mt-5">
                      <InputField
                        label="Image Alt Text"
                        name="missionImageAlt"
                        value={
                          formData.missionImageAlt
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                      <div>
                        <InputField
                          label="Mission Title"
                          name="missionTitle"
                          value={
                            formData.missionTitle
                          }
                          onChange={
                            handleChange
                          }
                        />

                        <div className="mt-3">
                          <FieldLabel>
                            Mission Content
                          </FieldLabel>

                          <RichTextEditor
                            value={
                              formData.missionContent
                            }
                            onChange={(html) =>
                              updateField(
                                'missionContent',
                                html
                              )
                            }
                            minHeight={160}
                          />
                        </div>
                      </div>

                      <div>
                        <InputField
                          label="Vision Title"
                          name="visionTitle"
                          value={
                            formData.visionTitle
                          }
                          onChange={
                            handleChange
                          }
                        />

                        <div className="mt-3">
                          <FieldLabel>
                            Vision Content
                          </FieldLabel>

                          <RichTextEditor
                            value={
                              formData.visionContent
                            }
                            onChange={(html) =>
                              updateField(
                                'visionContent',
                                html
                              )
                            }
                            minHeight={160}
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>
                )}

              {section ===
                'values' && (
                  <FormSection
                    eyebrow="Values"
                    title="Core Values / Features"
                    description="Manage icons, titles, descriptions and ordering."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputField
                        label="Section Title"
                        name="valuesTitle"
                        value={
                          formData.valuesTitle
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <InputField
                        label="Section Subtitle"
                        name="valuesSubtitle"
                        value={
                          formData.valuesSubtitle
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="mt-5 space-y-3">
                      {formData.values.map(
                        (
                          value,
                          index
                        ) => (
                          <ArrayCard
                            key={
                              value.id ||
                              index
                            }
                            index={index}
                            total={
                              formData
                                .values
                                .length
                            }
                            active={
                              value.isActive !==
                              false
                            }
                            onToggle={() =>
                              updateArrayItem(
                                'values',
                                index,
                                {
                                  isActive:
                                    value.isActive ===
                                    false,
                                }
                              )
                            }
                            onMove={(
                              direction
                            ) =>
                              moveArrayItem(
                                'values',
                                index,
                                direction
                              )
                            }
                            onDelete={() =>
                              removeArrayItem(
                                'values',
                                index
                              )
                            }
                          >
                            <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
                              <InputField
                                label="Icon"
                                value={
                                  value.icon
                                }
                                onChange={(e) =>
                                  updateArrayItem(
                                    'values',
                                    index,
                                    {
                                      icon:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                              />

                              <InputField
                                label="Title"
                                value={
                                  value.title
                                }
                                onChange={(e) =>
                                  updateArrayItem(
                                    'values',
                                    index,
                                    {
                                      title:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                              />

                              <div className="sm:col-span-2">
                                <FieldLabel>
                                  Description
                                </FieldLabel>

                                <textarea
                                  rows={3}
                                  value={
                                    value.description
                                  }
                                  onChange={(e) =>
                                    updateArrayItem(
                                      'values',
                                      index,
                                      {
                                        description:
                                          e
                                            .target
                                            .value,
                                      }
                                    )
                                  }
                                  className={`${inputClass} resize-none`}
                                />
                              </div>
                            </div>
                          </ArrayCard>
                        )
                      )}
                    </div>

                    <AddButton
                      label="Add Value"
                      onClick={() =>
                        updateField(
                          'values',
                          [
                            ...formData.values,
                            {
                              id:
                                createAboutItemId(
                                  'value'
                                ),
                              icon:
                                '✨',
                              title:
                                'New Value',
                              description:
                                '',
                              isActive:
                                true,
                            },
                          ]
                        )
                      }
                    />
                  </FormSection>
                )}

              {section ===
                'milestones' && (
                  <FormSection
                    eyebrow="Journey"
                    title="Milestones"
                    description="Manage timeline items and their order."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InputField
                        label="Section Label"
                        name="milestonesEyebrow"
                        value={
                          formData.milestonesEyebrow
                        }
                        onChange={
                          handleChange
                        }
                      />

                      <InputField
                        label="Section Title"
                        name="milestonesTitle"
                        value={
                          formData.milestonesTitle
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="mt-5 space-y-3">
                      {formData.milestones.map(
                        (
                          milestone,
                          index
                        ) => (
                          <ArrayCard
                            key={
                              milestone.id ||
                              index
                            }
                            index={index}
                            total={
                              formData
                                .milestones
                                .length
                            }
                            active={
                              milestone.isActive !==
                              false
                            }
                            onToggle={() =>
                              updateArrayItem(
                                'milestones',
                                index,
                                {
                                  isActive:
                                    milestone.isActive ===
                                    false,
                                }
                              )
                            }
                            onMove={(
                              direction
                            ) =>
                              moveArrayItem(
                                'milestones',
                                index,
                                direction
                              )
                            }
                            onDelete={() =>
                              removeArrayItem(
                                'milestones',
                                index
                              )
                            }
                          >
                            <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                              <InputField
                                label="Year"
                                value={
                                  milestone.year
                                }
                                onChange={(e) =>
                                  updateArrayItem(
                                    'milestones',
                                    index,
                                    {
                                      year:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                              />

                              <InputField
                                label="Title"
                                value={
                                  milestone.title
                                }
                                onChange={(e) =>
                                  updateArrayItem(
                                    'milestones',
                                    index,
                                    {
                                      title:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                              />

                              <div className="sm:col-span-2">
                                <FieldLabel>
                                  Description
                                </FieldLabel>

                                <textarea
                                  rows={3}
                                  value={
                                    milestone.description
                                  }
                                  onChange={(e) =>
                                    updateArrayItem(
                                      'milestones',
                                      index,
                                      {
                                        description:
                                          e
                                            .target
                                            .value,
                                      }
                                    )
                                  }
                                  className={`${inputClass} resize-none`}
                                />
                              </div>
                            </div>
                          </ArrayCard>
                        )
                      )}
                    </div>

                    <AddButton
                      label="Add Milestone"
                      onClick={() =>
                        updateField(
                          'milestones',
                          [
                            ...formData.milestones,
                            {
                              id:
                                createAboutItemId(
                                  'milestone'
                                ),
                              year:
                                new Date()
                                  .getFullYear()
                                  .toString(),
                              title:
                                'New Milestone',
                              description:
                                '',
                              isActive:
                                true,
                            },
                          ]
                        )
                      }
                    />
                  </FormSection>
                )}

              {section === 'team' && (
                <FormSection
                  eyebrow="People"
                  title="Team Members"
                  description="Add, edit, remove, hide or reorder team members."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Section Title"
                      name="teamTitle"
                      value={
                        formData.teamTitle
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Section Subtitle"
                      name="teamSubtitle"
                      value={
                        formData.teamSubtitle
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>

                  <div className="mt-5 space-y-4">
                    {formData.team.map(
                      (
                        member,
                        index
                      ) => (
                        <ArrayCard
                          key={
                            member.id ||
                            index
                          }
                          index={index}
                          total={
                            formData.team
                              .length
                          }
                          active={
                            member.isActive !==
                            false
                          }
                          onToggle={() =>
                            updateArrayItem(
                              'team',
                              index,
                              {
                                isActive:
                                  member.isActive ===
                                  false,
                              }
                            )
                          }
                          onMove={(
                            direction
                          ) =>
                            moveArrayItem(
                              'team',
                              index,
                              direction
                            )
                          }
                          onDelete={() =>
                            removeArrayItem(
                              'team',
                              index
                            )
                          }
                        >
                          <ImageUploader
                            compact
                            label="Team Image"
                            value={
                              member.image
                            }
                            uploading={
                              uploadingKey ===
                              `team-${index}`
                            }
                            onUpload={(file) =>
                              uploadTeamImage(
                                index,
                                file
                              )
                            }
                            onRemove={() =>
                              updateArrayItem(
                                'team',
                                index,
                                {
                                  image: '',
                                }
                              )
                            }
                          />

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <InputField
                              label="Name"
                              value={
                                member.name
                              }
                              onChange={(e) =>
                                updateArrayItem(
                                  'team',
                                  index,
                                  {
                                    name:
                                      e
                                        .target
                                        .value,
                                  }
                                )
                              }
                            />

                            <InputField
                              label="Role"
                              value={
                                member.role
                              }
                              onChange={(e) =>
                                updateArrayItem(
                                  'team',
                                  index,
                                  {
                                    role:
                                      e
                                        .target
                                        .value,
                                  }
                                )
                              }
                            />

                            <div className="sm:col-span-2">
                              <InputField
                                label="Image Alt Text"
                                value={
                                  member.imageAlt ||
                                  ''
                                }
                                onChange={(e) =>
                                  updateArrayItem(
                                    'team',
                                    index,
                                    {
                                      imageAlt:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <FieldLabel>
                                Bio
                              </FieldLabel>

                              <textarea
                                rows={3}
                                value={
                                  member.bio
                                }
                                onChange={(e) =>
                                  updateArrayItem(
                                    'team',
                                    index,
                                    {
                                      bio:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                className={`${inputClass} resize-none`}
                              />
                            </div>
                          </div>
                        </ArrayCard>
                      )
                    )}
                  </div>

                  <AddButton
                    label="Add Team Member"
                    onClick={() =>
                      updateField(
                        'team',
                        [
                          ...formData.team,
                          {
                            id:
                              createAboutItemId(
                                'team'
                              ),
                            name:
                              'New Team Member',
                            role: '',
                            bio: '',
                            image: '',
                            imageAlt:
                              '',
                            isActive:
                              true,
                          },
                        ]
                      )
                    }
                  />
                </FormSection>
              )}

              {section === 'cta' && (
                <FormSection
                  eyebrow="Conversion"
                  title="Call to Action"
                  description="Control the final About page message and navigation buttons."
                >
                  <InputField
                    label="CTA Title"
                    name="ctaTitle"
                    value={
                      formData.ctaTitle
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <div className="mt-4">
                    <FieldLabel>
                      CTA Description
                    </FieldLabel>

                    <RichTextEditor
                      value={
                        formData.ctaDescription
                      }
                      onChange={(html) =>
                        updateField(
                          'ctaDescription',
                          html
                        )
                      }
                      minHeight={120}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Primary Button"
                      name="ctaPrimaryLabel"
                      value={
                        formData.ctaPrimaryLabel
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Primary Link"
                      name="ctaPrimaryLink"
                      value={
                        formData.ctaPrimaryLink
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Secondary Button"
                      name="ctaSecondaryLabel"
                      value={
                        formData.ctaSecondaryLabel
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Secondary Link"
                      name="ctaSecondaryLink"
                      value={
                        formData.ctaSecondaryLink
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>
                </FormSection>
              )}
            </div>
          )
        )}

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-30 rounded-2xl border border-[#DCCFC6] bg-[#FFFEFC]/95 p-4 shadow-[0_18px_50px_rgba(58,33,23,0.16)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[#8A7467]">
              Changes become available
              to the frontend after
              saving.
            </p>

            <button
              type="submit"
              disabled={formBusy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving
                ? 'Saving...'
                : uploadingKey
                  ? 'Uploading Image...'
                  : 'Save All Changes'}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-[#E7DCD4] bg-[#FFFEFC] p-5 shadow-[0_8px_24px_rgba(58,33,23,0.04)] sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9A7A68]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-lg font-semibold text-[#281912]">
          {title}
        </h2>

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

function InputField({
  label,
  ...props
}) {
  return (
    <div>
      {label && (
        <FieldLabel>
          {label}
        </FieldLabel>
      )}

      <input
        {...props}
        type={
          props.type ||
          'text'
        }
        className={
          inputClass
        }
      />
    </div>
  )
}

function MoveButtons({
  index,
  total,
  onMove,
}) {
  return (
    <>
      <button
        type="button"
        onClick={() =>
          onMove('up')
        }
        disabled={index === 0}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DED1C8] bg-white text-[#6B4228] disabled:opacity-30"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() =>
          onMove('down')
        }
        disabled={
          index === total - 1
        }
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DED1C8] bg-white text-[#6B4228] disabled:opacity-30"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </>
  )
}

function ArrayCard({
  index,
  total,
  active,
  onToggle,
  onMove,
  onDelete,
  children,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${active
          ? 'border-[#E3D7CF] bg-[#FAF7F4]'
          : 'border-[#E6DDD7] bg-[#F7F4EF] opacity-65'
        }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#9A7A68]">
          Item {index + 1}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B4228] hover:bg-white"
          >
            {active ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>

          <MoveButtons
            index={index}
            total={total}
            onMove={onMove}
          />

          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#954B42] hover:bg-[#FFF2EF]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}

function AddButton({
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-4 py-2.5 text-sm font-semibold text-[#6B4228] transition hover:border-[#6B4228] hover:bg-[#F7F4EF]"
    >
      <Plus className="h-4 w-4" />

      {label}
    </button>
  )
}

function ImageUploader({
  label,
  value,
  uploading,
  onUpload,
  onRemove,
  compact = false,
}) {
  const inputRef =
    useRef(null)

  return (
    <div>
      <FieldLabel>
        {label}
      </FieldLabel>

      <div className="overflow-hidden rounded-xl border border-dashed border-[#D7C7BC] bg-[#FAF7F4]">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt={`${label} preview`}
              className={`w-full object-cover ${compact
                  ? 'h-44'
                  : 'h-60 sm:h-72'
                }`}
            />

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-[#281912]/80 to-transparent p-4 pt-12">
              <button
                type="button"
                onClick={() =>
                  inputRef.current?.click()
                }
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#3A2117]"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}

                Replace
              </button>

              <button
                type="button"
                onClick={onRemove}
                disabled={uploading}
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
              inputRef.current?.click()
            }
            disabled={uploading}
            className={`flex w-full flex-col items-center justify-center p-6 text-center transition hover:bg-[#F5EFEA] disabled:opacity-60 ${compact
                ? 'min-h-[130px]'
                : 'min-h-[190px]'
              }`}
          >
            {uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-[#6B4228]" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE4DC] text-[#6B4228]">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}

            <p className="mt-3 text-sm font-semibold text-[#4E3D34]">
              {uploading
                ? 'Uploading to XCDN...'
                : `Upload ${label}`}
            </p>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file =
              event.target
                .files?.[0]

            if (file) {
              onUpload(file)
            }

            event.target.value =
              ''
          }}
          className="hidden"
        />
      </div>
    </div>
  )
}