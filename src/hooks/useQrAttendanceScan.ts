import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { attendanceApi } from '@/api/services'
import type { QrScanResult } from '@/components/ui/StudentQrScanModal'
import { normalizeScanInput } from '@/utils/scanCode'

export function useQrAttendanceScan() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QrScanResult | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const processScan = useCallback(async (code: string) => {
    const normalized = normalizeScanInput(code)
    if (!normalized || loading) return false

    setLoading(true)
    try {
      const res = await attendanceApi.qrMark(normalized)
      const data = res.data.data as QrScanResult & { person?: { full_name?: string } }
      setResult(data.student ? data : null)
      setModalOpen(!!data.student)

      const action = data.action as string
      const name = data.student?.full_name ?? data.person?.full_name ?? 'Person'

      if (action === 'check_in') {
        toast.success(`${name} — Check IN recorded`)
      } else if (action === 'check_out') {
        toast.success(`${name} — Check OUT recorded`)
      } else if (action === 'verified') {
        toast.success(data.message)
      } else {
        toast(data.message, { icon: 'ℹ️' })
      }
      return true
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Invalid or expired QR code')
      return false
    } finally {
      setLoading(false)
    }
  }, [loading])

  const closeModal = () => {
    setModalOpen(false)
    setResult(null)
  }

  return { loading, result, modalOpen, processScan, closeModal, setModalOpen }
}
