import { SectionDecorations } from '@/components/design/SectionDecorations'
import { PageBreadcrumbs, type Crumb } from '@/components/public/PageBreadcrumbs'
import { cn } from '@/utils/cn'

interface PageHeroProps {
  label?: string
  title: string
  subtitle?: string
  className?: string
  breadcrumbs?: Crumb[]
  backgroundImage?: string | null
}

export function PageHero({ label, title, subtitle, className, breadcrumbs, backgroundImage }: PageHeroProps) {
  const crumbs = breadcrumbs ?? [{ label: title }]

  return (
    <div
      className={cn(
        'kidscholl-page-hero relative overflow-hidden',
        backgroundImage && 'kidscholl-page-hero--photo',
        className,
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {backgroundImage && <div className="kidscholl-page-hero-photo-tint" aria-hidden />}
      <SectionDecorations variant="page-hero" />
      <div className="kidscholl-blob w-56 h-56 bg-orange-300/40 -top-16 -right-10" />
      <div className="kidscholl-blob w-40 h-40 bg-violet-300/30 bottom-0 left-10" />
      <div className="mx-auto max-w-7xl px-4 py-14 md:py-18 relative z-10">
        <PageBreadcrumbs crumbs={crumbs} />
        {label && <span className="kidscholl-label kidscholl-label-light">{label}</span>}
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-3 mb-3 leading-tight">{title}</h1>
        {subtitle && <p className="text-white/80 text-base md:text-lg max-w-2xl">{subtitle}</p>}
      </div>
    </div>
  )
}
