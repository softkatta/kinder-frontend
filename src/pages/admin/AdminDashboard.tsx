import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, UserCog, ClipboardList, IndianRupee, ArrowUpRight,
  FileCheck, Settings, TrendingUp, CalendarDays, Sparkles, Bell,
} from 'lucide-react'
import { dashboardApi } from '@/api/services'
import {
  AdminStatGrid, AdminMiniStatCard, AdminQuickAction,
  AdminDashboardSection, AdminFeeTrendChart, AdminActivityTimeline,
} from '@/components/admin/AdminStats'
import { AdminPageShell } from '@/components/admin/AdminUi'
import { adminImages } from '@/config/adminCatalog'

interface DashboardData {
  greeting?: string
  academic_year?: string | null
  stats?: { label: string; value: string | number; change?: string }[]
  recent_activity?: { title: string; time: string }[]
  hero?: {
    collection_pct: number
    attendance_pct: number
    present_today: number
    alerts: number
    pending_admissions: number
    pending_payments: number
  }
  fee_trend?: { period?: string; month: string; value: number }[]
  today_snapshot?: { label: string; value: string; note: string }[]
  quick_actions?: { title: string; meta: string; link: string }[]
}

const statIcons = [Users, ClipboardList, UserCog, IndianRupee] as const
const statImages = [adminImages.nursery, adminImages.classroom, adminImages.playground, adminImages.facilities[0]]
const statTones = ['violet', 'sky', 'emerald', 'amber'] as const
const snapshotImages = [adminImages.classroom, adminImages.nursery, adminImages.about, adminImages.event]
const snapshotOverlays = ['emerald', 'sky', 'violet', 'amber'] as const
const quickIcons = [FileCheck, IndianRupee, Users, Settings] as const
const quickImages = [adminImages.nursery, adminImages.facilities[0], adminImages.playground, adminImages.event]

function formatToday() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const today = useMemo(() => formatToday(), [])

  useEffect(() => {
    dashboardApi.admin()
      .then((res) => setData(res.data.data as DashboardData))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const statsWithIcons = (data?.stats ?? []).map((s, i) => ({
    ...s,
    icon: statIcons[i % statIcons.length],
    image: statImages[i % statImages.length],
    tone: statTones[i % statTones.length],
  }))

  const hero = data?.hero
  const feeTrend = data?.fee_trend ?? []
  const feeHighlight = feeTrend.length
    ? `Latest month: ${feeTrend[feeTrend.length - 1]?.value ?? 0}k verified (₹ thousands)`
    : 'No verified payments yet'

  return (
    <AdminPageShell className="admin-dash space-y-6">
      <div className="admin-dash-hero" style={{ backgroundImage: `url(${adminImages.campus})` }}>
        <div className="admin-dash-hero-overlay" />
        <div className="admin-dash-hero-mesh" aria-hidden />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="admin-dash-pill">
                <Sparkles className="h-3.5 w-3.5" />
                Admin
              </span>
              {data?.academic_year && (
                <span className="admin-dash-pill admin-dash-pill--muted">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {data.academic_year}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-violet-200/90">{today}</p>
              <h2 className="font-display text-2xl font-bold sm:text-4xl mt-1 leading-tight">
                {loading ? 'Loading...' : (data?.greeting ?? 'Dashboard')}
              </h2>
              <p className="text-violet-100/85 text-sm sm:text-base mt-2 max-w-lg">
                Live counts from your database — students, staff, enquiries, and fees.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/admissions" className="admin-dash-cta admin-dash-cta--primary">
                Review Enquiries <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/admin/payments" className="admin-dash-cta admin-dash-cta--ghost">
                Fee Collection
              </Link>
            </div>
          </div>

          {hero && (
            <div className="admin-dash-hero-stats">
              <div className="admin-dash-glass-stat">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">Collection</p>
                <p className="font-display text-2xl font-bold text-white mt-1">{hero.collection_pct}%</p>
                <p className="text-xs text-emerald-200 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Verified payments
                </p>
              </div>
              <div className="admin-dash-glass-stat">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">Attendance</p>
                <p className="font-display text-2xl font-bold text-white mt-1">{hero.attendance_pct}%</p>
                <p className="text-xs text-white/75 mt-1">{hero.present_today} present today</p>
              </div>
              <div className="admin-dash-glass-stat admin-dash-glass-stat--alert">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">Alerts</p>
                <p className="font-display text-2xl font-bold text-white mt-1">{hero.alerts}</p>
                <p className="text-xs text-amber-200 font-semibold mt-1 flex items-center gap-1">
                  <Bell className="h-3 w-3" /> {hero.pending_admissions} enquiries · {hero.pending_payments} fees
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {statsWithIcons.length > 0 && <AdminStatGrid stats={statsWithIcons} />}

      <div className="admin-dash-bento">
        <div className="admin-dash-bento-main">
          <AdminDashboardSection
            title="Fee Collection Trend"
            subtitle="Verified payments per month (₹ thousands)"
            action={
              <Link to="/admin/payments" className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="admin-dash-panel">
              {feeTrend.length > 0 ? (
                <AdminFeeTrendChart data={feeTrend} highlight={feeHighlight} />
              ) : (
                <p className="px-5 py-8 text-sm text-slate-400 text-center">No payment data yet</p>
              )}
            </div>
          </AdminDashboardSection>

          <AdminDashboardSection title="Recent Activity" subtitle="Latest records from the database">
            <div className="admin-dash-panel admin-dash-panel--flush">
              {(data?.recent_activity ?? []).length > 0 ? (
                <AdminActivityTimeline items={data!.recent_activity!} />
              ) : (
                <p className="px-5 py-8 text-sm text-slate-400 text-center">No recent activity</p>
              )}
            </div>
          </AdminDashboardSection>
        </div>

        <div className="admin-dash-bento-side space-y-6">
          <AdminDashboardSection title="Today's Snapshot" subtitle="From attendance & CMS">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {(data?.today_snapshot ?? []).map((item, i) => (
                <AdminMiniStatCard
                  key={item.label}
                  {...item}
                  image={snapshotImages[i % snapshotImages.length]}
                  overlay={snapshotOverlays[i % snapshotOverlays.length]}
                />
              ))}
              {!loading && !(data?.today_snapshot ?? []).length && (
                <p className="text-sm text-slate-400">No snapshot data</p>
              )}
            </div>
          </AdminDashboardSection>

          <AdminDashboardSection title="Quick Actions" subtitle="Based on current counts">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {(data?.quick_actions ?? []).map((action, i) => (
                <AdminQuickAction
                  key={action.title}
                  to={action.link}
                  title={action.title}
                  meta={action.meta}
                  icon={quickIcons[i % quickIcons.length]}
                  image={quickImages[i % quickImages.length]}
                />
              ))}
            </div>
          </AdminDashboardSection>
        </div>
      </div>
    </AdminPageShell>
  )
}
