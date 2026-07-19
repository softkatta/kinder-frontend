import { useEffect, useState, useCallback } from 'react'
import { mediaUrl } from '@/utils/mediaUrl'
import { useT } from '@/i18n/LanguageContext'

interface Slide { src: string; alt: string; caption: string }

interface HeroCarouselProps {
  banners?: { image_path?: string; title?: string; subtitle?: string }[]
  aspect?: string
  className?: string
}

export function HeroCarousel({ banners = [], aspect = 'aspect-[4/5]', className = '' }: HeroCarouselProps) {
  const { t } = useT()

  const slides: Slide[] = banners
    .filter((b) => b.image_path)
    .map((b) => ({
      src: mediaUrl(b.image_path),
      alt: b.title || 'School banner',
      caption: b.subtitle || b.title || t.defaults.shortName,
    }))

  const [index, setIndex] = useState(0)
  const [broken, setBroken] = useState<Record<number, boolean>>({})
  const validSlides = slides.filter((_, i) => !broken[i])

  const next = useCallback(() => {
    if (validSlides.length <= 1) return
    setIndex((i) => (i + 1) % validSlides.length)
  }, [validSlides.length])

  useEffect(() => {
    if (validSlides.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, validSlides.length])

  if (validSlides.length === 0) return null

  const current = Math.min(index, validSlides.length - 1)

  return (
    <div className={`relative w-full max-w-md lg:max-w-xl mx-auto ${className}`}>
      <div className={`relative w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl ${aspect} bg-sky-200`}>
        {slides.map((slide, i) => {
          if (broken[i]) return null
          const visibleIndex = slides.slice(0, i).filter((_, j) => !broken[j]).length
          return (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${visibleIndex === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={() => setBroken((prev) => ({ ...prev, [i]: true }))}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="font-bold text-lg">{slide.caption}</p>
                <p className="text-white/80 text-sm">{t.grades}</p>
              </div>
            </div>
          )
        })}
      </div>

      {validSlides.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {validSlides.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
