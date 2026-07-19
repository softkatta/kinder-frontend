import { cn } from '@/utils/cn'

export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={cn('animate-fade-in-up opacity-0', className)}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  )
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>{children}</div>
}
