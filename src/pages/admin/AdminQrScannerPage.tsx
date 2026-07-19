import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageShell } from '@/components/admin/AdminUi'
import { StudentQrScanModal } from '@/components/ui/StudentQrScanModal'
import { AttendancePageHero } from '@/components/attendance/AttendancePageHero'
import { LiveScannerCard } from '@/components/attendance/LiveScannerCard'
import { AttendanceFlowFilters, type AttendanceFlow } from '@/components/attendance/AttendanceFlowFilters'
import { ScanResultPanel, type ScanResultData } from '@/components/attendance/StudentVerifyProfile'
import { attendanceApi } from '@/api/services'
import type { QrScanResult } from '@/components/ui/StudentQrScanModal'
import { useAppSelector } from '@/store/hooks'
import { selectAuthBootstrapped, selectIsAuthenticated } from '@/store/slices/authSlice'
import { normalizeScanInput } from '@/utils/scanCode'

function formatTime(t?: string) {
  if (!t) return undefined
  const [h, m] = t.split(':')
  const hour = Number(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

function resultFromApi(
  data: QrScanResult & { person?: { full_name?: string }; attendance?: { check_in_time?: string; check_out_time?: string } },
): ScanResultData {
  const name = data.student?.full_name ?? data.person?.full_name ?? 'Person'
  const subtitle = data.student
    ? [data.student.class?.name, data.student.section?.name].filter(Boolean).join(' · ')
    : undefined
  return {
    name,
    subtitle,
    action: data.action,
    message: data.message,
    checkIn: formatTime(data.attendance?.check_in_time),
    checkOut: formatTime(data.attendance?.check_out_time),
  }
}

export default function AdminQrScannerPage() {
  const [searchParams] = useSearchParams()
  const bootstrapped = useAppSelector(selectAuthBootstrapped)
  const isAuth = useAppSelector(selectIsAuthenticated)
  const [loading, setLoading] = useState(false)
  const [flow, setFlow] = useState<AttendanceFlow>('staff_student')
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalResult, setModalResult] = useState<QrScanResult | null>(null)
  const deepLinkHandled = useRef(false)

  const handleScan = useCallback(async (code: string) => {
    if (!bootstrapped || !isAuth) return
    const normalized = normalizeScanInput(code)
    if (!normalized || loading) return

    setLoading(true)
    try {
      if (flow === 'student_branch') {
        const res = await attendanceApi.qrMark(normalized)
        const data = res.data.data as QrScanResult & { attendance?: { check_in_time?: string; check_out_time?: string } }
        setScanResult(resultFromApi(data))
        toast.success('Branch check-in recorded')
        return
      }

      const res = await attendanceApi.qrMark(normalized)
      const data = res.data.data as QrScanResult & {
        person?: { full_name?: string }
        attendance?: { check_in_time?: string; check_out_time?: string }
      }
      setScanResult(resultFromApi(data))

      const action = data.action as string
      const name = data.student?.full_name ?? data.person?.full_name ?? 'Person'
      if (action === 'check_in') toast.success(`${name} — Check IN recorded`)
      else if (action === 'check_out') toast.success(`${name} — Check OUT recorded`)
      else if (action === 'verified') toast.success(data.message)
      else toast(data.message, { icon: 'ℹ️' })

      if (data.student) {
        setModalResult(data)
        setModalOpen(true)
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Invalid or expired QR code')
      setScanResult(null)
    } finally {
      setLoading(false)
    }
  }, [bootstrapped, isAuth, loading, flow])

  useEffect(() => {
    const code = searchParams.get('c')
    if (!code || !bootstrapped || !isAuth || deepLinkHandled.current) return
    deepLinkHandled.current = true
    void handleScan(code)
  }, [searchParams, bootstrapped, isAuth, handleScan])

  return (
    <AdminPageShell className="space-y-6">
      <AttendancePageHero
        badge="QR Attendance"
        title="QR Attendance"
        subtitle="Flow 1: Staff scans student ID · Flow 2: Student scans branch QR at entrance"
        icon={ScanLine}
      />

      <AttendanceFlowFilters flow={flow} onFlowChange={(f) => { setFlow(f); setScanResult(null) }} />

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveScannerCard onScan={handleScan} buttonLabel="Open Scanner" disabled={loading} />
        <ScanResultPanel result={scanResult} />
      </div>

      <StudentQrScanModal
        open={modalOpen}
        result={modalResult}
        onClose={() => { setModalOpen(false); setModalResult(null) }}
      />
    </AdminPageShell>
  )
}
