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

/** Parse schedule time to match admin "Starts:" wall clock (naive = browser local / IST). */
function parseScheduleTime(value: string): number {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    const [datePart, timePart] = value.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hour, minute, 0, 0).getTime()
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
    const [datePart, timePart] = value.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute, second] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hour, minute, second || 0, 0).getTime()
  }
  return new Date(value).getTime()
}

function secondsUntil(targetIso?: string | null, initialSeconds?: number | null): number {
  // Prefer wall-clock target so countdown matches admin schedule display (avoids UTC skew from API).
  if (targetIso) {
    const target = parseScheduleTime(targetIso)
    if (!Number.isNaN(target)) {
      return Math.max(0, Math.floor((target - Date.now()) / 1000))
    }
  }
  if (initialSeconds != null) return Math.max(0, initialSeconds)
  return 0
}

export function LiveCountdown({ targetIso, initialSeconds, className = '', variant = 'default', onComplete }: LiveCountdownProps) {
  const [seconds, setSeconds] = useState(() => secondsUntil(targetIso, initialSeconds))

  useEffect(() => {
    setSeconds(secondsUntil(targetIso, initialSeconds))
  }, [targetIso, initialSeconds])

  useEffect(() => {
    let completed = false
    const tick = () => {
      const left = secondsUntil(targetIso, initialSeconds)
      setSeconds(left)
      if (left <= 0 && !completed) {
        completed = true
        onComplete?.()
      }
    }

    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [targetIso, initialSeconds, onComplete])

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
