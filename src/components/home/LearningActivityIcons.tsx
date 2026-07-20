interface IconProps {
  className?: string
}

export function LiteracyIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <circle cx="18" cy="20" r="8" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="30" cy="20" r="8" fill="#FECDD3" stroke="#F43F5E" strokeWidth="1.5" />
      <circle cx="15" cy="18" r="1.2" fill="#1E293B" />
      <circle cx="21" cy="18" r="1.2" fill="#1E293B" />
      <circle cx="27" cy="18" r="1.2" fill="#1E293B" />
      <circle cx="33" cy="18" r="1.2" fill="#1E293B" />
      <path d="M14 24 Q18 27 22 24" stroke="#1E293B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M26 24 Q30 27 34 24" stroke="#1E293B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function GardeningIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path d="M16 38 L20 22 L28 22 L32 38 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
      <path d="M24 22 L24 14" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="24" cy="12" rx="6" ry="4" fill="#4ADE80" />
      <path d="M20 30 Q24 26 28 30" fill="#7DD3FC" />
    </svg>
  )
}

export function SportIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <circle cx="30" cy="18" r="9" fill="#FCA5A5" stroke="#EF4444" strokeWidth="1.5" />
      <rect x="10" y="26" width="16" height="10" rx="3" fill="#F87171" stroke="#DC2626" strokeWidth="1.5" transform="rotate(-25 18 31)" />
      <circle cx="30" cy="18" r="2" fill="#FFF" opacity="0.6" />
    </svg>
  )
}

export function ArtIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <ellipse cx="24" cy="28" rx="14" ry="10" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
      <circle cx="16" cy="22" r="3" fill="#EF4444" />
      <circle cx="24" cy="18" r="3" fill="#FBBF24" />
      <circle cx="32" cy="22" r="3" fill="#22C55E" />
      <circle cx="20" cy="28" r="3" fill="#3B82F6" />
      <circle cx="28" cy="28" r="3" fill="#A855F7" />
    </svg>
  )
}

export function ExcursionsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <rect x="8" y="18" width="32" height="16" rx="4" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <rect x="12" y="14" width="24" height="8" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="16" cy="36" r="4" fill="#1E293B" />
      <circle cx="32" cy="36" r="4" fill="#1E293B" />
      <rect x="14" y="22" width="6" height="5" rx="1" fill="#7DD3FC" />
      <rect x="22" y="22" width="6" height="5" rx="1" fill="#7DD3FC" />
    </svg>
  )
}

export function OutdoorIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <circle cx="36" cy="14" r="6" fill="#FBBF24" />
      <path d="M10 38 L18 22 L22 30 L28 20 L38 38 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M22 38 L26 28 L30 38 Z" fill="#16A34A" />
    </svg>
  )
}

export function MathIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <rect x="10" y="12" width="28" height="24" rx="3" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
      <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#14532D" fontFamily="sans-serif">1+1=2</text>
    </svg>
  )
}

export function DanceIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="10" r="5" fill="#F9A8D4" stroke="#DB2777" strokeWidth="1.5" />
      <path d="M24 15 L24 28" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 20 L14 16" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 20 L34 14" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 28 L16 40" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 28 L32 40" stroke="#BE185D" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="38" cy="12" r="3" fill="#FDE68A" opacity="0.9" />
      <circle cx="10" cy="18" r="2.5" fill="#A5B4FC" opacity="0.9" />
    </svg>
  )
}

export function YogaIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="12" r="5" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.5" />
      <path d="M24 17 L24 30" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 22 L12 18" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 22 L36 18" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 30 L14 40" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 30 L34 40" stroke="#6D28D9" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="24" cy="42" rx="10" ry="2.5" fill="#DDD6FE" />
    </svg>
  )
}

export function MusicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path d="M18 34 V14 L36 10 V30" fill="none" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="34" r="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
      <circle cx="32" cy="30" r="5" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.5" />
      <path d="M18 18 L36 14" stroke="#0EA5E9" strokeWidth="2" />
    </svg>
  )
}

