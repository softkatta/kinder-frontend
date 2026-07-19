import { Link } from 'react-router-dom'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { ShapedImage, ShapedPhoto } from '@/components/design/ShapedImage'
import type { ImageShape } from '@/components/design/ShapedImage'

export type FacilityCardTone = 'sky' | 'mint' | 'sunny' | 'coral' | 'lavender'

interface FacilityCardProps {
  title: string
  description: string
  imageSrc?: string
  imagePath?: string | null
  icon: LucideIcon
  tone?: FacilityCardTone
  shape?: ImageShape
  learnMoreLabel?: string
  learnMoreHref?: string
}

export function FacilityCard({
  title,
  description,
  imageSrc,
  imagePath,
  icon: Icon,
  tone = 'sky',
  shape = 'arch',
  learnMoreLabel,
  learnMoreHref = '/facilities',
}: FacilityCardProps) {
  return (
    <article className={`home-facility-card home-facility-card--${tone}`}>
      <div className={`home-facility-card-visual home-facility-card-visual--${tone}`}>
        {imagePath ? (
          <ShapedImage
            src={imagePath}
            alt={title}
            shape={shape}
            border="white"
            className="home-facility-card-photo"
            fallback={<Icon className="h-10 w-10 text-sky-500" strokeWidth={1.75} />}
          />
        ) : imageSrc ? (
          <ShapedPhoto
            src={imageSrc}
            alt={title}
            shape={shape}
            border="white"
            className="home-facility-card-photo"
          />
        ) : (
          <div className={`home-facility-card-photo flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-50 to-white`}>
            <Icon className="h-10 w-10 text-sky-500" strokeWidth={1.75} />
          </div>
        )}
        <div className={`home-facility-card-icon home-facility-card-icon--${tone}`}>
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
      </div>
      <div className={`home-facility-card-body home-facility-card-body--${tone}`}>
        <h3 className="home-facility-card-title">{title}</h3>
        <p className="home-facility-card-desc">{description}</p>
        {learnMoreLabel && (
          <Link to={learnMoreHref} className="home-facility-card-link">
            {learnMoreLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  )
}

export const facilityCardTones: FacilityCardTone[] = ['sky', 'mint', 'sunny', 'coral', 'lavender', 'sky']

export const facilityCardShapes: ImageShape[] = ['arch', 'circle', 'blob', 'squircle', 'circle', 'arch']
