import { mediaUrl } from '@/utils/mediaUrl'

interface HomeAboutBlobVisualProps {
  mainImage?: string | null
  schoolShort: string
}

export function HomeAboutBlobVisual({ mainImage, schoolShort }: HomeAboutBlobVisualProps) {
  const src = mainImage ? mediaUrl(mainImage) : ''

  return (
    <div className="home-about-visual">
      <div className="home-about-blob home-about-blob--sky" aria-hidden />
      <div className="home-about-blob home-about-blob--mint" aria-hidden />
      <div className="home-about-photo-blob">
        {src ? (
          <img src={src} alt={schoolShort} className="home-about-photo" loading="lazy" />
        ) : (
          <div className="home-about-photo bg-gradient-to-br from-sky-100 via-amber-50 to-mint-100" aria-hidden />
        )}
      </div>
    </div>
  )
}
