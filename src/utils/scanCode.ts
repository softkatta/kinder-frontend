/** Parse QR camera output (URL or legacy token) without exposing it in UI. */
export function normalizeScanInput(raw: string): string {
  const value = raw.trim()
  if (!value) return ''

  try {
    const url = new URL(value)
    const match = url.pathname.match(/\/s\/([A-Za-z0-9_-]+)/)
    if (match?.[1]) return match[1]
  } catch {
    // not a URL
  }

  const pathMatch = value.match(/\/s\/([A-Za-z0-9_-]+)/)
  if (pathMatch?.[1]) return pathMatch[1]

  return value
}
