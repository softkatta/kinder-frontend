import { Link } from 'react-router-dom'
import { Palette, Music, Dumbbell, BookOpen, Puzzle, Heart, Sparkles, PartyPopper, Pencil, Flower2, ArrowRight } from 'lucide-react'
import { KidschollSection } from '@/components/design/KidschollSection'
import { HomeSection } from '@/components/home/HomeSection'
import { FadeIn } from '@/components/ui/Motion'
import { activityColors } from '@/styles/design-tokens'
import { useT } from '@/i18n/LanguageContext'
import { usePublicList } from '@/hooks/useCmsContent'
import { slugify } from '@/utils/slugify'

const activityIcons = [Palette, Pencil, Music, Dumbbell, BookOpen, Puzzle, Heart, Sparkles, Flower2, PartyPopper]

export function ActivitiesSection() {
  const { t } = useT()
  const a = t.home.activities
  const { items: activities } = usePublicList('activities')

  const rows = activities.length
    ? activities.map((raw) => ({
        slug: String(raw.slug ?? slugify(String(raw.title ?? ''))),
        title: String(raw.title ?? ''),
        desc: String(raw.summary ?? raw.description ?? ''),
      }))
    : a.items.map((item) => ({ slug: '', title: item.title, desc: item.desc }))

  return (
    <HomeSection tone="sky" decorations="programs">
      <KidschollSection label={a.label} title={a.title} subtitle={a.subtitle} />
      <div className="home-activity-grid">
        {rows.map((item, i) => {
          const Icon = activityIcons[i] || Sparkles
          const Card = (
            <div className="home-activity-card h-full">
              <div className={`home-activity-icon ${activityColors[i % activityColors.length]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-sm text-ink">{item.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              {item.slug && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 mt-2">
                  {t.common.readMore} <ArrowRight className="h-3 w-3" />
                </span>
              )}
            </div>
          )
          return (
            <FadeIn key={item.slug || item.title} delay={i * 0.04}>
              {item.slug ? (
                <Link to={`/activities/${item.slug}`} className="block hover:-translate-y-0.5 transition-transform">
                  {Card}
                </Link>
              ) : Card}
            </FadeIn>
          )
        })}
      </div>
      <div className="text-center mt-8">
        <Link to="/activities" className="btn-kidscholl-outline">{a.viewAll}</Link>
      </div>
    </HomeSection>
  )
}
