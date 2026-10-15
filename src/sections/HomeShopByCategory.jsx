'use client'

import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/lib/navigation'
import { slugify } from '../utils/slugify.js'

const CATEGORY_SLOTS = [
    {
        key: 'table',
        label: 'Table Lamps',
        keywords: ['table lamp', 'table lamps', 'table'],
    },
    {
        key: 'floor',
        label: 'Floor Lamps',
        keywords: ['floor lamp', 'floor lamps', 'floor'],
    },
    {
        key: 'wall',
        label: 'Wall Lamps',
        keywords: ['wall lamp', 'wall lamps', 'wall light', 'wall'],
    },
    {
        key: 'ceiling',
        label: 'Ceiling',
        keywords: ['ceiling lamp', 'ceiling lamps', 'ceiling light', 'ceiling'],
    },
]

function normalize(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
}

function findCategory(categories, slot) {
    return categories.find((category) => {
        const title = normalize(
            category.title || category.id
        )

        return slot.keywords.some((keyword) =>
            title.includes(keyword)
        )
    })
}

export default function HomeShopByCategory({
    categories = [],
    theme = 'light',
}) {
    const isDark = theme === 'dark'

    const cards = CATEGORY_SLOTS.map((slot) => ({
        ...slot,
        category: findCategory(categories, slot),
    })).filter((item) => item.category)

    if (cards.length === 0) {
        return null
    }

    return (
        <section
            className={`w-full border-b py-10 transition-colors duration-300 sm:py-12 lg:py-14 ${isDark
                    ? 'border-white/10 bg-[#171310]'
                    : 'border-[#3A2117]/10 bg-[#F7F4EF]'
                }`}
        >
            <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">

                {/* HEADER */}
                <div className="mb-7 text-center sm:mb-9">
                    <p
                        className={`text-[9px] font-semibold uppercase tracking-[0.26em] ${isDark
                                ? 'text-[#D8AD87]'
                                : 'text-[#8A654D]'
                            }`}
                    >
                        Find Your Light
                    </p>

                    <h2
                        className={`mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl ${isDark
                                ? 'text-[#FFF8F1]'
                                : 'text-[#281912]'
                            }`}
                    >
                        Shop by Category
                    </h2>

                    <p
                        className={`mx-auto mt-2.5 max-w-xl text-[11px] leading-5 sm:text-xs ${isDark
                                ? 'text-stone-400'
                                : 'text-[#806F64]'
                            }`}
                    >
                        Explore lighting designed for every corner of
                        your home.
                    </p>
                </div>

                {/* CATEGORY CARDS */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {cards.map(({ key, label, category }) => (
                        <Link
                            key={key}
                            to={`/collections/${slugify(category.id)}`}
                            className={`group relative block overflow-hidden rounded-[22px] border shadow-[0_10px_30px_rgba(58,33,23,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(58,33,23,0.12)] ${isDark
                                    ? 'border-white/10 bg-[#241C18]'
                                    : 'border-[#3A2117]/10 bg-[#EAE1D9]'
                                }`}
                        >
                            {/* IMAGE */}
                            <div className="relative aspect-[4/5] overflow-hidden">
                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt={category.title || label}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]"
                                    />
                                ) : (
                                    <div
                                        className={`h-full w-full ${isDark
                                                ? 'bg-[#302620]'
                                                : 'bg-[#E9DED5]'
                                            }`}
                                    />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-[#21120C]/90 via-[#21120C]/10 to-transparent" />

                                {/* ARROW */}
                                <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/15 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-white group-hover:text-[#3A2117]">
                                    <ArrowUpRight
                                        size={15}
                                        strokeWidth={1.8}
                                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                    />
                                </span>

                                {/* CONTENT */}
                                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/65">
                                        Lamp &amp; Glow
                                    </p>

                                    <h3 className="mt-1 text-base font-semibold tracking-[-0.02em] text-white sm:text-lg lg:text-xl">
                                        {label}
                                    </h3>

                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-[9px] font-medium text-white/80">
                                            Explore
                                        </span>

                                        <span className="h-px w-5 bg-white/50 transition-all duration-300 group-hover:w-8" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}