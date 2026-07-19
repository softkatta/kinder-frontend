import { CMS_META_FIELDS } from '@/config/cmsFieldConfig'
import { highlightsToText, parseHighlights } from '@/utils/cmsNormalize'

const LINE_ARRAY_KEYS = new Set(['highlights', 'requirements'])

const LOCALE_META_KEYS = ['title_mr', 'summary_mr', 'body_mr'] as const

export function metaFromForm(type: string, meta: Record<string, string | boolean>): Record<string, unknown> {
  const fields = CMS_META_FIELDS[type] ?? []
  const result: Record<string, unknown> = {}

  for (const field of fields) {
    const val = meta[field.key]
    if (val === '' || val === undefined || val === false) {
      if (field.type === 'checkbox' && val === false) result[field.key] = false
      continue
    }
    if (LINE_ARRAY_KEYS.has(field.key)) {
      result[field.key] = parseHighlights(val)
    } else if (field.type === 'checkbox') {
      result[field.key] = val === true
    } else {
      result[field.key] = val
    }
    const mrVal = meta[`${field.key}_mr`]
    if (typeof mrVal === 'string' && mrVal.trim() !== '') {
      result[`${field.key}_mr`] = mrVal.trim()
    }
  }

  for (const key of LOCALE_META_KEYS) {
    const val = meta[key]
    if (typeof val === 'string' && val.trim() !== '') {
      result[key] = val.trim()
    }
  }

  return result
}

export function metaToForm(type: string, raw?: Record<string, unknown> | null): Record<string, string | boolean> {
  const fields = CMS_META_FIELDS[type] ?? []
  const result: Record<string, string | boolean> = {}

  for (const field of fields) {
    const val = raw?.[field.key]
    if (LINE_ARRAY_KEYS.has(field.key)) {
      result[field.key] = highlightsToText(val)
    } else if (field.type === 'checkbox') {
      result[field.key] = val === true || val === 'true' || val === 1
    } else {
      result[field.key] = String(val ?? '')
    }
    const mrKey = `${field.key}_mr`
    if (raw?.[mrKey] !== undefined) {
      result[mrKey] = String(raw[mrKey] ?? '')
    }
  }

  for (const key of LOCALE_META_KEYS) {
    result[key] = String(raw?.[key] ?? '')
  }

  return result
}

export const CMS_PUBLIC_PATH: Record<string, (slug: string) => string> = {
  program: (s) => `/programs/${s}`,
  facility: (s) => `/facilities/${s}`,
  activity: (s) => `/activities/${s}`,
  event: (s) => `/events/${s}`,
  blog: (s) => `/blog/${s}`,
  job: (s) => `/careers/${s}`,
  banner: () => `/`,
  staff: () => `/staff`,
  curriculum: () => `/curriculum`,
  page: (s) => `/${s === 'privacy-policy' ? 'privacy' : s === 'refund-policy' ? 'refund' : s}`,
}
