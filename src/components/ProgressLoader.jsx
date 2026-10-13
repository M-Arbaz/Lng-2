'use client'

export default function ProgressLoader({ progress = 0 }) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)))

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FAFAF8]/85 backdrop-blur-md">
      <div className="flex w-[280px] flex-col items-center rounded-3xl border border-black/[0.06] bg-white/90 px-7 py-8 shadow-2xl shadow-black/10">

        {/* Modern animated loader */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-stone-200" />

          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#B8860B] border-r-[#6F3B16]" />

          <div className="absolute inset-[9px] flex items-center justify-center rounded-full bg-[#FAFAF8]">
            <span className="text-2xl text-[#8A5A22]">✦</span>
          </div>
        </div>

        {/* Brand */}
        <h2 className="mt-5 text-lg font-semibold tracking-wide text-stone-900">
          Lamp & Glow
        </h2>

        <p className="mt-1 text-xs text-stone-500">
          Loading...
        </p>

        {/* Progress */}
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-[#6F3B16] via-[#B8860B] to-[#D6B35A] transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          >
            <div className="absolute inset-0 animate-pulse bg-white/20" />
          </div>
        </div>

        <span className="mt-2 text-[11px] font-medium tabular-nums text-stone-400">
          {pct}%
        </span>
      </div>
    </div>
  )
}