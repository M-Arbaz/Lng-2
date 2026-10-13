'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocation } from '@/lib/navigation'
import { X, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'
import onboardingService from '../utils/onboardingService.js'

const STORAGE_KEY = 'onboarding_dismissed'

function getDismissedGuides(userId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setDismissedGuides(userId, guideIds) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(guideIds))
}

export default function OnboardingPopup() {
  const location = useLocation()
  const { adminUser } = useAdminAuth()
  const [guide, setGuide] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const userId = adminUser?.uid || adminUser?.email || 'anonymous'

  const loadGuide = useCallback(async () => {
    // Skip onboarding management page itself
    if (location.pathname === '/admin/onboarding') return

    setLoading(true)
    try {
      const g = await onboardingService.getGuideByPath(location.pathname)
      if (g) {
        const dismissed = getDismissedGuides(userId)
        if (!dismissed.includes(g.id)) {
          // Sort steps by order
          const sortedSteps = [...(g.steps || [])].sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          )
          setGuide({ ...g, steps: sortedSteps })
          setCurrentStep(0)
          setShow(true)
        }
      }
    } catch (e) {
      console.error('Error loading onboarding guide:', e)
    } finally {
      setLoading(false)
    }
  }, [location.pathname, userId])

  useEffect(() => {
    // Reset and load guide when path changes
    setShow(false)
    setGuide(null)
    setCurrentStep(0)
    const timer = setTimeout(() => {
      loadGuide()
    }, 500) // slight delay so page renders first
    return () => clearTimeout(timer)
  }, [loadGuide])

  const handleSkip = () => {
    if (guide?.id) {
      const dismissed = getDismissedGuides(userId)
      if (!dismissed.includes(guide.id)) {
        setDismissedGuides(userId, [...dismissed, guide.id])
      }
    }
    setShow(false)
  }

  const handleNext = () => {
    if (guide?.steps && currentStep < guide.steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // Last step — mark as completed
      if (guide?.id) {
        const dismissed = getDismissedGuides(userId)
        if (!dismissed.includes(guide.id)) {
          setDismissedGuides(userId, [...dismissed, guide.id])
        }
      }
      setShow(false)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  if (!show || !guide || !guide.steps?.length) return null

  const step = guide.steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === guide.steps.length - 1
  const totalSteps = guide.steps.length

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Popup Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold text-sm">
              {guide.title || 'Welcome!'}
            </h3>
          </div>
          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg hover:bg-white/20 transition text-white"
            aria-label="Skip"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx <= currentStep
                    ? 'bg-orange-500 w-6'
                    : 'bg-gray-200 w-4'
                }`}
              />
            ))}
            <span className="ml-2 text-xs text-gray-400 font-medium">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>

          {/* Step Title */}
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            {step?.title || ''}
          </h4>

          {/* Step Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {step?.description || ''}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-[#F5F1EA]0 text-white text-sm font-medium hover:shadow-md transition"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
