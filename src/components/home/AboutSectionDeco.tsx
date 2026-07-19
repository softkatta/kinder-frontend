interface AboutSectionDollProps {
  side: 'left' | 'right'
}

export function AboutSectionDoll({ side }: AboutSectionDollProps) {
  return (
    <svg
      className={`home-about-side-deco home-about-side-deco--${side} home-about-side-deco--animate`}
      viewBox="0 0 80 120"
      fill="none"
      aria-hidden
    >
      <circle cx="40" cy="22" r="14" stroke="#34D399" strokeWidth="2.5" />
      <path d="M28 38 C30 52 50 52 52 38" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 52 L40 78 M40 78 L28 98 M40 78 L52 98" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="36" cy="20" r="1.5" fill="#34D399" />
      <circle cx="44" cy="20" r="1.5" fill="#34D399" />
      <path d="M36 26 Q40 29 44 26" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function AboutSectionArch({ side }: { side: 'left' | 'right' }) {
  return <div className={`home-about-side-arch home-about-side-arch--${side} home-about-side-arch--animate`} aria-hidden />
}

export function AboutSectionSquiggle({ side }: { side: 'left' | 'right' }) {
  return (
    <svg className={`home-about-side-squiggle home-about-side-squiggle--${side} home-about-side-squiggle--animate`} viewBox="0 0 48 32" aria-hidden>
      <path
        d="M4,20 C12,8 20,24 28,14 C36,4 40,18 44,10"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
