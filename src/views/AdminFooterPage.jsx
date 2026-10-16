'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Globe2,
  LayoutTemplate,
  Link2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import footerService from '../utils/footerService.js'

const LINK_SECTIONS = [
  { value: 'quickLinks', label: 'Quick Links' },
  { value: 'collections', label: 'Collections' },
  { value: 'policies', label: 'Policies' },
  { value: 'other', label: 'Other' },
]

const SECTION_ORDER = {
  quickLinks: 0,
  collections: 1,
  policies: 2,
  other: 3,
}

const INITIAL_CONFIG = {
  phone: '',
  email: '',
  whatsapp: '',
  showWhatsAppInFooter: true,
  address: '',
  city: '',
}

const INITIAL_LINK_FORM = {
  label: '',
  url: '',
  section: 'quickLinks',
  displayOrder: 0,
  isActive: true,
}

const inputClass =
  'w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A49388] focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.06]'

const labelClass =
  'mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4C3A31]'

function clean(value) {
  return String(value ?? '').trim()
}

function getSectionLabel(value) {
  return (
    LINK_SECTIONS.find((section) => section.value === value)?.label ||
    value ||
    'Other'
  )
}

function normalizeLinkUrl(value) {
  const url = clean(value)

  if (!url) return ''

  if (
    url.startsWith('/') ||
    url.startsWith('#') ||
    /^https?:\/\//i.test(url) ||
    /^mailto:/i.test(url) ||
    /^tel:/i.test(url)
  ) {
    return url
  }

  return `https://${url}`
}

