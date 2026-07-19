import { useEffect, useState } from 'react'
import { publicApi } from '@/api/services'
import { parseHighlights, toBlogPost, toCatalogItem, toEventItem, toJobDetail } from '@/utils/cmsNormalize'
import { useT } from '@/i18n/LanguageContext'
import type { Locale } from '@/i18n/types'

function useLocaleFetcher<T>(
  fetcher: (locale: string) => Promise<Record<string, unknown>[]>,
  mapFn: (raw: Record<string, unknown>) => T,
) {
  const { locale } = useT()
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetcher(locale)
      .then((data) => setItems(data?.length ? data.map((raw) => mapFn(raw)) : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [locale])

  return { items, loading }
}

export function useCmsList<T>(
  type: 'program' | 'facility' | 'activity' | 'event' | 'blog' | 'job',
  mapFn: (raw: Record<string, unknown>) => T,
) {
  const fetchers = {
    program: (locale: string) => publicApi.programs(locale).then((r) => r.data.data ?? []),
    facility: (locale: string) => publicApi.facilities(locale).then((r) => r.data.data ?? []),
    activity: (locale: string) => publicApi.activities(locale).then((r) => r.data.data ?? []),
    event: (locale: string) => publicApi.events(locale).then((r) => r.data.data ?? []),
    blog: (locale: string) => publicApi.blog(locale).then((r) => r.data.data ?? []),
    job: (locale: string) => publicApi.jobs(locale).then((r) => r.data.data ?? []),
  }
  return useLocaleFetcher(fetchers[type], mapFn)
}

function useCmsDetail<T>(
  slug: string | undefined,
  type: string,
  mapFn: (raw: Record<string, unknown>) => T,
) {
  const { locale } = useT()
  const [item, setItem] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    publicApi.content(type, slug, locale)
      .then((r) => setItem(mapFn(r.data.data)))
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [slug, locale])

  return { item, loading }
}

export function useProgram(slug?: string) {
  return useCmsDetail(slug, 'program', toCatalogItem)
}

export function useFacility(slug?: string) {
  return useCmsDetail(slug, 'facility', toCatalogItem)
}

export function useActivity(slug?: string) {
  return useCmsDetail(slug, 'activity', toCatalogItem)
}

export function useEvent(slug?: string) {
  return useCmsDetail(slug, 'event', toEventItem)
}

export function useBlogPost(slug?: string) {
  return useCmsDetail(slug, 'blog', toBlogPost)
}

export function useJob(slug?: string) {
  return useCmsDetail(slug, 'job', toJobDetail)
}

export function usePublicList(type: 'staff' | 'curriculum' | 'programs' | 'facilities' | 'activities' | 'events' | 'blog' | 'faqs' | 'gallery' | 'jobs' | 'testimonials') {
  const { locale } = useT()
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetcher = {
      staff: () => publicApi.staff(locale),
      curriculum: () => publicApi.curriculum(locale),
      programs: () => publicApi.programs(locale),
      facilities: () => publicApi.facilities(locale),
      activities: () => publicApi.activities(locale),
      events: () => publicApi.events(locale),
      blog: () => publicApi.blog(locale),
      faqs: () => publicApi.faqs(locale),
      gallery: () => publicApi.gallery(locale),
      jobs: () => publicApi.jobs(locale),
      testimonials: () => publicApi.testimonials(locale),
    }[type]

    fetcher()
      .then((r) => setItems(r.data.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [locale, type])

  return { items, loading }
}

/** Fetch public CMS JSON via API (locale handled server-side). */
export async function fetchLocalizedPublic<T>(
  fetcher: (locale: Locale) => Promise<{ data: { data: T } }>,
  locale: Locale,
): Promise<T> {
  const res = await fetcher(locale)
  return res.data.data
}

export { parseHighlights }
