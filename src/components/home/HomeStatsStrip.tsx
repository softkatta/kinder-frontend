import type { LucideIcon } from 'lucide-react'
import { GraduationCap, Award, BookOpen, Users } from 'lucide-react'
import { FadeIn } from '@/components/ui/Motion'
import type { useT } from '@/i18n/LanguageContext'

type H = ReturnType<typeof useT>['t']['home']

interface HomeStatsStripProps {
  teacherCount: string
  yearsExp: number
  programCount: number
  stats: H['stats']
}

export function HomeStatsStrip({
  teacherCount,
  yearsExp,
  programCount,
  stats,
}: HomeStatsStripProps) {
  const items: { value: string; label: string; icon: LucideIcon }[] = [
    { value: teacherCount, label: stats.teachers, icon: GraduationCap },
    { value: `${yearsExp}+`, label: stats.years, icon: Award },
    { value: `${programCount}`, label: stats.programs, icon: BookOpen },
    { value: '3', label: stats.classes, icon: Users },
  ]

  return (
    <section className="home-stats-strip" aria-label="School highlights">
      <div className="home-stats-strip-inner">
        {items.map(({ value, label, icon: Icon }, i) => (
          <FadeIn key={label} delay={i * 0.06}>
            <div className="home-stats-card">
              <div className="home-stats-icon">
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div>
                <p className="home-stats-value">{value}</p>
                <p className="home-stats-label">{label}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
