import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import type { ProfileImageKey } from '@/config/pageImages'
import { FadeIn } from '@/components/ui/Motion'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import type { Crumb } from '@/components/public/PageBreadcrumbs'
import { useT } from '@/i18n/LanguageContext'

interface DetailLayoutProps {
  label?: string
  title: string
  subtitle?: string
  breadcrumbs: Crumb[]
  image?: string
  imageAlt: string
  detail: string
  highlights: string[]
  meta?: { label: string; value: string }[]
  backHref: string
  backLabel: string
  ctaHref?: string
  ctaLabel?: string
  heroImageKey: ProfileImageKey
  heroBackgroundImage?: string | null
}

export function DetailLayout({
  label,
  title,
  subtitle,
  breadcrumbs,
  image,
  imageAlt,
  detail,
  highlights,
  meta,
  backHref,
  backLabel,
  ctaHref = '/admission',
  ctaLabel,
  heroImageKey,
  heroBackgroundImage,
}: DetailLayoutProps) {
  const { t } = useT()

  return (
    <div>
      <PublicPageHero
        imageKey={heroImageKey}
        backgroundImage={heroBackgroundImage}
        label={label}
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
      />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="about" />
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <FadeIn>
              <div className="rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                {image ? (
                  <img src={image} alt={imageAlt} className="w-full aspect-[4/3] object-cover" />
                ) : (
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-sky-100 via-amber-50 to-violet-100" aria-hidden />
                )}
              </div>
              {meta && meta.length > 0 && (
                <div className={`grid gap-3 mt-5 ${meta.length > 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3'}`}>
                  {meta.map((m) => (
                    <div key={m.label} className="kidscholl-stat-card !p-4 text-center">
                      <div className="text-xs font-bold text-slate-400 uppercase">{m.label}</div>
                      <div className="font-display font-bold text-ink mt-1">{m.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </FadeIn>
            <FadeIn delay={0.08}>
              <div className="kidscholl-form-card">
                <p className="text-slate-600 leading-relaxed text-lg">{detail}</p>
                <h3 className="font-display font-bold text-ink mt-8 mb-4">{t.pages.detail.highlights}</h3>
                <ul className="space-y-3">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link to={ctaHref} className="btn-kidscholl">
                    {ctaLabel ?? t.nav.applyNow} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to={backHref} className="btn-kidscholl-outline">{backLabel}</Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
