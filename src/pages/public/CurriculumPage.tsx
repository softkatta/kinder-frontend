import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { ShapedImage, ShapedPhoto } from '@/components/design/ShapedImage'
import { useT } from '@/i18n/LanguageContext'
import { usePublicList } from '@/hooks/useCmsContent'
import { parseHighlights } from '@/utils/cmsNormalize'
import { mediaUrl } from '@/utils/mediaUrl'
import { kindergartenPhotos } from '@/config/kindergartenPlaceholders'

const gradeOrder = ['nursery', 'lkg', 'ukg'] as const
const gradeLabels: Record<string, 'nursery' | 'lkg' | 'ukg'> = {
  nursery: 'nursery',
  lkg: 'lkg',
  ukg: 'ukg',
}
const gradePhotos: Record<string, string> = {
  nursery: kindergartenPhotos.nursery,
  lkg: kindergartenPhotos.lkg,
  ukg: kindergartenPhotos.ukg,
}
const gradeShapes = ['arch', 'blob', 'squircle'] as const

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
        <div className="mx-auto max-w-7xl px-4 relative z-10 space-y-10 md:space-y-14">
          <KidschollSection label={p.sectionLabel} title={p.sectionTitle} />
          {loading && <p className="text-center text-slate-400 py-12">{t.common.loading}</p>}
          {!loading && sorted.length === 0 && (
            <p className="text-center text-slate-400 py-12">{t.common.emptyCurriculum}</p>
          )}
          {sorted.map((item, i) => {
            const grade = String(item.grade_level ?? 'nursery')
            const gradeLabel = p[gradeLabels[grade] ?? 'nursery']
            const highlights = parseHighlights(item.highlights)
            const cmsImage = mediaUrl(String(item.image || item.image_path || ''))
            const fallback = gradePhotos[grade] || kindergartenPhotos.about
            const reverse = i % 2 === 1

            return (
              <FadeIn key={String(item.id ?? i)} delay={i * 0.08}>
                <article className={`curriculum-card ${reverse ? 'curriculum-card--reverse' : ''}`}>
                  <div className="curriculum-card-media">
                    {cmsImage ? (
                      <ShapedImage
                        src={cmsImage}
                        alt={String(item.title ?? gradeLabel)}
                        shape={gradeShapes[i % gradeShapes.length]}
                        border="white"
                        className="curriculum-card-photo"
                        fallback={<span className="text-5xl">📚</span>}
                      />
                    ) : (
                      <ShapedPhoto
                        src={fallback}
                        alt={String(item.title ?? gradeLabel)}
                        shape={gradeShapes[i % gradeShapes.length]}
                        border="white"
                        className="curriculum-card-photo"
                      />
                    )}
                  </div>

                  <div className="curriculum-card-body kidscholl-form-card !mb-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                        {gradeLabel}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-ink mb-2">
                      {String(item.title ?? '')}
                    </h3>
                    <p className="text-slate-500 mb-4">{String(item.summary ?? '')}</p>
                    {item.body ? (
                      <p className="text-slate-600 leading-relaxed mb-5">{String(item.body)}</p>
                    ) : null}
                    {highlights.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">{p.highlightsLabel}</p>
                        <ul className="grid sm:grid-cols-2 gap-2.5">
                          {highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
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
