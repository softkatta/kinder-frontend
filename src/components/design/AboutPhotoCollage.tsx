import { ShapedImage, ShapedPhoto } from '@/components/design/ShapedImage'
import { HeroIllustration } from '@/components/design/HeroIllustration'

interface AboutPhotoCollageProps {
  mainImage?: string | null
  accentImage?: string | null
  yearsExp: number
  established: string
  sinceBadge: string
  yearsLabel: string
  schoolShort: string
}

function GradientShape({ className, tone }: { className?: string; tone: 'sky' | 'mint' | 'sunny' | 'coral' }) {
  const tones = {
    sky: 'from-sky-200 via-white to-sky-100',
    mint: 'from-mint-100 to-sky-50',
    sunny: 'from-amber-100 to-orange-50',
    coral: 'from-rose-100 to-violet-50',
  }
  return <div className={`bg-gradient-to-br ${tones[tone]} ${className ?? ''}`} aria-hidden />
}

export function AboutPhotoCollage({
  mainImage,
  accentImage,
  yearsExp,
  established,
  sinceBadge,
  yearsLabel,
  schoolShort,
}: AboutPhotoCollageProps) {
  return (
    <div className="about-collage">
      {mainImage ? (
        <ShapedImage
          src={mainImage}
          alt={schoolShort}
          shape="arch"
          border="white"
          rotate={-2}
          className="about-collage-main"
          fallback={<GradientShape className="about-collage-main h-full w-full" tone="sky" />}
        />
      ) : (
        <GradientShape className="about-collage-main rounded-[2rem] shadow-lg ring-4 ring-white" tone="sky" />
      )}

      {accentImage ? (
        <ShapedPhoto
          src={accentImage}
          alt=""
          shape="circle"
          border="mint"
          rotate={6}
          className="about-collage-circle animate-float-slow"
        />
      ) : (
        <GradientShape className="about-collage-circle animate-float-slow rounded-full shadow-md ring-4 ring-mint-200" tone="mint" />
      )}
      <GradientShape className="about-collage-blob animate-drift rounded-[2rem] shadow-md ring-4 ring-amber-100" tone="sunny" />
      <GradientShape className="about-collage-leaf hidden sm:block animate-wiggle rounded-[2rem] shadow-md ring-4 ring-rose-100" tone="coral" />

      <div className="about-collage-badge about-collage-badge-years">
        <div className="font-display text-3xl font-bold text-sky-500">{yearsExp}+</div>
        <div className="text-xs font-bold text-slate-500 uppercase">{yearsLabel}</div>
      </div>

      <div className="about-collage-badge about-collage-badge-since">
        {established} {sinceBadge}
      </div>

      {!mainImage && (
        <div className="about-collage-illustration pointer-events-none hidden lg:block">
          <HeroIllustration className="w-full h-full opacity-[0.15]" />
        </div>
      )}
    </div>
  )
}
