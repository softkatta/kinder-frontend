import { useEffect, useState } from 'react'
import { dashboardApi } from '@/api/services'
import { StatGrid, ListCard } from '@/components/portal/PortalWidgets'
import { AdminPageHeader, AdminPageShell } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, teacherPortalConfig } from '@/config/erpPortals'

interface DashboardData {
  greeting?: string
  class?: string
  stats?: { label: string; value: string | number; change?: string }[]
  schedule?: { time: string; title: string }[]
}

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    dashboardApi.teacher()
      .then((res) => setData(res.data.data as DashboardData))
      .catch(() => setData(null))
  }, [])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={data?.greeting ?? 'Dashboard'}
        subtitle={data?.class ? `Class: ${data.class}` : 'Your classroom at a glance.'}
        breadcrumbs={portalBreadcrumbs(teacherPortalConfig.portalLabel, teacherPortalConfig.homePath, 'Dashboard')}
      />

      {data?.stats && <StatGrid stats={data.stats} />}

      <ListCard
        title="Today's Schedule"
        items={(data?.schedule ?? []).map((s) => ({ title: s.title, meta: s.time }))}
      />
    </AdminPageShell>
  )
}
