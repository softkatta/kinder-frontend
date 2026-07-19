import { type CSSProperties, type ReactNode } from 'react'
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export type BgCardOverlay = 'violet' | 'dark' | 'light' | 'emerald' | 'amber' | 'sky'

export function AdminBgCard({
  image,
  overlay = 'dark',
  className,
  contentClassName,
  children,
  style,
}: {
  image: string
  overlay?: BgCardOverlay
  className?: string
  contentClassName?: string
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div
      className={cn('admin-bg-card', `admin-bg-card--${overlay}`, className)}
      style={{ backgroundImage: `url(${image})`, ...style }}
    >
      <div className="admin-bg-card-overlay" aria-hidden />
      <div className={cn('admin-bg-card-content', contentClassName)}>{children}</div>
    </div>
  )
}

export interface AdminMetricItem {
  label: string
  value: string | number
  change?: string
  changeDirection?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  tone?: 'orange' | 'emerald' | 'violet' | 'sky' | 'amber'
}

const metricIconTone: Record<NonNullable<AdminMetricItem['tone']>, string> = {
  orange: 'bg-primary-100 text-primary-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  violet: 'bg-primary-100 text-primary-600',
  sky: 'bg-sky-100 text-sky-600',
  amber: 'bg-amber-100 text-amber-600',
}

const metricTones: NonNullable<AdminMetricItem['tone']>[] = ['sky', 'emerald', 'sky', 'amber']

