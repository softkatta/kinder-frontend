import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { ShapedImage, ShapedPhoto } from '@/components/design/ShapedImage'
import { ProgramPricing } from '@/components/home/ProgramPricing'
import type { ProgramPrices } from '@/utils/programPricing'

interface ProgramCardProps {
  title: string
  description: string
  ages: string
  time: string
  prices: ProgramPrices
  priceLabels: { monthly: string; sixMonth: string; yearly: string }
  imagePath?: string | null
  photoFallback?: string
  emojiFallback?: string
  learnMoreLabel: string
  learnMoreHref?: string
}

export function ProgramCard({
  title,
  description,
  ages,
  time,
  prices,
  priceLabels,
  imagePath,
  photoFallback,
  emojiFallback = '🌟',
  learnMoreLabel,
  learnMoreHref = '/programs',
}: ProgramCardProps) {
  return (
    <article className="home-program-card">
      <div className="home-program-card-visual">
        {imagePath ? (
          <ShapedImage
            src={imagePath}
            alt={title}
            shape="circle"
            border="white"
            className="home-program-card-photo"
            fallback={<span className="text-5xl">{emojiFallback}</span>}
          />
        ) : photoFallback ? (
          <ShapedPhoto
            src={photoFallback}
            alt={title}
            shape="circle"
            border="white"
            className="home-program-card-photo"
          />
        ) : (
          <div className="home-program-card-photo flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 to-amber-50">
            <span className="text-5xl">{emojiFallback}</span>
          </div>
        )}
      </div>
      <div className="home-program-card-body">
        <div className="home-program-meta">
          <span className="home-program-badge">{ages}</span>
          <span className="home-program-meta-item">
            <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
            {time}
          </span>
          <ProgramPricing prices={prices} labels={priceLabels} />
        </div>
        <h3 className="home-program-card-title">{title}</h3>
        <p className="home-program-card-desc">{description}</p>
        <Link to={learnMoreHref} className="home-program-card-link">
          {learnMoreLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
