import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { dashboardApi } from '@/api/services'
import {
  AdminDashboardSection,
  AdminFeeTrendChart,
  AdminQuickAction,
  AdminSummaryCard,
  AdminSummaryGrid,
} from '@/components/admin/AdminStats'
import { AdminPageHeader, AdminPageShell, AdminPanel } from '@/components/admin/AdminUi'
import { StatGrid } from '@/components/portal/PortalWidgets'
import { adminImages } from '@/config/adminCatalog'
import { adminPortalConfig, portalBreadcrumbs } from '@/config/erpPortals'

type StatItem = { label: string; value: string | number; change?: string }
type SnapshotItem = { label: string; value: string; note?: string }
type QuickActionItem = { title: string; meta?: string; link: string }
type ActivityItem = { title: string; time: string }
type FeeTrendItem = { period?: string; month: string; value: number }
type PlanUsage = { limit: number | null; total: number; remaining: number | null }

type DashboardData = {
  greeting?: string
  academic_year?: string
  stats?: StatItem[]
  hero?: { alerts?: number }
  plan_usage?: {
    users: PlanUsage
    students: PlanUsage
  }
  fee_trend?: FeeTrendItem[]
  today_snapshot?: SnapshotItem[]
  quick_actions?: QuickActionItem[]
  recent_activity?: ActivityItem[]
}

function formatPlanValue(value: number | null): string {
  return value === null ? 'Unlimited' : value.toLocaleString('en-IN')
}

function PlanUsageCard({
  title,
  usage,
  tone,
  image,
}: {
  title: string
  usage: PlanUsage
  tone: 'sky' | 'emerald'
  image: string
}) {
  return (
    <AdminSummaryCard
      label={title}
      value={formatPlanValue(usage.limit)}
      note={`Total ${usage.total.toLocaleString('en-IN')} | Remaining ${formatPlanValue(usage.remaining)}`}
      tone={tone}
      image={image}
      overlay={tone}
    />
  )
}

function quickActionIcon(link: string) {
  if (link.includes('/admissions')) return ClipboardList
  if (link.includes('/payments')) return CreditCard
  if (link.includes('/students')) return GraduationCap
  if (link.includes('/settings')) return Settings
  return LayoutDashboard
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    dashboardApi.admin()
      .then((res) => setData(res.data.data as DashboardData))
      .catch(() => setData(null))
  }, [])

  const quickActions = useMemo(() => data?.quick_actions ?? [], [data])
  const alerts = data?.hero?.alerts ?? 0

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={data?.greeting ?? 'Dashboard'}
        subtitle={data?.academic_year ? `Academic Year: ${data.academic_year}` : 'School overview and operations at a glance.'}
        badge={alerts > 0 ? `${alerts} alerts` : 'All clear'}
        image={adminImages.campus}
        breadcrumbs={portalBreadcrumbs(adminPortalConfig.portalLabel, adminPortalConfig.homePath, 'Dashboard')}
      />

      {data?.stats && <StatGrid stats={data.stats} />}

      {data?.plan_usage && (
        <AdminDashboardSection
          title="Plan Limits"
          subtitle="Users and students entitlement from your SoftKatta plan."
        >
          <AdminSummaryGrid>
            <PlanUsageCard title="Users" usage={data.plan_usage.users} tone="sky" image={adminImages.classroom} />
            <PlanUsageCard title="Students" usage={data.plan_usage.students} tone="emerald" image={adminImages.nursery} />
          </AdminSummaryGrid>
        </AdminDashboardSection>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPanel title="Today Snapshot" className="xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {(data?.today_snapshot ?? []).map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-ink">{item.value}</p>
                {item.note && <p className="mt-1 text-xs text-slate-500">{item.note}</p>}
              </div>
            ))}
            {(data?.today_snapshot ?? []).length === 0 && (
              <p className="text-sm text-slate-400">No snapshot data available.</p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel title="Recent Activity">
          <ul className="space-y-2">
            {(data?.recent_activity ?? []).map((item, index) => (
              <li key={`${item.title}-${index}`} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                <span className="font-medium text-ink">{item.title}</span>
                <span className="shrink-0 text-xs text-slate-500">{item.time}</span>
              </li>
            ))}
            {(data?.recent_activity ?? []).length === 0 && (
              <li className="text-sm text-slate-400">No activity recorded yet.</li>
            )}
          </ul>
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminPanel title="Fee Trend" className="xl:col-span-2">
          <AdminFeeTrendChart
            data={data?.fee_trend ?? []}
            highlight="Monthly verified fee collection trend"
          />
        </AdminPanel>

        <AdminPanel title="Quick Actions">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action, index) => {
              const Icon = quickActionIcon(action.link)
              const cardImage = index % 2 === 0 ? adminImages.playground : adminImages.classroom

              return (
                <AdminQuickAction
                  key={`${action.title}-${index}`}
                  title={action.title}
                  meta={action.meta}
                  icon={Icon}
                  image={cardImage}
                  to={action.link}
                />
              )
            })}
            {quickActions.length === 0 && (
              <p className="text-sm text-slate-400">No quick actions available.</p>
            )}
          </div>
          <div className="mt-4">
            <Link to="/admin/settings" className="text-xs font-bold text-primary-600 hover:text-primary-700">
              Open admin settings
            </Link>
          </div>
        </AdminPanel>
      </div>
    </AdminPageShell>
  )
}
