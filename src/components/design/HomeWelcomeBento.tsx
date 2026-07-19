import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapPin, CalendarDays, ClipboardList, Phone } from 'lucide-react'
import { HeroPlaneDoodle } from '@/components/design/HeroPlaneDoodle'
import { HeroRailButton } from '@/components/design/HeroRailButton'
import { mediaUrl } from '@/utils/mediaUrl'
import type { HeroSidebarCopy, HeroSlideCopy } from '@/config/siteContent'
import { HeroNoticeStrip, type HeroNoticeItem } from '@/components/design/HeroNoticeStrip'

interface HeroBanner {
  image?: string
  image_path?: string
  title?: string
  summary?: string
  subtitle?: string
  title_rest?: string
}

interface HomeWelcomeBentoProps {
  admissionBanner: string
  notices?: HeroNoticeItem[]
  slides: HeroSlideCopy[]
  sidebar: HeroSidebarCopy
  banners?: HeroBanner[]
  schoolShort: string
  phone: string
}

const heroGradients = [
  'linear-gradient(135deg, #7dd3fc 0%, #fde68a 50%, #fbcfe8 100%)',
  'linear-gradient(135deg, #a7f3d0 0%, #bae6fd 50%, #fef3c7 100%)',
  'linear-gradient(135deg, #c4b5fd 0%, #fda4af 50%, #fef08a 100%)',
]

function bannerImage(banner: HeroBanner | undefined, index: number): string {
  const src = banner?.image || banner?.image_path
  return src ? mediaUrl(src) : heroGradients[index % heroGradients.length]!
}

export function HomeWelcomeBento({
  admissionBanner,
  notices = [],
  slides,
  sidebar,
  banners = [],
  schoolShort,
  phone,
}: HomeWelcomeBentoProps) {
  const heroSlides = useMemo(() => {
    return slides.map((copy, i) => ({
      subline: copy.subline,
      titleAccent: copy.titleAccent,
      titleRest: copy.titleRest,
      image: bannerImage(banners[i], i),
    }))
  }, [slides, banners])

  const [index, setIndex] = useState(0)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % heroSlides.length)
  }, [heroSlides.length])

  useEffect(() => {
    if (heroSlides.length <= 1) return
    const timer = setInterval(next, 5500)
    return () => clearInterval(timer)
  }, [next, heroSlides.length])

  const active = heroSlides[index] ?? heroSlides[0]!

  const railItems = [
    { key: 'location', label: sidebar.location, href: '/contact', icon: MapPin, tone: 'sky' as const },
    { key: 'tour', label: sidebar.bookTour, href: '/book-tour', icon: CalendarDays, tone: 'orange' as const },
    { key: 'parents', label: sidebar.forParents, href: '/payment', icon: ClipboardList, tone: 'mint' as const },
    { key: 'contacts', label: sidebar.contacts, href: `tel:${phone.replace(/\s/g, '')}`, icon: Phone, tone: 'indigo' as const },
  ]

  return (
    <section
      className="home-hero home-hero--fullscreen"
      aria-label={schoolShort}
    >
      <HeroNoticeStrip notices={notices} fallback={admissionBanner} />

      <div className="home-hero-stage">
        <div className="home-hero-slides" aria-hidden>
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className={`home-hero-slide ${i === index ? 'is-active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
          <div className="home-hero-tint" />
        </div>

        <div className="home-hero-inner">
          <div className="home-hero-right-panel">
            <div className="home-hero-cloud" key={index}>
              <svg className="home-hero-cloud-shape" viewBox="0 0 420 400" preserveAspectRatio="none" aria-hidden>
                <path
                  fill="#FFFFFF"
                  d="M30,90 C10,40 60,10 110,25 C140,5 200,15 230,45
                     C280,30 340,50 370,90 C410,85 420,140 400,180
                     C420,230 390,290 340,320 C360,360 300,390 240,385
                     C200,400 140,390 100,360 C50,370 15,330 20,280
                     C5,240 15,190 30,150 C20,120 25,100 30,90 Z"
                />
              </svg>
              <div className="home-hero-cloud-content home-hero-cloud-content--animate">
                <HeroPlaneDoodle className="home-hero-plane" />
                <p className="home-hero-subline">{active.subline}</p>
                <h1 className="home-hero-title">
                  <span className="home-hero-title-accent">{active.titleAccent}</span>
                  <span className="home-hero-title-rest">{active.titleRest}</span>
                </h1>
              </div>
            </div>

            <nav className="home-hero-rail" aria-label="Quick links">
              {railItems.map(({ key, label, href, icon, tone }, i) => (
                <HeroRailButton
                  key={key}
                  to={href}
                  external={href.startsWith('tel:')}
                  tone={tone}
                  label={label}
                  icon={icon}
                  index={i}
                />
              ))}
            </nav>
          </div>
        </div>

        {heroSlides.length > 1 && (
          <div className="home-hero-dots" role="tablist" aria-label="Hero slides">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                className={`home-hero-dot ${i === index ? 'is-active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}

        <div className="home-hero-blend" aria-hidden />
      </div>
    </section>
  )
}
