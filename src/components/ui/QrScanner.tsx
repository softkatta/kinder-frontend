import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, ScanLine, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { selectAuthBootstrapped, selectIsAuthenticated } from '@/store/slices/authSlice'
import { cn } from '@/utils/cn'
import { normalizeScanInput } from '@/utils/scanCode'

interface QrScannerProps {
  onScan: (code: string) => void
  onClose?: () => void
  regionId?: string
  buttonLabel?: string
  buttonIcon?: ReactNode
  disabled?: boolean
  variant?: 'default' | 'attendance'
  /** Keep camera open after each scan (for batch scanning) */
  continuous?: boolean
}

export function QrScanner({
  onScan,
  onClose,
  regionId = 'qr-reader-region',
  buttonLabel = 'Open Camera Scanner',
  buttonIcon,
  disabled,
  variant = 'default',
  continuous = false,
}: QrScannerProps) {
  const bootstrapped = useAppSelector(selectAuthBootstrapped)
  const isAuth = useAppSelector(selectIsAuthenticated)
  const canScan = bootstrapped && isAuth
  const [active, setActive] = useState(false)
  const [error, setError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanRef = useRef({ code: '', at: 0 })

  const stop = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch(() => {})
    }
    scannerRef.current = null
    setActive(false)
    const el = document.getElementById(regionId)
    if (el) el.innerHTML = ''
  }, [regionId])

  const start = async () => {
    if (disabled || !canScan) return
    setError('')
    lastScanRef.current = { code: '', at: 0 }
    setActive(true)
    await new Promise((r) => setTimeout(r, 50))
    try {
      const scanner = new Html5Qrcode(regionId)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          const normalized = normalizeScanInput(decoded)
          if (!normalized) return

          const now = Date.now()
          if (
            lastScanRef.current.code === normalized
            && now - lastScanRef.current.at < 2500
          ) {
            return
          }
          lastScanRef.current = { code: normalized, at: now }

          onScan(normalized)

          if (!continuous) {
            void stop()
          }
        },
        () => {},
      )
    } catch {
      setError('Camera permission denied or not available.')
      setActive(false)
    }
  }

  useEffect(() => () => { void stop() }, [stop])

  if (!canScan) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-semibold text-ink">Staff login required</p>
        <p className="mt-1 text-xs text-slate-500">QR scan फक्त login नंतरच चालेल.</p>
        <Link to="/login" className="mt-4 inline-flex text-sm font-bold text-primary-600 hover:text-primary-700">
          Login →
        </Link>
      </div>
    )
  }

  if (variant === 'attendance') {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            disabled={disabled || active}
            onClick={start}
            className="admin-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            {buttonIcon ?? <Camera className="h-4 w-4" />}
            {active ? 'Scanner active' : buttonLabel}
          </button>
        </div>

        <div
          className={cn(
            'attendance-scanner-viewport relative overflow-hidden rounded-xl',
            !active && 'flex items-center justify-center',
          )}
        >
          {active ? (
            <>
              <div id={regionId} className="qr-scanner-region w-full min-h-[280px]" />
              <button
                type="button"
                onClick={() => { void stop(); onClose?.() }}
                className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow-lg"
                aria-label="Close scanner"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </>
          ) : (
            <ScanLine className="h-10 w-10 text-slate-600 opacity-40" strokeWidth={1.25} />
          )}
        </div>

        {active && continuous && (
          <p className="text-xs text-slate-500 text-center">
            Camera सुरू आहे — QR scan करत राहा. बंद करण्यासाठी ✕ दाबा.
          </p>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError('')} className="shrink-0 rounded-lg p-1 hover:bg-rose-100" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!active ? (
        <button
          type="button"
          disabled={disabled}
          onClick={start}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          <Camera className="h-5 w-5" /> {buttonLabel}
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border-2 border-violet-200">
          <div id={regionId} className="qr-scanner-region w-full" />
          <button
            type="button"
            onClick={() => { void stop(); onClose?.() }}
            className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow-lg"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      )}
      {error && <p className="text-center text-sm text-rose-600">{error}</p>}
    </div>
  )
}
