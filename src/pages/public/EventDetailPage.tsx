import { Link, Navigate, useParams } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { useEvent } from '@/hooks/useCmsContent'
import { useT } from '@/i18n/LanguageContext'

export default function EventDetailPage() {
  const { id } = useParams()
  const { t } = useT()
  const p = t.pages.events
  const { item, loading } = useEvent(id)

  if (!loading && !item) return <Navigate to="/events" replace />
  if (!item) return <div className="section text-center text-slate-400 py-20">Loading...</div>

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const time = item.time

  return (
    <div>
      <PublicPageHero
        imageKey="page_events_image"
        backgroundImage={item.image}
        label={p.label}
        title={item.title}
        subtitle={item.summary}
        breadcrumbs={[{ label: p.label, to: '/events' }, { label: item.title }]}
      />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="events" />
        <div className="mx-auto max-w-5xl px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10">
            <FadeIn>
              <div className="rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-violet-100 via-sky-50 to-amber-100" aria-hidden />
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-5">
                {formattedDate && (
                  <div className="kidscholl-feature-pill flex-1 min-w-[140px]">
                    <div className="kidscholl-feature-icon"><Calendar className="h-5 w-5" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{p.dateLabel}</p>
                      <p className="text-sm font-semibold text-ink">{formattedDate}</p>
                    </div>
                  </div>
                )}
                {time && (
                  <div className="kidscholl-feature-pill flex-1 min-w-[140px]">
                    <div className="kidscholl-feature-icon"><Clock className="h-5 w-5" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Time</p>
                      <p className="text-sm font-semibold text-ink">{time}</p>
                    </div>
                  </div>
                )}
                {item.location && (
                  <div className="kidscholl-feature-pill flex-1 min-w-[140px]">
                    <div className="kidscholl-feature-icon"><MapPin className="h-5 w-5" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">{p.locationLabel}</p>
                      <p className="text-sm font-semibold text-ink">{item.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div className="kidscholl-form-card">
                <p className="text-slate-600 leading-relaxed text-lg">{item.detail}</p>
                {item.highlights.length > 0 && (
                  <>
                    <h3 className="font-display font-bold text-ink mt-8 mb-4">{t.pages.detail.highlights}</h3>
                    <ul className="space-y-3">
                      {item.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-slate-600">
                          <CheckCircle2 className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link to="/contact" className="btn-kidscholl">{t.common.contactUs} <ArrowRight className="h-4 w-4" /></Link>
                  <Link to="/events" className="btn-kidscholl-outline">{p.backToList}</Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
