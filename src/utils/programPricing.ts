import { translations } from '@/i18n/translations'
import type { Locale } from '@/i18n/types'

export interface ProgramPrices {
  monthly: string
  sixMonth: string
  yearly: string
}

type GradeLevel = 'nursery' | 'lkg' | 'ukg'

function pickPrice(source: Record<string, unknown> | undefined, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = source?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `₹${value.toLocaleString('en-IN')}`
    }
  }
  return fallback
}

export function getProgramPrices(
  source: Record<string, unknown> | undefined,
  gradeLevel: string | undefined,
  locale: Locale,
): ProgramPrices {
  const level = (gradeLevel?.toLowerCase() || 'nursery') as GradeLevel
  const copy = translations[locale].programs[level] || translations[locale].programs.nursery
  const meta = (source?.meta && typeof source.meta === 'object'
    ? (source.meta as Record<string, unknown>)
    : undefined)

  const merged = { ...meta, ...source }

  return {
    monthly: pickPrice(merged, ['price', 'amount', 'monthly_fee', 'fee'], copy.price ?? ''),
    sixMonth: pickPrice(merged, ['price_6month', 'price_six_month', 'six_month_fee'], copy.price_6month ?? ''),
    yearly: pickPrice(merged, ['price_yearly', 'yearly_fee', 'annual_fee'], copy.price_yearly ?? ''),
  }
}

/** Display price for pricing cards — keeps CMS strings like ₹3,500/mo; formats bare numbers. */
export function formatProgramPriceDisplay(price: string): string {
  const trimmed = price.trim()
  if (!trimmed) return '—'
  if (/[₹]/.test(trimmed) || /rs\.?/i.test(trimmed)) return trimmed

  const numeric = Number(String(trimmed).replace(/,/g, ''))
  if (Number.isFinite(numeric)) {
    return `₹${numeric.toLocaleString('en-IN')}`
  }

  return trimmed
}

export function programPricesToMeta(
  prices: ProgramPrices,
  labels: { monthly: string; sixMonth: string; yearly: string },
): { label: string; value: string }[] {
  return [
    prices.monthly ? { label: labels.monthly, value: prices.monthly } : null,
    prices.sixMonth ? { label: labels.sixMonth, value: prices.sixMonth } : null,
    prices.yearly ? { label: labels.yearly, value: prices.yearly } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row))
}
