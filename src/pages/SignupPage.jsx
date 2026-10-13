'use client'

import React, { useState } from 'react'
import { useNavigate, Link } from '@/lib/navigation'
import { useAuth } from '../context/AuthContext'
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader,
  Eye,
  EyeOff,
} from 'lucide-react'

export default function SignupPage({ theme = 'light' }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const {
    signup,
    signInWithGoogle,
  } = useAuth()

  const isDark = theme === 'dark'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      await signup(
        email,
        password,
        firstName,
        lastName,
      )

      navigate('/')
    } catch (err) {
      setError(
        err.message ||
        'Signup failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      await signInWithGoogle()
      navigate('/')
    } catch (err) {
      setError(
        err.message ||
        'Google sign-in failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass = isDark
    ? `
        h-12 w-full rounded-xl
        border border-white/10
        bg-white/[0.04]
        pl-11 pr-4
        text-sm text-white
        outline-none
        transition
        placeholder:text-stone-600
        focus:border-[#B78353]
        focus:ring-2
        focus:ring-[#B78353]/15
      `
    : `
        h-12 w-full rounded-xl
        border border-[#DED3C9]
        bg-[#FFFCF9]
        pl-11 pr-4
        text-sm text-[#30251E]
        outline-none
        transition
        placeholder:text-[#B1A297]
        focus:border-[#A96F42]
        focus:ring-2
        focus:ring-[#A96F42]/10
      `

  const passwordInputClass = isDark
    ? `
        h-12 w-full rounded-xl
        border border-white/10
        bg-white/[0.04]
        pl-11 pr-12
        text-sm text-white
        outline-none
        transition
        placeholder:text-stone-600
        focus:border-[#B78353]
        focus:ring-2
        focus:ring-[#B78353]/15
      `
    : `
        h-12 w-full rounded-xl
        border border-[#DED3C9]
        bg-[#FFFCF9]
        pl-11 pr-12
        text-sm text-[#30251E]
        outline-none
        transition
        placeholder:text-[#B1A297]
        focus:border-[#A96F42]
        focus:ring-2
        focus:ring-[#A96F42]/10
      `

  const labelClass = isDark
    ? 'mb-1.5 block text-xs font-medium text-stone-300'
    : 'mb-1.5 block text-xs font-medium text-[#59483D]'

  const iconClass = isDark
    ? 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500'
    : 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A49284]'

  const eyeButtonClass = isDark
    ? `
        absolute right-3 top-1/2
        flex h-8 w-8
        -translate-y-1/2
        items-center justify-center
        rounded-lg
        text-stone-500
        transition
        hover:bg-white/5
        hover:text-white
      `
    : `
        absolute right-3 top-1/2
        flex h-8 w-8
        -translate-y-1/2
        items-center justify-center
        rounded-lg
        text-[#99887B]
        transition
        hover:bg-[#F4ECE5]
        hover:text-[#5A3422]
      `

  return (
    <section
      className={
        isDark
          ? 'flex min-h-[calc(100dvh-6.5rem)] w-full items-center justify-center bg-[#1F1F1F] px-4 py-8 sm:px-6 lg:min-h-[calc(100dvh-7.5rem)] lg:px-8 lg:py-10'
          : 'flex min-h-[calc(100dvh-6.5rem)] w-full items-center justify-center bg-[#FAF8F5] px-4 py-8 sm:px-6 lg:min-h-[calc(100dvh-7.5rem)] lg:px-8 lg:py-10'
      }
    >
      <div
        className={
          isDark
            ? 'grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-white/10 bg-[#242220] shadow-[0_24px_70px_rgba(0,0,0,0.28)] lg:grid-cols-[0.9fr_1.1fr]'
            : 'grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-[#E8DED4] bg-white shadow-[0_24px_70px_rgba(76,45,24,0.10)] lg:grid-cols-[0.9fr_1.1fr]'
        }
      >
        {/* LEFT BRAND PANEL */}
        <div
          className="
            relative hidden overflow-hidden
            bg-gradient-to-br
            from-[#382015]
            via-[#5A3422]
            to-[#74482C]
            p-10
            lg:flex
            lg:flex-col
            lg:justify-between
          "
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#D8A66A]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-black/20 blur-3xl" />

          {/* LOGO */}
          <div className="relative z-10">
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Go to Lamp & Glow home"
              className="
                inline-flex items-center justify-center
                rounded-2xl
                border border-white/20
                bg-[#FFF8F0]/95
                p-2.5
                shadow-[0_8px_24px_rgba(0,0,0,0.14)]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)]
              "
            >
              <img
                src="/logo.png"
                alt="Lamp & Glow"
                className="h-[72px] w-[72px] object-contain"
              />
            </button>
          </div>

          {/* BRAND COPY */}
          <div className="relative z-10 max-w-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#DDBB91]">
              Join Lamp & Glow
            </p>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] text-white">
              Create your space.
              <br />
              Make it yours.
            </h1>

            <p className="mt-4 max-w-xs text-sm leading-6 text-white/65">
              Create your account to save favourites,
              manage orders and enjoy a more personal
              Lamp & Glow experience.
            </p>
          </div>

          <p className="relative z-10 text-[10px] uppercase tracking-[0.18em] text-white/35">
            Lamp & Glow
          </p>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="flex items-center">
          <div className="w-full p-5 sm:p-8 lg:p-9 xl:p-10">
            {/* MOBILE LOGO */}
            <div className="mb-5 flex justify-center lg:hidden">
              <button
                type="button"
                onClick={() => navigate('/')}
                aria-label="Go to Lamp & Glow home"
              >
                <img
                  src="/logo.png"
                  alt="Lamp & Glow"
                  className="h-20 w-20 object-contain"
                />
              </button>
            </div>

            {/* HEADING */}
            <div className="mb-6 text-center lg:text-left">
              <p
                className={
                  isDark
                    ? 'text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D7A85B]'
                    : 'text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A6841]'
                }
              >
                Create Account
              </p>

              <h2
                className={
                  isDark
                    ? 'mt-2 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[28px]'
                    : 'mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#30241D] sm:text-[28px]'
                }
              >
                Join Lamp & Glow
              </h2>

              <p
                className={
                  isDark
                    ? 'mt-2 text-sm text-stone-400'
                    : 'mt-2 text-sm text-[#837266]'
                }
              >
                Enter your details to create your account.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div
                className={
                  isDark
                    ? 'mb-5 flex items-start gap-3 rounded-xl border border-red-900/60 bg-red-950/30 p-3.5'
                    : 'mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5'
                }
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <p
                  className={
                    isDark
                      ? 'text-sm leading-5 text-red-300'
                      : 'text-sm leading-5 text-red-700'
                  }
                >
                  {error}
                </p>
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >
              {/* NAME ROW */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="signup-first-name"
                    className={labelClass}
                  >
                    First Name
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      strokeWidth={1.8}
                      className={iconClass}
                    />

                    <input
                      id="signup-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) =>
                        setFirstName(e.target.value)
                      }
                      required
                      autoComplete="given-name"
                      placeholder="First name"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-last-name"
                    className={labelClass}
                  >
                    Last Name
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      strokeWidth={1.8}
                      className={iconClass}
                    />

                    <input
                      id="signup-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) =>
                        setLastName(e.target.value)
                      }
                      required
                      autoComplete="family-name"
                      placeholder="Last name"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="signup-email"
                  className={labelClass}
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    strokeWidth={1.8}
                    className={iconClass}
                  />

                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* PASSWORD ROW */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="signup-password"
                    className={labelClass}
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      strokeWidth={1.8}
                      className={iconClass}
                    />

                    <input
                      id="signup-password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={passwordInputClass}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev,
                        )
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      className={eyeButtonClass}
                    >
                      {showPassword ? (
                        <EyeOff
                          size={17}
                          strokeWidth={1.8}
                        />
                      ) : (
                        <Eye
                          size={17}
                          strokeWidth={1.8}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className={labelClass}
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      strokeWidth={1.8}
                      className={iconClass}
                    />

                    <input
                      id="signup-confirm-password"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value,
                        )
                      }
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={passwordInputClass}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev,
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                      className={eyeButtonClass}
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={17}
                          strokeWidth={1.8}
                        />
                      ) : (
                        <Eye
                          size={17}
                          strokeWidth={1.8}
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={loading}
                className="
                  flex h-12 w-full
                  items-center justify-center gap-2
                  rounded-xl
                  bg-[#5A3422]
                  px-5
                  text-sm font-semibold
                  text-white
                  shadow-[0_7px_18px_rgba(90,52,34,0.18)]
                  transition-all duration-200
                  hover:bg-[#452719]
                  hover:shadow-[0_9px_22px_rgba(90,52,34,0.24)]
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading && (
                  <Loader
                    size={17}
                    className="animate-spin"
                  />
                )}

                {loading
                  ? 'Creating account...'
                  : 'Create Account'}
              </button>
            </form>

            {/* DIVIDER */}
            <div className="my-4 flex items-center gap-3">
              <div
                className={
                  isDark
                    ? 'h-px flex-1 bg-white/10'
                    : 'h-px flex-1 bg-[#E7DED6]'
                }
              />

              <span
                className={
                  isDark
                    ? 'text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500'
                    : 'text-[10px] font-medium uppercase tracking-[0.14em] text-[#A39284]'
                }
              >
                Or continue with
              </span>

              <div
                className={
                  isDark
                    ? 'h-px flex-1 bg-white/10'
                    : 'h-px flex-1 bg-[#E7DED6]'
                }
              />
            </div>

            {/* GOOGLE */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={
                isDark
                  ? 'flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-stone-200 transition hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-50'
                  : 'flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#DED3C9] bg-white px-4 text-sm font-medium text-[#493A30] transition hover:border-[#CFB7A4] hover:bg-[#FCF8F4] disabled:opacity-50'
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.18c0-.71-.06-1.4-.18-2.07H12v3.91h5.24a4.48 4.48 0 0 1-1.94 2.94v2.54h3.14c1.84-1.69 2.91-4.19 2.91-7.32Z"
                />

                <path
                  fill="#34A853"
                  d="M12 21.7c2.62 0 4.82-.87 6.43-2.36l-3.14-2.54c-.87.58-1.98.93-3.29.93-2.53 0-4.67-1.71-5.44-4.01H3.32v2.62A9.7 9.7 0 0 0 12 21.7Z"
                />

                <path
                  fill="#FBBC05"
                  d="M6.56 13.72A5.84 5.84 0 0 1 6.25 12c0-.6.11-1.18.31-1.72V7.66H3.32A9.7 9.7 0 0 0 2.3 12c0 1.56.37 3.04 1.02 4.34l3.24-2.62Z"
                />

                <path
                  fill="#EA4335"
                  d="M12 6.27c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.82 3.36 14.62 2.3 12 2.3a9.7 9.7 0 0 0-8.68 5.36l3.24 2.62C7.33 7.98 9.47 6.27 12 6.27Z"
                />
              </svg>

              Continue with Google
            </button>

            {/* LOGIN LINK */}
            <div
              className={
                isDark
                  ? 'mt-5 border-t border-white/10 pt-4'
                  : 'mt-5 border-t border-[#ECE4DD] pt-4'
              }
            >
              <p
                className={
                  isDark
                    ? 'text-center text-sm text-stone-400'
                    : 'text-center text-sm text-[#7C6A5D]'
                }
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  className={
                    isDark
                      ? 'font-semibold text-[#D7A85B] transition hover:text-[#E8C999]'
                      : 'font-semibold text-[#7A492A] transition hover:text-[#4C2B19]'
                  }
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}