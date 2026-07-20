import { useEffect, useState } from 'react'
import { DEFAULT_SCHOOL_TIMEZONE } from '@/config/timezones'
import { parseWallClockInTimeZone } from '@/utils/scheduleTime'

interface LiveCountdownProps {
  targetIso?: string | null
  initialSeconds?: number | null
  /** School IANA timezone — wall-clock schedules are interpreted in this zone. */
  timeZone?: string | null
  className?: string
  variant?: 'default' | 'overlay'
  onComplete?: () => void
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function secondsUntil(
  targetIso?: string | null,
  initialSeconds?: number | null,
  timeZone?: string | null,
): number {
  if (targetIso) {
    const tz = timeZone?.trim() || DEFAULT_SCHOOL_TIMEZONE
    const target = parseWallClockInTimeZone(targetIso, tz)
    if (!Number.isNaN(target)) {
      return Math.max(0, Math.floor((target - Date.now()) / 1000))
    }
  }
  if (initialSeconds != null) return Math.max(0, initialSeconds)
  return 0
}

export function LiveCountdown({
  targetIso,
  initialSeconds,
  timeZone,
  className = '',
  variant = 'default',
  onComplete,
}: LiveCountdownProps) {
  const [seconds, setSeconds] = useState(() => secondsUntil(targetIso, initialSeconds, timeZone))

  useEffect(() => {
    setSeconds(secondsUntil(targetIso, initialSeconds, timeZone))
  }, [targetIso, initialSeconds, timeZone])

  useEffect(() => {
    let completed = false
    const tick = () => {
      const left = secondsUntil(targetIso, initialSeconds, timeZone)
      setSeconds(left)
      if (left <= 0 && !completed) {
        completed = true
        onComplete?.()
      }
    }

    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [targetIso, initialSeconds, timeZone, onComplete])

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