function isValidLinkUrl(value) {
  if (!value || value === '#') return false

  if (value.startsWith('/')) return true
  if (value.startsWith('#') && value.length > 1) return true
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) return true
  if (/^tel:\+?[0-9()\-\s]+$/i.test(value)) return true

  try {
    const parsed = new URL(value)

    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function isExternalUrl(value = '') {
  return /^https?:\/\//i.test(value)
}

export default function AdminFooterPage() {
  const [config, setConfig] = useState(INITIAL_CONFIG)
  const [links, setLinks] = useState([])

  const [loading, setLoading] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const [configDirty, setConfigDirty] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')

  const [showLinkForm, setShowLinkForm] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState(null)
  const [linkFormData, setLinkFormData] = useState(INITIAL_LINK_FORM)

  const [savingLink, setSavingLink] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const [message, setMessage] = useState({
    type: '',
    text: '',
  })

  useEffect(() => {
    let active = true

    const loadFooterData = async () => {
      try {
        setLoading(true)

        const [configData, linksData] = await Promise.all([
          footerService.getFooterConfig(),
          footerService.getAllFooterLinks(),
        ])

        if (!active) return

        if (configData) {
          setConfig({
            phone: configData.phone || '',
            email: configData.email || '',
            whatsapp: configData.whatsapp || '',
            showWhatsAppInFooter:
              configData.showWhatsAppInFooter !== false,
            address: configData.address || '',
            city: configData.city || '',
          })
        } else {
          setConfig(INITIAL_CONFIG)
        }

        setLinks(Array.isArray(linksData) ? linksData : [])
        setConfigDirty(false)
      } catch (error) {
        console.error('Error loading footer data:', error)

        if (active) {
          setMessage({
            type: 'error',
            text: 'Failed to load footer data from Firebase.',
          })
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadFooterData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!showLinkForm) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !savingLink) {
        closeLinkModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showLinkForm, savingLink])

  const flashMessage = (type, text) => {
    setMessage({ type, text })

    window.setTimeout(() => {
      setMessage({
        type: '',
        text: '',
      })
    }, 3500)
  }

  const updateConfig = (name, value) => {
    setConfig((previous) => ({
      ...previous,
      [name]: value,
    }))

    setConfigDirty(true)

    if (message.text) {
      setMessage({
        type: '',
        text: '',
      })
    }
  }

  const handleSaveConfig = async () => {
    const email = clean(config.email)

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid footer email address.',
      })
      return
    }

    const payload = {
      phone: clean(config.phone),
      email,
      whatsapp: clean(config.whatsapp),
      showWhatsAppInFooter: config.showWhatsAppInFooter === true,
      address: clean(config.address),
      city: clean(config.city),
    }

    try {
      setSavingConfig(true)

      const saved = await footerService.saveFooterConfig(payload)

      setConfig({
        phone: saved.phone || '',
        email: saved.email || '',
        whatsapp: saved.whatsapp || '',
        showWhatsAppInFooter: saved.showWhatsAppInFooter !== false,
        address: saved.address || '',
        city: saved.city || '',
      })

      setConfigDirty(false)

      flashMessage(
        'success',
        'Footer contact information saved successfully.'
      )
    } catch (error) {
      console.error('Error saving footer config:', error)

      setMessage({
        type: 'error',
        text: 'Failed to save footer contact information.',
      })
    } finally {
      setSavingConfig(false)
    }
  }

  const sortedLinks = useMemo(() => {
    return [...links].sort((a, b) => {
      const sectionA = SECTION_ORDER[a.section] ?? 99
      const sectionB = SECTION_ORDER[b.section] ?? 99

      if (sectionA !== sectionB) {
        return sectionA - sectionB
      }

      const orderA = Number(a.displayOrder) || 0
      const orderB = Number(b.displayOrder) || 0

      if (orderA !== orderB) {
        return orderA - orderB
      }

      return String(a.label || '').localeCompare(String(b.label || ''))
    })
  }, [links])

  const filteredLinks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return sortedLinks

    return sortedLinks.filter((link) => {
      const sectionLabel = getSectionLabel(link.section).toLowerCase()

      return (
        String(link.label || '').toLowerCase().includes(query) ||
        String(link.url || '').toLowerCase().includes(query) ||
        sectionLabel.includes(query)
      )
    })
  }, [sortedLinks, searchQuery])

  const activeLinks = useMemo(
    () => sortedLinks.filter((link) => link.isActive !== false),
    [sortedLinks]
  )

  const groupedActiveLinks = useMemo(() => {
    return activeLinks.reduce((groups, link) => {
      const section = link.section || 'other'

      if (!groups[section]) {
        groups[section] = []
      }

      groups[section].push(link)

      return groups
    }, {})
  }, [activeLinks])

  const activeSectionCount = useMemo(() => {
    return Object.values(groupedActiveLinks).filter(
      (sectionLinks) => sectionLinks.length > 0
    ).length
  }, [groupedActiveLinks])

  const getNextDisplayOrder = (section = 'quickLinks') => {
    const sectionLinks = links.filter(
      (link) => (link.section || 'other') === section
    )

    if (!sectionLinks.length) return 0

    return (
      Math.max(
        ...sectionLinks.map((link) => Number(link.displayOrder) || 0)
      ) + 1
    )
  }

  const openCreateLink = () => {
    setEditingLinkId(null)

    setLinkFormData({
      ...INITIAL_LINK_FORM,
      displayOrder: getNextDisplayOrder('quickLinks'),
    })

    setShowLinkForm(true)
  }

  const openEditLink = (link) => {
    setEditingLinkId(link.id)

    setLinkFormData({
      label: link.label || '',
      url: link.url || '',
      section: link.section || 'quickLinks',
      displayOrder: link.displayOrder ?? 0,
      isActive: link.isActive !== false,
    })

    setShowLinkForm(true)
  }

  const closeLinkModal = () => {
    if (savingLink) return

    setShowLinkForm(false)
    setEditingLinkId(null)
    setLinkFormData(INITIAL_LINK_FORM)
  }

  const updateLinkField = (name, value) => {
    setLinkFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleLinkSubmit = async (event) => {
    event.preventDefault()

    const label = clean(linkFormData.label)
    const url = normalizeLinkUrl(linkFormData.url)

    if (!label) {
      setMessage({
        type: 'error',
        text: 'Footer link label is required.',
      })
      return
    }

    if (!url) {
      setMessage({
        type: 'error',
        text: 'Footer link URL is required.',
      })
      return
    }

    if (!isValidLinkUrl(url)) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid internal or external URL. Bare # links are not allowed.',
      })
      return
    }

    const parsedOrder = Number.parseInt(linkFormData.displayOrder, 10)

    const payload = {
      label,
      url,
      section: linkFormData.section || 'quickLinks',
      displayOrder: Number.isFinite(parsedOrder)
        ? Math.max(0, parsedOrder)
        : 0,
      isActive: linkFormData.isActive === true,
    }

    try {
      setSavingLink(true)

      if (editingLinkId) {
        const updated = await footerService.updateFooterLink(
          editingLinkId,
          payload
        )

        setLinks((previous) =>
          previous.map((link) =>
            link.id === editingLinkId
              ? {
                ...link,
                ...updated,
              }
              : link
          )
        )

        flashMessage('success', 'Footer link updated successfully.')
      } else {
        const created = await footerService.createFooterLink(payload)

        setLinks((previous) => [...previous, created])

        flashMessage('success', 'Footer link added successfully.')
      }

      setShowLinkForm(false)
      setEditingLinkId(null)
      setLinkFormData(INITIAL_LINK_FORM)
    } catch (error) {
      console.error('Error saving footer link:', error)

      setMessage({
        type: 'error',
        text: 'Failed to save footer link. Please try again.',
      })
    } finally {
      setSavingLink(false)
    }
  }

  const handleToggleLinkActive = async (link) => {
    const currentlyActive = link.isActive !== false
    const nextActive = !currentlyActive

    try {
      setTogglingId(link.id)

      await footerService.updateFooterLink(link.id, {
        isActive: nextActive,
      })

      setLinks((previous) =>
        previous.map((item) =>
          item.id === link.id
            ? {
              ...item,
              isActive: nextActive,
            }
            : item
        )
      )

      flashMessage(
        'success',
        nextActive
          ? 'Footer link activated.'
          : 'Footer link deactivated.'
      )
    } catch (error) {
      console.error('Error toggling footer link:', error)

      flashMessage('error', 'Failed to update footer link status.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteLink = async (link) => {
    const confirmed = window.confirm(
      `Delete "${link.label || 'this footer link'}"?`
    )

    if (!confirmed) return

    try {
      setDeletingId(link.id)

      await footerService.deleteFooterLink(link.id)

      setLinks((previous) =>
        previous.filter((item) => item.id !== link.id)
      )

      flashMessage('success', 'Footer link deleted successfully.')
    } catch (error) {
      console.error('Error deleting footer link:', error)

      flashMessage('error', 'Failed to delete footer link.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#6B4228]" />

            <p className="mt-3 text-sm text-[#806C60]">
              Loading footer settings...
            </p>
          </div>
        </div>
      </AdminLayout>
    )
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
                  <LayoutTemplate className="h-6 w-6 text-[#F7F4EF]" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D6BBA9]">
                    Store Settings
                  </p>

                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                    Footer
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                    Manage storefront contact details, WhatsApp visibility
                    and organized footer navigation from one place.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openCreateLink}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#FFFEFC] px-5 text-sm font-semibold text-[#3A2117] transition hover:bg-[#F7F4EF]"
              >
                <Plus className="h-4 w-4" />
                Add Footer Link
              </button>
            </div>
          </div>
        </section>

        {/* Alert */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ${message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <span>{message.text}</span>
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
              Footer Links
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#281912]">
              {links.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
              Active Links
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#281912]">
              {activeLinks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
              Active Sections
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#281912]">
              {activeSectionCount}
            </p>
          </div>
        </section>

        {/* Contact Configuration */}
        <section className="overflow-hidden rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
          <div className="border-b border-[#ECE2DB] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                <Globe2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#281912]">
                  Contact Information
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#806C60]">
                  Information saved here is used by the public footer and
                  WhatsApp support experience.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  Phone Number
                </span>
              </label>

              <input
                type="text"
                value={config.phone}
                onChange={(event) =>
                  updateConfig('phone', event.target.value)
                }
                placeholder="03134371467"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Email Address
                </span>
              </label>

              <input
                type="email"
                value={config.email}
                onChange={(event) =>
                  updateConfig('email', event.target.value)
                }
                placeholder="contact@lampandglow.pk"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp Number
                </span>
              </label>

              <input
                type="text"
                value={config.whatsapp}
                onChange={(event) =>
                  updateConfig('whatsapp', event.target.value)
                }
                placeholder="923134371467"
                className={inputClass}
              />

              <p className="mt-2 text-[11px] leading-5 text-[#8A7569]">
                International format without spaces is recommended.
              </p>
            </div>

            <div>
              <label className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  City / Location
                </span>
              </label>

              <input
                type="text"
                value={config.city}
                onChange={(event) =>
                  updateConfig('city', event.target.value)
                }
                placeholder="Sahiwal, Punjab"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Full Address
                </span>
              </label>

              <textarea
                rows={4}
                value={config.address}
                onChange={(event) =>
                  updateConfig('address', event.target.value)
                }
                placeholder="Enter the complete business address shown in the footer."
                className={`${inputClass} resize-y`}
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                role="switch"
                aria-checked={config.showWhatsAppInFooter}
                onClick={() =>
                  updateConfig(
                    'showWhatsAppInFooter',
                    !config.showWhatsAppInFooter
                  )
                }
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${config.showWhatsAppInFooter
                    ? 'border-[#6B4228]/25 bg-[#F2EAE4]'
                    : 'border-[#DDD1C8] bg-[#F7F4EF]'
                  }`}
              >
                <div>
                  <p className="text-sm font-semibold text-[#281912]">
                    {config.showWhatsAppInFooter
                      ? 'WhatsApp number visible'
                      : 'WhatsApp number hidden'}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#806C60]">
                    This controls the WhatsApp number displayed inside the
                    footer contact section. The existing floating support
                    button remains independent.
                  </p>
                </div>

                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${config.showWhatsAppInFooter
                      ? 'bg-[#3A2117]'
                      : 'bg-[#C9BDB5]'
                    }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${config.showWhatsAppInFooter ? 'left-6' : 'left-1'
                      }`}
                  />
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E8DDD5] bg-[#F7F4EF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[11px] leading-5 text-[#806C60]">
              {configDirty
                ? 'You have unsaved contact changes.'
                : 'Footer contact information is saved.'}
            </p>

            <button
              type="button"
              disabled={savingConfig || !configDirty}
              onClick={handleSaveConfig}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-5 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingConfig ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {savingConfig ? 'Saving...' : 'Save Contact Info'}
            </button>
          </div>
        </section>

        {/* Footer Links */}
        <section className="overflow-hidden rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
          <div className="border-b border-[#ECE2DB] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                  <Link2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-[#281912]">
                    Footer Links
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-[#806C60]">
                    Manage Quick Links, Collections, Policies and additional
                    navigation displayed publicly.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openCreateLink}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-4 text-sm font-semibold text-white transition hover:bg-[#281912]"
              >
                <Plus className="h-4 w-4" />
                Add Link
              </button>
            </div>

            <div className="relative mt-5">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A8171]" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search label, URL or section..."
                className="w-full rounded-xl border border-[#DCCFC6] bg-[#F7F4EF] py-3 pl-10 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#A49388] focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.06]"
              />
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center p-6 text-center">
              <div>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F2EAE4] text-[#6B4228]">
                  <Link2 className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#281912]">
                  No footer links found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#806C60]">
                  {searchQuery
                    ? 'Try a different search term.'
                    : 'Add your first footer link to start building the storefront navigation.'}
                </p>

                {!searchQuery && (
                  <button
                    type="button"
                    onClick={openCreateLink}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3A2117] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#281912]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Footer Link
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="divide-y divide-[#EEE4DD] md:hidden">
                {filteredLinks.map((link) => {
                  const active = link.isActive !== false

                  return (
                    <article key={link.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#281912]">
                            {link.label}
                          </p>

                          <p className="mt-1 text-xs font-medium text-[#6B4228]">
                            {getSectionLabel(link.section)}
                          </p>

                          <p className="mt-2 break-all text-xs leading-5 text-[#806C60]">
                            {link.url}
                          </p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={active}
                          disabled={togglingId === link.id}
                          onClick={() => handleToggleLinkActive(link)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${active ? 'bg-[#3A2117]' : 'bg-[#C9BDB5]'
                            }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${active ? 'left-6' : 'left-1'
                              }`}
                          />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[#EEE4DD] pt-4">
                        <span className="text-xs text-[#806C60]">
                          Order:{' '}
                          <strong className="text-[#281912]">
                            {link.displayOrder ?? 0}
                          </strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditLink(link)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-[#E3D7CE] text-[#6B4228] transition hover:bg-[#F7F4EF]"
                            aria-label={`Edit ${link.label}`}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === link.id}
                            onClick={() => handleDeleteLink(link)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                            aria-label={`Delete ${link.label}`}
                          >
                            {deletingId === link.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[880px]">
                  <thead>
                    <tr className="border-b border-[#E8DDD5] bg-[#F7F4EF]">
                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#806C60]">
                        Label
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#806C60]">
                        URL
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#806C60]">
                        Section
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
                    {filteredLinks.map((link) => {
                      const active = link.isActive !== false

                      return (
                        <tr
                          key={link.id}
                          className="transition hover:bg-[#F7F4EF]/60"
                        >
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-[#281912]">
                              {link.label}
                            </span>
                          </td>

                          <td className="max-w-[300px] px-6 py-4">
                            <a
                              href={link.url}
                              target={
                                isExternalUrl(link.url) ? '_blank' : undefined
                              }
                              rel={
                                isExternalUrl(link.url)
                                  ? 'noopener noreferrer'
                                  : undefined
                              }
                              className="flex items-center gap-2 text-sm text-[#6B4228] transition hover:text-[#281912] hover:underline"
                            >
                              <span className="truncate">{link.url}</span>

                              {isExternalUrl(link.url) && (
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              )}
                            </a>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-lg bg-[#F2EAE4] px-3 py-1 text-xs font-semibold text-[#6B4228]">
                              {getSectionLabel(link.section)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex min-w-[38px] justify-center rounded-lg bg-[#F7F4EF] px-2.5 py-1 text-xs font-semibold text-[#4C3A31]">
                              {link.displayOrder ?? 0}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={active}
                              disabled={togglingId === link.id}
                              onClick={() => handleToggleLinkActive(link)}
                              className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${active ? 'bg-[#3A2117]' : 'bg-[#C9BDB5]'
                                }`}
                            >
                              <span
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${active ? 'left-6' : 'left-1'
                                  }`}
                              />
                            </button>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditLink(link)}
                                className="grid h-9 w-9 place-items-center rounded-lg border border-[#E3D7CE] text-[#6B4228] transition hover:bg-[#F7F4EF]"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                disabled={deletingId === link.id}
                                onClick={() => handleDeleteLink(link)}
                                className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId === link.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Active Link Preview */}
        <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] p-5 shadow-[0_12px_35px_rgba(58,33,23,0.05)] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A8171]">
            Storefront Preview
          </p>

          <h2 className="mt-1 text-base font-semibold text-[#281912]">
            Active Footer Navigation
          </h2>

          <p className="mt-1 text-xs leading-5 text-[#806C60]">
            Disabled links are intentionally excluded from this preview.
          </p>

          {activeLinks.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {LINK_SECTIONS.map((section) => {
                const sectionLinks =
                  groupedActiveLinks[section.value] || []

                if (!sectionLinks.length) return null

                return (
                  <div
                    key={section.value}
                    className="rounded-2xl border border-[#E7DDD5] bg-[#F7F4EF] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6B4228]">
                      {section.label}
                    </p>

                    <div className="mt-3 space-y-2">
                      {sectionLinks.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-start gap-2 text-sm text-[#4C3A31]"
                        >
                          <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#6B4228]" />
                          <span className="break-words">{link.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#DCCFC6] bg-[#F7F4EF] p-5 text-sm text-[#806C60]">
              No active footer navigation links are currently configured.
            </div>
          )}
        </section>
      </div>

      {/* Add / Edit Footer Link Modal */}
      {showLinkForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Close footer link form"
            onClick={closeLinkModal}
            className="absolute inset-0 bg-[#281912]/65 backdrop-blur-[2px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-link-modal-title"
            className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#FFFEFC] shadow-[0_30px_100px_rgba(40,25,18,0.35)]"
          >
            {/* Fixed Header */}
            <div className="shrink-0 border-b border-[#E8DDD5] bg-[#3A2117] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D6BBA9]">
                    Footer Navigation
                  </p>

                  <h2
                    id="footer-link-modal-title"
                    className="mt-1 text-xl font-semibold text-white"
                  >
                    {editingLinkId ? 'Edit Footer Link' : 'Add Footer Link'}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-white/60">
                    Configure the label, destination, section, display order
                    and storefront visibility.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeLinkModal}
                  disabled={savingLink}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-white/75 transition hover:bg-white/[0.12] hover:text-white disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleLinkSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* Scrollable Content */}
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-[#F7F4EF] p-5 sm:p-6">
                <div>
                  <label htmlFor="footer-link-label" className={labelClass}>
                    Link Label *
                  </label>

                  <input
                    id="footer-link-label"
                    type="text"
                    value={linkFormData.label}
                    onChange={(event) =>
                      updateLinkField('label', event.target.value)
                    }
                    placeholder="e.g. Privacy Policy"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="footer-link-url" className={labelClass}>
                    Destination URL *
                  </label>

                  <input
                    id="footer-link-url"
                    type="text"
                    value={linkFormData.url}
                    onChange={(event) =>
                      updateLinkField('url', event.target.value)
                    }
                    placeholder="/privacy-policy or https://example.com"
                    className={inputClass}
                  />

                  <p className="mt-2 text-[11px] leading-5 text-[#8A7569]">
                    Internal paths should start with /. External links may be
                    entered with or without https://. Bare # placeholder links
                    are blocked.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="footer-link-section"
                      className={labelClass}
                    >
                      Section *
                    </label>

                    <select
                      id="footer-link-section"
                      value={linkFormData.section}
                      onChange={(event) =>
                        updateLinkField('section', event.target.value)
                      }
                      className={inputClass}
                    >
                      {LINK_SECTIONS.map((section) => (
                        <option key={section.value} value={section.value}>
                          {section.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="footer-link-order"
                      className={labelClass}
                    >
                      Display Order
                    </label>

                    <input
                      id="footer-link-order"
                      type="number"
                      min="0"
                      step="1"
                      value={linkFormData.displayOrder}
                      onChange={(event) =>
                        updateLinkField('displayOrder', event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <p className={labelClass}>Visibility</p>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={linkFormData.isActive}
                    onClick={() =>
                      updateLinkField('isActive', !linkFormData.isActive)
                    }
                    className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${linkFormData.isActive
                        ? 'border-[#6B4228]/25 bg-[#F2EAE4]'
                        : 'border-[#DDD1C8] bg-[#FFFEFC]'
                      }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#281912]">
                        {linkFormData.isActive
                          ? 'Visible on storefront'
                          : 'Hidden from storefront'}
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#806C60]">
                        {linkFormData.isActive
                          ? 'Customers can see and use this footer link.'
                          : 'The link remains saved in Admin but is hidden publicly.'}
                      </p>
                    </div>

                    <span
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${linkFormData.isActive
                          ? 'bg-[#3A2117]'
                          : 'bg-[#C9BDB5]'
                        }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${linkFormData.isActive ? 'left-6' : 'left-1'
                          }`}
                      />
                    </span>
                  </button>
                </div>

                <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9A8171]">
                    Preview
                  </p>

                  <div className="mt-3 flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#3A2117] text-white">
                      <Link2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#281912]">
                        {linkFormData.label || 'Footer Link'}
                      </p>

                      <p className="mt-1 text-xs font-medium text-[#6B4228]">
                        {getSectionLabel(linkFormData.section)}
                      </p>

                      <p className="mt-1 break-all text-xs leading-5 text-[#806C60]">
                        {linkFormData.url || 'Destination URL'}
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
                    onClick={closeLinkModal}
                    disabled={savingLink}
                    className="min-h-[46px] rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-5 text-sm font-semibold text-[#4C3A31] transition hover:bg-[#F7F4EF] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingLink}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingLink && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    {savingLink
                      ? 'Saving...'
                      : editingLinkId
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