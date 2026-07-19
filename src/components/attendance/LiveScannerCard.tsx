import { useId } from 'react'
import { Camera, ScanLine } from 'lucide-react'
import { QrScanner } from '@/components/ui/QrScanner'

interface LiveScannerCardProps {
  onScan: (code: string) => void
  buttonLabel?: string
  disabled?: boolean
}

export function LiveScannerCard({
  onScan,
  buttonLabel = 'Open Camera',
  disabled,
}: LiveScannerCardProps) {
  const regionId = useId().replace(/:/g, '')

  return (
    <div className="attendance-panel-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Camera className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-ink">Live Scanner</h2>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <QrScanner
          regionId={`qr-region-${regionId}`}
          onScan={onScan}
          buttonLabel={buttonLabel}
          buttonIcon={<ScanLine className="h-4 w-4" />}
          disabled={disabled}
          variant="attendance"
          continuous
        />
      </div>
    </div>
  )
}