export function StoryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path d="M10 12 H22 C24 12 24 14 24 14 V38 C24 36 22 36 22 36 H10 Z" fill="#FDBA74" stroke="#EA580C" strokeWidth="1.5" />
      <path d="M38 12 H26 C24 12 24 14 24 14 V38 C24 36 26 36 26 36 H38 Z" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.5" />
      <path d="M14 18 H20 M14 23 H19 M14 28 H18" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 18 H34 M28 23 H33 M28 28 H32" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function PuzzleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path
        d="M14 14 H22 V18 C22 20.2 23.8 22 26 22 C28.2 22 30 20.2 30 18 V14 H34 V22 H38 C40.2 22 42 23.8 42 26 C42 28.2 40.2 30 38 30 H34 V38 H26 V34 C26 31.8 24.2 30 22 30 C19.8 30 18 31.8 18 34 V38 H10 V30 H14 C16.2 30 18 28.2 18 26 C18 23.8 16.2 22 14 22 H10 V14 H14 Z"
        fill="#F472B6"
        stroke="#DB2777"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CraftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <rect x="12" y="14" width="24" height="22" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
      <path d="M18 22 L24 28 L34 16" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="18" r="2" fill="#EF4444" />
      <circle cx="30" cy="32" r="2" fill="#3B82F6" />
    </svg>
  )
}

export function FestivalIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path d="M24 8 L28 18 H38 L30 24 L34 36 L24 28 L14 36 L18 24 L10 18 H20 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="24" cy="22" r="3" fill="#FDE68A" />
    </svg>
  )
}

export function DrawingIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <rect x="10" y="10" width="28" height="28" rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
      <path d="M16 30 L22 20 L28 26 L32 18" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 34 L40 10" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="34" r="3" fill="#FB923C" />
    </svg>
  )
}

const icons = {
  literacy: LiteracyIcon,
  gardening: GardeningIcon,
  sport: SportIcon,
  sports: SportIcon,
  art: ArtIcon,
  craft: CraftIcon,
  artcraft: ArtIcon,
  excursions: ExcursionsIcon,
  outdoor: OutdoorIcon,
  math: MathIcon,
  dance: DanceIcon,
  yoga: YogaIcon,
  music: MusicIcon,
  story: StoryIcon,
  storytelling: StoryIcon,
  puzzle: PuzzleIcon,
  drawing: DrawingIcon,
  festivals: FestivalIcon,
  festival: FestivalIcon,
} as const

export type LearningActivityIconKey = keyof typeof icons

export const learningActivityIconMap = icons

/** Resolve icon from CMS key or title (seed uses dance/yoga/music; UI defaults use literacy/art). */
export function resolveLearningActivityIcon(key: string, title = '') {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const fromKey = normalize(key)
  if (fromKey && fromKey in icons) {
    return icons[fromKey as LearningActivityIconKey]
  }

  const fromTitle = normalize(title)
  if (fromTitle.includes('art') || fromTitle.includes('craft')) return ArtIcon
  if (fromTitle.includes('sport')) return SportIcon
  if (fromTitle.includes('dance')) return DanceIcon
  if (fromTitle.includes('yoga')) return YogaIcon
  if (fromTitle.includes('music') || fromTitle.includes('song')) return MusicIcon
  if (fromTitle.includes('story')) return StoryIcon
  if (fromTitle.includes('garden')) return GardeningIcon
  if (fromTitle.includes('math') || fromTitle.includes('number')) return MathIcon
  if (fromTitle.includes('outdoor') || fromTitle.includes('nature')) return OutdoorIcon
  if (fromTitle.includes('excursion') || fromTitle.includes('trip')) return ExcursionsIcon
  if (fromTitle.includes('liter')) return LiteracyIcon
  if (fromTitle.includes('puzzle')) return PuzzleIcon
  if (fromTitle.includes('draw')) return DrawingIcon
  if (fromTitle.includes('festival')) return FestivalIcon

  return ArtIcon
}
