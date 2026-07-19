import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { useT } from '@/i18n/LanguageContext'
import { usePublicList } from '@/hooks/useCmsContent'
import { mediaUrl } from '@/utils/mediaUrl'

export default function StaffPage() {
  const { t } = useT()
  const p = t.pages.staff
  const { items, loading } = usePublicList('staff')

  return (
    <div>
      <PublicPageHero imageKey="page_staff_image" label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="programs" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <KidschollSection label={p.sectionLabel} title={p.sectionTitle} />
          {loading && <p className="text-center text-slate-400 py-12">{t.common.loading}</p>}
          {!loading && items.length === 0 && (
            <p className="text-center text-slate-400 py-12">{t.common.emptyStaff}</p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((member, i) => {
              const name = String(member.title ?? '')
              const role = String(member.role ?? member.summary ?? '')
              const bio = String(member.body ?? member.detail ?? '')
              const qualification = String(member.qualification ?? '')
              const image = mediaUrl(String(member.image ?? ''))
              return (
                <FadeIn key={String(member.id ?? i)} delay={i * 0.06}>
                  <article className="kidscholl-form-card h-full flex flex-col overflow-hidden !p-0">
                    <div className="aspect-[4/3] bg-sky-50 overflow-hidden">
                      {image ? (
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-50 to-sky-100">
                          <GraduationCap className="h-16 w-16 text-primary-300" strokeWidth={1.25} />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-display text-xl font-bold text-ink">{name}</h3>
                      <p className="text-sm font-semibold text-primary-600 mt-0.5">{role}</p>
                      {qualification && (
                        <p className="text-xs text-slate-500 mt-2">
                          <span className="font-bold uppercase tracking-wide">{p.qualificationLabel}: </span>
                          {qualification}
                        </p>
                      )}
                      {bio && <p className="text-sm text-slate-600 mt-3 leading-relaxed flex-1">{bio}</p>}
                    </div>
                  </article>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>
      <section className="section bg-white pb-20 text-center relative overflow-hidden">
        <SectionDecorations variant="cta" />
        <div className="relative z-10">
          <KidschollSection label={p.sectionLabel} title={t.pages.about.visitUs} subtitle={t.pages.about.visitDesc} />
          <Link to="/book-tour" className="btn-kidscholl">{t.common.bookVisit}</Link>
        </div>
      </section>
    </div>
  )
}
