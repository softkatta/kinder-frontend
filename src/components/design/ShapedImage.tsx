import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { mediaUrl } from '@/utils/mediaUrl'

export type ImageShape =
  | 'circle'
  | 'arch'
  | 'blob'
  | 'cloud'
  | 'star'
  | 'hex'
  | 'wave'
  | 'polaroid'
  | 'diamond'
  | 'squircle'
  | 'leaf'

const shapeClass: Record<ImageShape, string> = {
  circle: 'shape-circle',
  arch: 'shape-arch',
  blob: 'shape-blob',
  cloud: 'shape-cloud',
  star: 'shape-star',
  hex: 'shape-hex',
  wave: 'shape-wave',
  polaroid: 'shape-polaroid',
  diamond: 'shape-diamond',
  squircle: 'shape-squircle',
  leaf: 'shape-leaf',
}

interface ShapedImageProps {
  src?: string | null
  alt: string
  shape: ImageShape
  className?: string
  imgClassName?: string
  fallback?: ReactNode
  border?: 'white' | 'sky' | 'mint' | 'sunny' | 'coral' | 'none'
  rotate?: number
  hover?: boolean
}

const borderClass = {
  white: 'shape-border-white',
  sky: 'shape-border-sky',
  mint: 'shape-border-mint',
  sunny: 'shape-border-sunny',
  coral: 'shape-border-coral',
  none: '',
}

export function ShapedImage({
  src,
  alt,
  shape,
  className,
  imgClassName,
  fallback,
  border = 'white',
  rotate = 0,
  hover = true,
}: ShapedImageProps) {
  const resolved = src ? mediaUrl(src) : null

  return (
    <div
      className={cn(
        'shape-frame',
        shapeClass[shape],
        borderClass[border],
        hover && 'shape-frame-hover',
        className,
      )}
      style={{ '--shape-rotate': `${rotate}deg` } as CSSProperties}
    >
      {resolved ? (
        <img src={resolved} alt={alt} className={cn('shape-img', imgClassName)} loading="lazy" />
      ) : (
        <div className={cn('shape-fallback', imgClassName)}>{fallback}</div>
      )}
    </div>
  )
}

/** Direct URL (placeholder) variant — no mediaUrl prefix */
export function ShapedPhoto({
  src,
  alt,
  shape,
  className,
  border = 'white',
  rotate = 0,
  hover = true,
}: {
  src: string
  alt: string
  shape: ImageShape
  className?: string
  border?: ShapedImageProps['border']
  rotate?: number
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'shape-frame',
        shapeClass[shape],
        borderClass[border],
        hover && 'shape-frame-hover',
        className,
      )}
      style={{ '--shape-rotate': `${rotate}deg` } as CSSProperties}
    >
      <img src={src} alt={alt} className="shape-img" loading="lazy" />
    </div>
  )
}
