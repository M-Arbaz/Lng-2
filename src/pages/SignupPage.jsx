'use client'

import React, { useState } from 'react';
import { useNavigate, Link } from '@/lib/navigation';
import { useAuth, signInWithGoogle } from '../context/AuthContext';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function SignupPage({ theme = 'light' }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, firstName, lastName);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#1F1F1F] flex items-center justify-center px-4' : 'min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4'}>
      <div className="w-full max-w-md">
        <div className={theme === 'dark' ? 'bg-[#2A2A2A] rounded-lg shadow-xl p-8' : 'bg-white rounded-lg shadow-xl p-8'}>
          <div className="text-center mb-8">
            <h1 className={theme === 'dark' ? 'text-3xl font-bold text-[#FFD400]' : 'text-3xl font-bold text-[#5A2D0C]'}>LampandGlow</h1>
            <p className={theme === 'dark' ? 'text-stone-300 mt-2' : 'text-stone-600 mt-2'}>Create your account</p>
          </div>

          {error && (
            <div className={theme === 'dark' ? 'bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 flex items-start gap-3' : 'bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3'}>
              <AlertCircle className="text-[#E53935] flex-shrink-0 mt-0.5" size={20} />
              <p className={theme === 'dark' ? 'text-red-300 text-sm' : 'text-red-700 text-sm'}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={theme === 'dark' ? 'block text-sm font-medium text-stone-200 mb-1' : 'block text-sm font-medium text-stone-700 mb-1'}>First Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={theme === 'dark' ? 'w-full pl-10 pr-4 py-2 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-[#2A2A2A] text-stone-100 placeholder:text-stone-500' : 'w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-stone-900 placeholder:text-stone-400'}
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className={theme === 'dark' ? 'block text-sm font-medium text-stone-200 mb-1' : 'block text-sm font-medium text-stone-700 mb-1'}>Last Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={theme === 'dark' ? 'w-full pl-10 pr-4 py-2 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-[#2A2A2A] text-stone-100 placeholder:text-stone-500' : 'w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-stone-900 placeholder:text-stone-400'}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={theme === 'dark' ? 'block text-sm font-medium text-stone-200 mb-1' : 'block text-sm font-medium text-stone-700 mb-1'}>Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={theme === 'dark' ? 'w-full pl-10 pr-4 py-2 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-[#2A2A2A] text-stone-100 placeholder:text-stone-500' : 'w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-stone-900 placeholder:text-stone-400'}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <div>
                <label
                  className={
                    theme === 'dark'
                      ? 'block text-sm font-medium text-stone-200 mb-1'
                      : 'block text-sm font-medium text-stone-700 mb-1'
                  }
                >
                  Password
                </label>

                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-stone-400" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={
                      theme === 'dark'
                        ? 'w-full pl-10 pr-12 py-2 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-[#2A2A2A] text-stone-100 placeholder:text-stone-500'
                        : 'w-full pl-10 pr-12 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-stone-900 placeholder:text-stone-400'
                    }
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={
                      theme === 'dark'
                        ? 'absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition'
                        : 'absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition'
                    }
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div>
                <label
                  className={
                    theme === 'dark'
                      ? 'block text-sm font-medium text-stone-200 mb-1'
                      : 'block text-sm font-medium text-stone-700 mb-1'
                  }
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-stone-400" />

                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={
                      theme === 'dark'
                        ? 'w-full pl-10 pr-12 py-2 border border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-[#2A2A2A] text-stone-100 placeholder:text-stone-500'
                        : 'w-full pl-10 pr-12 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-stone-900 placeholder:text-stone-400'
                    }
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className={
                      theme === 'dark'
                        ? 'absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition'
                        : 'absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition'
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5A2D0C] hover:bg-[#7A4A20] text-white font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <div className="flex items-center gap-3 my-6">
            <div
              className={
                theme === 'dark'
                  ? 'flex-1 h-px bg-stone-700'
                  : 'flex-1 h-px bg-stone-200'
              }
            />

            <span
              className={
                theme === 'dark'
                  ? 'text-sm text-stone-400'
                  : 'text-sm text-stone-500'
              }
            >
              OR
            </span>

            <div
              className={
                theme === 'dark'
                  ? 'flex-1 h-px bg-stone-700'
                  : 'flex-1 h-px bg-stone-200'
              }
            />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={
              theme === 'dark'
                ? 'w-full border border-stone-600 bg-[#2A2A2A] hover:bg-stone-800 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-3 disabled:opacity-50'
                : 'w-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-3 disabled:opacity-50'
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
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
          <div className={theme === 'dark' ? 'mt-6 pt-6 border-t border-stone-700' : 'mt-6 pt-6 border-t border-stone-200'}>
            <p className={theme === 'dark' ? 'text-center text-stone-300 text-sm' : 'text-center text-stone-600 text-sm'}>
              Already have an account?{' '}
              <Link to="/login" className="text-[#FFD400] hover:text-[#FFE566] font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}