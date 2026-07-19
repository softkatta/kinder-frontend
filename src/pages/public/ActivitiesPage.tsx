import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { activityColors } from '@/styles/design-tokens'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { useT } from '@/i18n/LanguageContext'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { mediaUrl } from '@/utils/mediaUrl'

interface ActivityRow {
  slug: string
  title: string
  summary: string
  image?: string
}

export default function ActivitiesPage() {
  const { t, locale } = useT()
  const p = t.pages.activities
  const [items, setItems] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchLocalizedPublic((loc) => publicApi.activities(loc), locale)
      .then((data) => {
        const rows = (data as Record<string, unknown>[]) || []
        setItems(rows.map((d) => ({
          slug: String(d.slug ?? ''),
          title: String(d.title ?? ''),
          summary: String(d.summary ?? d.description ?? ''),
          image: mediaUrl(String(d.image ?? d.image_path ?? '')) || undefined,
        })))
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [locale])

  return (
    <div>
      <PublicPageHero imageKey="page_activities_image" label={p.label} title={p.title} subtitle={p.subtitle} breadcrumbs={[{ label: p.label }]} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="programs" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <KidschollSection label={p.gridLabel} title={p.gridTitle} />
          {loading ? (
            <p className="text-center text-slate-400 py-12">{t.common.loading}</p>
          ) : items.length === 0 ? (
            <p className="text-center text-slate-400 py-12">{t.common.emptyActivities}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item, i) => (
                <FadeIn key={item.slug} delay={i * 0.04}>
                  <Link to={`/activities/${item.slug}`} className="group block rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all border border-sky-50 hover:-translate-y-1">
                    <div className="aspect-[4/3] overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-100 via-amber-50 to-violet-100" />
                      )}
                    </div>
                    <div className="p-5">
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${activityColors[i % activityColors.length]}`}>
                        {p.badge}
                      </span>
                      <h3 className="font-display font-bold text-ink group-hover:text-orange-500 transition-colors">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.summary}</p>
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
    </div>
  )
}
