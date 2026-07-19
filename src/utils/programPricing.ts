import { translations } from '@/i18n/translations'
import type { Locale } from '@/i18n/types'

export interface ProgramPrices {
  monthly: string
  sixMonth: string
  yearly: string
}

type GradeLevel = 'nursery' | 'lkg' | 'ukg'

export function getProgramPrices(
  source: Record<string, unknown> | undefined,
  gradeLevel: string | undefined,
  locale: Locale,
): ProgramPrices {
  const level = (gradeLevel?.toLowerCase() || 'nursery') as GradeLevel
  const copy = translations[locale].programs[level] || translations[locale].programs.nursery

  return {
    monthly: String(source?.price ?? copy.price ?? ''),
    sixMonth: String(source?.price_6month ?? copy.price_6month ?? ''),
    yearly: String(source?.price_yearly ?? copy.price_yearly ?? ''),
  }
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
