import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { ProgramCard } from '@/components/home/ProgramCard'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { getProgramCopy } from '@/config/siteContent'
import { getProgramPrices } from '@/utils/programPricing'
import { mediaUrl } from '@/utils/mediaUrl'

const programEmojis: Record<string, string> = {
  nursery: '🌱',
  lkg: '🌟',
  ukg: '🚀',
}

export default function ProgramsPage() {
  const { t, locale } = useT()
  const [programs, setPrograms] = useState<Record<string, string>[]>([])
  const [loading, setLoading] = useState(true)
  const p = t.pages.programs

  useEffect(() => {
    setLoading(true)
    fetchLocalizedPublic((loc) => publicApi.programs(loc), locale)
      .then((data) => setPrograms((data as Record<string, string>[]) || []))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false))
  }, [locale])

  const priceLabels = { monthly: p.feeMonthly, sixMonth: p.fee6Month, yearly: p.feeYearly }

  return (
    <div>
      <PublicPageHero imageKey="page_programs_image" label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="programs" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <KidschollSection label={p.ageGroups} title={p.curriculum} />
          {loading ? (
            <p className="text-center text-slate-400 py-12">{t.common.loading}</p>
          ) : programs.length === 0 ? (
            <p className="text-center text-slate-400 py-12">{t.common.emptyPrograms}</p>
          ) : (
            <div className="home-programs">
              {programs.map((prog, i) => {
                const level = (prog.grade_level || prog.slug)?.toLowerCase() || 'nursery'
                const copy = getProgramCopy(level, locale, prog.description || prog.summary, prog.title, prog.ages, prog.time, prog.price)
                const emoji = programEmojis[level] || programEmojis.nursery
                const slug = prog.slug || level
                const prices = getProgramPrices(prog, level, locale)
                return (
                  <FadeIn key={prog.id ?? slug} delay={i * 0.08}>
                    <ProgramCard
                      title={prog.title || copy.title}
                      description={prog.description || prog.summary || copy.description}
                      ages={prog.ages || copy.ages}
                      time={prog.time || copy.time}
                      prices={prices}
                      priceLabels={priceLabels}
                      imagePath={mediaUrl(prog.image || prog.image_path)}
                      emojiFallback={emoji}
                      learnMoreLabel={t.common.readMore}
                      learnMoreHref={`/programs/${slug}`}
                    />
                  </FadeIn>
                )
              })}
            </div>
          )}
        </div>
      </section>
      <section className="section bg-white pb-20 text-center relative overflow-hidden">
        <SectionDecorations variant="enroll" />
        <div className="relative z-10">
        <KidschollSection label={t.nav.admission} title={p.limitedSeats} subtitle={`${p.admissionOpen} ${t.academicYear}.`} />
        <Link to="/admission" className="btn-kidscholl">{t.common.startApply} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  )
}
