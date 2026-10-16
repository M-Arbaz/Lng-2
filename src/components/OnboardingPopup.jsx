'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  X,
} from 'lucide-react'

import {
  useLocation,
} from '@/lib/navigation'

import {
  useAdminAuth,
} from '../context/AdminAuthContext'

import onboardingService from '../utils/onboardingService.js'

const STORAGE_KEY =
  'onboarding_completed_v2'

function getStorageKey(
  userId
) {
  return `${STORAGE_KEY}_${userId}`
}

function getCompletedGuides(
  userId
) {
  try {
    const raw =
      localStorage.getItem(
        getStorageKey(
          userId
        )
      )

    if (!raw) {
      return {}
    }

    const parsed =
      JSON.parse(raw)

    return (
      parsed &&
        typeof parsed ===
        'object' &&
        !Array.isArray(parsed)
        ? parsed
        : {}
    )
  } catch {
    return {}
  }
}

function setCompletedGuides(
  userId,
  value
) {
  try {
    localStorage.setItem(
      getStorageKey(
        userId
      ),
      JSON.stringify(
        value
      )
    )
  } catch {
    // Browser storage may be unavailable.
  }
}

function getGuideVersion(
  guide
) {
  return String(
    guide?.updatedAt ||
    guide?.createdAt ||
    'initial'
  )
}

function isGuideCompleted(
  userId,
  guide
) {
  if (!guide?.id) {
    return false
  }

  const completed =
    getCompletedGuides(
      userId
    )

  return (
    completed[
    guide.id
    ] ===
    getGuideVersion(
      guide
    )
  )
}

function markGuideCompleted(
  userId,
  guide
) {
  if (!guide?.id) {
    return
  }

  const completed =
    getCompletedGuides(
      userId
    )

  setCompletedGuides(
    userId,
    {
      ...completed,

      [guide.id]:
        getGuideVersion(
          guide
        ),
    }
  )
}

