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

export const learningActivityIconMap = {
  literacy: LiteracyIcon,
  gardening: GardeningIcon,
  sport: SportIcon,
  art: ArtIcon,
  excursions: ExcursionsIcon,
  outdoor: OutdoorIcon,
  math: MathIcon,
} as const
