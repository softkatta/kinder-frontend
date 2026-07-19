import { useId } from 'react'
import { TestimonialCarousel } from '@/components/ui/TestimonialCarousel'
import type { HomeTestimonialItem } from '@/components/home/HomeTestimonialsSection.types'

export type { HomeTestimonialItem } from '@/components/home/HomeTestimonialsSection.types'

/** Wide scalloped cloud blob — reference style */
const BLOB = {
  w: 900,
  h: 480,
  path: `M95,115 C55,115 35,75 60,50 C35,30 70,10 110,22 C135,5 185,8 220,32 C255,12 315,15 355,38 C395,18 455,20 495,42 C535,22 595,25 635,48 C675,28 735,32 775,55 C815,35 865,42 885,78 C905,115 890,155 860,172 C885,210 870,252 830,268 C855,305 840,348 795,362 C820,400 805,438 755,448 C715,458 665,452 625,432 C585,452 525,458 485,438 C445,458 385,455 345,435 C305,455 245,452 205,432 C165,448 115,442 90,408 C65,374 80,332 105,315 C80,278 70,238 95,220 C70,185 75,145 95,115 Z`,
}
const BLOB_CLIP_SCALE = `scale(${1 / BLOB.w} ${1 / BLOB.h})`

interface HomeTestimonialsSectionProps {
  label: string
  title: string
  subtitle: string
  items: HomeTestimonialItem[]
}

export function HomeTestimonialsSection({
  label,
  title,
  subtitle,
  items,
}: HomeTestimonialsSectionProps) {
  const uid = useId().replace(/:/g, '')
  const clipId = `testi-blob-clip-${uid}`

  if (!items.length) return null

  const list = items

  return (
    <section className="home-testimonials-section">
      <div className="home-testimonials-section-inner">
        <div className="home-testimonials-blob-wrap">
          {/* Decorative squiggles outside blob */}
          <svg className="home-testimonials-squiggle home-testimonials-squiggle--tl" viewBox="0 0 80 80" aria-hidden>
            <path
              d="M40,8 C20,25 15,45 28,58 C12,52 8,68 22,72 C38,76 52,62 48,44 C56,50 68,38 62,24 C58,14 48,8 40,8 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <svg className="home-testimonials-squiggle home-testimonials-squiggle--br" viewBox="0 0 80 80" aria-hidden>
            <path
              d="M38,10 C58,22 65,42 52,58 C68,54 72,70 56,74 C40,78 26,64 30,46 C22,52 10,40 16,26 C20,14 30,8 38,10 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <div className="home-testimonials-blob">
            <svg
              className="home-testimonials-blob-svg"
              viewBox={`0 0 ${BLOB.w} ${BLOB.h}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                  <path transform={BLOB_CLIP_SCALE} d={BLOB.path} />
                </clipPath>
              </defs>
              <path className="home-testimonials-blob-fill" d={BLOB.path} />
              <path
                className="home-testimonials-blob-stroke"
                d={BLOB.path}
                fill="none"
                strokeWidth="5"
                strokeLinejoin="round"
              />
            </svg>

            <div
              className="home-testimonials-blob-content"
              style={{ clipPath: `url(#${clipId})` }}
            >
              <div className="home-testimonials-blob-doodles" aria-hidden>
                <span>✎</span><span>★</span><span>?</span><span>☺</span><span>→</span>
                <span>♪</span><span>✿</span><span>○</span><span>△</span><span>☁</span>
              </div>

              <header className="home-testimonials-header">
                <span className="home-testimonials-label">{label}</span>
                <h2 className="home-testimonials-title">{title}</h2>
                {subtitle && <p className="home-testimonials-subtitle">{subtitle}</p>}
              </header>

              <TestimonialCarousel items={list} variant="home" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
