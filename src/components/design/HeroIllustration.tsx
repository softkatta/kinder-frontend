/** Premium vector-style hero scene — school, kids, rainbow, sun (design-system colors) */

export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 420" className={className} aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sun */}
      <circle cx="420" cy="72" r="44" fill="#FDE68A" opacity="0.9" className="animate-pulse-soft" />
      <g className="animate-spin-slow" style={{ transformOrigin: '420px 72px' }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="420"
            y1="72"
            x2={420 + 58 * Math.cos((deg * Math.PI) / 180)}
            y2={72 + 58 * Math.sin((deg * Math.PI) / 180)}
            stroke="#FBBF24"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
        ))}
      </g>

      {/* Clouds */}
      <g className="animate-float-slow">
        <ellipse cx="88" cy="58" rx="36" ry="22" fill="#E0F2FE" />
        <ellipse cx="118" cy="48" rx="42" ry="26" fill="white" />
        <ellipse cx="148" cy="58" rx="30" ry="18" fill="#E0F2FE" />
      </g>
      <g className="animate-float" style={{ animationDelay: '1s' }}>
        <ellipse cx="360" cy="110" rx="28" ry="16" fill="#E0F2FE" />
        <ellipse cx="384" cy="102" rx="34" ry="20" fill="white" />
      </g>

      {/* Rainbow */}
      <g className="animate-drift">
        <path d="M140 200 A120 120 0 0 1 380 200" stroke="#7DD3FC" strokeWidth="8" strokeLinecap="round" />
        <path d="M155 200 A105 105 0 0 1 365 200" stroke="#6EE7B7" strokeWidth="8" strokeLinecap="round" />
        <path d="M170 200 A90 90 0 0 1 350 200" stroke="#FDE68A" strokeWidth="8" strokeLinecap="round" />
        <path d="M185 200 A75 75 0 0 1 335 200" stroke="#FDA4AF" strokeWidth="8" strokeLinecap="round" />
        <path d="M200 200 A60 60 0 0 1 320 200" stroke="#C4B5FD" strokeWidth="8" strokeLinecap="round" />
      </g>

      {/* School building */}
      <rect x="180" y="168" width="160" height="120" rx="12" fill="white" stroke="#38BDF8" strokeWidth="3" />
      <path d="M160 168 L260 118 L360 168" fill="#38BDF8" stroke="#0EA5E9" strokeWidth="3" strokeLinejoin="round" />
      <rect x="232" y="228" width="56" height="60" rx="6" fill="#6EE7B7" opacity="0.5" />
      <rect x="204" y="192" width="32" height="28" rx="4" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="2" />
      <rect x="284" y="192" width="32" height="28" rx="4" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="2" />
      <circle cx="260" cy="148" r="14" fill="#FDE68A" stroke="#FBBF24" strokeWidth="2" />

      {/* Ground */}
      <ellipse cx="260" cy="318" rx="200" ry="24" fill="#D1FAE5" opacity="0.6" />

      {/* Child left */}
      <g className="animate-bounce-soft">
        <circle cx="130" cy="268" r="22" fill="#FDA4AF" />
        <circle cx="130" cy="248" r="18" fill="#FFE4E6" stroke="#FDA4AF" strokeWidth="2" />
        <rect x="118" y="288" width="24" height="36" rx="8" fill="#7DD3FC" />
        <line x1="118" y1="302" x2="98" y2="318" stroke="#FFE4E6" strokeWidth="4" strokeLinecap="round" />
        <line x1="142" y1="302" x2="158" y2="290" stroke="#FFE4E6" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Child right */}
      <g className="animate-float" style={{ animationDelay: '0.5s' }}>
        <circle cx="390" cy="272" r="22" fill="#C4B5FD" />
        <circle cx="390" cy="252" r="18" fill="#EDE9FE" stroke="#C4B5FD" strokeWidth="2" />
        <rect x="378" y="292" width="24" height="36" rx="8" fill="#FDE68A" />
        <line x1="378" y1="306" x2="362" y2="294" stroke="#EDE9FE" strokeWidth="4" strokeLinecap="round" />
        <line x1="402" y1="306" x2="418" y2="320" stroke="#EDE9FE" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Teacher */}
      <g className="animate-float-slow" style={{ animationDelay: '0.3s' }}>
        <circle cx="260" cy="298" r="20" fill="#6EE7B7" />
        <circle cx="260" cy="280" r="16" fill="#FFFBF5" stroke="#34D399" strokeWidth="2" />
        <rect x="248" y="316" width="24" height="32" rx="6" fill="#38BDF8" />
      </g>

      {/* Blocks */}
      <rect x="88" y="328" width="28" height="28" rx="6" fill="#FBBF24" className="animate-wiggle" />
      <rect x="404" y="332" width="24" height="24" rx="5" fill="#7DD3FC" className="animate-wiggle" style={{ animationDelay: '0.4s' }} />

      {/* Stars */}
      <text x="48" y="140" fontSize="20" fill="#FBBF24" className="animate-pulse-soft">✦</text>
      <text x="460" y="200" fontSize="16" fill="#C4B5FD" className="animate-pulse-soft" style={{ animationDelay: '0.6s' }}>✦</text>
    </svg>
  )
}