/** White metric cards (branch management reference style) */
export function AdminMetricGrid({ stats }: { stats: AdminMetricItem[] }) {
  return (
    <div className="admin-metric-grid">
      {stats.map((stat, i) => {
        const tone = stat.tone ?? metricTones[i % metricTones.length]!
        const Icon = stat.icon
        const changeUp = stat.changeDirection === 'up'
        const changeDown = stat.changeDirection === 'down'

        return (
          <div key={stat.label} className="admin-metric-card">
            <div className="min-w-0">
              <p className="admin-metric-label">{stat.label}</p>
              <p className="admin-metric-value">{stat.value}</p>
              {stat.change && (
                <p className={cn(
                  'admin-metric-change',
                  changeUp && 'admin-metric-change--up',
                  changeDown && 'admin-metric-change--down',
                )}>
                  {changeUp && <TrendingUp className="h-3 w-3" />}
                  {changeDown && <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </p>
              )}
            </div>
            <div className={cn('admin-metric-icon', metricIconTone[tone])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export interface AdminStatItem {
  label: string
  value: string | number
  change?: string
  icon?: LucideIcon
  tone?: 'violet' | 'sky' | 'emerald' | 'amber'
  image?: string
}

export function AdminStatGrid({ stats }: { stats: AdminStatItem[] }) {
  const metrics: AdminMetricItem[] = stats.map((stat, i) => ({
    label: stat.label,
    value: stat.value,
    change: stat.change,
    changeDirection: stat.change?.startsWith('+') ? 'up' : stat.change?.startsWith('-') ? 'down' : 'neutral',
    icon: stat.icon ?? TrendingUp,
    tone: (stat.tone === 'emerald' ? 'emerald' : stat.tone === 'sky' ? 'sky' : stat.tone === 'amber' ? 'amber' : stat.tone === 'violet' ? 'violet' : metricTones[i % metricTones.length]) as AdminMetricItem['tone'],
  }))
  return <AdminMetricGrid stats={metrics} />
}

interface ActivityItem {
  title: string
  meta?: string
  image?: string
}

export function AdminActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i}>
          {item.image ? (
            <AdminBgCard
              image={item.image}
              overlay="light"
              className="min-h-[64px]"
              contentClassName="flex items-center justify-between gap-3 px-4 py-3"
            >
              <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
              {item.meta && <span className="shrink-0 text-xs font-medium text-slate-500">{item.meta}</span>}
            </AdminBgCard>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              {item.meta && <span className="text-xs text-slate-400">{item.meta}</span>}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export function AdminQuickAction({
  title,
  meta,
  icon: Icon,
  image,
  onClick,
  to,
}: {
  title: string
  meta?: string
  icon: LucideIcon
  image?: string
  onClick?: () => void
  to?: string
}) {
  const inner = image ? (
    <AdminBgCard
      image={image}
      overlay="violet"
      className="min-h-[72px] transition-transform hover:scale-[1.02]"
      contentClassName="flex items-center gap-3 p-3"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-white">{title}</p>
        {meta && <p className="text-xs text-white/80">{meta}</p>}
      </div>
    </AdminBgCard>
  ) : (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">{title}</p>
        {meta && <p className="text-xs text-slate-500">{meta}</p>}
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cn('block w-full text-left', !image && 'admin-quick-action group')}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cn('w-full text-left', !image && 'admin-quick-action group')}>
      {inner}
    </button>
  )
}

export function AdminAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const sizeClass =
    size === 'sm' ? 'h-8 w-8 text-xs' :
    size === 'lg' ? 'h-12 w-12 text-base' :
    size === 'xl' ? 'h-16 w-16 text-lg' :
    'h-10 w-10 text-sm'

  return (
    <div className={cn('admin-avatar', sizeClass, className)}>
      {initials}
    </div>
  )
}

export function AdminMiniStatCard({
  label,
  value,
  note,
  image,
  overlay = 'violet',
}: {
  label: string
  value: string | number
  note?: string
  image?: string
  overlay?: BgCardOverlay
}) {
  if (image) {
    return (
      <AdminBgCard
        image={image}
        overlay={overlay}
        className="min-h-[100px]"
        contentClassName="flex h-full flex-col justify-end p-4"
      >
        <p className="text-xs font-bold uppercase tracking-wide text-white/80">{label}</p>
        <p className="font-display text-3xl font-bold text-white mt-0.5">{value}</p>
        {note && <p className="text-xs text-white/75 mt-0.5">{note}</p>}
      </AdminBgCard>
    )
  }

  return <AdminSummaryCard label={label} value={value} note={note} tone={overlay === 'sky' || overlay === 'emerald' || overlay === 'amber' ? overlay : 'violet'} />
}

const summaryTones = {
  violet: { card: 'border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white', value: 'text-violet-700', note: 'text-violet-600' },
  sky: { card: 'border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white', value: 'text-sky-700', note: 'text-sky-600' },
  emerald: { card: 'border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white', value: 'text-emerald-700', note: 'text-emerald-600' },
  amber: { card: 'border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white', value: 'text-amber-700', note: 'text-amber-600' },
}

export function AdminSummaryCard({
  label,
  value,
  note,
  tone = 'violet',
  image,
  overlay,
}: {
  label: string
  value: string | number
  note?: string
  tone?: 'violet' | 'sky' | 'emerald' | 'amber'
  image?: string
  overlay?: BgCardOverlay
}) {
  const overlayMap: Record<string, BgCardOverlay> = {
    violet: 'violet',
    sky: 'sky',
    emerald: 'emerald',
    amber: 'amber',
  }

  if (image) {
    return (
      <AdminBgCard
        image={image}
        overlay={overlay ?? overlayMap[tone]}
        className="admin-stat-card min-h-[120px] border-0 p-0"
        contentClassName="flex h-full flex-col justify-end p-5"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-white/80">{label}</p>
        <p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>
        {note && <p className="mt-1 text-xs font-semibold text-white/85">{note}</p>}
      </AdminBgCard>
    )
  }

  const styles = summaryTones[tone]
  const iconTone = tone === 'emerald' ? 'emerald' : tone === 'sky' ? 'sky' : tone === 'amber' ? 'amber' : 'orange'
  return (
    <div className="admin-metric-card">
      <div className="min-w-0">
        <p className="admin-metric-label">{label}</p>
        <p className="admin-metric-value">{value}</p>
        {note && <p className={cn('admin-metric-change mt-1.5', styles.note)}>{note}</p>}
      </div>
      <div className={cn('admin-metric-icon', metricIconTone[iconTone as keyof typeof metricIconTone])} aria-hidden>
        <span className="text-xs font-bold">{String(value).slice(0, 2)}</span>
      </div>
    </div>
  )
}

export function AdminSummaryGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}

export function AdminDashboardSection({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function AdminFeeTrendChart({
  data,
  highlight,
}: {
  data: { period?: string; month: string; value: number }[]
  highlight?: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const rows = data.filter(
    (row, i) => data.findIndex((r) => (r.period ?? r.month) === (row.period ?? row.month)) === i,
  )

  return (
    <div className="admin-dash-chart">
      <div className="admin-dash-chart-bars">
        {rows.map((row, i) => (
          <div key={row.period ?? `${row.month}-${i}`} className="admin-dash-chart-col">
            <div className="admin-dash-chart-bar-wrap">
              <div
                className="admin-chart-bar admin-dash-chart-bar"
                style={{ height: `${(row.value / max) * 100}%` }}
                title={`${row.value}%`}
              />
            </div>
            <span className="admin-dash-chart-label">{row.month}</span>
            <span className="admin-dash-chart-value">{row.value}%</span>
          </div>
        ))}
      </div>
      {highlight && (
        <p className="admin-dash-chart-note">
          <TrendingUp className="h-4 w-4 shrink-0" />
          {highlight}
        </p>
      )}
    </div>
  )
}

const activityDotColors = ['bg-violet-500', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-500']

export function AdminActivityTimeline({
  items,
}: {
  items: { title: string; time: string; type?: string }[]
}) {
  return (
    <ul className="admin-dash-timeline">
      {items.map((item, i) => (
        <li key={i} className="admin-dash-timeline-item">
          <span className={cn('admin-dash-timeline-dot', activityDotColors[i % activityDotColors.length])} />
          <div className="admin-dash-timeline-body">
            <p className="font-semibold text-ink text-sm">{item.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
