import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', className }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', 'mb-12', className)}>
      {eyebrow && (
        <span className="inline-block mb-3 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-sky-100 to-mint-100 text-sky-700 border border-sky-200/60">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-ink mb-3 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl', align === 'center' && 'mx-auto')}>
          {subtitle}
        </p>
      )}
      <div className={cn('mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-sky-400 via-mint-400 to-amber-300', align === 'center' && 'mx-auto')} />
    </div>
  )
}
