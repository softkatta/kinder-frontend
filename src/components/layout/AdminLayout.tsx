import { useEffect, useMemo, useState } from 'react'
import ErpLayout from './ErpLayout'
import { adminPortalConfig, type ErpNavItem } from '@/config/erpPortals'
import { useAdminNotificationRealtime } from '@/hooks/useAdminNotificationRealtime'
import { useAdminSidebarData } from '@/hooks/useAdminSidebarData'
import { isModuleEnabled, loadEntitlements, type Entitlements } from '@/lib/entitlements'

/** SoftKatta module keys for admin nav labels (unmapped labels always show). */
const MODULE_BY_LABEL: Record<string, string> = {
  Students: 'students',
  Admissions: 'admissions',
  Payments: 'payments',
  'Student Fees': 'payments',
  Transport: 'transport',
  Homework: 'homework',
  Reports: 'reports',
  Attendance: 'attendance',
  'ID Cards': 'id_cards',
  Academics: 'academics',
  Guests: 'guests',
  'Live Streams': 'live_streams',
  'Website CMS': 'cms',
}

function filterNavByEntitlements(items: ErpNavItem[], entitlements: Entitlements | null): ErpNavItem[] {
  return items.filter((item) => {
    const moduleKey = MODULE_BY_LABEL[item.label]
    if (!moduleKey) return true
    return isModuleEnabled(moduleKey, entitlements)
  })
}

export default function AdminLayout() {
  useAdminNotificationRealtime()
  const { badges, yearCard } = useAdminSidebarData()
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null)

  useEffect(() => {
    loadEntitlements()
      .then(setEntitlements)
      .catch(() => setEntitlements(null))
  }, [])

  const nav = useMemo(() => {
    const withBadges = adminPortalConfig.nav.map((item) => {
      if (!item.badgeKey) return item
      const count = badges[item.badgeKey] ?? 0
      if (count <= 0) {
        const { badgeKey: _, badge: __, ...rest } = item
        return rest
      }
      return { ...item, badge: String(count) }
    })
    return filterNavByEntitlements(withBadges, entitlements)
  }, [badges, entitlements])

  const config = useMemo(() => ({ ...adminPortalConfig, nav }), [nav])

  return <ErpLayout config={config} yearCard={yearCard} />
}
