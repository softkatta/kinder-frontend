import { useEffect, useState } from 'react'

interface LiveCountdownProps {
  targetIso?: string | null
  initialSeconds?: number | null
  className?: string
  variant?: 'default' | 'overlay'
  onComplete?: () => void
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function parseScheduleTime(value: string): number {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    const [datePart, timePart] = value.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hour, minute, 0, 0).getTime()
  }
  return new Date(value).getTime()
}

export function LiveCountdown({ targetIso, initialSeconds, className = '', variant = 'default', onComplete }: LiveCountdownProps) {
  const [seconds, setSeconds] = useState(() => {
    if (initialSeconds != null) return Math.max(0, initialSeconds)
    if (targetIso) return Math.max(0, Math.floor((parseScheduleTime(targetIso) - Date.now()) / 1000))
    return 0
  })

  useEffect(() => {
    if (initialSeconds != null) {
      setSeconds(Math.max(0, initialSeconds))
    } else if (targetIso) {
      setSeconds(Math.max(0, Math.floor((parseScheduleTime(targetIso) - Date.now()) / 1000)))
    }
  }, [targetIso, initialSeconds])

  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.()
      return
    }
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          onComplete?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [seconds > 0, onComplete])

  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const units = d > 0
    ? [{ v: d, l: 'Days' }, { v: h, l: 'Hrs' }, { v: m, l: 'Min' }, { v: s, l: 'Sec' }]
    : [{ v: h, l: 'Hrs' }, { v: m, l: 'Min' }, { v: s, l: 'Sec' }]

  return (
    <div className={`live-countdown ${variant === 'overlay' ? 'live-countdown--overlay' : ''} ${className}`}>
      <p className={`live-countdown-heading ${variant === 'overlay' ? 'live-countdown-heading--overlay' : ''}`}>
        Starts In
      </p>
      <div className="flex justify-center gap-2 sm:gap-3 flex-wrap max-w-full live-countdown-units">
        {units.map((u) => (
          <div key={u.l} className="live-countdown-unit">
            <span className="live-countdown-value">{pad(u.v)}</span>
            <span className="live-countdown-label">{u.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
