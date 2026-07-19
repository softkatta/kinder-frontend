import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageShell } from '@/components/admin/AdminUi'
import { AttendancePageHero } from '@/components/attendance/AttendancePageHero'
import { LiveScannerCard } from '@/components/attendance/LiveScannerCard'
import { StudentVerifyProfile } from '@/components/attendance/StudentVerifyProfile'
import { idCardApi } from '@/api/services'
import type { IdCardViewData } from '@/components/idcards/idCardTheme'
import { useAppSelector } from '@/store/hooks'
import { selectAuthBootstrapped, selectIsAuthenticated } from '@/store/slices/authSlice'
import { normalizeScanInput } from '@/utils/scanCode'

export default function AdminVerifyStudentPage() {
  const bootstrapped = useAppSelector(selectAuthBootstrapped)
  const isAuth = useAppSelector(selectIsAuthenticated)
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [card, setCard] = useState<IdCardViewData | null>(null)
  const busyRef = useRef(false)

  const verify = useCallback(async (code: string) => {
    if (!bootstrapped || !isAuth || busyRef.current) return
    const normalized = normalizeScanInput(code)
    if (!normalized) return

    busyRef.current = true
    setLoading(true)
    try {
      const res = await idCardApi.verify(normalized)
      const data = res.data.data as { card: IdCardViewData; card_type?: string; message: string }
      const cardType = data.card?.card_type
      if (cardType !== 'student') {
        toast.error('This card is not a student ID. Use QR Attendance for staff cards.')
        setCard(null)
        return
      }
      setCard(data.card)
      toast.success(data.message || 'Student verified')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Invalid or expired student card')
      setCard(null)
    } finally {
      busyRef.current = false
      setLoading(false)
    }
  }, [bootstrapped, isAuth])

  useEffect(() => {
    const code = searchParams.get('c')
    if (code && bootstrapped && isAuth) {
      verify(code)
    }
  }, [searchParams, bootstrapped, isAuth, verify])

  return (
    <AdminPageShell className="space-y-6">
      <AttendancePageHero
        badge="Student Verify"
        title="Scan Student ID Card"
        subtitle="फक्त verify — attendance mark होणार नाही. Camera उघडा आणि QR scan करा."
        icon={UserCheck}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveScannerCard onScan={verify} buttonLabel="Open Camera" disabled={loading} />
        <StudentVerifyProfile card={card} />
      </div>
    </AdminPageShell>
  )
}
