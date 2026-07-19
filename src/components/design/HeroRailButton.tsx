import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export type HeroRailTone = 'sky' | 'orange' | 'mint' | 'indigo'

const shapePaths: Record<HeroRailTone, string> = {
  sky: 'M76,2 L76,82 L14,82 C2,74 0,58 8,46 C0,34 6,20 18,14 C12,4 28,0 42,6 C54,0 68,6 74,18 C76,10 76,4 76,2 Z',
  orange: 'M76,0 L76,84 L22,84 C8,78 4,64 12,52 C4,40 10,26 24,20 C18,8 34,2 48,8 C62,2 72,10 76,0 Z',
  mint: 'M76,6 L76,78 L28,78 C14,72 6,58 12,44 C4,32 12,18 26,14 C20,4 38,0 50,10 C64,4 72,14 76,6 Z',
  indigo: 'M76,0 L76,84 L18,84 C6,76 2,60 10,48 C2,36 8,22 22,16 C16,6 32,2 46,10 C58,4 70,12 76,0 Z',
}

const fills: Record<HeroRailTone, string> = {
  sky: '#38BDF8',
  orange: '#FB923C',
  mint: '#2DD4BF',
  indigo: '#6366F1',
}

interface HeroRailButtonProps {
  to: string
  external?: boolean
  tone: HeroRailTone
  label: string
  icon: LucideIcon
  index: number
}

export function HeroRailButton({ to, external, tone, label, icon: Icon, index }: HeroRailButtonProps) {
  const className = `home-hero-rail-btn home-hero-rail-btn--${tone} home-hero-rail-btn--n${index + 1}`

  const content = (
    <>
      <svg className="home-hero-rail-shape" viewBox="0 0 76 84" preserveAspectRatio="none" aria-hidden>
        <path d={shapePaths[tone]} fill={fills[tone]} />
      </svg>
      <span className="home-hero-rail-content">
        <Icon className="home-hero-rail-icon" strokeWidth={2.25} />
        <span className="home-hero-rail-label">{label}</span>
      </span>
    </>
  )

  if (external) {
    return <a href={to} className={className}>{content}</a>
  }
  return <Link to={to} className={className}>{content}</Link>
}
