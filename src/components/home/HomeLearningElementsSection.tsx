import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { FadeIn } from '@/components/ui/Motion'
import { learningActivityIconMap } from '@/components/home/LearningActivityIcons'
import { useT } from '@/i18n/LanguageContext'
import type { HomeProfileContent } from '@/utils/homeProfile'

interface HomeLearningElementsSectionProps {
  content: HomeProfileContent
}

export function HomeLearningElementsSection({ content }: HomeLearningElementsSectionProps) {
  const { t } = useT()
  const items = content.learningItems
  const [selected, setSelected] = useState<number | null>(null)

  if (!items.length) return null

  return (
    <section className="home-learning-elements">
      <div className="home-learning-elements-inner">
        <FadeIn>
          <div className="home-learning-copy">
            <span className="home-learning-eyebrow">{content.learningLabel}</span>
            <h2 className="home-learning-heading">
              <span className="home-learning-heading-accent">{content.learningTitleAccent}</span>
              <span className="home-learning-heading-rest">{content.learningTitleRest}</span>
            </h2>
            {content.learningParagraphs.map((text) => (
              <p key={text.slice(0, 32)} className="home-learning-text">{text}</p>
            ))}
            <Link to="/activities" className="home-learning-cta">
              {t.home.learningElements.readMore} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div className="home-learning-orbit-wrap">
            <div
              className="home-learning-orbit"
              style={{ '--orbit-n': items.length } as CSSProperties}
              onMouseLeave={() => setSelected(null)}
            >
              <div className="home-learning-orbit-hub" aria-hidden={selected === null}>
                {selected !== null ? (
                  <div className="home-learning-orbit-center" key={selected} role="dialog" aria-live="polite">
                    <h3 className="home-learning-orbit-title">{items[selected]!.title}</h3>
                    <p className="home-learning-orbit-desc">{items[selected]!.desc}</p>
                  </div>
                ) : null}
              </div>

              <div className="home-learning-orbit-spinner">
                <svg className="home-learning-orbit-ring" viewBox="0 0 400 400" aria-hidden>
                  <circle cx="200" cy="200" r="168" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="8 10" />
                </svg>

                {items.map((item, i) => {
                  const Icon = learningActivityIconMap[item.key as keyof typeof learningActivityIconMap]
                  const isActive = i === selected
                  return (
                    <button
                      key={`${item.key}-${i}`}
                      type="button"
                      className={`home-learning-orbit-node ${isActive ? 'is-active' : ''}`}
                      style={{ '--orbit-i': i } as CSSProperties}
                      onClick={() => setSelected(i)}
                      aria-pressed={isActive}
                      aria-label={item.title}
                    >
                      <span className="home-learning-orbit-node-counter">
                        <span className="home-learning-orbit-node-icon">
                          {Icon ? <Icon className="home-learning-orbit-node-svg" /> : null}
                        </span>
                        <span className="home-learning-orbit-node-label">{item.title}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              <svg className="home-learning-cloud" viewBox="0 0 200 80" aria-hidden>
                <path
                  fill="#E0F2FE"
                  d="M20,50 C5,50 0,35 15,28 C10,15 30,8 45,18
                     C55,5 80,5 95,20 C115,10 140,20 150,38
                     C175,35 190,55 170,62 C180,72 150,78 120,75
                     C100,82 60,80 40,68 C25,72 15,62 20,50 Z"
                />
              </svg>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