export default function OnboardingPopup() {
  const location =
    useLocation()

  const {
    adminUser,
  } = useAdminAuth()

  const [
    guide,
    setGuide,
  ] = useState(null)

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0)

  const [
    visible,
    setVisible,
  ] = useState(false)

  const userId =
    adminUser?.uid ||
    adminUser?.email ||
    'anonymous'

  const pathname =
    location.pathname || ''

  const loadGuide =
    useCallback(
      async () => {
        /*
         * Never show an onboarding
         * popup while the Admin is
         * managing onboarding guides.
         */
        if (
          pathname ===
          '/admin/onboarding' ||
          pathname.startsWith(
            '/admin/onboarding/'
          )
        ) {
          return
        }

        try {
          const result =
            await onboardingService.getGuideByPath(
              pathname
            )

          if (!result) {
            return
          }

          if (
            isGuideCompleted(
              userId,
              result
            )
          ) {
            return
          }

          const sortedSteps =
            [
              ...(result.steps ||
                []),
            ]
              .sort(
                (a, b) =>
                  (a.order ||
                    0) -
                  (b.order ||
                    0)
              )

          if (
            !sortedSteps.length
          ) {
            return
          }

          setGuide({
            ...result,
            steps:
              sortedSteps,
          })

          setCurrentStep(0)
          setVisible(true)
        } catch (error) {
          console.error(
            'Error loading onboarding guide:',
            error
          )
        }
      },
      [
        pathname,
        userId,
      ]
    )

  useEffect(() => {
    setVisible(false)
    setGuide(null)
    setCurrentStep(0)

    const timer =
      window.setTimeout(
        () => {
          loadGuide()
        },
        450
      )

    return () => {
      window.clearTimeout(
        timer
      )
    }
  }, [
    loadGuide,
  ])

  /*
   * Lock the Admin page behind
   * the onboarding dialog.
   */
  useEffect(() => {
    if (!visible) {
      return undefined
    }

    const oldOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    return () => {
      document.body.style.overflow =
        oldOverflow
    }
  }, [
    visible,
  ])

  const completeAndClose =
    useCallback(() => {
      if (guide) {
        markGuideCompleted(
          userId,
          guide
        )
      }

      setVisible(false)
    }, [
      guide,
      userId,
    ])

  useEffect(() => {
    if (!visible) {
      return undefined
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        'Escape'
      ) {
        completeAndClose()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [
    visible,
    completeAndClose,
  ])

  const steps =
    guide?.steps || []

  const step =
    steps[currentStep]

  const totalSteps =
    steps.length

  const isFirstStep =
    currentStep === 0

  const isLastStep =
    currentStep ===
    totalSteps - 1

  const progress =
    useMemo(() => {
      if (!totalSteps) {
        return 0
      }

      return (
        ((currentStep + 1) /
          totalSteps) *
        100
      )
    }, [
      currentStep,
      totalSteps,
    ])

  const handleNext = () => {
    if (isLastStep) {
      completeAndClose()
      return
    }

    setCurrentStep(
      (prev) =>
        Math.min(
          prev + 1,
          totalSteps - 1
        )
    )
  }

  const handlePrevious =
    () => {
      setCurrentStep(
        (prev) =>
          Math.max(
            prev - 1,
            0
          )
      )
    }

  if (
    !visible ||
    !guide ||
    !step ||
    !totalSteps
  ) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-onboarding-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Skip onboarding tour"
        onClick={
          completeAndClose
        }
        className="absolute inset-0 cursor-default bg-[#17110E]/65 backdrop-blur-[4px]"
      />

      {/* Popup */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[26px] border border-[#4E382D] bg-[#FFFEFC] shadow-[0_30px_100px_rgba(24,14,9,0.38)]">
        {/* Header */}
        <div className="relative overflow-hidden bg-[#3A2117] px-5 py-5 text-white sm:px-6">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-[#D8AD87]/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-[#E2B890]">
                <Lightbulb className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#D8AD87]">
                  Admin Guide
                </p>

                <h3
                  id="admin-onboarding-title"
                  className="mt-1 break-words text-base font-semibold leading-6 text-white"
                >
                  {guide.title ||
                    'Welcome'}
                </h3>

                {guide.description && (
                  <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-white/65">
                    {
                      guide.description
                    }
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={
                completeAndClose
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#D8AD87] transition-all duration-300"
              style={{
                width:
                  `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6 sm:px-6 sm:py-7">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-[#F0E8E1] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6B4228]">
              Step{' '}
              {currentStep +
                1}
            </span>

            <span className="text-xs font-medium text-[#9A8478]">
              {currentStep +
                1}{' '}
              of {totalSteps}
            </span>
          </div>

          <h4 className="mt-5 break-words text-xl font-semibold tracking-[-0.02em] text-[#281912]">
            {step.title}
          </h4>

          <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#6F5E54]">
            {
              step.description
            }
          </p>

          {/* Step dots */}
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            {steps.map(
              (
                _,
                index
              ) => (
                <span
                  key={
                    index
                  }
                  className={`h-1.5 rounded-full transition-all duration-300 ${index ===
                      currentStep
                      ? 'w-7 bg-[#6B4228]'
                      : index <
                        currentStep
                        ? 'w-4 bg-[#B99A85]'
                        : 'w-4 bg-[#E4DAD3]'
                    }`}
                />
              )
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#E8DDD5] bg-[#F7F4EF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={
              completeAndClose
            }
            className="text-xs font-semibold text-[#8A7467] transition hover:text-[#3A2117]"
          >
            Skip Tour
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={
                  handlePrevious
                }
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D8C9BF] bg-[#FFFEFC] px-4 py-2.5 text-xs font-semibold text-[#6B4228] transition hover:bg-[#F2ECE7] sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4" />

                Back
              </button>
            )}

            <button
              type="button"
              onClick={
                handleNext
              }
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#3A2117] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#281912] sm:flex-none"
            >
              {isLastStep
                ? 'Finish'
                : 'Next'}

              {!isLastStep && (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}