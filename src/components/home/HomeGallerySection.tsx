import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { FadeIn } from '@/components/ui/Motion'
import { KidschollSection } from '@/components/design/KidschollSection'
import type { ImageShape } from '@/components/design/ShapedImage'
import type { FacilityCardTone } from '@/components/home/FacilityCard'

export interface GalleryPreviewItem {
  key: string
  name: string
  imageSrc: string
  shape: ImageShape
  tone: FacilityCardTone
}

interface HomeGallerySectionProps {
  label: string
  title: string
  items: GalleryPreviewItem[]
  showAllLabel: string
  showAllHref?: string
}

export function HomeGallerySection({
  label,
  title,
  items,
  showAllLabel,
  showAllHref = '/gallery',
}: HomeGallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const navigateLightbox = useCallback((dir: 1 | -1) => {
    setLightboxIndex((current) => {
      if (current === null || items.length === 0) return current
      return (current + dir + items.length) % items.length
    })
  }, [items.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigateLightbox(-1)
      if (e.key === 'ArrowRight') navigateLightbox(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxIndex, closeLightbox, navigateLightbox])

  const activeItem = lightboxIndex !== null ? items[lightboxIndex] : null

  return (
    <section className="home-gallery-section">
      <div className="home-gallery-section-inner">
        <KidschollSection label={label} title={title} />
        <div className="home-gallery">
          {items.map((item, i) => (
            <FadeIn key={item.key} delay={i * 0.06}>
              <button
                type="button"
                className={`home-gallery-card home-gallery-card--${item.tone} ${i === 0 ? 'home-gallery-card--featured' : ''}`}
                onClick={() => setLightboxIndex(i)}
                aria-label={`View ${item.name}`}
              >
                <div className="home-gallery-card-media">
                  <img src={item.imageSrc} alt={item.name} loading="lazy" />
                  <div className="home-gallery-card-overlay" aria-hidden />
                  <div className="home-gallery-card-caption">
                    <span className="home-gallery-card-label">{item.name}</span>
                  </div>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to={showAllHref} className="btn-kidscholl-outline home-gallery-cta">
            {showAllLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {activeItem && (
        <div
          className="home-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.name}
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="home-gallery-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="home-gallery-lightbox-nav home-gallery-lightbox-nav--prev"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1) }}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="home-gallery-lightbox-nav home-gallery-lightbox-nav--next"
            onClick={(e) => { e.stopPropagation(); navigateLightbox(1) }}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="home-gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={activeItem.imageSrc} alt={activeItem.name} className="home-gallery-lightbox-img" />
            <p className="home-gallery-lightbox-caption">{activeItem.name}</p>
          </div>
        </div>
      )}
    </section>
  )
}

export const galleryPreviewShapes: ImageShape[] = ['arch', 'circle', 'blob', 'squircle']
export const galleryPreviewTones: FacilityCardTone[] = ['sky', 'mint', 'sunny', 'lavender']
