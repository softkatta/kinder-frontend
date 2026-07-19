import { useEffect, useState } from 'react'
import { Calendar, MapPin, Ticket, Users } from 'lucide-react'
import { dashboardApi } from '@/api/services'
import { StatGrid, ListCard } from '@/components/portal/PortalWidgets'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBadge } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, guestPortalConfig } from '@/config/erpPortals'

interface DashboardData {
  greeting?: string
  event?: {
    name: string
    date?: string | null
    location?: string | null
    valid_from: string
    valid_until: string
  }
  stats?: { label: string; value: string | number; change?: string }[]
  companions?: { name: string; relation?: string | null; phone?: string | null }[]
}

export default function GuestDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    dashboardApi.guest()
      .then((res) => setData(res.data.data as DashboardData))
      .catch(() => setData(null))
  }, [])

  const event = data?.event

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={data?.greeting ?? 'Welcome'}
        subtitle="Your event invitation — add companions and show your pass at entry."
        breadcrumbs={portalBreadcrumbs(guestPortalConfig.portalLabel, guestPortalConfig.homePath, 'Dashboard')}
      />

      {event && (
        <AdminPanel title="Event Details" className="mb-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Ticket className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-bold text-ink">{event.name}</h3>
                <AdminBadge tone="violet">Invited Guest</AdminBadge>
              </div>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {event.date && (
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0 text-violet-500" />
                    <span>Event date: <strong className="text-ink">{event.date}</strong></span>
                  </li>
                )}
                {event.location && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-violet-500" />
                    <span>{event.location}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-violet-500" />
                  <span>Pass valid: <strong className="text-ink">{event.valid_from}</strong> — <strong className="text-ink">{event.valid_until}</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </AdminPanel>
      )}

      {data?.stats && <StatGrid stats={data.stats} />}

      <div className="mt-6">
        <ListCard
          title="Your Companions"
          items={(data?.companions ?? []).map((c) => ({
            title: c.name,
            meta: [c.relation, c.phone].filter(Boolean).join(' · ') || 'Coming with you',
          }))}
        />
      </div>
    </AdminPageShell>
  )
}
