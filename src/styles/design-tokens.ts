/** Kindergarten ERP — Design Tokens (reference for TS components) */
export const colors = {
  sky: '#7DD3FC',
  mint: '#6EE7B7',
  sunny: '#FDE68A',
  coral: '#FDA4AF',
  lavender: '#C4B5FD',
  peach: '#FED7AA',
  cream: '#FFFBF5',
  ink: '#1E293B',
} as const

export const programGradients = {
  nursery: 'from-sky-200 via-mint-100 to-cream',
  lkg: 'from-amber-100 via-peach to-coral/30',
  ukg: 'from-lavender/40 via-sky-100 to-mint-100',
} as const

export const activityColors = [
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-mint-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-orange-100 text-orange-700 border-orange-200',
] as const
