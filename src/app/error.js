'use client'

export default function ErrorPage({ reset }) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-bold text-[#222222]">Something went wrong</h1>
        <p className="mt-3 text-sm text-[#666666]">Please try loading this page again.</p>
        <button onClick={() => reset()} className="mt-6 rounded-full bg-[#5A2D0C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#FFD400] hover:text-[#222222]">
          Try again
        </button>
      </div>
    </section>
  )
}
