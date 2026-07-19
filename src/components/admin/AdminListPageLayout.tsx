import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { AdminPageHero } from '@/components/admin/AdminPageHero'
import { AdminPageShell } from '@/components/admin/AdminUi'
import { AdminMetricGrid, type AdminMetricItem } from '@/components/admin/AdminStats'

export interface AdminListPageLayoutProps {
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; to?: string }[]
  heroImage?: string
  primaryAction?: ReactNode
  headerActions?: ReactNode
  stats?: AdminMetricItem[]
  loading?: boolean
  loadingMessage?: string
  children: ReactNode
  className?: string
}

/** Standard list page: hero → metric cards → table */
export function AdminListPageLayout({
  title,
  subtitle,
  breadcrumbs,
  heroImage,
  primaryAction,
  headerActions,
  stats,
  loading,
  loadingMessage = 'Loading...',
  children,
  className,
}: AdminListPageLayoutProps) {
  const actions = primaryAction || headerActions ? (
    <>
      {primaryAction}
      {headerActions}
    </>
  ) : undefined

  return (
    <AdminPageShell className={cn('admin-list-page space-y-5', className)}>
      <AdminPageHero
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        image={heroImage}
        actions={actions}
      />
      {stats && stats.length > 0 && <AdminMetricGrid stats={stats} />}
      {loading && (
        <p className="text-sm text-slate-500 text-center py-6">{loadingMessage}</p>
      )}
      <div className="admin-list-page-body">{children}</div>
    </AdminPageShell>
  )
}
