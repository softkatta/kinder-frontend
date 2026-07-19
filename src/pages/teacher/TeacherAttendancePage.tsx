import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import { QrScanner } from '@/components/ui/QrScanner'
import { StudentQrScanModal } from '@/components/ui/StudentQrScanModal'
import { useQrAttendanceScan } from '@/hooks/useQrAttendanceScan'
import { attendanceApi } from '@/api/services'
import { ID_CARD_TYPE_LABELS } from '@/components/idcards/idCardTheme'
import { AdminPageHeader, AdminPageShell, AdminPanel } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, teacherPortalConfig } from '@/config/erpPortals'
import type { QrScanResult } from '@/components/ui/StudentQrScanModal'

interface AttendanceRow {
  id: number
  person_name: string
  card_type: string
  check_in_time?: string
  check_out_time?: string
  status: string
  meta?: Record<string, string>
}

function formatTime(t?: string) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = Number(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default function TeacherAttendancePage() {
  const [searchParams] = useSearchParams()
  const { loading, result, modalOpen, processScan, closeModal } = useQrAttendanceScan()
  const [today, setToday] = useState<AttendanceRow[]>([])
  const deepLinkHandled = useRef(false)

  const loadToday = useCallback(async () => {
    try {
      const res = await attendanceApi.daily(new Date().toISOString().slice(0, 10))
      setToday(res.data.data ?? [])
    } catch {
      setToday([])
    }
  }, [])

  useEffect(() => { loadToday() }, [loadToday])

  useEffect(() => {
    const code = searchParams.get('c')
    if (!code || deepLinkHandled.current) return
    deepLinkHandled.current = true
    void (async () => {
      const ok = await processScan(code)
      if (ok) loadToday()
    })()
  }, [searchParams, processScan, loadToday])

  const handleScan = async (code: string) => {
    const ok = await processScan(code)
    if (ok) loadToday()
  }

  const students = today.filter((r) => r.card_type === 'student')
  const staff = today.filter((r) => r.card_type === 'teacher' || r.card_type === 'staff')

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Attendance"
        subtitle="Scan student or teacher ID cards — check-in / check-out recorded automatically."
        breadcrumbs={portalBreadcrumbs(teacherPortalConfig.portalLabel, teacherPortalConfig.homePath, 'Attendance')}
      />

      <AdminPanel title="QR Scanner" subtitle="Point camera at ID card QR code">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-violet-600">
            <ScanLine className="h-5 w-5" />
            <span className="text-sm font-semibold">Live scanner</span>
          </div>
          <QrScanner onScan={handleScan} variant="attendance" buttonLabel="Open Camera" disabled={loading} continuous />
        </div>
      </AdminPanel>

      <div className="grid md:grid-cols-2 gap-6">
        <AdminPanel title={`Students Today (${students.length})`}>
          {students.length === 0 ? (
            <p className="text-sm text-slate-400">No student scans yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {students.map((s) => (
                <li key={s.id} className="py-3 flex justify-between gap-2 text-sm">
                  <div>
                    <p className="font-semibold text-ink">{s.person_name}</p>
                    <p className="text-xs text-slate-400">{s.meta?.class_name} {s.meta?.section_name}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-emerald-600 font-semibold">IN {formatTime(s.check_in_time)}</p>
                    <p className="text-amber-600">OUT {formatTime(s.check_out_time)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel title={`Teachers / Staff Today (${staff.length})`}>
          {staff.length === 0 ? (
            <p className="text-sm text-slate-400">No teacher/staff scans yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {staff.map((s) => (
                <li key={s.id} className="py-3 flex justify-between gap-2 text-sm">
                  <div>
                    <p className="font-semibold text-ink">{s.person_name}</p>
                    <p className="text-xs text-slate-400">{ID_CARD_TYPE_LABELS[s.card_type as keyof typeof ID_CARD_TYPE_LABELS] ?? s.card_type} · {s.meta?.department}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-emerald-600 font-semibold">IN {formatTime(s.check_in_time)}</p>
                    <p className="text-amber-600">OUT {formatTime(s.check_out_time)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      <StudentQrScanModal open={modalOpen} result={result as QrScanResult | null} onClose={closeModal} />
    </AdminPageShell>
  )
}
