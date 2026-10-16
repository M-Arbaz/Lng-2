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
      className={`
        ${className}
        min-w-0
        max-w-full
        break-words
        [overflow-wrap:anywhere]
        [&_*]:max-w-full
        [&_p]:mb-4
        [&_p]:whitespace-normal
        [&_p:last-child]:mb-0
        [&_ul]:ml-5
        [&_ul]:list-disc
        [&_ol]:ml-5
        [&_ol]:list-decimal
        [&_li]:mb-1
        [&_li]:whitespace-normal
        [&_strong]:font-semibold
        [&_a]:break-all
        [&_img]:h-auto
        [&_img]:max-w-full
        [&_table]:block
        [&_table]:max-w-full
        [&_table]:overflow-x-auto
      `}
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

  const ref =
    useRef(null)

  const hasRun =
    useRef(false)

  const [count, setCount] =
    useState(0)

  const raw =
    String(value ?? '')

  const decimals =
    raw.includes('.')
      ? raw.split('.')[1].length
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

    if (!element) {
      return
    }

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

          const tick = (
            now
          ) => {
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

    return () => {
      observer.disconnect()
    }
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
        className={className}
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

  /*
   * Theme system
   */
  const sectionLight =
    isDark
      ? 'bg-[#171310]'
      : 'bg-[#FFFEFC]'

  const sectionSoft =
    isDark
      ? 'bg-[#211711]'
      : 'bg-[#F7F4EF]'

  const cardLight =
    isDark
      ? 'border-[#49352B] bg-[#2A1D17]'
      : 'border-[#E2D6CE] bg-[#FFFEFC]'

  const cardSoft =
    isDark
      ? 'border-[#49352B] bg-[#251A15]'
      : 'border-[#E7DCD4] bg-[#F7F4EF]'

  const headingText =
    isDark
      ? 'text-[#FFF8F1]'
      : 'text-[#281912]'

  const bodyText =
    isDark
      ? 'text-[#C8B8AE]'
      : 'text-[#6F5E54]'

  const mutedText =
    isDark
      ? 'text-[#A99487]'
      : 'text-[#8A7467]'

  const accentText =
    isDark
      ? 'text-[#D8AD87]'
      : 'text-[#8A654D]'

  if (loading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${isDark
            ? 'bg-[#171310]'
            : 'bg-[#F7F4EF]'
          }`}
      >
        <Loader2
          className={`h-8 w-8 animate-spin ${isDark
              ? 'text-[#D8AD87]'
              : 'text-[#6B4228]'
            }`}
        />
      </div>
    )
  }

  const data =
    pageData

  /*
   * HERO
   *
   * Hero intentionally remains dark
   * in both themes because it is the
   * main brand statement.
   */
  const renderHero = () => (
    <section className="relative overflow-hidden bg-[#3A2117]">
      {data.heroImage && (
        <img
          src={
            data.heroImage
          }
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
        <div className="min-w-0 max-w-3xl">
          {data.heroBadge && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F0D9C7] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D5A77F]" />

              {data.heroBadge}
            </div>
          )}

          {data.heroTitle && (
            <h1 className="mt-6 max-w-3xl break-words text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#FFFEFC] sm:text-5xl lg:text-6xl">
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

  /*
   * STATS
   */
  const renderStats = () => {
    const items =
      data.stats.filter(
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
      <section
        className={`border-b ${isDark
            ? 'border-[#3E2C23]'
            : 'border-[#E5DAD2]'
          } ${sectionLight}`}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-12 sm:px-8 lg:grid-cols-4 lg:px-10 lg:py-16">
          {items.map(
            (
              stat,
              index
            ) => (
              <div
                key={
                  stat.id ||
                  index
                }
                className="relative min-w-0 text-center"
              >
                <p
                  className={`text-3xl font-semibold tracking-tight sm:text-4xl ${headingText}`}
                >
                  <AnimatedCounter
                    value={
                      stat.value
                    }
                    suffix={
                      stat.suffix
                    }
                  />
                </p>

                <p
                  className={`mt-2 break-words text-xs font-medium uppercase tracking-[0.08em] ${mutedText}`}
                >
                  {stat.label}
                </p>
              </div>
            )
          )}
        </div>
      </section>
    )
  }

  /*
   * STORY
   */
  const renderStory = () => (
    <section
      className={`${sectionSoft} py-16 transition-colors duration-300 sm:py-20 lg:py-24`}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10">
        <div
          className={`overflow-hidden rounded-3xl border shadow-[0_20px_50px_rgba(58,33,23,0.10)] ${isDark
              ? 'border-[#49352B] bg-[#2A1D17]'
              : 'border-[#E1D4CB] bg-[#EDE4DC]'
            }`}
        >
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
            <div
              className={`flex aspect-[4/5] items-center justify-center ${isDark
                  ? 'bg-gradient-to-br from-[#38271F] to-[#614332]'
                  : 'bg-gradient-to-br from-[#E7D8CC] to-[#C5A58D]'
                }`}
            >
              <ImageIcon
                className={`h-14 w-14 ${isDark
                    ? 'text-[#D8AD87]/40'
                    : 'text-[#6B4228]/40'
                  }`}
              />
            </div>
          )}
        </div>

        <div className="min-w-0">
          {data.storyEyebrow && (
            <p
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentText}`}
            >
              {
                data.storyEyebrow
              }
            </p>
          )}

          {data.storyTitle && (
            <h2
              className={`mt-3 break-words text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl ${headingText}`}
            >
              {
                data.storyTitle
              }
            </h2>
          )}

          <RichHtml
            html={
              data.storyContent
            }
            className={`mt-6 text-sm leading-7 sm:text-base sm:leading-8 ${bodyText}`}
          />
        </div>
      </div>
    </section>
  )

  /*
   * MISSION / VISION
   */
  const renderMission = () => (
    <section
      className={`${sectionLight} py-16 transition-colors duration-300 sm:py-20 lg:py-24`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div
          className={`grid min-w-0 gap-6 ${data.missionImage
              ? 'lg:grid-cols-[0.85fr_1.15fr]'
              : 'lg:grid-cols-2'
            }`}
        >
          {data.missionImage && (
            <div
              className={`min-w-0 overflow-hidden rounded-3xl border ${isDark
                  ? 'border-[#49352B] bg-[#2A1D17]'
                  : 'border-[#E7DCD4] bg-[#F0E8E1]'
                }`}
            >
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
            className={`grid min-w-0 gap-5 ${data.missionImage
                ? ''
                : 'lg:col-span-2 lg:grid-cols-2'
              }`}
          >
            {/* Mission */}
            <div
              className={`min-w-0 overflow-hidden rounded-3xl border p-6 sm:p-8 ${cardSoft}`}
            >
              <span
                className={`text-xs font-semibold uppercase tracking-[0.18em] ${accentText}`}
              >
                Mission
              </span>

              <h2
                className={`mt-3 break-words text-2xl font-semibold sm:text-3xl ${headingText}`}
              >
                {
                  data.missionTitle
                }
              </h2>

              <RichHtml
                html={
                  data.missionContent
                }
                className={`mt-4 min-w-0 text-sm leading-7 ${bodyText}`}
              />
            </div>

            {/* Vision */}
            <div className="min-w-0 overflow-hidden rounded-3xl border border-[#5A392B] bg-[#3A2117] p-6 text-[#FFFEFC] sm:p-8">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D5A77F]">
                Vision
              </span>

              <h2 className="mt-3 break-words text-2xl font-semibold text-[#FFFEFC] sm:text-3xl">
                {
                  data.visionTitle
                }
              </h2>

              <RichHtml
                html={
                  data.visionContent
                }
                className="mt-4 min-w-0 text-sm leading-7 text-white/70"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  /*
   * CORE VALUES
   */
  const renderValues = () => {
    const items =
      data.values.filter(
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
      <section
        className={`${sectionSoft} py-16 transition-colors duration-300 sm:py-20 lg:py-24`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className={`text-3xl font-semibold tracking-[-0.03em] sm:text-4xl ${headingText}`}
            >
              {
                data.valuesTitle
              }
            </h2>

            {data.valuesSubtitle && (
              <p
                className={`mt-3 text-sm leading-7 ${bodyText}`}
              >
                {
                  data.valuesSubtitle
                }
              </p>
            )}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map(
              (
                value,
                index
              ) => (
                <article
                  key={
                    value.id ||
                    index
                  }
                  className={`min-w-0 rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(58,33,23,0.08)] ${cardLight}`}
                >
                  {value.icon && (
                    <div className="mb-5 text-3xl">
                      {value.icon}
                    </div>
                  )}

                  <h3
                    className={`break-words text-base font-semibold ${headingText}`}
                  >
                    {
                      value.title
                    }
                  </h3>

                  <p
                    className={`mt-2 break-words text-sm leading-6 ${bodyText}`}
                  >
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

  /*
   * MILESTONES
   */
  const renderMilestones = () => {
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
      <section
        className={`${sectionLight} py-16 transition-colors duration-300 sm:py-20 lg:py-24`}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-center">
            {data.milestonesEyebrow && (
              <p
                className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentText}`}
              >
                {
                  data.milestonesEyebrow
                }
              </p>
            )}

            <h2
              className={`mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl ${headingText}`}
            >
              {
                data.milestonesTitle
              }
            </h2>
          </div>

          <div className="relative mt-12">
            <div
              className={`absolute bottom-0 left-[11px] top-0 w-px sm:left-1/2 ${isDark
                  ? 'bg-[#5A4033]'
                  : 'bg-[#D7C6BA]'
                }`}
            />

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
                  className={`relative mb-10 flex min-w-0 sm:w-1/2 ${index % 2 ===
                      0
                      ? 'sm:pr-10'
                      : 'sm:ml-auto sm:pl-10'
                    }`}
                >
                  <div
                    className={`absolute top-2 h-6 w-6 rounded-full border-[6px] bg-[#6B4228] ${isDark
                        ? 'border-[#171310]'
                        : 'border-[#F7F4EF]'
                      } ${index % 2 ===
                        0
                        ? 'left-0 -translate-x-0 sm:left-auto sm:right-0 sm:translate-x-1/2'
                        : 'left-0 -translate-x-0 sm:-translate-x-1/2'
                      }`}
                  />

                  <div
                    className={`ml-10 min-w-0 w-full rounded-2xl border p-5 sm:ml-0 ${cardSoft}`}
                  >
                    <p
                      className={`text-xs font-bold tracking-wide ${accentText}`}
                    >
                      {
                        milestone.year
                      }
                    </p>

                    <h3
                      className={`mt-1 break-words text-base font-semibold ${headingText}`}
                    >
                      {
                        milestone.title
                      }
                    </h3>

                    <p
                      className={`mt-2 break-words text-sm leading-6 ${bodyText}`}
                    >
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

  /*
   * TEAM
   */
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
      <section
        className={`${sectionSoft} py-16 transition-colors duration-300 sm:py-20 lg:py-24`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className={`text-3xl font-semibold tracking-[-0.03em] sm:text-4xl ${headingText}`}
            >
              {data.teamTitle}
            </h2>

            {data.teamSubtitle && (
              <p
                className={`mt-3 text-sm leading-7 ${bodyText}`}
              >
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
                    className={`min-w-0 overflow-hidden rounded-3xl border text-center shadow-[0_8px_24px_rgba(58,33,23,0.04)] ${cardLight}`}
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
                      <div
                        className={`flex aspect-[4/3] items-center justify-center ${isDark
                            ? 'bg-gradient-to-br from-[#422D23] to-[#75513B]'
                            : 'bg-gradient-to-br from-[#DCC7B6] to-[#9E765B]'
                          }`}
                      >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/15 text-2xl font-semibold text-white backdrop-blur">
                          {initials}
                        </div>
                      </div>
                    )}

                    <div className="min-w-0 p-6">
                      <h3
                        className={`break-words text-lg font-semibold ${headingText}`}
                      >
                        {
                          member.name
                        }
                      </h3>

                      <p
                        className={`mt-1 break-words text-xs font-semibold uppercase tracking-[0.1em] ${accentText}`}
                      >
                        {
                          member.role
                        }
                      </p>

                      <p
                        className={`mt-3 break-words text-sm leading-6 ${bodyText}`}
                      >
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

  /*
   * CTA
   *
   * CTA intentionally remains walnut
   * in both themes.
   */
  const renderCta = () => (
    <section className="relative overflow-hidden bg-[#3A2117] py-20 sm:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3A2117] via-[#4B2D20] to-[#281912]" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="break-words text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
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
    hero:
      renderHero,

    stats:
      renderStats,

    story:
      renderStory,

    mission:
      renderMission,

    values:
      renderValues,

    milestones:
      renderMilestones,

    team:
      renderTeam,

    cta:
      renderCta,
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${isDark
          ? 'bg-[#171310]'
          : 'bg-[#F7F4EF]'
        }`}
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
            <Fragment
              key={section}
            >
              {render()}
            </Fragment>
          )
        }
      )}
    </main>
  )
}