import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBadge } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, studentPortalConfig } from '@/config/erpPortals'
import { portalApi } from '@/api/services'

interface DayRow {
  day: string
  date: string
  status: string
}

export default function StudentAttendancePage() {
  const [calendar, setCalendar] = useState<DayRow[]>([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.studentAttendance()
      const data = res.data.data as { calendar?: DayRow[]; summary?: string }
      setCalendar(data.calendar ?? [])
      setSummary(data.summary ?? '')
    } catch {
      toast.error('Could not load attendance')
      setCalendar([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Attendance"
        subtitle={`This week — ${summary}`}
        breadcrumbs={portalBreadcrumbs(studentPortalConfig.portalLabel, studentPortalConfig.homePath, 'Attendance')}
      />

      <AdminPanel title="This Week" noPadding>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 p-5">
            {calendar.map((d) => (
              <div key={d.date} className="rounded-xl border border-slate-100 p-3 text-center">
                <p className="text-xs font-bold text-slate-400">{d.day}</p>
                <p className="text-sm font-semibold text-ink mt-1">{d.date.slice(5)}</p>
                <AdminBadge tone={d.status === 'Present' || d.status === 'Late' ? 'success' : d.status === 'Absent' ? 'danger' : 'info'}>
                  {d.status}
                </AdminBadge>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  )
}
