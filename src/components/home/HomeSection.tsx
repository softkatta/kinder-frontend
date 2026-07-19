import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { SectionDecorations, type DecorationVariant } from '@/components/design/SectionDecorations'

type HomeSectionTone = 'white' | 'cream' | 'sky' | 'mint'

interface HomeSectionProps {
  tone?: HomeSectionTone
  children: ReactNode
  className?: string
  decorations?: DecorationVariant
  wave?: boolean
  id?: string
}

export function HomeSection({
  tone = 'white',
  children,
  className,
  decorations,
  wave = false,
  id,
}: HomeSectionProps) {
  return (
    <section id={id} className={cn('home-section', `home-section--${tone}`, className)}>
      {wave && (
        <div className="home-section-wave" aria-hidden>
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full h-8 md:h-10">
            <path
              fill="currentColor"
              d="M0,24 C240,48 480,0 720,24 C960,48 1200,0 1440,24 L1440,48 L0,48 Z"
            />
          </svg>
        </div>
      )}
      {decorations && <SectionDecorations variant={decorations} />}
      <div className="home-section-inner">{children}</div>
    </section>
  )
}
