import type { Locale } from '@/i18n/types'

const SKIP_KEYS = new Set([
  'id', 'slug', 'image', 'image_path', 'media_path', 'status', 'sort_order',
  'grade_level', 'icon', 'featured', 'date', 'application_deadline', 'employment_type',
  'readTime', 'category', 'album', 'email', 'phone', 'address', 'city',
  'established_year', 'school_name', 'short_name', 'principal_name',
  'upi_id', 'account_number', 'ifsc_code', 'bank_name', 'branch',
])

const cache = new Map<string, string>()

function hasDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text)
}

function shouldSkipString(text: string): boolean {
  if (!text.trim()) return true
  if (hasDevanagari(text)) return true
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return true
  if (/^https?:\/\//i.test(text)) return true
  if (/^\+?[\d\s\-()]{7,}$/.test(text)) return true
  if (text.includes('<') && text.includes('>')) return true
  return false
}

export async function translateToMarathi(text: string): Promise<string> {
  const trimmed = text.trim()
  if (shouldSkipString(trimmed)) return text
  if (cache.has(trimmed)) return cache.get(trimmed)!

  try {
    const url = new URL('https://translate.googleapis.com/translate_a/single')
    url.searchParams.set('client', 'gtx')
    url.searchParams.set('sl', 'en')
    url.searchParams.set('tl', 'mr')
    url.searchParams.set('dt', 't')
    url.searchParams.set('q', trimmed)

    const res = await fetch(url.toString())
    if (!res.ok) return text

    const data = (await res.json()) as unknown
    if (!Array.isArray(data) || !Array.isArray(data[0])) return text

    const parts = (data[0] as unknown[])
      .map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
      .join('')
      .trim()

    const translated = parts || text
    cache.set(trimmed, translated)
    return translated
  } catch {
    return text
  }
}

async function localizeValue(key: string, value: unknown): Promise<unknown> {
  if (SKIP_KEYS.has(key)) return value

  if (typeof value === 'string') {
    return translateToMarathi(value)
  }

  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string')) {
      return Promise.all(value.map((v) => translateToMarathi(String(v))))
    }
    return Promise.all(value.map((v) => localizeCmsValue(v)))
  }

  if (value && typeof value === 'object') {
    return localizeCmsValue(value as Record<string, unknown>)
  }

  return value
}

export async function localizeCmsValue<T extends Record<string, unknown>>(item: T): Promise<T> {
  const out: Record<string, unknown> = { ...item }

  await Promise.all(
    Object.entries(item).map(async ([key, value]) => {
      if (key.endsWith('_mr') || key.endsWith('_en')) {
        delete out[key]
        return
      }
      out[key] = await localizeValue(key, value)
    }),
  )

  return out as T
}

export async function localizeCmsList<T extends Record<string, unknown>>(items: T[]): Promise<T[]> {
  return Promise.all(items.map((item) => localizeCmsValue(item)))
}

/** Localize nested homepage / API payloads when locale is Marathi. */
export async function localizeCmsPayload<T>(payload: T, locale: Locale): Promise<T> {
  if (locale !== 'mr' || payload == null) return payload

  if (Array.isArray(payload)) {
    return (await localizeCmsList(payload as Record<string, unknown>[])) as T
  }

  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const out: Record<string, unknown> = {}

    await Promise.all(
      Object.entries(record).map(async ([key, value]) => {
        if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
          out[key] = await localizeCmsList(value as Record<string, unknown>[])
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          out[key] = await localizeCmsValue(value as Record<string, unknown>)
        } else {
          out[key] = await localizeValue(key, value)
        }
      }),
    )

    return out as T
  }

  return payload
}
