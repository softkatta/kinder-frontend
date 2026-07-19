import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export function FormCard({
  children,
  className,
  title,
  subtitle,
}: {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
}) {
  return (
    <div className={cn('form-card', className)}>
      {(title || subtitle) && (
        <div className="form-card-header">
          {title && <h2 className="form-card-title">{title}</h2>}
          {subtitle && <p className="form-card-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('form-section', className)}>
      <div className="form-section-head">
        {Icon && (
          <span className="form-section-icon">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h3 className="form-section-title">{title}</h3>
          {description && <p className="form-section-desc">{description}</p>}
        </div>
      </div>
      <div className="form-section-body">{children}</div>
    </section>
  )
}

export function FormGrid({
  children,
  cols = 2,
  className,
}: {
  children: ReactNode
  cols?: 1 | 2 | 3
  className?: string
}) {
  return (
    <div
      className={cn(
        'form-grid',
        cols === 1 && 'form-grid--1',
        cols === 2 && 'form-grid--2',
        cols === 3 && 'form-grid--3',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function FormActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('form-actions', className)}>{children}</div>
}

export function FormStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('form-stack', className)}>{children}</div>
}
