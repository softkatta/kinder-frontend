import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBadge } from '@/components/admin/AdminUi'
import { portalBreadcrumbs } from '@/config/erpPortals'
import { notificationApi } from '@/api/services'

interface NotificationRow {
  id: number
  title: string
  body: string
  time: string
  read: boolean
  type?: string
}

const PORTAL_LABELS: Record<string, string> = {
  admin: 'Admin',
  teacher: 'Teacher',
  parent: 'Parent',
  student: 'Student',
  guest: 'Guest',
}

export default function NotificationsPage() {
  const location = useLocation()
  const portalKey = location.pathname.split('/').filter(Boolean)[0] ?? 'admin'
  const homePath = `/${portalKey}`
  const portalLabel = PORTAL_LABELS[portalKey] ?? 'Portal'

  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await notificationApi.list()
      setNotifications((res.data.data as NotificationRow[]) ?? [])
    } catch {
      toast.error('Could not load notifications')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const markRead = async (id: number) => {
    try {
      await notificationApi.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {
      toast.error('Could not mark notification as read')
    }
  }

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success('All notifications marked read')
    } catch {
      toast.error('Could not mark all as read')
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Notifications"
        subtitle="Alerts and updates for your account"
        breadcrumbs={portalBreadcrumbs(portalLabel, homePath, 'Notifications')}
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
            >
              Mark all read ({unreadCount})
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <AdminPanel>
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <Bell className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">No notifications yet.</p>
          </div>
        </AdminPanel>
      ) : (
        <div className="grid gap-3">
          {notifications.map((n) => (
            <AdminPanel key={n.id} noPadding>
              <button
                type="button"
                className={`w-full text-left p-5 transition hover:bg-violet-50/50 ${n.read ? 'opacity-75' : ''}`}
                onClick={() => !n.read && void markRead(n.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-ink">{n.title}</p>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{n.body}</p>
                    <p className="text-xs text-slate-400 mt-2">{n.time}</p>
                  </div>
                  {!n.read && <AdminBadge tone="warning">New</AdminBadge>}
                </div>
              </button>
            </AdminPanel>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}
