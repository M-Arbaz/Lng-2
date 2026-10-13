import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found | Lamp & Glow',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold text-[#8a6000]">404</p>
        <h1 className="mt-2 text-3xl font-bold text-[#222222]">Page not found</h1>
        <p className="mt-3 text-sm text-[#666666]">The page you requested does not exist or may have moved.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-[#5A2D0C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#FFD400] hover:text-[#222222]">
          Back to home
        </Link>
      </div>
    </section>
  )
}
