import { useMemo } from 'react'
import ErpLayout from './ErpLayout'
import { adminPortalConfig } from '@/config/erpPortals'
import { useAdminNotificationRealtime } from '@/hooks/useAdminNotificationRealtime'
import { useAdminSidebarData } from '@/hooks/useAdminSidebarData'

export default function AdminLayout() {
  useAdminNotificationRealtime()
  const { badges, yearCard } = useAdminSidebarData()

  const nav = useMemo(
    () =>
      adminPortalConfig.nav.map((item) => {
        if (!item.badgeKey) return item
        const count = badges[item.badgeKey] ?? 0
        if (count <= 0) {
          const { badgeKey: _, badge: __, ...rest } = item
          return rest
        }
        return { ...item, badge: String(count) }
      }),
    [badges],
  )

  const config = useMemo(() => ({ ...adminPortalConfig, nav }), [nav])

  return <ErpLayout config={config} yearCard={yearCard} />
}
