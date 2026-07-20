/** Convert a wall-clock datetime in an IANA timezone to a UTC epoch ms. */
export function parseWallClockInTimeZone(value: string, timeZone: string): number {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!match) {
    const fallback = new Date(value).getTime()
    return Number.isNaN(fallback) ? Date.now() : fallback
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6] || 0)

  // Treat as UTC guess, then subtract the zone offset for that instant (handles DST).
  let utc = Date.UTC(year, month - 1, day, hour, minute, second)
  for (let i = 0; i < 2; i += 1) {
    const offset = getTimeZoneOffsetMs(new Date(utc), timeZone)
    utc = Date.UTC(year, month - 1, day, hour, minute, second) - offset
  }
  return utc
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
    const parts = Object.fromEntries(
      dtf.formatToParts(date)
        .filter((p) => p.type !== 'literal')
        .map((p) => [p.type, p.value]),
    ) as Record<string, string>
    const asUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    )
    return asUtc - date.getTime()
  } catch {
    return 0
  }
}
