'use client'

import {
  Fragment,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'

import {
  Link,
} from '@/lib/navigation'

import aboutService, {
  normalizeAboutData,
} from '../utils/aboutService'

function RichHtml({
  html,
  className = '',
}) {
  if (!html) {
    return null
  }

  return (
    <div
      className={`${className} [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal [&_li]:mb-1 [&_strong]:font-semibold`}
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  )
}

function AnimatedCounter({
  value,
  suffix = '',
  duration = 1600,
}) {
  const numericValue =
    Number(value)

  const ref = useRef(null)

  const hasRun =
    useRef(false)

  const [count, setCount] =
    useState(0)

  const raw =
    String(value ?? '')

  const decimals =
    raw.includes('.')
      ? raw.split('.')[1]
        .length
      : 0

  useEffect(() => {
    if (
      !Number.isFinite(
        numericValue
      )
    ) {
      return
    }

    const element =
      ref.current

    if (!element) return

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            !entry.isIntersecting ||
            hasRun.current
          ) {
            return
          }

          hasRun.current =
            true

          const start =
            performance.now()

          const tick = (now) => {
            const progress =
              Math.min(
                (now - start) /
                duration,
                1
              )

            const eased =
              1 -
              Math.pow(
                1 - progress,
                3
              )

            setCount(
              numericValue *
              eased
            )

            if (
              progress < 1
            ) {
              requestAnimationFrame(
                tick
              )
            }
          }

          requestAnimationFrame(
            tick
          )
        },

        {
          threshold: 0.3,
        }
      )

    observer.observe(
      element
    )

    return () =>
      observer.disconnect()
  }, [
    numericValue,
    duration,
  ])

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return (
      <span>
        {value}
        {suffix}
      </span>
    )
  }

  return (
    <span ref={ref}>
      {decimals > 0
        ? count.toFixed(
          decimals
        )
        : Math.floor(count)}

      {suffix}
    </span>
  )
}

function ActionLink({
  href,
  children,
  className,
}) {
  const cleanHref =
    String(href || '').trim()

  if (!cleanHref) {
    return null
  }

  const external =
    /^https?:\/\//i.test(
      cleanHref
    )

  if (external) {
    return (
      <a
        href={cleanHref}
        target="_blank"
        rel="noopener noreferrer"
        className={
          className
        }
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      to={cleanHref}
      className={className}
    >
      {children}
    </Link>
  )
}

