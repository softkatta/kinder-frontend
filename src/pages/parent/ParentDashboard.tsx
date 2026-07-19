import { useEffect, useState } from 'react'
import { dashboardApi } from '@/api/services'
import { StatGrid, ListCard } from '@/components/portal/PortalWidgets'
import { AdminPageHeader, AdminPageShell, AdminPanel } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, parentPortalConfig } from '@/config/erpPortals'

interface DashboardData {
  greeting?: string
  children?: { name: string; class: string; attendance: string }[]
  stats?: { label: string; value: string | number; change?: string }[]
  notices?: { title: string; date: string }[]
}

export default function ParentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    dashboardApi.parent()
      .then((res) => setData(res.data.data as DashboardData))
      .catch(() => setData(null))
  }, [])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={data?.greeting ?? 'Dashboard'}
        subtitle="Stay updated on your child's school life."
        breadcrumbs={portalBreadcrumbs(parentPortalConfig.portalLabel, parentPortalConfig.homePath, 'Dashboard')}
      />

      {data?.children && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.children.map((child) => (
            <AdminPanel key={child.name} noPadding>
              <div className="p-5 border-l-4 border-l-violet-400">
                <p className="font-display font-bold text-ink">{child.name}</p>
                <p className="text-sm text-slate-500">{child.class}</p>
                <p className="mt-2 text-xs font-bold text-emerald-600">{child.attendance}</p>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}

      {data?.stats && <StatGrid stats={data.stats} />}

      <ListCard
        title="School Notices"
        items={(data?.notices ?? []).map((n) => ({ title: n.title, meta: n.date }))}
      />
    </AdminPageShell>
  )
}
