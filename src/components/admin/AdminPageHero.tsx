import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { adminImages } from '@/config/adminCatalog'

interface AdminPageHeroProps {
  title: string
  subtitle?: string
  badge?: string
  breadcrumbs?: { label: string; to?: string }[]
  image?: string
  actions?: ReactNode
  className?: string
}

/** Branch-management style page hero with background image */
export function AdminPageHero({
  title,
  subtitle,
  badge,
  breadcrumbs,
  image = adminImages.campus,
  actions,
  className,
}: AdminPageHeroProps) {
  return (
    <section className={cn('admin-page-hero', className)}>
      <div className="admin-page-hero-bg" style={{ backgroundImage: `url(${image})` }} aria-hidden />
      <div className="admin-page-hero-overlay" aria-hidden />
      <div className="admin-page-hero-inner">
        <div className="admin-page-hero-copy">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="admin-page-hero-breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}
                  {crumb.to ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          {badge && <span className="admin-page-hero-badge">{badge}</span>}
          <h1 className="admin-page-hero-title">{title}</h1>
          {subtitle && <p className="admin-page-hero-subtitle">{subtitle}</p>}
          {actions && <div className="admin-page-hero-actions">{actions}</div>}
        </div>
      </div>
    </section>
  )
}

/** @deprecated Use AdminPageHero — kept for gradual migration */
export function AdminPageHeader(props: AdminPageHeroProps) {
  return <AdminPageHero {...props} />
}
