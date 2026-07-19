import { Phone, Shield, Heart, UserCheck, Sparkles, type LucideIcon } from 'lucide-react'
import { FadeIn } from '@/components/ui/Motion'
import { KidschollSection } from '@/components/design/KidschollSection'
import type { FacilityCardTone } from '@/components/home/FacilityCard'

const whyIcons: LucideIcon[] = [Shield, Heart, UserCheck, Sparkles]
const whyTones: FacilityCardTone[] = ['sky', 'mint', 'sunny', 'lavender']

interface WhyItem {
  title: string
  desc: string
}

interface HomeWhySectionProps {
  label: string
  title: string
  panelTitle: string
  panelDesc: string
  items: readonly WhyItem[]
  callBox: string
  phone: string
  mainImage?: string | null
}

export function HomeWhySection({
  label,
  title,
  panelTitle,
  panelDesc,
  items,
  callBox,
  phone,
  mainImage,
}: HomeWhySectionProps) {
  return (
    <section className="home-why-section">
      <div className="home-why-section-inner">
        <FadeIn>
          <div className="home-why-visual">
            <div className="home-why-blob home-why-blob--sky" aria-hidden />
            <div className="home-why-blob home-why-blob--mint" aria-hidden />
            <div
              className="home-why-photo-main rounded-[2rem] bg-gradient-to-br from-sky-200 via-white to-mint-100 shadow-lg ring-4 ring-white overflow-hidden"
              aria-hidden={!mainImage}
            >
              {mainImage ? (
                <img src={mainImage} alt="" className="h-full w-full object-cover aspect-[4/5]" loading="lazy" />
              ) : null}
            </div>
            <div className="home-why-photo-accent animate-float-slow rounded-full bg-gradient-to-br from-amber-100 to-orange-200 shadow-md ring-4 ring-mint-200" aria-hidden />
            <div className="home-why-panel home-why-panel--animate">
              <h3 className="home-why-panel-title">{panelTitle}</h3>
              <p className="home-why-panel-desc">{panelDesc}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <KidschollSection align="left" label={label} title={title} className="!mb-8" />
          <div className="home-why-grid">
            {items.map(({ title: itemTitle, desc }, idx) => {
              const Icon = whyIcons[idx] || Sparkles
              const tone = whyTones[idx % whyTones.length]
              return (
                <article key={itemTitle} className={`home-why-card home-why-card--${tone}`}>
                  <div className={`home-why-card-icon home-why-card-icon--${tone}`}>
                    <Icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <h4 className="home-why-card-title">{itemTitle}</h4>
                  <p className="home-why-card-desc">{desc}</p>
                </article>
              )
            })}
          </div>
          <div className="home-why-call">
            <div className="home-why-call-icon">
              <Phone className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div>
              <p className="home-why-call-label">{callBox}</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="home-why-call-phone">
                {phone}
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
