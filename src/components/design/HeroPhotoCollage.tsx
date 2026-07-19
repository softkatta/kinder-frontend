import { HeroCarousel } from '@/components/ui/HeroCarousel'
import { HeroIllustration } from '@/components/design/HeroIllustration'
import { ShapedPhoto } from '@/components/design/ShapedImage'
import { kindergartenPhotos } from '@/config/kindergartenPlaceholders'

interface HeroPhotoCollageProps {
  hasHeroSlides: boolean
  banners: { image_path?: string; title?: string; subtitle?: string }[]
  schoolShort: string
  grades: string
}

export function HeroPhotoCollage({ hasHeroSlides, banners, schoolShort, grades }: HeroPhotoCollageProps) {
  if (hasHeroSlides) {
    return (
      <div className="hero-carousel-wrap">
        <HeroCarousel banners={banners} aspect="aspect-[4/3] lg:aspect-[5/4]" className="w-full" />
      </div>
    )
  }

  return (
    <div className="hero-photo-collage">
      <div className="hero-collage-center">
        <div className="hero-visual-frame hero-visual-frame--organic">
          <HeroIllustration className="w-full h-full max-h-[min(340px,68vw)] object-contain animate-rainbow-glow" />
          <div className="hero-collage-caption">
            <p className="font-display font-bold text-lg">{schoolShort}</p>
            <p className="text-white/90 text-sm">{grades}</p>
          </div>
        </div>
      </div>

      <ShapedPhoto
        src={kindergartenPhotos.hero}
        alt="Children learning"
        shape="circle"
        border="white"
        rotate={-12}
        className="hero-collage-float hero-collage-float-1 animate-float-slow"
      />

      <ShapedPhoto
        src={kindergartenPhotos.lkg}
        alt="Classroom fun"
        shape="arch"
        border="mint"
        rotate={8}
        className="hero-collage-float hero-collage-float-2 animate-drift"
      />

      <ShapedPhoto
        src={kindergartenPhotos.ukg}
        alt="Outdoor play"
        shape="blob"
        border="sunny"
        rotate={-6}
        className="hero-collage-float hero-collage-float-3 animate-float"
      />

      <ShapedPhoto
        src={kindergartenPhotos.aboutSmall}
        alt="Art activity"
        shape="star"
        border="coral"
        rotate={10}
        className="hero-collage-float hero-collage-float-4 hidden md:block animate-wiggle"
      />
    </div>
  )
}
