import { useCallback, useEffect, useState } from 'react'
import { BarChart3, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBtn } from '@/components/admin/AdminUi'
import { AdminStatGrid } from '@/components/admin/AdminStats'
import { reportApi } from '@/api/services'

interface ReportBlock {
  label: string
  value: string | number
  note?: string
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [studentStats, setStudentStats] = useState<ReportBlock[]>([])
  const [paymentStats, setPaymentStats] = useState<ReportBlock[]>([])
  const [admissionStats, setAdmissionStats] = useState<ReportBlock[]>([])
  const [attendanceStats, setAttendanceStats] = useState<ReportBlock[]>([])
  const [feeStats, setFeeStats] = useState<ReportBlock[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [students, payments, admissions, attendance, fees] = await Promise.all([
        reportApi.students(),
        reportApi.payments(),
        reportApi.admissions(),
        reportApi.attendance(),
        reportApi.fees(),
      ])

      const s = students.data.data as { total?: number; active?: number; by_class?: Record<string, number> }
      const p = payments.data.data as { total_count?: number; verified_amount?: number; pending_amount?: number }
      const a = admissions.data.data as { total?: number; by_status?: Record<string, number> }
      const att = attendance.data.data as { total_records?: number; by_status?: Record<string, number> }
      const f = fees.data.data as {
        assigned_count?: number
        total_outstanding?: number
        total_collected?: number
        pending_verification_count?: number
        pending_verification_amount?: number
      }

      setStudentStats([
        { label: 'Total students', value: s.total ?? 0 },
        { label: 'Active', value: s.active ?? 0 },
        { label: 'Classes', value: Object.keys(s.by_class ?? {}).length },
      ])
      setPaymentStats([
        { label: 'Payments (period)', value: p.total_count ?? 0 },
        { label: 'Verified ₹', value: `₹${Number(p.verified_amount ?? 0).toLocaleString('en-IN')}` },
        { label: 'Pending ₹', value: `₹${Number(p.pending_amount ?? 0).toLocaleString('en-IN')}` },
      ])
      setAdmissionStats([
        { label: 'Applications', value: a.total ?? 0 },
        { label: 'Approved', value: a.by_status?.approved ?? 0 },
        { label: 'Pending', value: a.by_status?.pending ?? 0 },
      ])
      setAttendanceStats([
        { label: 'Records', value: att.total_records ?? 0 },
        { label: 'Present', value: att.by_status?.present ?? 0 },
        { label: 'Absent', value: att.by_status?.absent ?? 0 },
      ])
      setFeeStats([
        { label: 'Assigned fees', value: f.assigned_count ?? 0 },
        { label: 'Collected ₹', value: `₹${Number(f.total_collected ?? 0).toLocaleString('en-IN')}` },
        { label: 'Outstanding ₹', value: `₹${Number(f.total_outstanding ?? 0).toLocaleString('en-IN')}` },
        { label: 'Pending verify', value: `${f.pending_verification_count ?? 0} (₹${Number(f.pending_verification_amount ?? 0).toLocaleString('en-IN')})` },
      ])
    } catch {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const sections = [
    { title: 'Students', stats: studentStats, tone: 'sky' as const },
    { title: 'Payments (this month)', stats: paymentStats, tone: 'emerald' as const },
    { title: 'Admissions (YTD)', stats: admissionStats, tone: 'violet' as const },
    { title: 'Attendance (period)', stats: attendanceStats, tone: 'amber' as const },
    { title: 'Student fees', stats: feeStats, tone: 'emerald' as const },
  ]

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Reports"
        subtitle="School overview from live ERP data"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Reports' }]}
        actions={
          <AdminBtn variant="secondary" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </AdminBtn>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading reports...</p>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-lg font-bold text-ink mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-500" /> {section.title}
              </h2>
              <AdminStatGrid
                stats={section.stats.map((s) => ({
                  label: s.label,
                  value: s.value,
                  change: s.note ?? '',
                  icon: BarChart3,
                  tone: section.tone,
                }))}
              />
            </div>
          ))}
          <AdminPanel>
            <p className="p-5 text-sm text-slate-600">
              Detailed CSV exports are available from Payments and Students pages. Audit trail is under Admin → Audit Logs.
            </p>
          </AdminPanel>
        </div>
      )}
    </AdminPageShell>
  )
}
