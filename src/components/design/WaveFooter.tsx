export function WaveFooterTop({ className = '' }: { className?: string }) {
  return (
    <div className={`site-footer-wave ${className}`} aria-hidden>
      <svg viewBox="0 0 1440 72" className="w-full h-10 md:h-14" preserveAspectRatio="none">
        <defs>
          <linearGradient id="footerWaveAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="40%" stopColor="#6EE7B7" />
            <stop offset="75%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FDA4AF" />
          </linearGradient>
        </defs>
        <path
          fill="url(#footerWaveAccent)"
          d="M0,28 C240,64 480,8 720,36 C960,64 1200,16 1440,40 L1440,72 L0,72 Z"
          opacity="0.45"
        />
        <path
          fill="#0B6FA8"
          d="M0,40 C280,72 560,12 840,40 C1080,60 1260,48 1440,36 L1440,72 L0,72 Z"
        />
      </svg>
    </div>
  )
}
