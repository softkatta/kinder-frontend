import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, MapPin, Calendar, Heart, GraduationCap,
  Users, Sparkles, ArrowRight,
} from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { getProfileImage } from '@/config/pageImages'
import { useSchoolProfile } from '@/contexts/SchoolProfileContext'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { toJobDetail } from '@/utils/cmsNormalize'

export default function CareersPage() {
  const { t, locale } = useT()
  const p = t.pages.careers
  const profile = useSchoolProfile()
  const [jobs, setJobs] = useState<ReturnType<typeof toJobDetail>[]>([])
  const coverImage = getProfileImage(profile, 'page_careers_image') || getProfileImage(profile, 'cover_image') || ''

  useEffect(() => {
    fetchLocalizedPublic((loc) => publicApi.jobs(loc), locale)
      .then((data) => {
        const rows = data as Record<string, unknown>[]
        if (rows?.length) setJobs(rows.map(toJobDetail))
        else setJobs([])
      })
      .catch(() => setJobs([]))
  }, [locale])

  const perks = [
    { icon: Heart, title: p.perk1, desc: p.perk1Desc },
    { icon: GraduationCap, title: p.perk2, desc: p.perk2Desc },
    { icon: Users, title: p.perk3, desc: p.perk3Desc },
    { icon: Sparkles, title: p.perk4, desc: p.perk4Desc },
  ]

  return (
    <div>
      <PublicPageHero imageKey="page_careers_image" label={p.label} title={p.title} subtitle={p.subtitle} breadcrumbs={[{ label: p.label }]} />

      <section className="section bg-white relative overflow-hidden">
        <SectionDecorations variant="teachers" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <KidschollSection label={p.cultureLabel} title={p.cultureTitle} subtitle={p.cultureSubtitle} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {perks.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 0.06}>
                <div className="kidscholl-stat-card text-left !items-start h-full">
                  <div className="kidscholl-stat-icon mb-3"><Icon className="h-5 w-5" /></div>
                  <h3 className="font-display font-bold text-ink">{title}</h3>
                  <p className="text-sm text-slate-500 mt-2">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="programs" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <KidschollSection label={p.jobsLabel} title={p.vacancies} className="mb-8" />

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="space-y-4 order-2 lg:order-1">
              {jobs.map((job, i) => (
                <FadeIn key={job.id} delay={i * 0.05}>
                  <article className="rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-lg text-ink">{job.title}</h3>
                        {job.department && (
                          <p className="text-sm text-orange-500 font-semibold mt-1">{job.department}</p>
                        )}
                      </div>
                      <Briefcase className="h-6 w-6 text-violet-400 shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                      {job.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      )}
                      {job.application_deadline && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{p.deadline} {job.application_deadline.slice(0, 10)}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">{job.summary}</p>
                    <Link
                      to={`/careers/${job.slug}`}
                      className="btn-kidscholl mt-4 !py-2.5 !px-5 !text-sm inline-flex"
                    >
                      {p.applyBtn} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                </FadeIn>
              ))}
              {jobs.length === 0 && (
                <p className="text-center text-slate-400 py-8">{t.common.emptyJobs}</p>
              )}
            </div>

            <FadeIn className="order-1 lg:order-2 lg:sticky lg:top-28">
              <div className="careers-hero-image overflow-hidden rounded-3xl shadow-xl ring-1 ring-orange-100">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={p.cultureTitle}
                    className="h-full w-full object-cover min-h-[320px] lg:min-h-[520px]"
                  />
                ) : (
                  <div className="min-h-[320px] lg:min-h-[520px] bg-gradient-to-br from-violet-100 via-sky-50 to-amber-100" />
                )}
                <div className="careers-hero-image-overlay p-8">
                  <p className="text-sm font-bold uppercase tracking-wider text-orange-200">{p.label}</p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2 leading-tight">
                    {p.cultureTitle}
                  </h2>
                  <p className="text-white/85 text-sm mt-3 max-w-sm">{p.cultureSubtitle}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="section bg-white pb-20 text-center">
        <p className="text-slate-500 mb-4">{p.noRole}</p>
        <Link to="/contact" className="btn-kidscholl-outline">{t.common.contactUs} <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  )
}
