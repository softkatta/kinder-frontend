/** Cute propeller plane + clouds for hero cloud card */
export function HeroPlaneDoodle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="28" cy="48" rx="18" ry="8" fill="#BAE6FD" opacity="0.7" />
      <ellipse cx="58" cy="52" rx="14" ry="6" fill="#BAE6FD" opacity="0.5" />
      <ellipse cx="88" cy="46" rx="16" ry="7" fill="#BAE6FD" opacity="0.6" />
      <path
        d="M18 38 L42 32 L78 30 L92 28 L88 34 L72 36 L48 38 L28 42 Z"
        fill="#FDBA74"
        stroke="#FB923C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M42 32 L38 22 L46 30 Z" fill="#38BDF8" />
      <path d="M78 30 L82 20 L74 28 Z" fill="#38BDF8" />
      <circle cx="52" cy="34" r="5" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="1.5" />
      <path
        d="M14 36 C10 30 12 24 18 22"
        stroke="#FB923C"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M96 28 C102 22 108 24 110 30"
        stroke="#FB923C"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="18" cy="22" r="2" fill="#FB923C" opacity="0.6" />
      <circle cx="110" cy="30" r="2" fill="#FB923C" opacity="0.6" />
    </svg>
  )
}