export default function AboutPage({
  theme,
}) {
  const isDark =
    theme === 'dark'

  const [
    pageData,
    setPageData,
  ] = useState(() =>
    normalizeAboutData({})
  )

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const unsubscribe =
      aboutService.subscribeAboutPage(
        (data) => {
          setPageData(
            normalizeAboutData(
              data
            )
          )

          setLoading(false)
        },

        (error) => {
          console.error(
            'About page realtime error:',
            error
          )

          setLoading(false)
        }
      )

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4EF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6B4228]" />
      </div>
    )
  }

  const data =
    pageData

  const renderHero = () => (
    <section className="relative overflow-hidden bg-[#3A2117]">
      {data.heroImage && (
        <img
          src={data.heroImage}
          alt={
            data.heroImageAlt ||
            data.heroTitle ||
            'Lamp & Glow'
          }
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div
        className={`absolute inset-0 ${data.heroImage
            ? 'bg-gradient-to-r from-[#281912]/95 via-[#281912]/80 to-[#281912]/35'
            : 'bg-gradient-to-br from-[#3A2117] via-[#4E2E20] to-[#281912]'
          }`}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-40">
        <div className="max-w-3xl">
          {data.heroBadge && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F0D9C7] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D5A77F]" />

              {data.heroBadge}
            </div>
          )}

          {data.heroTitle && (
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#FFFEFC] sm:text-5xl lg:text-6xl">
              {data.heroTitle}
            </h1>
          )}

          <RichHtml
            html={
              data.heroDescription
            }
            className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg"
          />

          <div className="mt-8 flex flex-wrap gap-3">
            {data.heroPrimaryLabel && (
              <ActionLink
                href={
                  data.heroPrimaryLink
                }
                className="inline-flex items-center justify-center rounded-xl bg-[#FFFEFC] px-6 py-3 text-sm font-semibold text-[#3A2117] transition hover:bg-[#F1E7DF]"
              >
                {
                  data.heroPrimaryLabel
                }
              </ActionLink>
            )}

            {data.heroSecondaryLabel && (
              <ActionLink
                href={
                  data.heroSecondaryLink
                }
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {
                  data.heroSecondaryLabel
                }
              </ActionLink>
            )}
          </div>
        </div>
      </div>
    </section>
  )

  const renderStats = () => {
    const items =
      data.stats.filter(
        (item) =>
          item.isActive !==
          false
      )

    if (items.length === 0) {
      return null
    }

    return (
      <section className="border-b border-[#E5DAD2] bg-[#FFFEFC]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-12 sm:px-8 lg:grid-cols-4 lg:px-10 lg:py-16">
          {items.map(
            (stat, index) => (
              <div
                key={
                  stat.id ||
                  index
                }
                className="relative text-center"
              >
                <p className="text-3xl font-semibold tracking-tight text-[#3A2117] sm:text-4xl">
                  <AnimatedCounter
                    value={
                      stat.value
                    }
                    suffix={
                      stat.suffix
                    }
                  />
                </p>

                <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8A7467]">
                  {stat.label}
                </p>
              </div>
            )
          )}
        </div>
      </section>
    )
  }

  const renderStory = () => (
    <section className="bg-[#F7F4EF] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10">
        <div className="overflow-hidden rounded-3xl border border-[#E1D4CB] bg-[#EDE4DC] shadow-[0_20px_50px_rgba(58,33,23,0.10)]">
          {data.storyImage ? (
            <img
              src={
                data.storyImage
              }
              alt={
                data.storyImageAlt ||
                data.storyTitle ||
                'Lamp & Glow story'
              }
              className="aspect-[4/5] h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-[#E7D8CC] to-[#C5A58D]">
              <ImageIcon className="h-14 w-14 text-[#6B4228]/40" />
            </div>
          )}
        </div>

        <div>
          {data.storyEyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
              {
                data.storyEyebrow
              }
            </p>
          )}

          {data.storyTitle && (
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#281912] sm:text-4xl">
              {
                data.storyTitle
              }
            </h2>
          )}

          <RichHtml
            html={
              data.storyContent
            }
            className="mt-6 text-sm leading-7 text-[#6F5E54] sm:text-base sm:leading-8"
          />
        </div>
      </div>
    </section>
  )

  const renderMission = () => (
    <section className="bg-[#FFFEFC] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div
          className={`grid gap-6 ${data.missionImage
              ? 'lg:grid-cols-[0.85fr_1.15fr]'
              : 'lg:grid-cols-2'
            }`}
        >
          {data.missionImage && (
            <div className="overflow-hidden rounded-3xl border border-[#E7DCD4] bg-[#F0E8E1]">
              <img
                src={
                  data.missionImage
                }
                alt={
                  data.missionImageAlt ||
                  'Lamp & Glow mission'
                }
                className="h-full min-h-[340px] w-full object-cover"
              />
            </div>
          )}

          <div
            className={`grid gap-5 ${data.missionImage
                ? ''
                : 'lg:col-span-2 lg:grid-cols-2'
              }`}
          >
            <div className="rounded-3xl border border-[#E7DCD4] bg-[#F7F4EF] p-6 sm:p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A654D]">
                Mission
              </span>

              <h2 className="mt-3 text-2xl font-semibold text-[#281912] sm:text-3xl">
                {
                  data.missionTitle
                }
              </h2>

              <RichHtml
                html={
                  data.missionContent
                }
                className="mt-4 text-sm leading-7 text-[#6F5E54]"
              />
            </div>

            <div className="rounded-3xl border border-[#E7DCD4] bg-[#3A2117] p-6 text-[#FFFEFC] sm:p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D5A77F]">
                Vision
              </span>

              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                {
                  data.visionTitle
                }
              </h2>

              <RichHtml
                html={
                  data.visionContent
                }
                className="mt-4 text-sm leading-7 text-white/70"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const renderValues = () => {
    const items =
      data.values.filter(
        (item) =>
          item.isActive !==
          false
      )

    if (items.length === 0) {
      return null
    }

    return (
      <section className="bg-[#F7F4EF] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#281912] sm:text-4xl">
              {
                data.valuesTitle
              }
            </h2>

            {data.valuesSubtitle && (
              <p className="mt-3 text-sm leading-7 text-[#7B685D]">
                {
                  data.valuesSubtitle
                }
              </p>
            )}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map(
              (value, index) => (
                <article
                  key={
                    value.id ||
                    index
                  }
                  className="rounded-2xl border border-[#E2D6CE] bg-[#FFFEFC] p-6 transition hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(58,33,23,0.08)]"
                >
                  {value.icon && (
                    <div className="mb-5 text-3xl">
                      {value.icon}
                    </div>
                  )}

                  <h3 className="text-base font-semibold text-[#281912]">
                    {
                      value.title
                    }
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#7B685D]">
                    {
                      value.description
                    }
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>
    )
  }

  const renderMilestones =
    () => {
      const items =
        data.milestones.filter(
          (item) =>
            item.isActive !==
            false
        )

      if (
        items.length === 0
      ) {
        return null
      }

      return (
        <section className="bg-[#FFFEFC] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="text-center">
              {data.milestonesEyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A654D]">
                  {
                    data.milestonesEyebrow
                  }
                </p>
              )}

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#281912] sm:text-4xl">
                {
                  data.milestonesTitle
                }
              </h2>
            </div>

            <div className="relative mt-12">
              <div className="absolute bottom-0 left-[11px] top-0 w-px bg-[#D7C6BA] sm:left-1/2" />

              {items.map(
                (
                  milestone,
                  index
                ) => (
                  <div
                    key={
                      milestone.id ||
                      index
                    }
                    className={`relative mb-10 flex sm:w-1/2 ${index % 2 ===
                        0
                        ? 'sm:pr-10'
                        : 'sm:ml-auto sm:pl-10'
                      }`}
                  >
                    <div
                      className={`absolute top-2 h-6 w-6 rounded-full border-[6px] border-[#F7F4EF] bg-[#6B4228] ${index % 2 ===
                          0
                          ? 'left-0 -translate-x-0 sm:left-auto sm:right-0 sm:translate-x-1/2'
                          : 'left-0 -translate-x-0 sm:-translate-x-1/2'
                        }`}
                    />

                    <div className="ml-10 w-full rounded-2xl border border-[#E7DCD4] bg-[#F7F4EF] p-5 sm:ml-0">
                      <p className="text-xs font-bold tracking-wide text-[#8A654D]">
                        {
                          milestone.year
                        }
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-[#281912]">
                        {
                          milestone.title
                        }
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#7B685D]">
                        {
                          milestone.description
                        }
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )
    }

  const renderTeam = () => {
    const members =
      data.team.filter(
        (member) =>
          member.isActive !==
          false
      )

    if (
      members.length === 0
    ) {
      return null
    }

    return (
      <section className="bg-[#F7F4EF] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#281912] sm:text-4xl">
              {data.teamTitle}
            </h2>

            {data.teamSubtitle && (
              <p className="mt-3 text-sm leading-7 text-[#7B685D]">
                {
                  data.teamSubtitle
                }
              </p>
            )}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {members.map(
              (
                member,
                index
              ) => {
                const initials =
                  String(
                    member.name ||
                    '?'
                  )
                    .split(/\s+/)
                    .filter(Boolean)
                    .map(
                      (part) =>
                        part[0]
                    )
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()

                return (
                  <article
                    key={
                      member.id ||
                      index
                    }
                    className="overflow-hidden rounded-3xl border border-[#E2D6CE] bg-[#FFFEFC] text-center shadow-[0_8px_24px_rgba(58,33,23,0.04)]"
                  >
                    {member.image ? (
                      <img
                        src={
                          member.image
                        }
                        alt={
                          member.imageAlt ||
                          member.name ||
                          'Team member'
                        }
                        className="aspect-[4/3] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#DCC7B6] to-[#9E765B]">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/15 text-2xl font-semibold text-white backdrop-blur">
                          {initials}
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-[#281912]">
                        {
                          member.name
                        }
                      </h3>

                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#8A654D]">
                        {
                          member.role
                        }
                      </p>

                      <p className="mt-3 text-sm leading-6 text-[#7B685D]">
                        {
                          member.bio
                        }
                      </p>
                    </div>
                  </article>
                )
              }
            )}
          </div>
        </div>
      </section>
    )
  }

  const renderCta = () => (
    <section className="relative overflow-hidden bg-[#3A2117] py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3A2117] via-[#4B2D20] to-[#281912]" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          {data.ctaTitle}
        </h2>

        <RichHtml
          html={
            data.ctaDescription
          }
          className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base"
        />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {data.ctaPrimaryLabel && (
            <ActionLink
              href={
                data.ctaPrimaryLink
              }
              className="inline-flex items-center justify-center rounded-xl bg-[#FFFEFC] px-6 py-3 text-sm font-semibold text-[#3A2117] transition hover:bg-[#F0E7E0]"
            >
              {
                data.ctaPrimaryLabel
              }
            </ActionLink>
          )}

          {data.ctaSecondaryLabel && (
            <ActionLink
              href={
                data.ctaSecondaryLink
              }
              className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {
                data.ctaSecondaryLabel
              }
            </ActionLink>
          )}
        </div>
      </div>
    </section>
  )

  const sections = {
    hero: renderHero,
    stats: renderStats,
    story: renderStory,
    mission: renderMission,
    values: renderValues,
    milestones:
      renderMilestones,
    team: renderTeam,
    cta: renderCta,
  }

  return (
    <main
      className={
        isDark
          ? 'min-h-screen bg-[#211711]'
          : 'min-h-screen bg-[#F7F4EF]'
      }
    >
      {data.sectionOrder.map(
        (section) => {
          if (
            data
              .sectionVisibility[
            section
            ] === false
          ) {
            return null
          }

          const render =
            sections[section]

          if (!render) {
            return null
          }

          return (
            <Fragment key={section}>
              {render()}
            </Fragment>
          )
        }
      )}
    </main>
  )
}