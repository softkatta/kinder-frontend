/** Hand-drawn style decorative SVGs — KidsCholl-inspired doodles */

export function Cloud({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} fill="currentColor" aria-hidden>
      <ellipse cx="35" cy="38" rx="28" ry="18" />
      <ellipse cx="65" cy="32" rx="32" ry="22" />
      <ellipse cx="90" cy="40" rx="24" ry="16" />
      <ellipse cx="55" cy="42" rx="38" ry="14" />
    </svg>
  )
}

export function Balloon({ className = '', color = '#FF8A4C' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 56" className={className} aria-hidden>
      <ellipse cx="20" cy="20" rx="16" ry="20" fill="none" stroke={color} strokeWidth="2.5" />
      <path d="M20 40 Q16 48 20 54 Q24 48 20 40" fill="none" stroke={color} strokeWidth="2" />
      <path d="M20 40 Q18 48 20 54" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  )
}

export function Butterfly({ className = '', color = '#FF8A4C' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden>
      <path d="M32 24 L32 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M32 14 C20 4 8 8 12 20 C16 28 28 26 32 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 14 C44 4 56 8 52 20 C48 28 36 26 32 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 8 Q32 4 36 8" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

export function Rainbow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 44" className={className} aria-hidden>
      <path d="M8 40 A32 32 0 0 1 72 40" fill="none" stroke="#FF8A4C" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 40 A26 26 0 0 1 66 40" fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 40 A20 20 0 0 1 60 40" fill="none" stroke="#6C5CE7" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="12" cy="38" rx="8" ry="5" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.5" />
      <ellipse cx="68" cy="38" rx="8" ry="5" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.5" />
    </svg>
  )
}

export function StarDoodle({ className = '', color = '#FBBF24' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path
        d="M20 4 L23 15 L35 15 L25 22 L29 34 L20 27 L11 34 L15 22 L5 15 L17 15 Z"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CircleRing({ className = '', color = '#1B1464' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="18" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 6" opacity="0.35" />
      <circle cx="24" cy="24" r="12" fill="none" stroke={color} strokeWidth="1.5" opacity="0.2" />
    </svg>
  )
}

export function PencilDoodle({ className = '', color = '#6C5CE7' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M8 40 L38 10 L42 14 L12 44 Z" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M38 10 L42 6 L44 8 L40 14 Z" fill="#FBBF24" stroke={color} strokeWidth="1.5" />
      <path d="M8 40 L4 44 L8 44 Z" fill="#FDA4AF" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

export function RocketDoodle({ className = '', color = '#FF8A4C' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 56" className={className} aria-hidden>
      <path d="M24 4 C24 4 36 20 36 36 C36 42 30 48 24 52 C18 48 12 42 12 36 C12 20 24 4 24 4Z" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="24" cy="28" r="6" fill="none" stroke="#7DD3FC" strokeWidth="2" />
      <path d="M12 36 L4 44 M36 36 L44 44" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M20 52 L18 56 M28 52 L30 56" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function HeartDoodle({ className = '', color = '#FDA4AF' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={className} aria-hidden>
      <path
        d="M20 32 C10 24 2 18 2 11 C2 5 6 2 11 2 C15 2 18 4 20 8 C22 4 25 2 29 2 C34 2 38 5 38 11 C38 18 30 24 20 32Z"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SunDoodle({ className = '', color = '#FBBF24' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="10" fill="none" stroke={color} strokeWidth="2.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="24"
          y1="24"
          x2={24 + 18 * Math.cos((deg * Math.PI) / 180)}
          y2={24 + 18 * Math.sin((deg * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

export function BookDoodle({ className = '', color = '#6C5CE7' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 44 40" className={className} aria-hidden>
      <path d="M4 6 C4 6 14 4 22 8 C30 4 40 6 40 6 V34 C40 34 30 32 22 36 C14 32 4 34 4 34 Z" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M22 8 V36" stroke={color} strokeWidth="2" />
    </svg>
  )
}

export function MusicNote({ className = '', color = '#FF8A4C' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 32 44" className={className} aria-hidden>
      <ellipse cx="10" cy="34" rx="8" ry="6" fill="none" stroke={color} strokeWidth="2.5" />
      <path d="M18 34 V8 L28 6 V30" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="26" cy="30" rx="6" ry="5" fill="none" stroke={color} strokeWidth="2.5" />
    </svg>
  )
}

export function FlowerDoodle({ className = '', color = '#FDA4AF' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="6" fill="#FBBF24" stroke={color} strokeWidth="1.5" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx={24 + 14 * Math.cos((deg * Math.PI) / 180)}
          cy={24 + 14 * Math.sin((deg * Math.PI) / 180)}
          rx="8"
          ry="10"
          fill="none"
          stroke={color}
          strokeWidth="2"
          transform={`rotate(${deg} ${24 + 14 * Math.cos((deg * Math.PI) / 180)} ${24 + 14 * Math.sin((deg * Math.PI) / 180)})`}
        />
      ))}
    </svg>
  )
}

export function Squiggle({ className = '', color = '#6C5CE7' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 24" className={className} aria-hidden>
      <path d="M4 12 Q16 2 28 12 T52 12" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function DotCluster({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="8" cy="8" r="3" fill="#FF8A4C" opacity="0.6" />
      <circle cx="20" cy="6" r="2" fill="#6C5CE7" opacity="0.5" />
      <circle cx="26" cy="18" r="2.5" fill="#7DD3FC" opacity="0.6" />
      <circle cx="10" cy="22" r="2" fill="#FBBF24" opacity="0.5" />
      <circle cx="18" cy="26" r="1.5" fill="#FDA4AF" opacity="0.6" />
    </svg>
  )
}
