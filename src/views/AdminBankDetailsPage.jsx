'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Percent,
  Save,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react'

import AdminLayout from '../components/AdminLayout'
import { uploadToXcdn } from '../utils/xcdnUpload.js'
import bankDetailsService from '../utils/bankDetailsService'

const inputClass =
  'w-full rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] px-4 py-3 text-sm text-[#281912] outline-none transition placeholder:text-[#A49388] focus:border-[#6B4228] focus:ring-4 focus:ring-[#6B4228]/[0.06]'

const labelClass =
  'mb-2 block text-[11px] font-semibold text-[#4C3A31]'

const INITIAL_FORM = {
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  branchCode: '',
  bankTransferInstructions: '',
  codInstructions: '',
  qrCodeImage: '',
  qrCodeInstructions: '',
  qrCodeEnabled: false,
  codAdvancePercent: '0',
  isActive: false,
}

function clean(value) {
  return String(value ?? '').trim()
}

export default function AdminBankDetailsPage() {
  const [
    formData,
    setFormData,
  ] = useState(INITIAL_FORM)

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
    qrCodeUploading,
    setQrCodeUploading,
  ] = useState(false)
  const [
    message,
    setMessage,
  ] = useState({
    type: '',
    text: '',
  })

  useEffect(() => {
    let active = true

    const loadBankDetails =
      async () => {
        try {
          setLoading(true)

          const data =
            await bankDetailsService.getBankDetails()

          if (!active) {
            return
          }

          setFormData({
            bankName:
              data.bankName || '',

            accountTitle:
              data.accountTitle || '',

            accountNumber:
              data.accountNumber || '',

            iban:
              data.iban || '',

            branchCode:
              data.branchCode || '',

            bankTransferInstructions:
              data.bankTransferInstructions ||
              '',

            codInstructions:
              data.codInstructions || '',

            codAdvancePercent:
              String(
                data.codAdvancePercent ??
                0
              ),
            qrCodeImage:
              data.qrCodeImage || '',

            qrCodeInstructions:
              data.qrCodeInstructions || '',

            qrCodeEnabled:
              data.qrCodeEnabled === true,
            isActive:
              data.isActive === true,
          })

          setDirty(false)
        } catch (error) {
          console.error(
            'Error loading bank details:',
            error
          )

          if (active) {
            setMessage({
              type: 'error',
              text:
                'Failed to load bank details.',
            })
          }
        } finally {
          if (active) {
            setLoading(false)
          }
        }
      }

    loadBankDetails()

    return () => {
      active = false
    }
  }, [])

  const updateField = (
    name,
    value
  ) => {
    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          name === 'iban'
            ? value.toUpperCase()
            : value,
      })
    )

    setDirty(true)

    if (message.text) {
      setMessage({
        type: '',
        text: '',
      })
    }
  }
  const handleQrCodeUpload = async (event) => {
    const input = event.target
    const file = input.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: 'Please select a valid image file.',
      })
      input.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'QR image must be smaller than 5MB.',
      })
      input.value = ''
      return
    }

    setQrCodeUploading(true)

    setMessage({
      type: '',
      text: '',
    })

    try {
      const url = await uploadToXcdn(
        file,
        'bank-details'
      )

      updateField('qrCodeImage', url)

      setMessage({
        type: 'success',
        text: 'QR code uploaded. Save changes to publish it.',
      })
    } catch (error) {
      console.error('QR code upload failed:', error)

      setMessage({
        type: 'error',
        text: error?.message || 'QR code upload failed.',
      })
    } finally {
      setQrCodeUploading(false)
      input.value = ''
    }
  }
  const toggleActive = () => {
    setFormData(
      (previous) => ({
        ...previous,
        isActive:
          !previous.isActive,
      })
    )

    setDirty(true)

    if (message.text) {
      setMessage({
        type: '',
        text: '',
      })
    }
  }

  const validate = () => {
    const advancePercent =
      Number(
        formData.codAdvancePercent
      )

    if (
      !Number.isFinite(
        advancePercent
      ) ||
      advancePercent < 0 ||
      advancePercent > 100
    ) {
      setMessage({
        type: 'error',
        text:
          'COD advance percentage must be between 0 and 100.',
      })
      if (
        formData.qrCodeEnabled &&
        !clean(formData.qrCodeImage)
      ) {
        setMessage({
          type: 'error',
          text: 'Please upload a QR code image before enabling QR payments.',
        })

        return false
      }
      return false
    }

    if (formData.isActive) {
      const missingBankData =
        !clean(
          formData.bankName
        ) ||
        !clean(
          formData.accountTitle
        ) ||
        !clean(
          formData.accountNumber
        ) ||
        !clean(
          formData.iban
        )

      if (missingBankData) {
        setMessage({
          type: 'error',
          text:
            'Bank Name, Account Title, Account Number and IBAN are required before activating bank payments.',
        })

        return false
      }
    }

    return true
  }

  const handleSave =
    async (event) => {
      event.preventDefault()
      if (qrCodeUploading) return
      if (!validate()) {
        return
      }

      setSaving(true)

      setMessage({
        type: '',
        text: '',
      })

      try {
        const saved =
          await bankDetailsService.saveBankDetails(
            {
              bankName:
                clean(
                  formData.bankName
                ),

              accountTitle:
                clean(
                  formData.accountTitle
                ),

              accountNumber:
                clean(
                  formData.accountNumber
                ),

              iban:
                clean(
                  formData.iban
                ).toUpperCase(),

              branchCode:
                clean(
                  formData.branchCode
                ),

              bankTransferInstructions:
                clean(
                  formData.bankTransferInstructions
                ),

              codInstructions:
                clean(
                  formData.codInstructions
                ),
              qrCodeImage:
                clean(formData.qrCodeImage),

              qrCodeInstructions:
                clean(formData.qrCodeInstructions),

              qrCodeEnabled:
                formData.qrCodeEnabled,
              codAdvancePercent:
                Number(
                  formData.codAdvancePercent
                ),

              isActive:
                formData.isActive,
            }
          )

        setFormData({
          bankName:
            saved.bankName || '',

          accountTitle:
            saved.accountTitle || '',

          accountNumber:
            saved.accountNumber || '',

          iban:
            saved.iban || '',

          branchCode:
            saved.branchCode || '',

          bankTransferInstructions:
            saved.bankTransferInstructions ||
            '',

          codInstructions:
            saved.codInstructions || '',

          codAdvancePercent:
            String(
              saved.codAdvancePercent ??
              0
            ),
          qrCodeImage:
            saved.qrCodeImage || '',

          qrCodeInstructions:
            saved.qrCodeInstructions || '',

          qrCodeEnabled:
            saved.qrCodeEnabled === true,
          isActive:
            saved.isActive === true,
        })

        setDirty(false)

        setMessage({
          type: 'success',
          text:
            'Bank details saved successfully.',
        })
      } catch (error) {
        console.error(
          'Error saving bank details:',
          error
        )

        setMessage({
          type: 'error',
          text:
            'Failed to save bank details. Please try again.',
        })
      } finally {
        setSaving(false)
      }
    }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#6B4228]" />

            <p className="mt-3 text-sm text-[#806C60]">
              Loading bank details...
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <form
        id="bank-details-form"
        onSubmit={handleSave}
        className="space-y-6"
      >
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border border-[#4C3429] bg-[#3A2117] shadow-[0_20px_60px_rgba(58,33,23,0.14)]">
          <div className="relative px-5 py-7 sm:px-7">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/[0.04]" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08]">
                  <Building2 className="h-6 w-6 text-[#F7F4EF]" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D6BBA9]">
                    Store Settings
                  </p>

                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                    Bank Details
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                    Manage bank transfer details,
                    checkout instructions and
                    Cash on Delivery advance
                    settings.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  saving ||
                  qrCodeUploading ||
                  !dirty
                }
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#FFFEFC] px-5 text-sm font-semibold text-[#3A2117] transition hover:bg-[#F7F4EF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving
                  ? 'Saving...'
                  : dirty
                    ? 'Save Changes'
                    : 'Saved'}
              </button>
            </div>
          </div>
        </section>

        {/* Messages */}
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

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
              Bank Transfer
            </p>

            <p className="mt-2 text-lg font-semibold text-[#281912]">
              {formData.isActive
                ? 'Active'
                : 'Inactive'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
              Bank
            </p>

            <p className="mt-2 truncate text-lg font-semibold text-[#281912]">
              {formData.bankName ||
                'Not configured'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DAD2] bg-[#FFFEFC] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A8171]">
              COD Advance
            </p>

            <p className="mt-2 text-lg font-semibold text-[#281912]">
              {Number(
                formData.codAdvancePercent
              ) || 0}
              %
            </p>
          </div>
        </section>

        {/* Bank Transfer Availability */}
        <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
          <div className="border-b border-[#ECE2DB] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#281912]">
                  Checkout Availability
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#806C60]">
                  Enable this only when
                  the bank account is ready
                  to receive customer
                  payments.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <button
              type="button"
              role="switch"
              aria-checked={
                formData.isActive
              }
              onClick={toggleActive}
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${formData.isActive
                ? 'border-[#6B4228]/25 bg-[#F4ECE6]'
                : 'border-[#DDD1C8] bg-[#F7F4EF]'
                }`}
            >
              <div>
                <p className="text-sm font-semibold text-[#281912]">
                  Bank Transfer{' '}
                  {formData.isActive
                    ? 'enabled'
                    : 'disabled'}
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#806C60]">
                  {formData.isActive
                    ? 'Bank Deposit will be available at checkout when the required account information is configured.'
                    : 'Bank account information remains saved but Bank Deposit stays hidden from checkout.'}
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
        </section>
        {/* QR Code Availability */}
        <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
          <div className="border-b border-[#ECE2DB] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                <ImageIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#281912]">
                  QR Code Availability
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#806C60]">
                  Manage QR code visibility independently from Bank Transfer.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <button
              type="button"
              role="switch"
              aria-checked={formData.qrCodeEnabled}
              onClick={() =>
                updateField(
                  'qrCodeEnabled',
                  !formData.qrCodeEnabled
                )
              }
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${formData.qrCodeEnabled
                ? 'border-[#6B4228]/25 bg-[#F4ECE6]'
                : 'border-[#DDD1C8] bg-[#F7F4EF]'
                }`}
            >
              <div>
                <p className="text-sm font-semibold text-[#281912]">
                  QR Code{' '}
                  {formData.qrCodeEnabled ? 'enabled' : 'disabled'}
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#806C60]">
                  {formData.qrCodeEnabled
                    ? 'QR code will be displayed at checkout wherever advance or bank payment applies.'
                    : 'QR code remains saved but hidden from checkout.'}
                </p>
              </div>

              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${formData.qrCodeEnabled
                  ? 'bg-[#3A2117]'
                  : 'bg-[#C9BDB5]'
                  }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${formData.qrCodeEnabled
                    ? 'left-6'
                    : 'left-1'
                    }`}
                />
              </span>
            </button>
          </div>
        </section>
        {/* Bank Account */}
        <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
          <div className="border-b border-[#ECE2DB] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#281912]">
                  Bank Account
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#806C60]">
                  These details appear only
                  when Bank Transfer is
                  enabled and configured.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label className={labelClass}>
                Bank Name *
              </label>

              <input
                type="text"
                value={
                  formData.bankName
                }
                onChange={(event) =>
                  updateField(
                    'bankName',
                    event.target.value
                  )
                }
                placeholder="Enter bank name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Account Title *
              </label>

              <input
                type="text"
                value={
                  formData.accountTitle
                }
                onChange={(event) =>
                  updateField(
                    'accountTitle',
                    event.target.value
                  )
                }
                placeholder="Enter account title"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Account Number *
              </label>

              <input
                type="text"
                value={
                  formData.accountNumber
                }
                onChange={(event) =>
                  updateField(
                    'accountNumber',
                    event.target.value
                  )
                }
                placeholder="Enter account number"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                IBAN *
              </label>

              <input
                type="text"
                value={
                  formData.iban
                }
                onChange={(event) =>
                  updateField(
                    'iban',
                    event.target.value
                  )
                }
                placeholder="PK..."
                className={`${inputClass} uppercase`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>
                Branch Code
              </label>

              <input
                type="text"
                value={
                  formData.branchCode
                }
                onChange={(event) =>
                  updateField(
                    'branchCode',
                    event.target.value
                  )
                }
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </div>
        </section>
        {/* QR Code Settings */}
        <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
          <div className="border-b border-[#ECE2DB] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                <ImageIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#281912]">
                  Bank QR Code
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#806C60]">
                  Upload the QR image provided by your bank and add customer instructions.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
            <div>
              <label className={labelClass}>
                QR Code Image
              </label>

              {formData.qrCodeImage ? (
                <div className="rounded-2xl border border-[#E5DAD2] bg-[#F7F4EF] p-4">
                  <img
                    src={formData.qrCodeImage}
                    alt="Bank QR Code"
                    className="mx-auto max-h-[230px] w-auto max-w-full object-contain"
                  />

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <label
                      htmlFor="bank-qr-upload"
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3A2117] px-4 py-2.5 text-xs font-semibold text-white ${qrCodeUploading || saving
                        ? 'pointer-events-none opacity-50'
                        : ''
                        }`}
                    >
                      {qrCodeUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}

                      Replace QR
                    </label>

                    <button
                      type="button"
                      disabled={qrCodeUploading || saving}
                      onClick={() =>
                        updateField('qrCodeImage', '')
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="bank-qr-upload"
                  className={`flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DCCFC6] bg-[#F7F4EF] p-6 text-center transition hover:border-[#6B4228] ${qrCodeUploading || saving
                    ? 'pointer-events-none opacity-50'
                    : ''
                    }`}
                >
                  {qrCodeUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-[#6B4228]" />
                  ) : (
                    <Upload className="h-8 w-8 text-[#6B4228]" />
                  )}

                  <p className="mt-3 text-sm font-semibold text-[#281912]">
                    {qrCodeUploading
                      ? 'Uploading QR Code...'
                      : 'Upload Bank QR Code'}
                  </p>

                  <p className="mt-1 text-xs text-[#806C60]">
                    PNG, JPG or WEBP · Maximum 5MB
                  </p>
                </label>
              )}

              <input
                id="bank-qr-upload"
                type="file"
                accept="image/*"
                onChange={handleQrCodeUpload}
                disabled={qrCodeUploading || saving}
                className="sr-only"
              />
            </div>

            <div>
              <label className={labelClass}>
                QR Code Instructions
              </label>

              <textarea
                rows={8}
                value={formData.qrCodeInstructions}
                onChange={(event) =>
                  updateField(
                    'qrCodeInstructions',
                    event.target.value
                  )
                }
                placeholder="Scan this QR code using your banking app and enter the payment amount shown at checkout. After payment, keep your transaction receipt."
                className={`${inputClass} resize-y`}
              />

              <p className="mt-2 text-[11px] leading-5 text-[#8A7569]">
                These instructions will appear alongside the QR code at checkout.
              </p>
            </div>
          </div>
        </section>
        {/* Instructions */}
        <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
          <div className="border-b border-[#ECE2DB] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#281912]">
                  Checkout Instructions
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#806C60]">
                  Keep Bank Transfer and COD
                  messages separate so the
                  customer only sees relevant
                  payment information.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
            <div>
              <label className={labelClass}>
                Bank Transfer Instructions
              </label>

              <textarea
                rows={5}
                value={
                  formData.bankTransferInstructions
                }
                onChange={(event) =>
                  updateField(
                    'bankTransferInstructions',
                    event.target.value
                  )
                }
                placeholder="Explain how the customer should complete the bank transfer."
                className={`${inputClass} resize-y`}
              />
            </div>

            <div>
              <label className={labelClass}>
                COD Instructions
              </label>

              <textarea
                rows={5}
                value={
                  formData.codInstructions
                }
                onChange={(event) =>
                  updateField(
                    'codInstructions',
                    event.target.value
                  )
                }
                placeholder="Explain COD and any advance payment requirement."
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        </section>

        {/* COD Advance */}
        <section className="rounded-3xl border border-[#E5DAD2] bg-[#FFFEFC] shadow-[0_12px_35px_rgba(58,33,23,0.05)]">
          <div className="border-b border-[#ECE2DB] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F2EAE4] text-[#6B4228]">
                <Percent className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#281912]">
                  COD Advance
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#806C60]">
                  Set how much of a Cash on
                  Delivery order must be paid
                  in advance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="max-w-sm">
              <label className={labelClass}>
                Advance Percentage
              </label>

              <div className="flex overflow-hidden rounded-xl border border-[#DCCFC6] bg-[#FFFEFC] focus-within:border-[#6B4228] focus-within:ring-4 focus-within:ring-[#6B4228]/[0.06]">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={
                    formData.codAdvancePercent
                  }
                  onChange={(event) =>
                    updateField(
                      'codAdvancePercent',
                      event.target.value
                    )
                  }
                  className="w-full bg-transparent px-4 py-3 text-sm text-[#281912] outline-none"
                />

                <span className="grid min-w-[52px] place-items-center border-l border-[#E5DAD2] bg-[#F7F4EF] text-sm font-semibold text-[#6B4228]">
                  %
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-[#8A7569]">
                Use 0% when Cash on Delivery
                does not require an advance.
                No hard-coded advance is
                applied.
              </p>
            </div>
          </div>
        </section>

        {/* Sticky Footer */}
        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-[#E0D4CB] bg-[#FFFEFC]/95 p-3 shadow-[0_16px_45px_rgba(58,33,23,0.14)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <p className="px-1 text-[11px] leading-5 text-[#806C60]">
            {dirty
              ? 'You have unsaved changes.'
              : 'All changes are saved.'}
          </p>

          <button
            type="submit"
            disabled={
              saving ||
              qrCodeUploading ||
              !dirty
            }
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#3A2117] px-6 text-sm font-semibold text-white transition hover:bg-[#281912] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {saving
              ? 'Saving...'
              : 'Save Bank Details'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}