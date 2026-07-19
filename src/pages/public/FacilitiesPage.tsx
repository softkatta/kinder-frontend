import { useEffect, useState } from 'react'
import { BookOpen, Music, Palette, Users, Bus, Shield, HeartPulse, Monitor, Sparkles } from 'lucide-react'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'
import { FacilityCard, facilityCardShapes, facilityCardTones } from '@/components/home/FacilityCard'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'
import { slugify } from '@/utils/slugify'
import { mediaUrl } from '@/utils/mediaUrl'

const facilityIcons: Record<string, typeof BookOpen> = {
  library: BookOpen,
  music: Music,
  art: Palette,
  playground: Users,
  transport: Bus,
  cctv: Shield,
  medical: HeartPulse,
  smart: Monitor,
  activity: Sparkles,
}

export default function FacilitiesPage() {
  const { t, locale } = useT()
  const [items, setItems] = useState<Record<string, string>[]>([])
  const [loading, setLoading] = useState(true)
  const p = t.pages.facilities

  useEffect(() => {
    setLoading(true)
    fetchLocalizedPublic((loc) => publicApi.facilities(loc), locale)
      .then((data) => setItems((data as Record<string, string>[]) || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [locale])

  return (
    <div>
      <PublicPageHero imageKey="page_facilities_image" label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="programs" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <KidschollSection label={p.sectionLabel} title={p.sectionTitle} />
          {loading ? (
            <p className="text-center text-slate-400 py-12">{t.common.loading}</p>
          ) : items.length === 0 ? (
            <p className="text-center text-slate-400 py-12">{t.common.emptyFacilities}</p>
          ) : (
            <div className="home-facilities">
              {items.map((f, i) => {
                const iconKey = String(f.icon || f.slug || f.title?.toLowerCase().split(' ')[0] || '')
                const Icon = facilityIcons[iconKey] || Shield
                const hrefSlug = f.slug || iconKey || slugify(f.title || '')
                return (
                  <FadeIn key={f.id ?? hrefSlug} delay={i * 0.05}>
                    <FacilityCard
                      title={f.title}
                      description={f.description || f.summary || ''}
                      imagePath={mediaUrl(f.image || f.image_path)}
                      icon={Icon}
                      tone={facilityCardTones[i % facilityCardTones.length]}
                      shape={facilityCardShapes[i % facilityCardShapes.length]}
                      learnMoreLabel={t.common.readMore}
                      learnMoreHref={`/facilities/${hrefSlug}`}
                    />
                  </FadeIn>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
