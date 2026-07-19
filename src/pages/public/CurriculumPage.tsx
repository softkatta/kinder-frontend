import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { useT } from '@/i18n/LanguageContext'
import { usePublicList } from '@/hooks/useCmsContent'
import { parseHighlights } from '@/utils/cmsNormalize'

const gradeOrder = ['nursery', 'lkg', 'ukg'] as const
const gradeLabels: Record<string, 'nursery' | 'lkg' | 'ukg'> = {
  nursery: 'nursery',
  lkg: 'lkg',
  ukg: 'ukg',
}

export default function CurriculumPage() {
  const { t } = useT()
  const p = t.pages.curriculum
  const { items, loading } = usePublicList('curriculum')

  const sorted = [...items].sort((a, b) => {
    const ai = gradeOrder.indexOf(String(a.grade_level ?? 'nursery') as typeof gradeOrder[number])
    const bi = gradeOrder.indexOf(String(b.grade_level ?? 'nursery') as typeof gradeOrder[number])
    return ai - bi
  })

  return (
    <div>
      <PublicPageHero imageKey="page_curriculum_image" label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="programs" />
        <div className="mx-auto max-w-7xl px-4 relative z-10 space-y-8">
          <KidschollSection label={p.sectionLabel} title={p.sectionTitle} />
          {loading && <p className="text-center text-slate-400 py-12">{t.common.loading}</p>}
          {!loading && sorted.length === 0 && (
            <p className="text-center text-slate-400 py-12">{t.common.emptyCurriculum}</p>
          )}
          {sorted.map((item, i) => {
            const grade = String(item.grade_level ?? 'nursery')
            const gradeLabel = p[gradeLabels[grade] ?? 'nursery']
            const highlights = parseHighlights(item.highlights)
            return (
              <FadeIn key={String(item.id ?? i)} delay={i * 0.08}>
                <article className="kidscholl-form-card">
                  <div className="flex flex-wrap items-start gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 mb-2">
                        {gradeLabel}
                      </span>
                      <h3 className="font-display text-2xl font-bold text-ink">{String(item.title ?? '')}</h3>
                      <p className="text-sm text-slate-500 mt-1">{String(item.summary ?? '')}</p>
                    </div>
                  </div>
                  {item.body ? (
                    <p className="text-slate-600 leading-relaxed mb-5">{String(item.body)}</p>
                  ) : null}
                  {highlights.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">{p.highlightsLabel}</p>
                      <ul className="grid sm:grid-cols-2 gap-2">
                        {highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              </FadeIn>
            )
          })}
        </div>
      </section>
      <section className="section bg-white pb-20 text-center relative overflow-hidden">
        <SectionDecorations variant="enroll" />
        <div className="relative z-10">
          <KidschollSection label={p.label} title={t.pages.programs.limitedSeats} />
          <Link to="/programs" className="btn-kidscholl">{p.viewPrograms}</Link>
        </div>
      </section>
    </div>
  )
}
