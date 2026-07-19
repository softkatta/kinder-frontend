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
