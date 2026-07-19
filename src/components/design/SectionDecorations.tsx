import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import {
  Balloon, Butterfly, Rainbow, StarDoodle, CircleRing, PencilDoodle,
  RocketDoodle, HeartDoodle, SunDoodle, BookDoodle, MusicNote, FlowerDoodle,
  Squiggle, DotCluster, Cloud,
} from '@/components/ui/HeroDecorations'

export type DecorationVariant =
  | 'hero'
  | 'about'
  | 'programs'
  | 'why'
  | 'teachers'
  | 'pricing'
  | 'testimonials'
  | 'enroll'
  | 'events'
  | 'gallery'
  | 'cta'
  | 'page-hero'
  | 'default'

interface DecoConfig {
  node: ReactNode
  className: string
  style?: CSSProperties
}

const VARIANT_DECORATIONS: Record<DecorationVariant, DecoConfig[]> = {
  hero: [
    { node: <Balloon color="#FF8A4C" className="w-full h-full" />, className: 'absolute top-16 left-[3%] w-12 h-16 animate-float-slow hidden sm:block', style: { animationDelay: '0s' } },
    { node: <Butterfly color="#FF8A4C" className="w-full h-full" />, className: 'absolute top-24 right-[8%] w-14 h-10 animate-drift hidden md:block', style: { animationDelay: '0.5s' } },
    { node: <StarDoodle color="#FBBF24" className="w-full h-full" />, className: 'absolute top-40 left-[12%] w-8 h-8 animate-wiggle hidden lg:block' },
    { node: <CircleRing className="w-full h-full" />, className: 'absolute top-1/2 left-[45%] w-10 h-10 animate-spin-slow hidden md:block' },
    { node: <Cloud className="w-full h-full text-sky-300/50" />, className: 'absolute bottom-32 right-[5%] w-24 h-12 animate-float', style: { animationDelay: '1s' } },
    { node: <DotCluster className="w-full h-full" />, className: 'absolute bottom-48 left-[8%] w-8 h-8 animate-pulse-soft' },
    { node: <Balloon color="#7DD3FC" className="w-full h-full" />, className: 'absolute top-1/3 right-[20%] w-10 h-14 animate-float hidden lg:block', style: { animationDelay: '1.5s' } },
  ],
  about: [
    { node: <Rainbow className="w-full h-full" />, className: 'absolute top-8 left-[2%] w-20 h-11 animate-float-slow hidden sm:block' },
    { node: <Balloon color="#FF8A4C" className="w-full h-full" />, className: 'absolute top-12 right-[4%] w-11 h-15 animate-drift hidden md:block' },
    { node: <Butterfly color="#6C5CE7" className="w-full h-full" />, className: 'absolute bottom-20 right-[10%] w-12 h-9 animate-float', style: { animationDelay: '0.8s' } },
    { node: <CircleRing className="w-full h-full" />, className: 'absolute top-1/3 right-[30%] w-12 h-12 animate-spin-slow hidden lg:block' },
    { node: <HeartDoodle className="w-full h-full" />, className: 'absolute bottom-12 left-[6%] w-9 h-8 animate-wiggle hidden md:block' },
    { node: <Squiggle color="#FF8A4C" className="w-full h-full" />, className: 'absolute top-1/2 left-[40%] w-14 h-6 animate-drift hidden xl:block', style: { animationDelay: '2s' } },
  ],
  programs: [
    { node: <BookDoodle className="w-full h-full" />, className: 'absolute top-10 left-[3%] w-11 h-10 animate-float-slow hidden sm:block' },
    { node: <PencilDoodle className="w-full h-full" />, className: 'absolute top-16 right-[5%] w-10 h-10 animate-wiggle hidden md:block' },
    { node: <StarDoodle color="#6C5CE7" className="w-full h-full" />, className: 'absolute bottom-16 left-[8%] w-9 h-9 animate-pulse-soft' },
    { node: <RocketDoodle className="w-full h-full" />, className: 'absolute bottom-24 right-[6%] w-11 h-13 animate-float hidden md:block', style: { animationDelay: '1s' } },
    { node: <DotCluster className="w-full h-full" />, className: 'absolute top-1/2 right-[15%] w-8 h-8 animate-drift hidden lg:block' },
  ],
  why: [
    { node: <HeartDoodle className="w-full h-full" />, className: 'absolute top-12 left-[4%] w-10 h-9 animate-float-slow hidden sm:block' },
    { node: <SunDoodle className="w-full h-full" />, className: 'absolute top-8 right-[6%] w-12 h-12 animate-spin-slow hidden md:block' },
    { node: <Butterfly color="#FF8A4C" className="w-full h-full" />, className: 'absolute bottom-20 left-[10%] w-14 h-10 animate-drift hidden md:block' },
    { node: <CircleRing color="#6C5CE7" className="w-full h-full" />, className: 'absolute bottom-32 right-[12%] w-14 h-14 animate-float', style: { animationDelay: '0.6s' } },
    { node: <StarDoodle color="#FBBF24" className="w-full h-full" />, className: 'absolute top-1/2 left-[2%] w-7 h-7 animate-wiggle hidden lg:block' },
  ],
  teachers: [
    { node: <FlowerDoodle className="w-full h-full" />, className: 'absolute top-10 right-[4%] w-12 h-12 animate-float-slow hidden sm:block' },
    { node: <BookDoodle color="#FF8A4C" className="w-full h-full" />, className: 'absolute top-14 left-[5%] w-10 h-9 animate-drift hidden md:block' },
    { node: <StarDoodle color="#7DD3FC" className="w-full h-full" />, className: 'absolute bottom-20 right-[8%] w-8 h-8 animate-pulse-soft' },
    { node: <PencilDoodle color="#FF8A4C" className="w-full h-full" />, className: 'absolute bottom-16 left-[7%] w-9 h-9 animate-wiggle hidden md:block' },
    { node: <Cloud className="w-full h-full text-violet-200/60" />, className: 'absolute top-1/3 left-[2%] w-20 h-10 animate-float hidden lg:block' },
  ],
  pricing: [
    { node: <StarDoodle color="#FF8A4C" className="w-full h-full" />, className: 'absolute top-12 left-[6%] w-10 h-10 animate-wiggle hidden sm:block' },
    { node: <CircleRing className="w-full h-full" />, className: 'absolute top-20 right-[5%] w-12 h-12 animate-spin-slow hidden md:block' },
    { node: <Balloon color="#6C5CE7" className="w-full h-full" />, className: 'absolute bottom-24 left-[4%] w-11 h-14 animate-float hidden md:block' },
    { node: <DotCluster className="w-full h-full" />, className: 'absolute bottom-12 right-[10%] w-8 h-8 animate-pulse-soft' },
  ],
  testimonials: [
    { node: <HeartDoodle color="#6C5CE7" className="w-full h-full" />, className: 'absolute top-10 right-[6%] w-10 h-9 animate-float-slow hidden sm:block' },
    { node: <FlowerDoodle className="w-full h-full" />, className: 'absolute top-16 left-[5%] w-11 h-11 animate-drift hidden md:block' },
    { node: <Squiggle color="#FF8A4C" className="w-full h-full" />, className: 'absolute bottom-20 right-[15%] w-16 h-6 animate-float hidden lg:block' },
    { node: <StarDoodle color="#FDA4AF" className="w-full h-full" />, className: 'absolute bottom-12 left-[8%] w-8 h-8 animate-pulse-soft' },
  ],
  enroll: [
    { node: <RocketDoodle className="w-full h-full" />, className: 'absolute top-8 right-[5%] w-12 h-14 animate-float-slow hidden sm:block' },
    { node: <PencilDoodle className="w-full h-full" />, className: 'absolute top-14 left-[4%] w-10 h-10 animate-wiggle hidden md:block' },
    { node: <StarDoodle color="#FF8A4C" className="w-full h-full" />, className: 'absolute bottom-20 right-[8%] w-9 h-9 animate-drift' },
    { node: <BookDoodle className="w-full h-full" />, className: 'absolute bottom-16 left-[6%] w-11 h-10 animate-float hidden md:block', style: { animationDelay: '0.7s' } },
    { node: <CircleRing color="#FF8A4C" className="w-full h-full" />, className: 'absolute top-1/2 right-[3%] w-10 h-10 animate-spin-slow hidden lg:block' },
  ],
  events: [
    { node: <MusicNote className="w-full h-full" />, className: 'absolute top-10 left-[5%] w-8 h-11 animate-float-slow hidden sm:block' },
    { node: <Balloon color="#6C5CE7" className="w-full h-full" />, className: 'absolute top-12 right-[6%] w-11 h-14 animate-drift hidden md:block' },
    { node: <StarDoodle color="#FBBF24" className="w-full h-full" />, className: 'absolute bottom-24 left-[8%] w-9 h-9 animate-wiggle' },
    { node: <SunDoodle className="w-full h-full" />, className: 'absolute bottom-16 right-[10%] w-11 h-11 animate-spin-slow hidden md:block' },
  ],
  gallery: [
    { node: <CameraDoodle className="w-full h-full" />, className: 'absolute top-12 right-[5%] w-11 h-10 animate-float-slow hidden sm:block' },
    { node: <StarDoodle color="#6C5CE7" className="w-full h-full" />, className: 'absolute top-16 left-[4%] w-8 h-8 animate-pulse-soft hidden md:block' },
    { node: <Rainbow className="w-full h-full" />, className: 'absolute bottom-20 left-[6%] w-18 h-10 animate-float hidden md:block' },
    { node: <Butterfly color="#FF8A4C" className="w-full h-full" />, className: 'absolute bottom-12 right-[8%] w-12 h-9 animate-drift' },
  ],
  cta: [
    { node: <Balloon color="#FDE68A" className="w-full h-full" />, className: 'absolute top-8 left-[8%] w-12 h-16 animate-float-slow hidden sm:block' },
    { node: <Balloon color="#FDA4AF" className="w-full h-full" />, className: 'absolute top-12 right-[10%] w-10 h-14 animate-float hidden md:block', style: { animationDelay: '0.8s' } },
    { node: <StarDoodle color="#FDE68A" className="w-full h-full" />, className: 'absolute bottom-16 left-[12%] w-10 h-10 animate-wiggle hidden md:block' },
    { node: <Butterfly color="#FDE68A" className="w-full h-full" />, className: 'absolute bottom-20 right-[14%] w-14 h-10 animate-drift hidden md:block' },
    { node: <DotCluster className="w-full h-full" />, className: 'absolute top-1/2 left-[4%] w-8 h-8 animate-pulse-soft hidden lg:block' },
  ],
  'page-hero': [
    { node: <Balloon color="#FDE68A" className="w-full h-full" />, className: 'absolute top-6 left-[6%] w-10 h-14 animate-float-slow hidden sm:block' },
    { node: <Butterfly color="#FDA4AF" className="w-full h-full" />, className: 'absolute top-10 right-[8%] w-12 h-9 animate-drift hidden md:block' },
    { node: <StarDoodle color="#FDE68A" className="w-full h-full" />, className: 'absolute bottom-8 left-[15%] w-8 h-8 animate-wiggle hidden md:block' },
    { node: <CircleRing color="white" className="w-full h-full" />, className: 'absolute bottom-12 right-[20%] w-10 h-10 animate-spin-slow hidden lg:block opacity-40' },
  ],
  default: [
    { node: <StarDoodle color="#FF8A4C" className="w-full h-full" />, className: 'absolute top-10 right-[5%] w-8 h-8 animate-pulse-soft hidden sm:block' },
    { node: <Balloon color="#6C5CE7" className="w-full h-full" />, className: 'absolute bottom-16 left-[5%] w-10 h-13 animate-float-slow hidden md:block' },
    { node: <CircleRing className="w-full h-full" />, className: 'absolute top-1/2 right-[3%] w-9 h-9 animate-spin-slow hidden lg:block' },
  ],
}

