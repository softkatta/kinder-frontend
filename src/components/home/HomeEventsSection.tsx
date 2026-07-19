import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, MapPin, Sparkles } from 'lucide-react'
import { FadeIn } from '@/components/ui/Motion'
import { KidschollSection } from '@/components/design/KidschollSection'
import { mediaUrl } from '@/utils/mediaUrl'
import type { Locale } from '@/i18n/types'

export interface HomeEventItem {
  id: number | string
  title: string
  description?: string
  event_date: string
  image_path?: string
  location?: string
}

interface HomeEventsSectionProps {
  label: string
  title: string
  subtitle: string
  upcomingTitle: string
  thisMonthTitle: string
  readMoreLabel: string
  showAllLabel: string
  locale: Locale
  events: HomeEventItem[]
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function parseEventDate(value: string): Date | null {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatEventDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'mr' ? 'mr-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatDayMonth(date: Date, locale: Locale) {
  const tag = locale === 'mr' ? 'mr-IN' : 'en-IN'
  return new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short' }).format(date)
}

function formatMonthShort(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'mr' ? 'mr-IN' : 'en-IN', { month: 'short' }).format(date)
}

const monthItemTones = ['sky', 'mint', 'sunny', 'lavender'] as const

export function HomeEventsSection({
  label,
  title,
  subtitle,
  upcomingTitle,
  thisMonthTitle,
  readMoreLabel,
  showAllLabel,
  locale,
  events,
}: HomeEventsSectionProps) {
  const today = startOfDay(new Date())
  const allEvents = events
    .map((event) => ({ event, date: parseEventDate(event.event_date) }))
    .filter((entry): entry is { event: HomeEventItem; date: Date } => entry.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const upcoming = allEvents.filter(({ date }) => startOfDay(date) >= today)
  const thisMonth = allEvents.filter(({ date }) =>
    date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear(),
  )

  const featured = upcoming[0] ?? thisMonth[0] ?? allEvents[0]
  const monthList = (thisMonth.length ? thisMonth : upcoming.slice(0, 4)).filter(
    ({ event }) => event.id !== featured?.event.id,
  )

  if (!featured) return null

  const featuredImage = featured.event.image_path ? mediaUrl(featured.event.image_path) : undefined

  return (
    <section className="home-events-section">
      <div className="home-events-color-blob home-events-color-blob--violet" aria-hidden />
      <div className="home-events-color-blob home-events-color-blob--mint" aria-hidden />
      <div className="home-events-color-blob home-events-color-blob--sunny" aria-hidden />

      <div className="home-events-section-inner">
        <KidschollSection label={label} title={title} subtitle={subtitle} />

        <div className="home-events-layout">
          <FadeIn>
            <article className="home-events-featured home-events-featured--upcoming">
              <div className="home-events-featured-badge">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{upcomingTitle}</span>
              </div>
              <div className="home-events-featured-media home-events-featured-media--arch">
                {featuredImage ? (
                  <img src={featuredImage} alt={featured.event.title} loading="lazy" />
                ) : (
                  <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-violet-200 via-sky-100 to-mint-100" aria-hidden />
                )}
                <div className="home-events-featured-date home-events-featured-date--sunny">
                  <span className="home-events-featured-day">
                    {formatDayMonth(featured.date, locale)}
                  </span>
                  <span className="home-events-featured-year">{featured.date.getFullYear()}</span>
                </div>
              </div>
              <div className="home-events-featured-body">
                <h3 className="home-events-featured-title">{featured.event.title}</h3>
                {featured.event.description && (
                  <p className="home-events-featured-desc">{featured.event.description}</p>
                )}
                {featured.event.location && (
                  <p className="home-events-featured-location">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {featured.event.location}
                  </p>
                )}
                <Link to="/events" className="home-events-featured-link">
                  {readMoreLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </FadeIn>

          <div className="home-events-month home-events-month--panel">
            <h3 className="home-events-month-heading">
              <span className="home-events-month-icon">
                <CalendarDays className="h-4 w-4" />
              </span>
              {thisMonthTitle}
            </h3>
            <ul className="home-events-month-list">
              {(monthList.length ? monthList : allEvents.slice(1, 4)).map(({ event, date }, i) => (
                <FadeIn key={event.id} delay={i * 0.06}>
                  <li>
                    <Link
                      to="/events"
                      className={`home-events-month-item home-events-month-item--${monthItemTones[i % monthItemTones.length]}`}
                    >
                      <div className="home-events-month-date">
                        <span className="home-events-month-day">{date.getDate()}</span>
                        <span className="home-events-month-mon">{formatMonthShort(date, locale)}</span>
                      </div>
                      <div className="home-events-month-content">
                        <p className="home-events-month-title">{event.title}</p>
                        <p className="home-events-month-meta">{formatEventDate(date, locale)}</p>
                      </div>
                      <ArrowRight className="home-events-month-arrow h-4 w-4 shrink-0" />
                    </Link>
                  </li>
                </FadeIn>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link to="/events" className="btn-kidscholl-outline home-events-show-all">
            {showAllLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
