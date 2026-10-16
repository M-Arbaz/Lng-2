'use client'

import {
    ArrowLeft,
    FileText,
    Loader2,
    Sparkles,
} from 'lucide-react'

import {
    useNavigate,
} from '@/lib/navigation'

import {
    useAppState,
} from '@/context/AppStateContext'

export default function PublicContentLayout({
    title,
    description = '',
    content = '',
    loading = false,
    emptyMessage = 'Information will be available soon.',
}) {
    const navigate =
        useNavigate()

    const {
        theme,
    } = useAppState()

    const isDark =
        theme === 'dark'

    const pageBackground =
        isDark
            ? 'bg-[#171310]'
            : 'bg-[#F7F4EF]'

    const headerBackground =
        isDark
            ? 'bg-[#211711]'
            : 'bg-[#F7F4EF]'

    const cardBackground =
        isDark
            ? 'border-[#49352B] bg-[#251A15]'
            : 'border-[#E2D6CE] bg-[#FFFEFC]'

    const headingText =
        isDark
            ? 'text-[#FFF8F1]'
            : 'text-[#281912]'

    const bodyText =
        isDark
            ? 'text-[#CBBAB0]'
            : 'text-[#5F4C42]'

    const mutedText =
        isDark
            ? 'text-[#A99487]'
            : 'text-[#7A6A60]'

    const accentText =
        isDark
            ? 'text-[#D8AD87]'
            : 'text-[#8A654D]'

    return (
        <main
            className={`relative min-h-screen w-full overflow-hidden transition-colors duration-300 ${pageBackground} ${headingText}`}
        >
            {/* Decorative glow */}
            <div
                className={`pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full blur-[120px] ${isDark
                        ? 'bg-[#6B4228]/15'
                        : 'bg-[#D7B89F]/20'
                    }`}
            />

            {/* =========================
          PAGE HEADER
      ========================== */}
            <section
                className={`relative border-b transition-colors duration-300 ${isDark
                        ? 'border-[#3C2A22]'
                        : 'border-[#3A2117]/10'
                    } ${headerBackground}`}
            >
                <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-10">
                    {/* Back */}
                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className={`inline-flex min-h-[42px] items-center gap-2 rounded-full border px-4 text-[11px] font-semibold transition-all duration-200 ${isDark
                                ? 'border-white/10 bg-white/[0.04] text-[#E6D5CA] hover:border-[#D8AD87]/35 hover:bg-white/[0.08]'
                                : 'border-[#3A2117]/12 bg-[#FFFEFC] text-[#3A2117] hover:border-[#6B4228]/30 hover:bg-[#EEE5DC]'
                            }`}
                    >
                        <ArrowLeft
                            size={14}
                            strokeWidth={1.8}
                        />

                        Back
                    </button>

                    {/* Hero text */}
                    <div className="mx-auto max-w-4xl px-2 py-10 text-center sm:py-14 lg:py-16">
                        <div
                            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark
                                    ? 'border-[#5B4033] bg-[#2D201A] text-[#D8AD87]'
                                    : 'border-[#E2D4CA] bg-[#FFFEFC] text-[#6B4228]'
                                }`}
                        >
                            <FileText
                                size={19}
                                strokeWidth={1.7}
                            />
                        </div>

                        <div className="mt-5 flex items-center justify-center gap-2">
                            <span
                                className={`h-px w-7 ${isDark
                                        ? 'bg-[#D8AD87]/40'
                                        : 'bg-[#8A654D]/35'
                                    }`}
                            />

                            <p
                                className={`text-[9px] font-semibold uppercase tracking-[0.28em] ${accentText}`}
                            >
                                Lamp &amp; Glow
                            </p>

                            <span
                                className={`h-px w-7 ${isDark
                                        ? 'bg-[#D8AD87]/40'
                                        : 'bg-[#8A654D]/35'
                                    }`}
                            />
                        </div>

                        <h1
                            className={`mx-auto mt-4 max-w-4xl break-words text-[clamp(2rem,5vw,3.8rem)] font-semibold leading-[1.06] tracking-[-0.045em] ${headingText}`}
                        >
                            {title ||
                                'Information'}
                        </h1>

                        {description && (
                            <p
                                className={`mx-auto mt-5 max-w-2xl break-words text-sm leading-7 sm:text-[15px] ${mutedText}`}
                            >
                                {description}
                            </p>
                        )}

                        <div className="mt-7 flex items-center justify-center gap-2">
                            <Sparkles
                                size={12}
                                className={
                                    accentText
                                }
                            />

                            <span
                                className={`text-[10px] font-medium uppercase tracking-[0.12em] ${mutedText}`}
                            >
                                Lamp &amp; Glow
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================
          CONTENT AREA
      ========================== */}
            <section className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
                <div className="mx-auto w-full max-w-[980px]">
                    {loading ? (
                        <div
                            className={`flex min-h-[320px] items-center justify-center rounded-[28px] border ${isDark
                                    ? 'border-[#49352B] bg-[#251A15]'
                                    : 'border-[#E2D6CE] bg-[#FFFEFC]'
                                }`}
                        >
                            <div className="text-center">
                                <div
                                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${isDark
                                            ? 'bg-[#33231C]'
                                            : 'bg-[#F0E8E1]'
                                        }`}
                                >
                                    <Loader2
                                        size={23}
                                        className={`animate-spin ${isDark
                                                ? 'text-[#D8AD87]'
                                                : 'text-[#6B4228]'
                                            }`}
                                    />
                                </div>

                                <p
                                    className={`mt-4 text-sm font-medium ${mutedText}`}
                                >
                                    Loading
                                    information...
                                </p>

                                <p
                                    className={`mt-1 text-xs ${mutedText}`}
                                >
                                    Please wait a
                                    moment.
                                </p>
                            </div>
                        </div>
                    ) : content ? (
                        <article
                            className={`overflow-hidden rounded-[26px] border shadow-[0_18px_55px_rgba(58,33,23,0.06)] transition-colors duration-300 sm:rounded-[30px] ${cardBackground}`}
                        >
                            {/* Content accent */}
                            <div
                                className={`h-[3px] w-full ${isDark
                                        ? 'bg-gradient-to-r from-transparent via-[#A87557] to-transparent'
                                        : 'bg-gradient-to-r from-transparent via-[#6B4228]/50 to-transparent'
                                    }`}
                            />

                            <div className="px-5 py-7 sm:px-8 sm:py-10 md:px-10 lg:px-12 lg:py-12">
                                <div
                                    className={`
                    page-content

                    min-w-0
                    max-w-none
                    break-words
                    [overflow-wrap:anywhere]

                    text-[14px]
                    leading-7
                    sm:text-[15px]
                    sm:leading-8

                    ${isDark
                                            ? 'text-[#CBBAB0]'
                                            : 'text-[#5F4C42]'
                                        }

                    [&_*]:max-w-full

                    /* H1 */
                    [&_h1]:!mb-5
                    [&_h1]:!mt-10
                    [&_h1]:!break-words
                    [&_h1]:!text-2xl
                    [&_h1]:!font-semibold
                    [&_h1]:!leading-[1.2]
                    [&_h1]:!tracking-[-0.025em]
                    sm:[&_h1]:!text-3xl

                    ${isDark
                                            ? '[&_h1]:!text-[#FFF8F1]'
                                            : '[&_h1]:!text-[#281912]'
                                        }

                    [&_h1:first-child]:!mt-0

                    /* H2 */
                    [&_h2]:!mb-4
                    [&_h2]:!mt-10
                    [&_h2]:!break-words
                    [&_h2]:!text-xl
                    [&_h2]:!font-semibold
                    [&_h2]:!leading-[1.25]
                    [&_h2]:!tracking-[-0.02em]
                    sm:[&_h2]:!text-2xl

                    ${isDark
                                            ? '[&_h2]:!text-[#F7ECE5]'
                                            : '[&_h2]:!text-[#3A2117]'
                                        }

                    [&_h2:first-child]:!mt-0

                    /* H3 */
                    [&_h3]:!mb-3
                    [&_h3]:!mt-8
                    [&_h3]:!break-words
                    [&_h3]:!text-base
                    [&_h3]:!font-semibold
                    [&_h3]:!leading-6
                    sm:[&_h3]:!text-lg

                    ${isDark
                                            ? '[&_h3]:!text-[#F0DED2]'
                                            : '[&_h3]:!text-[#3A2117]'
                                        }

                    /* H4-H6 */
                    [&_h4]:!mb-2
                    [&_h4]:!mt-6
                    [&_h4]:!font-semibold

                    ${isDark
                                            ? '[&_h4]:!text-[#ECD9CD]'
                                            : '[&_h4]:!text-[#4D3124]'
                                        }

                    /* Paragraphs */
                    [&_p]:!mb-5
                    [&_p]:!max-w-full
                    [&_p]:!whitespace-normal
                    [&_p]:!leading-7
                    sm:[&_p]:!leading-8

                    [&_p:last-child]:!mb-0

                    /* Strong */
                    [&_strong]:!font-semibold

                    ${isDark
                                            ? '[&_strong]:!text-[#F1E0D5]'
                                            : '[&_strong]:!text-[#3A2117]'
                                        }

                    /* Emphasis */
                    [&_em]:italic

                    /* Links */
                    [&_a]:!break-all
                    [&_a]:!font-semibold
                    [&_a]:underline
                    [&_a]:underline-offset-4
                    [&_a]:transition-colors

                    ${isDark
                                            ? '[&_a]:!text-[#D8AD87] hover:[&_a]:!text-[#F0C9A6]'
                                            : '[&_a]:!text-[#6B4228] hover:[&_a]:!text-[#3A2117]'
                                        }

                    /* Lists */
                    [&_ul]:!my-5
                    [&_ul]:!ml-5
                    [&_ul]:!list-disc

                    [&_ol]:!my-5
                    [&_ol]:!ml-5
                    [&_ol]:!list-decimal

                    [&_li]:!mb-2
                    [&_li]:!pl-1
                    [&_li]:!leading-7
                    [&_li]:!whitespace-normal

                    [&_li::marker]:!text-[#8A654D]

                    /* Nested lists */
                    [&_li_ul]:!my-2
                    [&_li_ol]:!my-2

                    /* Blockquote */
                    [&_blockquote]:!my-7
                    [&_blockquote]:!rounded-r-2xl
                    [&_blockquote]:!border-l-[3px]
                    [&_blockquote]:!px-5
                    [&_blockquote]:!py-4
                    [&_blockquote]:!italic
                    [&_blockquote]:!leading-7

                    ${isDark
                                            ? '[&_blockquote]:!border-l-[#D8AD87] [&_blockquote]:!bg-[#33231C] [&_blockquote]:!text-[#CBBAB0]'
                                            : '[&_blockquote]:!border-l-[#6B4228] [&_blockquote]:!bg-[#F3EBE4] [&_blockquote]:!text-[#5F4C42]'
                                        }

                    /* Horizontal rule */
                    [&_hr]:!my-9

                    ${isDark
                                            ? '[&_hr]:!border-[#49352B]'
                                            : '[&_hr]:!border-[#3A2117]/10'
                                        }

                    /* Images */
                    [&_img]:!mx-auto
                    [&_img]:!my-7
                    [&_img]:!h-auto
                    [&_img]:!max-w-full
                    [&_img]:!rounded-2xl
                    [&_img]:!object-contain
                    [&_img]:shadow-[0_12px_35px_rgba(58,33,23,0.08)]

                    /* Figure */
                    [&_figure]:!my-7
                    [&_figure]:!max-w-full

                    [&_figcaption]:!mt-2
                    [&_figcaption]:!text-center
                    [&_figcaption]:!text-xs

                    ${isDark
                                            ? '[&_figcaption]:!text-[#A99487]'
                                            : '[&_figcaption]:!text-[#8A7569]'
                                        }

                    /* Tables */
                    [&_table]:!my-7
                    [&_table]:block
                    [&_table]:w-full
                    [&_table]:max-w-full
                    [&_table]:overflow-x-auto
                    [&_table]:whitespace-nowrap
                    [&_table]:rounded-xl
                    [&_table]:border-collapse

                    [&_thead]:!text-left

                    [&_th]:!border
                    [&_th]:!px-4
                    [&_th]:!py-3
                    [&_th]:!text-xs
                    [&_th]:!font-semibold

                    ${isDark
                                            ? '[&_th]:!border-[#4B352A] [&_th]:!bg-[#33231C] [&_th]:!text-[#F0DED2]'
                                            : '[&_th]:!border-[#DFD1C7] [&_th]:!bg-[#EEE5DC] [&_th]:!text-[#3A2117]'
                                        }

                    [&_td]:!border
                    [&_td]:!px-4
                    [&_td]:!py-3
                    [&_td]:!text-sm

                    ${isDark
                                            ? '[&_td]:!border-[#49352B] [&_td]:!text-[#CBBAB0]'
                                            : '[&_td]:!border-[#3A2117]/10 [&_td]:!text-[#5F4C42]'
                                        }

                    /* Code */
                    [&_code]:!break-words
                    [&_code]:!rounded-md
                    [&_code]:!px-1.5
                    [&_code]:!py-0.5
                    [&_code]:!text-[0.9em]

                    ${isDark
                                            ? '[&_code]:!bg-[#382820] [&_code]:!text-[#E5C0A2]'
                                            : '[&_code]:!bg-[#EFE6DE] [&_code]:!text-[#6B4228]'
                                        }

                    /* Preformatted */
                    [&_pre]:!my-6
                    [&_pre]:!max-w-full
                    [&_pre]:!overflow-x-auto
                    [&_pre]:!rounded-xl
                    [&_pre]:!p-4
                    [&_pre]:!text-sm

                    ${isDark
                                            ? '[&_pre]:!bg-[#120E0C] [&_pre]:!text-[#EADCD3]'
                                            : '[&_pre]:!bg-[#2B211C] [&_pre]:!text-[#FFF8F1]'
                                        }

                    /* Embedded content */
                    [&_iframe]:!my-7
                    [&_iframe]:!max-w-full
                    [&_video]:!my-7
                    [&_video]:!h-auto
                    [&_video]:!max-w-full
                    [&_video]:!rounded-2xl
                  `}
                                    style={{
                                        overflowWrap:
                                            'anywhere',
                                        wordBreak:
                                            'normal',
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: content,
                                    }}
                                />
                            </div>
                        </article>
                    ) : (
                        <div
                            className={`rounded-[26px] border px-5 py-14 text-center shadow-[0_15px_45px_rgba(58,33,23,0.05)] sm:px-8 sm:py-16 ${cardBackground}`}
                        >
                            <div
                                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${isDark
                                        ? 'bg-[#33231C] text-[#D8AD87]'
                                        : 'bg-[#F0E8E1] text-[#6B4228]'
                                    }`}
                            >
                                <FileText
                                    size={20}
                                    strokeWidth={1.7}
                                />
                            </div>

                            <p
                                className={`mt-4 text-base font-semibold ${headingText}`}
                            >
                                Content unavailable
                            </p>

                            <p
                                className={`mx-auto mt-2 max-w-md text-sm leading-6 ${mutedText}`}
                            >
                                {emptyMessage}
                            </p>
                        </div>
                    )}

                    {/* Bottom brand note */}
                    {!loading &&
                        content && (
                            <div className="mt-8 text-center sm:mt-10">
                                <div className="flex items-center justify-center gap-3">
                                    <span
                                        className={`h-px w-10 ${isDark
                                                ? 'bg-[#5A4033]'
                                                : 'bg-[#DCCFC6]'
                                            }`}
                                    />

                                    <Sparkles
                                        size={12}
                                        className={
                                            accentText
                                        }
                                    />

                                    <span
                                        className={`h-px w-10 ${isDark
                                                ? 'bg-[#5A4033]'
                                                : 'bg-[#DCCFC6]'
                                            }`}
                                    />
                                </div>

                                <p
                                    className={`mt-3 text-[10px] font-medium uppercase tracking-[0.16em] ${mutedText}`}
                                >
                                    Lamp &amp; Glow
                                </p>
                            </div>
                        )}
                </div>
            </section>
        </main>
    )
}