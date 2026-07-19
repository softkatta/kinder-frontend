export function WaveFooterTop({ className = '' }: { className?: string }) {
  return (
    <div className={`relative -mt-1 ${className}`} aria-hidden>
      <svg viewBox="0 0 1440 80" className="w-full h-12 md:h-16" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="33%" stopColor="#6EE7B7" />
            <stop offset="66%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FDA4AF" />
          </linearGradient>
        </defs>
        <path fill="url(#waveGrad)" d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" opacity="0.3" />
        <path fill="#FFFBF5" d="M0,50 C360,90 720,20 1080,50 C1260,70 1380,60 1440,50 L1440,80 L0,80 Z" />
      </svg>
    </div>
  )
}
