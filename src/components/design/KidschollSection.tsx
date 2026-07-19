import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface KidschollSectionProps {
  label: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
  light?: boolean
}

export function KidschollSection({ label, title, subtitle, align = 'center', className, light }: KidschollSectionProps) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', 'mb-12 md:mb-14', className)}>
      <span className={cn('kidscholl-label', light && 'kidscholl-label-light')}>{label}</span>
      <h2 className={cn('font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight mt-3 mb-3', light ? 'text-white' : 'text-ink')}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-base md:text-lg leading-relaxed max-w-2xl', light ? 'text-white/85' : 'text-slate-500', align === 'center' && 'mx-auto')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

interface StatCardProps {
  value: string
  label: string
  icon: ReactNode
  className?: string
}

export function KidschollStatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <div className={cn('kidscholl-stat-card', className)}>
      <div className="kidscholl-stat-icon">{icon}</div>
      <div className="font-display text-2xl md:text-3xl font-bold text-ink">{value}</div>
      <div className="text-xs md:text-sm font-semibold text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}
