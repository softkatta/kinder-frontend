import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { toEventItem } from '@/utils/cmsNormalize'
import type { EventItem } from '@/config/publicCatalog'

export default function EventsPage() {
  const { t, locale } = useT()
  const p = t.pages.events
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchLocalizedPublic((loc) => publicApi.events(loc), locale)
      .then((data) => {
        const rows = (data as Record<string, unknown>[]) || []
        setEvents(rows.map((e, i) => {
          const item = toEventItem(e)
          return { ...item, id: item.id || String(i) }
        }))
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [locale])

  return (
    <div>
      <PublicPageHero imageKey="page_events_image" label={p.label} title={p.title} subtitle={p.subtitle} breadcrumbs={[{ label: p.label }]} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="events" />
        <div className="mx-auto max-w-5xl px-4 relative z-10">
          <KidschollSection label={p.calendar} title={p.upcomingList} />
          {loading ? (
            <p className="text-center text-slate-400 py-12">{t.common.loading}</p>
          ) : events.length === 0 ? (
            <p className="text-center text-slate-400 py-12">{t.common.emptyEvents}</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((e, i) => (
                <FadeIn key={e.id} delay={i * 0.08}>
                  <Link to={`/events/${e.id}`} className="group kidscholl-program-card overflow-hidden flex flex-col sm:flex-row h-full hover:shadow-xl transition-all hover:-translate-y-0.5">
                    <div className="sm:w-44 h-44 sm:h-auto shrink-0 overflow-hidden">
                      {e.image ? (
                        <img src={e.image} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full min-h-[11rem] bg-gradient-to-br from-violet-100 via-sky-50 to-amber-100" />
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      {e.date && (
                        <p className="text-xs font-bold text-orange-500 uppercase mb-2">
                          {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                      <h2 className="font-display font-bold text-lg text-ink mb-2 group-hover:text-orange-500 transition-colors">{e.title}</h2>
                      <p className="text-sm text-slate-500 leading-relaxed flex-1">{e.summary}</p>
                      {e.location && (
                        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-violet-500" /> {e.location}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-500 mt-3">
                        {t.common.readMore} <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="section bg-white pb-20 text-center relative overflow-hidden">
        <SectionDecorations variant="cta" />
        <div className="relative z-10">
          <p className="text-slate-500 mb-4">{p.bookOpenDay}</p>
          <Link to="/book-tour" className="btn-kidscholl mr-3">{t.common.bookVisit}</Link>
          <Link to="/contact" className="btn-kidscholl-outline">{t.common.contactUs} <ArrowRight className="h-4 w-4 inline" /></Link>
        </div>
      </section>
    </div>
  )
}
