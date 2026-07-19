import { Link } from 'react-router-dom'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { FadeIn } from '@/components/ui/Motion'
import { KidschollSection } from '@/components/design/KidschollSection'
import type { FacilityCardTone } from '@/components/home/FacilityCard'

const stepTones: FacilityCardTone[] = ['sky', 'mint', 'sunny', 'lavender']

export interface EnrollStepItem {
  step: number
  title: string
  desc: string
  icon: LucideIcon
}

interface HomeEnrollSectionProps {
  label: string
  title: string
  subtitle: string
  steps: EnrollStepItem[]
  ctaLabel: string
  ctaHref?: string
}

export function HomeEnrollSection({
  label,
  title,
  subtitle,
  steps,
  ctaLabel,
  ctaHref = '/admission',
}: HomeEnrollSectionProps) {
  return (
    <section className="home-enroll-section">
      <div className="home-enroll-section-inner">
        <KidschollSection label={label} title={title} subtitle={subtitle} />
        <div className="home-enroll">
          <div className="home-enroll-track" aria-hidden>
            <svg className="home-enroll-track-line" viewBox="0 0 1000 8" preserveAspectRatio="none">
              <line
                x1="80"
                y1="4"
                x2="920"
                y2="4"
                stroke="url(#enroll-line-gradient)"
                strokeWidth="3"
                strokeDasharray="10 8"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="enroll-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {steps.map(({ step, title: stepTitle, desc, icon: Icon }, i) => {
            const tone = stepTones[i % stepTones.length]
            return (
              <FadeIn key={step} delay={i * 0.08}>
                <article className={`home-enroll-step home-enroll-step--${tone}`}>
                  <div className={`home-enroll-step-badge home-enroll-step-badge--${tone}`}>{step}</div>
                  <div className={`home-enroll-step-icon home-enroll-step-icon--${tone}`}>
                    <Icon className="h-6 w-6" strokeWidth={2.25} />
                  </div>
                  <h4 className="home-enroll-step-title">{stepTitle}</h4>
                  <p className="home-enroll-step-desc">{desc}</p>
                </article>
              </FadeIn>
            )
          })}
        </div>
        <div className="text-center mt-10">
          <Link to={ctaHref} className="btn-kidscholl home-enroll-cta">
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
