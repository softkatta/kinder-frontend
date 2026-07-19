import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { mediaUrl } from '@/utils/mediaUrl'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { JobApplyForm } from '@/components/careers/JobApplyForm'
import { useJob } from '@/hooks/useCmsContent'
import { useT } from '@/i18n/LanguageContext'

export default function JobDetailPage() {
  const { slug } = useParams()
  const { t } = useT()
  const p = t.pages.careers
  const { item: job, loading } = useJob(slug)

  if (!loading && !job) return <Navigate to="/careers" replace />
  if (!job) {
    return (
      <div className="section text-center text-slate-400 py-20">Loading...</div>
    )
  }

  const labels = {
    applyFor: p.applyFor,
    fullName: p.fullName,
    email: p.email,
    phone: p.phone,
    qualification: p.qualification,
    experience: p.experience,
    coverLetter: p.coverLetter,
    resume: p.resume,
    submit: p.submit,
    submitting: p.submitting,
    success: p.success,
  }

  return (
    <div>
      <PublicPageHero
        imageKey="page_careers_image"
        backgroundImage={job.image ? mediaUrl(job.image) : undefined}
        label={p.label}
        title={job.title}
        subtitle={job.summary}
        breadcrumbs={[{ label: p.label, to: '/careers' }, { label: job.title }]}
      />

      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="programs" />
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <FadeIn className="lg:col-span-3 space-y-6">
              <div className="rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                {job.image ? (
                  <img
                    src={mediaUrl(job.image)}
                    alt={job.title}
                    className="w-full aspect-[21/9] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[21/9] bg-gradient-to-br from-sky-100 via-amber-50 to-violet-100" aria-hidden />
                )}
              </div>

              <div className="kidscholl-form-card">
                <div className="flex flex-wrap gap-3 mb-4">
                  {job.department && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                      <Briefcase className="h-3.5 w-3.5" /> {job.department}
                    </span>
                  )}
                  {job.location && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                      <MapPin className="h-3.5 w-3.5" /> {job.location}
                    </span>
                  )}
                  {job.application_deadline && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <Calendar className="h-3.5 w-3.5" /> {p.deadline} {job.application_deadline.slice(0, 10)}
                    </span>
                  )}
                </div>

                {job.employment_type && (
                  <p className="text-sm text-slate-500 mb-2"><strong>Type:</strong> {job.employment_type}</p>
                )}
                {job.salary_range && (
                  <p className="text-sm text-slate-500 mb-4"><strong>Salary:</strong> {job.salary_range}</p>
                )}

                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">{job.description}</p>

                {job.requirements.length > 0 && (
                  <>
                    <h3 className="font-display font-bold text-ink mt-8 mb-4">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req) => (
                        <li key={req} className="flex items-start gap-2 text-slate-600">
                          <CheckCircle2 className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <Link to="/careers" className="btn-kidscholl-outline mt-8 inline-flex">
                  Back to careers <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.08} className="lg:col-span-2 lg:sticky lg:top-28">
              <div className="kidscholl-form-card">
                <JobApplyForm jobId={job.id} jobTitle={job.title} labels={labels} />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
