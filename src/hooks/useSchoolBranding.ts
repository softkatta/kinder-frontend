import { useEffect } from 'react'
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { publicApi } from '@/api/services'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { getSchoolName, type SchoolProfile } from '@/config/siteContent'
import { useT } from '@/i18n/LanguageContext'
import { mediaUrl } from '@/utils/mediaUrl'

export const schoolProfileQueryKey = (locale: string) => ['school-profile', locale] as const
export const paymentInfoQueryKey = ['payment-info'] as const

function normalizeProfile(raw: Record<string, unknown> | null | undefined): SchoolProfile {
  if (!raw) return {}
  const profile = raw as SchoolProfile
  const logo = profile.logo_image || profile.image
  return logo ? { ...profile, logo_image: logo, image: logo } : profile
}

function absoluteUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function applyDocumentMeta(profile: SchoolProfile | null, fallbackName: string) {
  const title =
    (profile?.meta_title || '').trim()
    || (profile?.school_name || '').trim()
    || (profile?.title || '').trim()
    || fallbackName
    || 'Little Stars Kindergarten'

  const description =
    (profile?.meta_description || '').trim()
    || (profile?.summary || '').trim()
    || (profile?.mission || '').trim()
    || 'Nurturing young minds with joy and care.'

  const imagePath =
    profile?.meta_image
    || profile?.cover_image
    || profile?.logo_image
    || profile?.image
    || ''
  const imageUrl = absoluteUrl(mediaUrl(imagePath) || undefined)
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  document.title = title

  upsertMeta('name', 'description', description)
  upsertMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  if (imageUrl) upsertMeta('name', 'twitter:image', imageUrl)

  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', title)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  if (pageUrl) upsertMeta('property', 'og:url', pageUrl)
  if (imageUrl) {
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('property', 'og:image:alt', title)
  }
}

export function useSchoolBranding() {
  const { locale } = useT()

  const query = useQuery({
    queryKey: schoolProfileQueryKey(locale),
    queryFn: async () => {
      const data = await fetchLocalizedPublic((loc) => publicApi.schoolProfile(loc), locale)
      return normalizeProfile(data as Record<string, unknown>)
    },
    staleTime: 30_000,
  })

  const profile = query.data ?? null
  const logoUrl = profile?.logo_image || profile?.image || null
  const schoolName = getSchoolName(profile, false, locale)
  const schoolFullName = getSchoolName(profile, true, locale)

  useEffect(() => {
    const href = profile?.favicon_image ? mediaUrl(profile.favicon_image) : '/favicon.svg'
    let link = document.querySelector<HTMLLinkElement>('link[data-site-favicon="true"]')
    if (!link) {
      const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      link = existing ?? document.createElement('link')
      link.rel = 'icon'
      link.setAttribute('data-site-favicon', 'true')
      if (!existing) document.head.appendChild(link)
    }
    link.href = href
    link.type = href.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
  }, [profile?.favicon_image])

  useEffect(() => {
    applyDocumentMeta(profile, schoolFullName || schoolName)
  }, [
    profile,
    schoolFullName,
    schoolName,
    profile?.meta_title,
    profile?.meta_description,
    profile?.meta_image,
    profile?.cover_image,
    profile?.logo_image,
    profile?.summary,
    profile?.mission,
  ])

  return {
    profile,
    logoUrl,
    schoolName,
    schoolFullName,
    loading: query.isLoading,
    refetch: query.refetch,
  }
}

export function usePaymentInfo() {
  return useQuery({
    queryKey: paymentInfoQueryKey,
    queryFn: async () => {
      const res = await publicApi.paymentInfo()
      return (res.data.data as Record<string, string>) || {}
    },
    staleTime: 30_000,
  })
}

export function invalidateSchoolBranding(client: QueryClient) {
  void client.invalidateQueries({ queryKey: ['school-profile'] })
}

export function invalidatePaymentInfo(client: QueryClient) {
  void client.invalidateQueries({ queryKey: paymentInfoQueryKey })
}

export function invalidateAllPublicSettings(client: QueryClient) {
  invalidateSchoolBranding(client)
  invalidatePaymentInfo(client)
}

export function useInvalidatePublicSettings() {
  const client = useQueryClient()
  return () => invalidateAllPublicSettings(client)
}
