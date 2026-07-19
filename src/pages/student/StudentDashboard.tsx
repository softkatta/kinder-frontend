import { useEffect, useState } from 'react'
import { dashboardApi } from '@/api/services'
import { StatGrid, ListCard } from '@/components/portal/PortalWidgets'
import { AdminPageHeader, AdminPageShell } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, studentPortalConfig } from '@/config/erpPortals'

interface DashboardData {
  greeting?: string
  class?: string
  stats?: { label: string; value: string | number; change?: string }[]
  homework?: { title: string; due: string }[]
  activities?: { title: string; time: string }[]
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    dashboardApi.student()
      .then((res) => setData(res.data.data as DashboardData))
      .catch(() => setData(null))
  }, [])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={data?.greeting ?? 'Dashboard'}
        subtitle={data?.class ? `Class: ${data.class}` : 'Your learning adventure starts here!'}
        breadcrumbs={portalBreadcrumbs(studentPortalConfig.portalLabel, studentPortalConfig.homePath, 'Dashboard')}
      />

      {data?.stats && <StatGrid stats={data.stats} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard
          title="Homework"
          items={(data?.homework ?? []).map((h) => ({ title: h.title, meta: h.due }))}
        />
        <ListCard
          title="Today's Activities"
          items={(data?.activities ?? []).map((a) => ({ title: a.title, meta: a.time }))}
        />
      </div>
    </AdminPageShell>
  )
}