function CameraDoodle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 36" className={className} aria-hidden>
      <rect x="4" y="10" width="36" height="24" rx="4" fill="none" stroke="#6C5CE7" strokeWidth="2.5" />
      <path d="M16 10 L20 6 H28 L32 10" fill="none" stroke="#6C5CE7" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="22" cy="22" r="8" fill="none" stroke="#FF8A4C" strokeWidth="2.5" />
    </svg>
  )
}

interface SectionDecorationsProps {
  variant?: DecorationVariant
  className?: string
}

export function SectionDecorations({ variant = 'default', className }: SectionDecorationsProps) {
  const items = VARIANT_DECORATIONS[variant] ?? VARIANT_DECORATIONS.default

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden z-0', className)} aria-hidden>
      {items.map((item, i) => (
        <div key={i} className={item.className} style={item.style}>
          {item.node}
        </div>
      ))}
    </div>
  )
}

interface DecoratedSectionProps {
  variant?: DecorationVariant
  className?: string
  children: ReactNode
  as?: 'section' | 'div'
}

export function DecoratedSection({ variant = 'default', className, children, as: Tag = 'section' }: DecoratedSectionProps) {
  return (
    <Tag className={cn('relative overflow-hidden', className)}>
      <SectionDecorations variant={variant} />
      <div className="relative z-10">{children}</div>
    </Tag>
  )
}
