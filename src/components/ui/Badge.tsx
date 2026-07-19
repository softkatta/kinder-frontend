import { cn } from '@/utils/cn'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

const styles: Record<BadgeVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  default: 'bg-slate-100 text-slate-600',
}

export function Badge({ children, variant = 'default', className }: { children: React.ReactNode; variant?: BadgeVariant; className?: string }) {
  return <span className={cn('badge', styles[variant], className)}>{children}</span>
}
