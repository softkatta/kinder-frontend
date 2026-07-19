import { useCallback, useEffect, useState } from 'react'
import { Calendar, Users } from 'lucide-react'
import { AdminAdvancedFilters } from '@/components/admin/AdminAdvancedFilters'
import { AdminPageHeader, AdminPageShell, AdminBadge } from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { attendanceApi } from '@/api/services'
import { ID_CARD_TYPE_LABELS, type IdCardType } from '@/components/idcards/idCardTheme'

interface AttendanceRow {
  id: number
  date: string
  status: string
  check_in_time?: string
  check_out_time?: string
  method: string
  marked_by_name?: string
  person_name: string
  card_type: IdCardType
  card_number: string
  meta?: Record<string, string>
}

function formatTime(t?: string) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = Number(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

export default function AdminAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState<AttendanceRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await attendanceApi.daily(date)
      setRows((res.data.data ?? []) as AttendanceRow[])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => { load() }, [load])

  const students = rows.filter((r) => r.card_type === 'student')
  const teachers = rows.filter((r) => r.card_type === 'teacher' || r.card_type === 'staff')

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Daily Attendance"
        subtitle="Student & teacher attendance from QR card scans — check-in and check-out times."
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Attendance' },
          { label: 'Daily Attendance' },
        ]}
      />

      <AdminAdvancedFilters
        className="mb-5"
        defaultCollapsed
        subtitle="attendance date"
        fields={[{ key: 'date', label: 'Date', type: 'date' }]}
        values={{ date }}
        onChange={(_key, value) => setDate(value)}
        onReset={() => setDate(new Date().toISOString().slice(0, 10))}
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="admin-panel-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600"><Users className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Students Today</p>
            <p className="text-2xl font-bold text-ink">{students.length}</p>
          </div>
        </div>
        <div className="admin-panel-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><Users className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Teachers / Staff</p>
            <p className="text-2xl font-bold text-ink">{teachers.length}</p>
          </div>
        </div>
        <div className="admin-panel-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600"><Calendar className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Selected Date</p>
            <p className="text-sm font-semibold text-ink mt-1">{date}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm py-12 text-center">Loading...</p>
      ) : (
        <AdminDataTable<AttendanceRow>
          data={rows}
          rowKey={(r) => r.id}
          onRefresh={load}
          title="Daily Attendance"
          subtitle={`${rows.length} records · QR scan`}
          searchPlaceholder="Search name, card #..."
          searchKeys={['person_name', 'card_number', 'marked_by_name']}
          pageSize={12}
          filterSubtitle="card type"
          filters={[
            {
              key: 'type',
              label: 'Card Type',
              options: [
                { value: 'all', label: 'All Types' },
                { value: 'student', label: ID_CARD_TYPE_LABELS.student },
                { value: 'teacher', label: ID_CARD_TYPE_LABELS.teacher },
                { value: 'staff', label: ID_CARD_TYPE_LABELS.staff },
              ],
            },
          ]}
          filterConfigs={[
            { key: 'type', defaultValue: 'all', match: (row, v) => v === 'all' || row.card_type === v },
          ]}
          columns={[
            { key: 'type', header: 'Type', cell: (r) => <AdminBadge tone="violet">{ID_CARD_TYPE_LABELS[r.card_type] ?? r.card_type}</AdminBadge> },
            { key: 'name', header: 'Name', sortable: true, cell: (r) => <span className="font-semibold text-ink">{r.person_name}</span> },
            { key: 'detail', header: 'Class / Dept', cell: (r) => {
              const m = r.meta ?? {}
              if (r.card_type === 'student') return `${m.class_name ?? '—'} ${m.section_name ? `· ${m.section_name}` : ''}`
              return m.department ?? m.designation ?? '—'
            }},
            { key: 'in', header: 'Check In', cell: (r) => <span className="text-emerald-600 font-semibold">{formatTime(r.check_in_time)}</span> },
            { key: 'out', header: 'Check Out', cell: (r) => <span className="text-amber-600 font-semibold">{formatTime(r.check_out_time)}</span> },
            { key: 'status', header: 'Status', cell: (r) => <AdminBadge tone={r.status === 'present' ? 'success' : 'warning'}>{r.status}</AdminBadge> },
            { key: 'by', header: 'Scanned By', cell: (r) => r.marked_by_name ?? '—' },
          ]}
          emptyMessage="No attendance yet. Scan ID cards from QR Attendance page."
        />
      )}
    </AdminPageShell>
  )
}
