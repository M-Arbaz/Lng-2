'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { useNavigate } from '@/lib/navigation'

export default function PublicContentLayout({
    title,
    description = '',
    content = '',
    loading = false,
    emptyMessage = 'Information will be available soon.',
}) {
    const navigate = useNavigate()

    return (
        <main className="w-full bg-[#F7F4EF] text-[#281912]">
            {/* ───────── PAGE HEADER ───────── */}
            <section className="border-b border-[#3A2117]/10">
                <div className="mx-auto w-full max-w-[1400px] px-4 pt-7 sm:px-6 sm:pt-9 lg:px-10">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
              inline-flex min-h-[40px] items-center gap-2
              rounded-full border border-[#3A2117]/12
              bg-[#FFFEFC] px-4
              text-[11px] font-semibold text-[#3A2117]
              transition-colors
              hover:border-[#6B4228]/30 hover:bg-[#EEE5DC]
            "
                    >
                        <ArrowLeft size={14} strokeWidth={1.8} />
                        Back
                    </button>

                    <div className="mx-auto max-w-4xl py-10 text-center sm:py-12 lg:py-14">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8A654D]">
                            Lamp &amp; Glow
                        </p>

                        <h1 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#281912]">
                            {title}
                        </h1>

                        {description && (
                            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#7A6A60] sm:text-[15px]">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* ───────── CONTENT ───────── */}
            <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
                <div className="mx-auto w-full max-w-[1000px]">
                    {loading ? (
                        <div className="flex min-h-[240px] items-center justify-center">
                            <div className="text-center">
                                <Loader2
                                    size={28}
                                    className="mx-auto animate-spin text-[#6B4228]"
                                />

                                <p className="mt-3 text-xs text-[#8A7569]">
                                    Loading information...
                                </p>
                            </div>
                        </div>
                    ) : content ? (
                        <div
                            className="
                page-content
                max-w-none
                break-words
                text-[14px]
                leading-7
                text-[#5F4C42]
                sm:text-[15px]

                [&_*]:max-w-full

                [&_h1]:!mb-4
                [&_h1]:!mt-8
                [&_h1]:!text-2xl
                [&_h1]:!font-semibold
                [&_h1]:!leading-tight
                [&_h1]:!text-[#281912]

                [&_h2]:!mb-3
                [&_h2]:!mt-8
                [&_h2]:!text-xl
                [&_h2]:!font-semibold
                [&_h2]:!leading-tight
                [&_h2]:!text-[#3A2117]

                [&_h3]:!mb-2
                [&_h3]:!mt-6
                [&_h3]:!text-base
                [&_h3]:!font-semibold
                [&_h3]:!text-[#3A2117]

                [&_p]:!mb-4
                [&_p]:!leading-7

                [&_strong]:!font-semibold
                [&_strong]:!text-[#3A2117]

                [&_a]:!font-medium
                [&_a]:!text-[#6B4228]
                [&_a]:underline
                [&_a]:underline-offset-4
                hover:[&_a]:!text-[#3A2117]

                [&_ul]:!my-4
                [&_ol]:!my-4
                [&_li]:!mb-2
                [&_li]:!leading-7

                [&_blockquote]:!my-6
                [&_blockquote]:!border-l-[#6B4228]
                [&_blockquote]:!bg-[#EEE5DC]
                [&_blockquote]:!px-5
                [&_blockquote]:!py-4
                [&_blockquote]:!text-[#5F4C42]

                [&_hr]:!my-8
                [&_hr]:!border-[#3A2117]/10

                [&_img]:!mx-auto
                [&_img]:!my-6
                [&_img]:!rounded-2xl

                [&_table]:!my-6
                [&_table]:block
                [&_table]:max-w-full
                [&_table]:overflow-x-auto

                [&_th]:!bg-[#EEE5DC]
                [&_th]:!text-[#3A2117]
                [&_td]:!border-[#3A2117]/10
              "
                            style={{
                                overflowWrap: 'anywhere',
                            }}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <div className="rounded-[22px] border border-[#3A2117]/10 bg-[#FFFEFC] px-5 py-12 text-center">
                            <p className="text-sm font-semibold text-[#281912]">
                                Content unavailable
                            </p>

                            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#8A7569]">
                                {emptyMessage}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}