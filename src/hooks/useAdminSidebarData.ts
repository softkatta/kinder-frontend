import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { dashboardApi } from '@/api/services'

export interface AdminSidebarData {
  badges: Record<string, number>
  yearCard: { label: string; students: number; staff: number } | null
}

export function useAdminSidebarData(enabled = true): AdminSidebarData {
  const location = useLocation()
  const [badges, setBadges] = useState<Record<string, number>>({})
  const [yearCard, setYearCard] = useState<AdminSidebarData['yearCard']>(null)

  const load = useCallback(async () => {
    if (!enabled) return
    try {
      const res = await dashboardApi.sidebar()
      const data = res.data.data
      setBadges(data.badges ?? {})
      setYearCard(data.year_card ?? null)
    } catch {
      setBadges({})
      setYearCard(null)
    }
  }, [enabled])

  useEffect(() => {
    void load()
  }, [load, location.pathname])

  return { badges, yearCard }
}
