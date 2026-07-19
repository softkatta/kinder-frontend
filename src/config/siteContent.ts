/**
 * School profile helpers + CMS localization utilities.
 * UI copy lives in @/i18n/translations — use useT() in components.
 */

import { translations, type Translation } from '@/i18n/translations'
import type { Locale } from '@/i18n/types'

export type SchoolProfile = Record<string, string | undefined>

type DefaultKey = keyof Translation['defaults']

export function getSchoolField(
  profile: SchoolProfile | null | undefined,
  key: DefaultKey,
  locale: Locale = 'mr',
): string {
  const fromApi = profile?.[key]
  if (fromApi) return String(fromApi)
  return translations[locale].defaults[key] ?? translations.en.defaults[key] ?? ''
}

export function getSchoolName(profile?: SchoolProfile | null, full = false, _locale: Locale = 'mr'): string {
  if (full) return profile?.school_name || profile?.title || ''
  return profile?.short_name || profile?.title || ''
}

export function getYearsSince(profile?: SchoolProfile | null): number {
  const fallbackYear = Number(translations.en.defaults.establishedYear)
  const raw = profile?.established_year || translations.en.defaults.establishedYear
  const normalized = String(raw).replace(/[^\d]/g, '')
  const y = Number(normalized)
  const established = Number.isFinite(y) && y >= 1900 && y <= new Date().getFullYear() ? y : fallbackYear
  return Math.max(1, new Date().getFullYear() - established)
}

export function formatAddress(profile?: SchoolProfile | null, _locale: Locale = 'mr'): string {
  if (!profile?.address) return profile?.city || ''
  const city = profile.city ? `, ${profile.city}` : ''
  return `${profile.address}${city}`
}

export function whatsAppUrl(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}

export function getProfileText(
  profile: SchoolProfile | null | undefined,
  field: 'vision' | 'mission' | 'principal_message',
  locale: Locale,
): string {
  const api = profile?.[field]
  if (api) return String(api)
  return translations[locale].defaults[field === 'principal_message' ? 'principalMessage' : field]
}

export interface HeroSidebarCopy {
  location: string
  bookTour: string
  forParents: string
  contacts: string
}

export interface HeroSlideCopy {
  subline: string
  titleAccent: string
  titleRest: string
}

export function getHeroContent(
  banners: Record<string, string>[],
  fallbacks: {
    admissionBanner: string
    heroSlides: readonly HeroSlideCopy[]
    heroSidebar: HeroSidebarCopy
  },
): { admissionBanner: string; slides: HeroSlideCopy[]; sidebar: HeroSidebarCopy } {
  const sidebar = { ...fallbacks.heroSidebar }
  const admissionBanner = fallbacks.admissionBanner

  if (banners.length > 0) {
    const slides = banners.map((b, i) => {
      const fb = fallbacks.heroSlides[i] || fallbacks.heroSlides[0]!
      return {
        subline: b.summary || fb.subline,
        titleAccent: b.title || fb.titleAccent,
        titleRest: b.title_rest || fb.titleRest,
      }
    })
    return { admissionBanner, slides: [...slides], sidebar }
  }

  return {
    admissionBanner,
    slides: [...fallbacks.heroSlides],
    sidebar,
  }
}

export function getProgramCopy(
  _gradeLevel: string | undefined,
  _locale: Locale,
  apiDescription?: string,
  apiTitle?: string,
  apiAges?: string,
  apiTime?: string,
  apiPrice?: string,
): { title: string; description: string; ages: string; time: string; price: string } {
  return {
    title: apiTitle || '',
    description: apiDescription || '',
    ages: apiAges || '',
    time: apiTime || '',
    price: apiPrice || '',
  }
}

export function getFacilityCopy(
  title: string | undefined,
  _locale: Locale,
  apiDescription?: string,
  apiTitle?: string,
): { title: string; description: string } {
  return {
    title: apiTitle || title || '',
    description: apiDescription || '',
  }
}

export function getFaqItems(
  _locale: Locale,
  apiFaqs?: { id: number; question?: string; answer?: string; title?: string; body?: string; summary?: string }[],
) {
  if (!apiFaqs?.length) return []
  return apiFaqs.map((item) => ({
    id: item.id,
    question: String(item.question ?? item.title ?? ''),
    answer: String(item.answer ?? item.body ?? item.summary ?? ''),
  }))
}

/** @deprecated Use useT() instead */
export const SITE = translations.mr
