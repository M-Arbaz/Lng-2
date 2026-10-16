'use client'

import { useState } from 'react'
import { useNavigate } from '@/lib/navigation'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { adminLogin } = useAdminAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const email = formData.email.trim()
    const password = formData.password

    if (!email || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await adminLogin(email, password)

      if (!result?.admin) {
        setError('Invalid admin email or password.')
        return
      }

      navigate('/admin/dashboard')
    } catch (err) {
      console.error('Admin login failed:', err)
      setError('Unable to sign in right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F4EF] px-4 py-6 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-32 -top-40 h-[420px] w-[420px] rounded-full bg-[#DCC7B8]/30 blur-3xl" />

        <div className="absolute -bottom-48 -right-24 h-[500px] w-[500px] rounded-full bg-[#B99A84]/20 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.48),transparent_58%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[30px] border border-[#E6DCD4] bg-[#FFFEFC] shadow-[0_30px_90px_rgba(58,33,23,0.14)] lg:grid-cols-[0.92fr_1.08fr]">
          {/* Left brand panel */}
          <section className="relative hidden min-h-[650px] overflow-hidden bg-[#3A2117] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
            <div
              aria-hidden="true"
              className="absolute inset-0"
            >
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />

              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-tr-full bg-[#6B4228]/40" />

              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_35%,rgba(255,255,255,0.025)_35%,rgba(255,255,255,0.025)_50%,transparent_50%)] bg-[length:24px_24px]" />
            </div>

            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-sm backdrop-blur">
                <span className="text-sm font-bold tracking-[0.16em] text-[#F7F4EF]">
                  L&G
                </span>
              </div>

              <div className="mt-10 max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8C4B6]">
                  Lamp & Glow
                </p>

                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.03em] text-white xl:text-[44px]">
                  Manage your store with clarity.
                </h1>

                <p className="mt-5 max-w-sm text-sm leading-7 text-[#D9CCC4]">
                  Products, orders, customers and storefront content — all
                  managed from one secure workspace.
                </p>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 border-t border-white/10 pt-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-[#F0E6DF]" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Authorized access only
                  </p>

                  <p className="mt-0.5 text-xs text-[#BEAAA0]">
                    Lamp & Glow management portal
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Login area */}
          <section className="flex min-h-[620px] items-center justify-center px-5 py-10 sm:px-10 lg:min-h-[650px] lg:px-14 xl:px-20">
            <div className="w-full max-w-md">
              {/* Mobile branding */}
              <div className="mb-8 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3A2117]">
                    <span className="text-xs font-bold tracking-[0.14em] text-white">
                      L&G
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#281912]">
                      Lamp & Glow
                    </p>

                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8D7465]">
                      Admin Console
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E7DCD4] bg-[#F7F4EF] px-3 py-1.5">
                  <LockKeyhole className="h-3.5 w-3.5 text-[#6B4228]" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B4228]">
                    Secure Admin Access
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.025em] text-[#281912] sm:text-[34px]">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#806C60]">
                  Sign in to continue to the Lamp & Glow administration panel.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-7 flex items-start gap-3 rounded-2xl border border-[#E9C3BE] bg-[#FFF4F2] p-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#F8DCD8]">
                    <AlertCircle className="h-4 w-4 text-[#A54137]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#7D2E27]">
                      Sign in failed
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-[#96584F]">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#3A2A22]"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A18B7E] transition group-focus-within:text-[#6B4228]" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="username"
                      placeholder="Enter admin email"
                      disabled={loading}
                      className="h-13 w-full rounded-2xl border border-[#DCCFC6] bg-white py-3.5 pl-12 pr-4 text-sm text-[#281912] outline-none transition placeholder:text-[#B6A59A] focus:border-[#8C6650] focus:ring-4 focus:ring-[#6B4228]/10 disabled:cursor-not-allowed disabled:bg-[#F3EFEA]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-[#3A2A22]"
                    >
                      Password
                    </label>
                  </div>

                  <div className="group relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#A18B7E] transition group-focus-within:text-[#6B4228]" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={loading}
                      className="h-13 w-full rounded-2xl border border-[#DCCFC6] bg-white py-3.5 pl-12 pr-12 text-sm text-[#281912] outline-none transition placeholder:text-[#B6A59A] focus:border-[#8C6650] focus:ring-4 focus:ring-[#6B4228]/10 disabled:cursor-not-allowed disabled:bg-[#F3EFEA]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      disabled={loading}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#8D776A] transition hover:bg-[#F2ECE7] hover:text-[#3A2117] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3A2117] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(58,33,23,0.20)] transition duration-200 hover:bg-[#4A2A1E] hover:shadow-[0_16px_34px_rgba(58,33,23,0.25)] focus:outline-none focus:ring-4 focus:ring-[#6B4228]/20 disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-[18px] w-[18px] animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to Admin
                      <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Security footer */}
              <div className="mt-8 border-t border-[#EEE5DE] pt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7B5A47]" />

                  <p className="text-xs leading-5 text-[#8B776B]">
                    This portal is restricted to authorized Lamp & Glow
                    administrators.
                  </p>
                </div>
              </div>

              <p className="mt-8 text-center text-[11px] text-[#A08C80]">
                © 2026 Lamp & Glow. All rights reserved.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}