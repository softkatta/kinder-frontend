import type { Locale } from '@/i18n/types'

type CmsRecord = Record<string, unknown>

/**
 * CMS text from API is already localized when `locale` is passed to public endpoints.
 * Backend auto-translates English → Marathi when no manual `_mr` fields exist.
 */
export function cmsText(
  item: CmsRecord | null | undefined,
  field: string,
  _locale: Locale,
): string {
  if (!item) return ''
  const val = item[field]
  return typeof val === 'string' ? val : ''
}

export function cmsListText(items: CmsRecord[], field: string, locale: Locale): CmsRecord[] {
  return items.map((item) => ({
    ...item,
    [field]: cmsText(item, field, locale) || String(item[field] ?? ''),
  }))
}
