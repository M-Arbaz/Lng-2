'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  Truck,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import shippingService from '../utils/shippingService.js'

const inputClass =
  'w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A49388] focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.06]'

const labelClass =
  'mb-2 block text-[11px] font-semibold text-[#4C3A31]'

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function createMethodForm() {
  return {
    name: '',
    enabled: true,
    rateType: 'city',
    flatFee: '',
    deliveryEstimate: '',
    description: '',
    policy: '',
  }
}

function formatMoney(value) {
  const number =
    Number(value)

  if (
    !Number.isFinite(number)
  ) {
    return '0'
  }

  return number.toLocaleString(
    'en-PK',
    {
      maximumFractionDigits: 0,
    }
  )
}

export default function AdminShippingPage() {
  const [
    cities,
    setCities,
  ] = useState([])

  const [
    methods,
    setMethods,
  ] = useState([])

  const [
    freeShippingEnabled,
    setFreeShippingEnabled,
  ] = useState(true)

  const [
    freeShippingThreshold,
    setFreeShippingThreshold,
  ] = useState('15000')

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    dirty,
    setDirty,
  ] = useState(false)

  const [
    message,
    setMessage,
  ] = useState({
    type: '',
    text: '',
  })

  const [
    newCityName,
    setNewCityName,
  ] = useState('')

  const [
    newCityFee,
    setNewCityFee,
  ] = useState('')

  const [
    methodModalOpen,
    setMethodModalOpen,
  ] = useState(false)

  const [
    editingMethodId,
    setEditingMethodId,
  ] = useState(null)

  const [
    methodForm,
    setMethodForm,
  ] = useState(
    createMethodForm
  )

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
        4000
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

  useEffect(() => {
    const loadSettings =
      async () => {
        try {
          setLoading(true)

          const data =
            await shippingService.getShippingSettings()

          setCities(
            Array.isArray(
              data.cities
            )
              ? data.cities
              : []
          )

          setMethods(
            Array.isArray(
              data.methods
            )
              ? data.methods
              : []
          )

          setFreeShippingEnabled(
            data.freeShippingEnabled !==
            false
          )

          setFreeShippingThreshold(
            String(
              data.freeShippingThreshold ??
              15000
            )
          )

          setDirty(false)
        } catch (error) {
          console.error(
            'Shipping settings load failed:',
            error
          )

          showMessage(
            'error',
            'Failed to load shipping settings.'
          )
        } finally {
          setLoading(false)
        }
      }

    loadSettings()
  }, [])

  const closeMethodModal =
    () => {
      setMethodModalOpen(
        false
      )

      setEditingMethodId(
        null
      )

      setMethodForm(
        createMethodForm()
      )
    }

  useEffect(() => {
    if (
      !methodModalOpen
    ) {
      return undefined
    }

    const oldOverflow =
      document.body.style
        .overflow

    document.body.style.overflow =
      'hidden'

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          'Escape'
        ) {
          closeMethodModal()
        }
      }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      document.body.style
        .overflow =
        oldOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [
    methodModalOpen,
  ])

  const activeMethodCount =
    methods.filter(
      (method) =>
        method.enabled !==
        false
    ).length

  const handleAddCity =
    () => {
      const name =
        newCityName.trim()

      const fee =
        Number(
          newCityFee
        )

      if (!name) {
        showMessage(
          'error',
          'Please enter a city name.'
        )

        return
      }

      if (
        !Number.isFinite(fee) ||
        fee < 0
      ) {
        showMessage(
          'error',
          'Please enter a valid city shipping fee.'
        )

        return
      }

      const duplicate =
        cities.some(
          (city) =>
            String(
              city.name || ''
            )
              .trim()
              .toLowerCase() ===
            name.toLowerCase()
        )

      if (duplicate) {
        showMessage(
          'error',
          'This city has already been added.'
        )

        return
      }

      setCities(
        (previous) => [
          ...previous,
          {
            id:
              createId(
                'city'
              ),

            name,
            fee,
          },
        ]
      )

      setNewCityName('')
      setNewCityFee('')
      setDirty(true)
    }

  const handleCityFeeChange =
    (
      id,
      value
    ) => {
      setCities(
        (previous) =>
          previous.map(
            (city) =>
              city.id === id
                ? {
                  ...city,
                  fee: value,
                }
                : city
          )
      )

      setDirty(true)
    }

  const handleRemoveCity =
    (id) => {
      setCities(
        (previous) =>
          previous.filter(
            (city) =>
              city.id !== id
          )
      )

      setDirty(true)
    }

  const openAddMethod =
    () => {
      setEditingMethodId(
        null
      )

      setMethodForm(
        createMethodForm()
      )

      setMethodModalOpen(
        true
      )
    }

  const openEditMethod =
    (method) => {
      setEditingMethodId(
        method.id
      )

      setMethodForm({
        name:
          method.name || '',

        enabled:
          method.enabled !==
          false,

        rateType:
          method.rateType ===
            'flat'
            ? 'flat'
            : 'city',

        flatFee:
          String(
            method.flatFee ??
            0
          ),

        deliveryEstimate:
          method.deliveryEstimate ||
          '',

        description:
          method.description ||
          '',

        policy:
          method.policy || '',
      })

      setMethodModalOpen(
        true
      )
    }

  const handleSaveMethod =
    () => {
      const name =
        methodForm.name.trim()

      if (!name) {
        showMessage(
          'error',
          'Shipping method name is required.'
        )

        return
      }

      const duplicate =
        methods.some(
          (method) =>
            method.id !==
            editingMethodId &&
            String(
              method.name || ''
            )
              .trim()
              .toLowerCase() ===
            name.toLowerCase()
        )

      if (duplicate) {
        showMessage(
          'error',
          'A shipping method with this name already exists.'
        )

        return
      }

      let flatFee = 0

      if (
        methodForm.rateType ===
        'flat'
      ) {
        flatFee =
          Number(
            methodForm.flatFee
          )

        if (
          !Number.isFinite(
            flatFee
          ) ||
          flatFee < 0
        ) {
          showMessage(
            'error',
            'Please enter a valid flat shipping fee.'
          )

          return
        }
      }

      const method = {
        id:
          editingMethodId ||
          createId(
            'method'
          ),

        name,

        enabled:
          methodForm.enabled,

        rateType:
          methodForm.rateType ===
            'flat'
            ? 'flat'
            : 'city',

        flatFee,

        deliveryEstimate:
          methodForm
            .deliveryEstimate
            .trim(),

        description:
          methodForm
            .description
            .trim(),

        policy:
          methodForm.policy.trim(),
      }

      setMethods(
        (previous) => {
          if (
            editingMethodId
          ) {
            return previous.map(
              (item) =>
                item.id ===
                  editingMethodId
                  ? method
                  : item
            )
          }

          return [
            ...previous,
            method,
          ]
        }
      )

      setDirty(true)
      closeMethodModal()
    }

  const toggleMethod =
    (id) => {
      setMethods(
        (previous) =>
          previous.map(
            (method) =>
              method.id === id
                ? {
                  ...method,

                  enabled:
                    method.enabled ===
                    false,
                }
                : method
          )
      )

      setDirty(true)
    }

  const removeMethod =
    (id) => {
      const method =
        methods.find(
          (item) =>
            item.id === id
        )

      if (
        !window.confirm(
          `Remove "${method?.name || 'this shipping method'}"?`
        )
      ) {
        return
      }

      setMethods(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== id
          )
      )

      setDirty(true)
    }

  const handleSave =
    async () => {
      const threshold =
        Number(
          freeShippingThreshold
        )

      if (
        freeShippingEnabled &&
        (
          !Number.isFinite(
            threshold
          ) ||
          threshold < 0
        )
      ) {
        showMessage(
          'error',
          'Please enter a valid free shipping threshold.'
        )

        return
      }

      const normalizedCities =
        cities.map(
          (city) => ({
            id: city.id,

            name:
              String(
                city.name || ''
              ).trim(),

            fee:
              Number(
                city.fee
              ),
          })
        )

      if (
        normalizedCities.some(
          (city) =>
            !city.name ||
            !Number.isFinite(
              city.fee
            ) ||
            city.fee < 0
        )
      ) {
        showMessage(
          'error',
          'One or more city shipping fees are invalid.'
        )

        return
      }

      const cityNames =
        normalizedCities.map(
          (city) =>
            city.name.toLowerCase()
        )

      if (
        new Set(
          cityNames
        ).size !==
        cityNames.length
      ) {
        showMessage(
          'error',
          'Duplicate delivery cities are not allowed.'
        )

        return
      }

      setSaving(true)

      try {
        const saved =
          await shippingService.saveShippingSettings({
            cities:
              normalizedCities,

            methods,

            freeShippingEnabled,

            freeShippingThreshold:
              freeShippingEnabled
                ? threshold
                : Number(
                  freeShippingThreshold
                ) || 0,
          })

        setCities(
          saved.cities || []
        )

        setMethods(
          saved.methods || []
        )

        setFreeShippingEnabled(
          saved.freeShippingEnabled !==
          false
        )

        setFreeShippingThreshold(
          String(
            saved.freeShippingThreshold ??
            0
          )
        )

        setDirty(false)

        if (
          saved.methods.filter(
            (method) =>
              method.enabled !==
              false
          ).length === 0
        ) {
          showMessage(
            'warning',
            'Settings saved. Checkout currently has no active shipping method.'
          )
        } else {
          showMessage(
            'success',
            'Shipping settings saved successfully.'
          )
        }
      } catch (error) {
        console.error(
          'Shipping settings save failed:',
          error
        )

        showMessage(
          'error',
          'Failed to save shipping settings. Please try again.'
        )
      } finally {
        setSaving(false)
      }
    }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-[#4C3429] bg-[#3A2117] shadow-[0_20px_60px_rgba(58,33,23,0.14)]">
          <div className="relative px-5 py-7 sm:px-7">
            <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/[0.04]" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-[#D7B293]/[0.06]" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-[#F7F4EF]">
                  <Truck className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D6BBA9]">
                    Store Settings
                  </p>

                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                    Shipping Fees
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                    Control delivery methods, city rates,
                    delivery estimates and your free shipping
                    threshold from one place.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  loading ||
                  !dirty
                }
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#FFFEFC] px-5 text-sm font-semibold text-[#3A2117] shadow-sm transition hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />

                {saving
                  ? 'Saving...'
                  : dirty
                    ? 'Save Changes'
                    : 'Saved'}
              </button>
            </div>
          </div>
        </section>

        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ${message.type ===
                'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : message.type ===
                  'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
          >
            {message.type ===
              'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="leading-5">
              {message.text}
            </p>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-[#E4D8CF] bg-[#FFFEFC] px-6 py-16 text-center shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D9C8BC] border-t-[#3A2117]" />

            <p className="mt-4 text-sm text-[#7E6A5F]">
              Loading shipping settings...
            </p>
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5 shadow-[0_10px_30px_rgba(58,33,23,0.04)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
                  Active Methods
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#281912]">
                  {activeMethodCount}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5 shadow-[0_10px_30px_rgba(58,33,23,0.04)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
                  Delivery Cities
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#281912]">
                  {cities.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5 shadow-[0_10px_30px_rgba(58,33,23,0.04)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
                  Free Shipping
                </p>

                <p className="mt-2 text-lg font-semibold text-[#281912]">
                  {freeShippingEnabled
                    ? `Rs.${formatMoney(
                      freeShippingThreshold
                    )}+`
                    : 'Disabled'}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
              <div className="border-b border-[#ECE2DB] px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                    <Truck className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#281912]">
                      Free Shipping Threshold
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#806C60]">
                      When enabled, eligible orders receive free
                      shipping regardless of the selected delivery
                      method.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-[1fr_240px] sm:items-end sm:p-6">
                <div>
                  <p className={labelClass}>
                    Status
                  </p>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={
                      freeShippingEnabled
                    }
                    onClick={() => {
                      setFreeShippingEnabled(
                        (previous) =>
                          !previous
                      )

                      setDirty(true)
                    }}
                    className={`flex min-h-[48px] w-full items-center justify-between rounded-xl border px-4 transition ${freeShippingEnabled
                        ? 'border-[#6B4228]/30 bg-[#F4ECE6]'
                        : 'border-[#DED2C9] bg-[#F7F4EF]'
                      }`}
                  >
                    <span className="text-sm font-semibold text-[#281912]">
                      {freeShippingEnabled
                        ? 'Free shipping enabled'
                        : 'Free shipping disabled'}
                    </span>

                    <span
                      className={`relative h-6 w-11 rounded-full transition ${freeShippingEnabled
                          ? 'bg-[#3A2117]'
                          : 'bg-[#C9BDB5]'
                        }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${freeShippingEnabled
                            ? 'left-6'
                            : 'left-1'
                          }`}
                      />
                    </span>
                  </button>
                </div>

                <div>
                  <label className={labelClass}>
                    Threshold
                  </label>

                  <div className="flex items-center overflow-hidden rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] focus-within:border-[#6B4228]">
                    <span className="border-r border-[#E5DAD2] bg-[#F7F4EF] px-4 py-3 text-sm font-semibold text-[#6B4228]">
                      Rs.
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        freeShippingThreshold
                      }
                      disabled={
                        !freeShippingEnabled
                      }
                      onChange={(event) => {
                        setFreeShippingThreshold(
                          event.target
                            .value
                        )

                        setDirty(true)
                      }}
                      className="w-full bg-transparent px-4 py-3 text-sm text-[#281912] outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
              <div className="flex flex-col gap-4 border-b border-[#ECE2DB] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#281912]">
                      Delivery Methods
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#806C60]">
                      Methods shown here become selectable during
                      checkout when they are enabled.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openAddMethod}
                  className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-4 text-xs font-semibold text-white transition hover:bg-[#281912]"
                >
                  <Plus className="h-4 w-4" />
                  Add Method
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {methods.length ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {methods.map(
                      (method) => (
                        <article
                          key={
                            method.id
                          }
                          className={`rounded-2xl border p-5 transition ${method.enabled !==
                              false
                              ? 'border-[#DCCFC6] bg-[#FFFEFC]'
                              : 'border-[#E6DDD7] bg-[#F7F4EF] opacity-75'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-[#281912]">
                                  {
                                    method.name
                                  }
                                </h3>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${method.enabled !==
                                      false
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-[#EAE1DB] text-[#8A7467]'
                                    }`}
                                >
                                  {method.enabled !==
                                    false
                                    ? 'Active'
                                    : 'Disabled'}
                                </span>
                              </div>

                              <p className="mt-2 text-xs font-medium text-[#6B4228]">
                                {method.rateType ===
                                  'flat'
                                  ? `Flat fee · Rs.${formatMoney(
                                    method.flatFee
                                  )}`
                                  : 'Uses selected city rate'}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleMethod(
                                    method.id
                                  )
                                }
                                className="grid h-9 w-9 place-items-center rounded-lg border border-[#E0D4CB] text-[#6B4228] transition hover:bg-[#F7F4EF]"
                                title={
                                  method.enabled !==
                                    false
                                    ? 'Disable method'
                                    : 'Enable method'
                                }
                              >
                                <span className="h-2.5 w-2.5 rounded-full border-2 border-current" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditMethod(
                                    method
                                  )
                                }
                                className="grid h-9 w-9 place-items-center rounded-lg border border-[#E0D4CB] text-[#6B4228] transition hover:bg-[#F7F4EF]"
                                title="Edit method"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeMethod(
                                    method.id
                                  )
                                }
                                className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                                title="Remove method"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2 border-t border-[#EEE5DF] pt-4 text-xs leading-5 text-[#756157]">
                            <p>
                              <span className="font-semibold text-[#4C3A31]">
                                Estimate:
                              </span>{' '}
                              {method.deliveryEstimate ||
                                'Not specified'}
                            </p>

                            {method.description && (
                              <p>
                                {
                                  method.description
                                }
                              </p>
                            )}

                            {method.policy && (
                              <p className="rounded-xl bg-[#F7F4EF] px-3 py-2.5 text-[11px]">
                                {
                                  method.policy
                                }
                              </p>
                            )}
                          </div>
                        </article>
                      )
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D8CBC2] bg-[#F7F4EF] px-5 py-10 text-center">
                    <Truck className="mx-auto h-7 w-7 text-[#9A8171]" />

                    <p className="mt-3 text-sm font-semibold text-[#281912]">
                      No shipping methods
                    </p>

                    <p className="mt-1 text-xs text-[#806C60]">
                      Add a delivery method before accepting checkout
                      orders.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
              <div className="border-b border-[#ECE2DB] px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#281912]">
                      City Shipping Rates
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#806C60]">
                      These rates are used by every delivery method
                      configured as City Based.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                {cities.length > 0 && (
                  <div className="divide-y divide-[#EEE5DF] overflow-hidden rounded-2xl border border-[#E3D7CF]">
                    {cities.map(
                      (city) => (
                        <div
                          key={
                            city.id
                          }
                          className="flex flex-col gap-3 bg-[#FFFEFC] p-4 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#281912]">
                              {
                                city.name
                              }
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#917B6D]">
                              City-based delivery rate
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center overflow-hidden rounded-xl border border-[#DCCFC6] bg-[#F7F4EF]">
                              <span className="px-3 text-xs font-semibold text-[#6B4228]">
                                Rs.
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={
                                  city.fee
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleCityFeeChange(
                                    city.id,
                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="w-28 border-l border-[#E4D8D0] bg-[#FFFEFC] px-3 py-2.5 text-sm text-[#281912] outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveCity(
                                  city.id
                                )
                              }
                              className="grid h-10 w-10 place-items-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                              title="Remove city"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                <div className="rounded-2xl border border-[#E4D8D0] bg-[#F7F4EF] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7467]">
                    Add Delivery City
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_170px_auto]">
                    <input
                      value={
                        newCityName
                      }
                      onChange={(
                        event
                      ) =>
                        setNewCityName(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                          'Enter'
                        ) {
                          handleAddCity()
                        }
                      }}
                      placeholder="e.g. Lahore"
                      className={inputClass}
                    />

                    <div className="flex items-center overflow-hidden rounded-xl border border-[#DCCFC6] bg-[#FFFEFC]">
                      <span className="border-r border-[#E5DAD2] px-3 text-xs font-semibold text-[#6B4228]">
                        Rs.
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          newCityFee
                        }
                        onChange={(
                          event
                        ) =>
                          setNewCityFee(
                            event.target
                              .value
                          )
                        }
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                            'Enter'
                          ) {
                            handleAddCity()
                          }
                        }}
                        placeholder="Fee"
                        className="w-full bg-transparent px-3 py-3 text-sm text-[#281912] outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleAddCity
                      }
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#6B4228] px-5 text-xs font-semibold text-white transition hover:bg-[#3A2117]"
                    >
                      <Plus className="h-4 w-4" />
                      Add City
                    </button>
                  </div>
                </div>

                <p className="text-[11px] leading-5 text-[#917B6D]">
                  City and method edits stay local until you press
                  Save Changes.
                </p>
              </div>
            </section>
          </>
        )}

        {methodModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#281912]/60 p-3 backdrop-blur-[3px] sm:p-5">
            <button
              type="button"
              aria-label="Close shipping method form"
              onClick={
                closeMethodModal
              }
              className="absolute inset-0"
            />

            <div className="relative z-10 flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#DCCFC6] bg-[#FFFEFC] shadow-[0_30px_90px_rgba(40,25,18,0.35)]">
              {/* Fixed Header */}
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E8DDD5] bg-[#FFFEFC] px-5 py-5 sm:px-6">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9A8171]">
                    Shipping Method
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#281912]">
                    {editingMethodId
                      ? 'Edit Delivery Method'
                      : 'Add Delivery Method'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    closeMethodModal
                  }
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#E2D6CE] text-[#6B5A50] transition hover:bg-[#F7F4EF] hover:text-[#281912]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>
                      Method Name
                    </label>

                    <input
                      value={
                        methodForm.name
                      }
                      onChange={(
                        event
                      ) =>
                        setMethodForm(
                          (previous) => ({
                            ...previous,

                            name:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="e.g. Express Delivery"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Pricing Type
                    </label>

                    <select
                      value={
                        methodForm.rateType
                      }
                      onChange={(
                        event
                      ) =>
                        setMethodForm(
                          (previous) => ({
                            ...previous,

                            rateType:
                              event.target
                                .value,
                          })
                        )
                      }
                      className={inputClass}
                    >
                      <option value="city">
                        City Based — use the selected city's rate
                      </option>

                      <option value="flat">
                        Flat Rate — same fee for every supported city
                      </option>
                    </select>
                  </div>

                  {methodForm.rateType ===
                    'flat' && (
                      <div>
                        <label className={labelClass}>
                          Flat Shipping Fee
                        </label>

                        <div className="flex items-center overflow-hidden rounded-xl border border-[#DCCFC6] bg-[#FFFEFC]">
                          <span className="border-r border-[#E5DAD2] bg-[#F7F4EF] px-4 py-3 text-sm font-semibold text-[#6B4228]">
                            Rs.
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              methodForm.flatFee
                            }
                            onChange={(
                              event
                            ) =>
                              setMethodForm(
                                (
                                  previous
                                ) => ({
                                  ...previous,

                                  flatFee:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                            className="w-full bg-transparent px-4 py-3 text-sm text-[#281912] outline-none"
                            placeholder="500"
                          />
                        </div>
                      </div>
                    )}

                  <div>
                    <label className={labelClass}>
                      Delivery Estimate
                    </label>

                    <input
                      value={
                        methodForm
                          .deliveryEstimate
                      }
                      onChange={(
                        event
                      ) =>
                        setMethodForm(
                          (previous) => ({
                            ...previous,

                            deliveryEstimate:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="e.g. 2–3 business days"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Checkout Description
                    </label>

                    <textarea
                      rows={3}
                      value={
                        methodForm.description
                      }
                      onChange={(
                        event
                      ) =>
                        setMethodForm(
                          (previous) => ({
                            ...previous,

                            description:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="Short customer-facing description..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Shipping Information / Policy
                    </label>

                    <textarea
                      rows={3}
                      value={
                        methodForm.policy
                      }
                      onChange={(
                        event
                      ) =>
                        setMethodForm(
                          (previous) => ({
                            ...previous,

                            policy:
                              event.target
                                .value,
                          })
                        )
                      }
                      placeholder="Optional shipping note shown during checkout..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={
                      methodForm.enabled
                    }
                    onClick={() =>
                      setMethodForm(
                        (previous) => ({
                          ...previous,

                          enabled:
                            !previous.enabled,
                        })
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${methodForm.enabled
                        ? 'border-[#6B4228]/25 bg-[#F4ECE6]'
                        : 'border-[#DED2C9] bg-[#F7F4EF]'
                      }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#281912]">
                        Method Active
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#806C60]">
                        Disabled methods stay saved but disappear from
                        checkout.
                      </p>
                    </div>

                    <span
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${methodForm.enabled
                          ? 'bg-[#3A2117]'
                          : 'bg-[#C9BDB5]'
                        }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${methodForm.enabled
                            ? 'left-6'
                            : 'left-1'
                          }`}
                      />
                    </span>
                  </button>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="shrink-0 border-t border-[#E8DDD5] bg-[#F7F4EF] px-5 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeMethodModal
                    }
                    className="min-h-[44px] rounded-xl border border-[#D6C9C0] bg-[#FFFEFC] px-5 text-xs font-semibold text-[#6B5A50] transition hover:bg-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSaveMethod
                    }
                    className="min-h-[44px] rounded-xl bg-[#3A2117] px-6 text-xs font-semibold text-white transition hover:bg-[#281912]"
                  >
                    {editingMethodId
                      ? 'Update Method'
                      : 'Add Method'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}