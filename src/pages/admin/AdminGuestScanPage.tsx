import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageShell, AdminPanel } from '@/components/admin/AdminUi'
import { AttendancePageHero } from '@/components/attendance/AttendancePageHero'
import { LiveScannerCard } from '@/components/attendance/LiveScannerCard'
import { GuestVerifyPanel, type GuestViewData } from '@/components/guest/GuestVerifyPanel'
import { guestApi } from '@/api/services'
import { useAppSelector } from '@/store/hooks'
import { selectAuthBootstrapped, selectIsAuthenticated } from '@/store/slices/authSlice'
import { normalizeScanInput } from '@/utils/scanCode'

interface EntryLogRow {
  id: number
  direction: string
  scanned_at: string
  guest?: { full_name?: string; guest_code?: string; event_name?: string }
  companion?: { full_name?: string } | null
}

function formatLogTime(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export default function AdminGuestScanPage() {
  const bootstrapped = useAppSelector(selectAuthBootstrapped)
  const isAuth = useAppSelector(selectIsAuthenticated)
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [guest, setGuest] = useState<GuestViewData | null>(null)
  const [lastToken, setLastToken] = useState('')
  const [entryLogs, setEntryLogs] = useState<EntryLogRow[]>([])
  const busyRef = useRef(false)
  const deepLinkHandled = useRef(false)

  const loadEntryLogs = useCallback(async () => {
    try {
      const res = await guestApi.entryLogs()
      setEntryLogs((res.data.data ?? []) as EntryLogRow[])
    } catch {
      setEntryLogs([])
    }
  }, [])

  useEffect(() => { loadEntryLogs() }, [loadEntryLogs])

  const recordEntry = useCallback(async (
    direction: 'in' | 'out' | 'toggle',
    companionId?: number,
    token = lastToken,
  ) => {
    if (!token) {
      toast.error('Scan guest QR first')
      return
    }

    setLoading(true)
    try {
      const payload: {
        qr_token: string
        direction: 'in' | 'out' | 'toggle'
        guest_companion_id?: number
      } = {
        qr_token: token,
        direction,
      }
      if (companionId != null) {
        payload.guest_companion_id = companionId
      }

      const res = await guestApi.entry(payload)
      const data = res.data.data as {
        guest: GuestViewData
        direction?: 'in' | 'out'
        action?: string
      }
      setGuest(data.guest)
      setLastToken(token)

      const recorded = data.direction ?? (data.action === 'check_out' ? 'out' : 'in')
      toast.success(recorded === 'out' ? 'Entry OUT recorded' : 'Entry IN recorded')
      loadEntryLogs()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Entry failed')
    } finally {
      setLoading(false)
    }
  }, [lastToken, loadEntryLogs])

  const verify = useCallback(async (code: string) => {
    if (!bootstrapped || !isAuth || busyRef.current) return
    const normalized = normalizeScanInput(code)
    if (!normalized) return

    busyRef.current = true
    setLoading(true)
    try {
      const res = await guestApi.verify(normalized)
      const data = res.data.data as { guest: GuestViewData }
      setGuest(data.guest)
      setLastToken(normalized)

      await recordEntry('toggle', undefined, normalized)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Invalid or expired guest pass')
      setGuest(null)
      setLastToken('')
    } finally {
      busyRef.current = false
      setLoading(false)
    }
  }, [bootstrapped, isAuth, recordEntry])

  useEffect(() => {
    const code = searchParams.get('c')
    if (!code || !bootstrapped || !isAuth || deepLinkHandled.current) return
    deepLinkHandled.current = true
    void verify(code)
  }, [searchParams, bootstrapped, isAuth, verify])

  return (
    <AdminPageShell className="space-y-6">
      <AttendancePageHero
        badge="Guest Entry"
        title="Scan Guest ID"
        subtitle="पहिला scan = IN · पुन्हा scan = OUT. किंवा खाली IN/OUT buttons वापरा."
        icon={ScanLine}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveScannerCard onScan={verify} buttonLabel="Open Camera" disabled={loading} />
        <GuestVerifyPanel
          guest={guest}
          loading={loading}
          onEntry={(direction, companionId) => recordEntry(direction, companionId)}
        />
      </div>

      <AdminPanel title="Today's Guest Entries" subtitle="Recent IN/OUT scans">
        {entryLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No guest entries recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {entryLogs.slice(0, 20).map((log) => (
              <li key={log.id} className="py-3 flex flex-wrap justify-between gap-2 text-sm">
                <div>
                  <p className="font-semibold text-ink">{log.guest?.full_name ?? 'Guest'}</p>
                  <p className="text-xs text-slate-400">
                    {log.guest?.event_name}
                    {log.companion?.full_name ? ` · ${log.companion.full_name}` : ''}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className={`font-bold uppercase ${log.direction === 'in' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {log.direction}
                  </p>
                  <p className="text-slate-400">{formatLogTime(log.scanned_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </AdminPageShell>
  )
}
