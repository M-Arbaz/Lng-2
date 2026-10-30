'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function DownloadInvoiceButton({
    order,
    compact = false,
    className = '',
    label,
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleDownload = async () => {
        if (loading) return

        setLoading(true)
        setError('')

        try {
            const { downloadOrderInvoice } = await import('../utils/invoicePdf')
            await downloadOrderInvoice(order)
        } catch (downloadError) {
            console.error('Invoice download failed:', downloadError)
            setError(downloadError?.message || 'Could not generate the invoice. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
            <button
                type="button"
                onClick={handleDownload}
                disabled={loading || !order}
                className={compact
                    ? 'inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full border border-[#6B4228]/20 bg-[#FFFEFC] px-3 text-[10px] font-semibold text-[#3A2117] transition hover:bg-[#F2ECE5] disabled:cursor-not-allowed disabled:opacity-60'
                    : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#3A2117] px-6 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(58,33,23,0.16)] transition hover:bg-[#4A2B1F] disabled:cursor-not-allowed disabled:opacity-60'}
            >
                {loading
                    ? <Loader2 size={compact ? 13 : 16} className="animate-spin" />
                    : <Download size={compact ? 13 : 16} />}
                {loading ? 'Preparing PDF...' : (label || (compact ? 'Invoice PDF' : 'Download Invoice PDF'))}
            </button>

            {error && (
                <p role="alert" className="max-w-[260px] text-[10px] text-rose-600">
                    {error}
                </p>
            )}
        </div>
    )
}
