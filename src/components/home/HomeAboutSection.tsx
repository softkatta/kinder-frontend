import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { FadeIn } from '@/components/ui/Motion'
import { HomeAboutBlobVisual } from '@/components/home/HomeAboutBlobVisual'
import { AboutSectionArch, AboutSectionDoll, AboutSectionSquiggle } from '@/components/home/AboutSectionDeco'

interface HomeAboutSectionProps {
  label: string
  title: string
  paragraphs: readonly string[]
  mainImage?: string | null
  schoolShort: string
  exploreLabel: string
}

export function HomeAboutSection({
  label,
  title,
  paragraphs,
  mainImage,
  schoolShort,
  exploreLabel,
}: HomeAboutSectionProps) {
  return (
    <section className="home-about-section">
      <AboutSectionDoll side="left" />
      <AboutSectionDoll side="right" />
      <AboutSectionArch side="left" />
      <AboutSectionSquiggle side="right" />
      <div className="home-about-section-inner">
        <FadeIn>
          <HomeAboutBlobVisual mainImage={mainImage} schoolShort={schoolShort} />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="home-about-copy">
            <span className="home-about-eyebrow">{label}</span>
            <h2 className="home-about-heading">{title}</h2>
            {paragraphs.map((text) => (
              <p key={text.slice(0, 32)} className="home-about-text">{text}</p>
            ))}
            <Link to="/about" className="home-about-cta">
              {exploreLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
