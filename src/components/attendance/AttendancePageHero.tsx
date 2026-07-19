import { type LucideIcon, ImageIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface AttendancePageHeroProps {
  badge: string
  title: string
  subtitle: string
  icon?: LucideIcon
  tone?: 'sky' | 'violet'
}

export function AttendancePageHero({
  badge,
  title,
  subtitle,
  icon: Icon = ImageIcon,
  tone = 'sky',
}: AttendancePageHeroProps) {
  return (
    <div
      className={cn(
        'attendance-hero relative overflow-hidden rounded-2xl border p-6 sm:p-8',
        tone === 'sky' && 'attendance-hero--sky',
        tone === 'violet' && 'attendance-hero--violet',
      )}
    >
      <div className="relative z-10 max-w-2xl">
        <span className="attendance-hero-badge">{badge}</span>
        <h1 className="mt-3 font-display text-2xl font-bold text-slate-800 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed sm:text-base">{subtitle}</p>
      </div>
      <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 sm:block">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/60 text-slate-300">
          <Icon className="h-12 w-12" strokeWidth={1.25} />
        </div>
      </div>
    </div>
  )
}
