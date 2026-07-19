import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBadge } from '@/components/admin/AdminUi'
import { ParentChildSelector } from '@/components/parent/ParentChildSelector'
import { portalBreadcrumbs, parentPortalConfig } from '@/config/erpPortals'
import { portalApi } from '@/api/services'

interface AttendanceRecord {
  date: string
  status: string
  in: string
  out: string
}

export default function ParentAttendancePage() {
  const [childId, setChildId] = useState<number | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [childName, setChildName] = useState<string | null>(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.parentAttendance(childId ?? undefined)
      const data = res.data.data as { records?: AttendanceRecord[]; child_name?: string; summary?: string }
      setRecords(data.records ?? [])
      setChildName(data.child_name ?? null)
      setSummary(data.summary ?? '')
    } catch {
      toast.error('Could not load attendance')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [childId])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Attendance"
        subtitle={childName ? `Monthly attendance for ${childName} — ${summary}` : 'Monthly attendance record'}
        breadcrumbs={portalBreadcrumbs(parentPortalConfig.portalLabel, parentPortalConfig.homePath, 'Attendance')}
        actions={<ParentChildSelector value={childId} onChange={setChildId} className="min-w-[200px]" />}
      />

      <AdminPanel title="Attendance Records" noPadding>
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading...</p>
        ) : records.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No attendance records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">In</th>
                  <th className="px-5 py-3 font-semibold">Out</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.date} className="border-t border-slate-100">
                    <td className="px-5 py-3">{r.date}</td>
                    <td className="px-5 py-3">
                      <AdminBadge tone={r.status === 'Present' || r.status === 'Late' ? 'success' : r.status === 'Absent' ? 'danger' : 'info'}>
                        {r.status}
                      </AdminBadge>
                    </td>
                    <td className="px-5 py-3">{r.in}</td>
                    <td className="px-5 py-3">{r.out}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  )
}
