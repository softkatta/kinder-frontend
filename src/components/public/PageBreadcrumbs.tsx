import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useT } from '@/i18n/LanguageContext'

export interface Crumb {
  label: string
  to?: string
}

export function PageBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const { t } = useT()

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-white/70 mb-6">
      <Link to="/" className="flex items-center gap-1 hover:text-orange-200 transition-colors">
        <Home className="h-3.5 w-3.5" /> {t.common.home}
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />
          {crumb.to ? (
            <Link to={crumb.to} className="hover:text-orange-200 transition-colors">{crumb.label}</Link>
          ) : (
            <span className="text-orange-200 font-semibold">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
