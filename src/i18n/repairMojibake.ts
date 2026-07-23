/**
 * Restores text that was UTF-8 encoded and then read as Windows-1252 one or
 * more times. Older Marathi seed content has this form (for example
 * `à¤®à¤°à¤¾à¤ à¥€` instead of `मराठी`).
 */
const WINDOWS_1252_BYTES: Record<string, number> = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
  'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91,
  '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98,
  '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
}

const mojibakeMarkers = /[ÃÂâà¤¥]/
const utf8Decoder = new TextDecoder('utf-8', { fatal: true })

function windows1252Bytes(value: string): Uint8Array | null {
  const bytes: number[] = []
  for (const char of value) {
    const byte = WINDOWS_1252_BYTES[char] ?? char.codePointAt(0)
    if (byte === undefined || byte > 0xff) return null
    bytes.push(byte)
  }
  return new Uint8Array(bytes)
}

function decodeOnce(value: string): string | null {
  const bytes = windows1252Bytes(value)
  if (!bytes) return null
  try {
    return utf8Decoder.decode(bytes)
  } catch {
    return null
  }
}

/** Restore a string without changing normal Marathi or English text. */
export function repairMojibake(value: string): string {
  let repaired = value
  for (let attempt = 0; attempt < 3 && mojibakeMarkers.test(repaired); attempt += 1) {
    const decoded = decodeOnce(repaired)
    if (!decoded || decoded === repaired) break
    repaired = decoded
  }
  return repaired
}

/** Recursively repair only static translation values when the app starts. */
export function repairTranslationTree<T>(value: T): T {
  if (typeof value === 'string') return repairMojibake(value) as T
  if (Array.isArray(value)) return value.map(repairTranslationTree) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, repairTranslationTree(child)]),
    ) as T
  }
  return value
}
