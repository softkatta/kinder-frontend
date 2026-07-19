import { type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export { AdminPageHeader, AdminPageHero } from '@/components/admin/AdminPageHero'
export { AdminListPageLayout } from '@/components/admin/AdminListPageLayout'

interface AdminPanelProps {
  id?: string
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function AdminPanel({ id, title, subtitle, action, children, className, noPadding }: AdminPanelProps) {
  return (
    <div id={id} className={cn('admin-table-card', className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            {title && <h3 className="font-display text-lg font-bold text-ink dark:text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={noPadding ? undefined : 'p-5'}>{children}</div>
    </div>
  )
}

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'neutral'

const badgeStyles: Record<BadgeTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200/60',
  info: 'bg-sky-50 text-sky-700 ring-sky-200/60',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200/60',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200/60',
}

export function AdminBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset', badgeStyles[tone])}>
      {children}
    </span>
  )
}

const adminBtnClass = (variant: 'primary' | 'secondary' | 'ghost', className?: string) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200',
    variant === 'primary' && 'admin-btn-primary',
    variant === 'secondary' && 'admin-btn-secondary',
    variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 px-3',
    className,
  )

export function AdminBtn({
  children,
  variant = 'primary',
  className,
  to,
  href,
  target,
  rel,
  onClick,
  disabled,
  ...props
}: {
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  to?: string
  href?: string
  target?: string
  rel?: string
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) {
  const classes = adminBtnClass(variant, className)

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={classes} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export function AdminSearch({ placeholder = 'Search...' }: { placeholder?: string }) {
  return (
    <div className="admin-search hidden md:block">
      <input type="search" placeholder={placeholder} className="admin-search-input" />
    </div>
  )
}

export interface AdminActionItem {
  label: string
  icon: LucideIcon
  onClick?: () => void
  to?: string
  href?: string
  external?: boolean
  variant?: 'default' | 'primary' | 'danger' | 'success'
  confirm?: boolean
}

function actionKey(action: AdminActionItem, index: number) {
  return `${action.label}-${index}`
}

function isDeleteAction(action: AdminActionItem) {
  return action.variant === 'danger' && /delete/i.test(action.label)
}

export function AdminTableActions({ actions }: { actions: AdminActionItem[] }) {
  const [pendingConfirm, setPendingConfirm] = useState<string | null>(null)

  if (!actions.length) return null

  return (
    <div className="admin-row-actions">
      {actions.map((action, i) => {
        const key = actionKey(action, i)
        const needsConfirm = action.confirm ?? isDeleteAction(action)
        const confirming = pendingConfirm === key

        if (needsConfirm && confirming) {
          return (
            <span key={key} className="inline-flex flex-wrap items-center justify-end gap-1">
              <button
                type="button"
                className="admin-row-action admin-row-action--danger"
                onClick={(e) => {
                  e.stopPropagation()
                  action.onClick?.()
                  setPendingConfirm(null)
                }}
              >
                Confirm
              </button>
              <button
                type="button"
                className="admin-row-action"
                onClick={(e) => {
                  e.stopPropagation()
                  setPendingConfirm(null)
                }}
              >
                Cancel
              </button>
            </span>
          )
        }

        const cls = cn(
          'admin-row-action',
          action.variant === 'danger' && 'admin-row-action--danger',
          action.variant === 'primary' && 'admin-row-action--primary',
          action.variant === 'success' && 'admin-row-action--success',
        )
        const content = (
          <>
            <action.icon className="h-3.5 w-3.5 shrink-0" />
            <span>{action.label}</span>
          </>
        )

        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation()
          if (needsConfirm) {
            setPendingConfirm(key)
            return
          }
          action.onClick?.()
        }

        if (action.to) {
          return (
            <Link key={key} to={action.to} className={cls} onClick={() => setPendingConfirm(null)}>
              {content}
            </Link>
          )
        }

        if (action.href) {
          return (
            <a
              key={key}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              className={cls}
              onClick={() => setPendingConfirm(null)}
            >
              {content}
            </a>
          )
        }

        return (
          <button key={key} type="button" className={cls} onClick={handleClick}>
            {content}
          </button>
        )
      })}
    </div>
  )
}

/** Orange monospace ID cell (reference table style) */
export function AdminTableIdCell({ children }: { children: ReactNode }) {
  return <span className="admin-table-id">{children}</span>
}

/** Two-line primary cell with optional badge */
export function AdminTablePrimaryCell({
  title,
  meta,
  badge,
}: {
  title: ReactNode
  meta?: ReactNode
  badge?: ReactNode
}) {
  return (
    <div className="admin-table-primary-cell">
      <div className="flex flex-wrap items-center gap-2">
        <p className="admin-table-primary-title">{title}</p>
        {badge}
      </div>
      {meta && <p className="admin-table-primary-meta">{meta}</p>}
    </div>
  )
}

export function AdminModal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className={cn(
          'relative z-10 w-full rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col',
          wide ? 'max-w-3xl' : 'max-w-lg',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="border-b border-slate-100 px-6 py-4 shrink-0">
          <h3 id="admin-modal-title" className="font-display text-lg font-bold text-ink">{title}</h3>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1 form-stack">{children}</div>
        {footer && (
          <div className="border-t border-slate-100 px-6 py-4 shrink-0 flex flex-wrap justify-end gap-2 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminRecordFields({ fields }: { fields: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label}>
          <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{field.label}</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{field.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Consistent page wrapper for admin list/detail pages */
export function AdminPageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('admin-page-shell space-y-6', className)}>{children}</div>
}
