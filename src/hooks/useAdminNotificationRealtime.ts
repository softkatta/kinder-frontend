import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { store } from '@/store'
import { ensureEcho, getEcho } from '@/realtime/echo'

/** Subscribe to admin realtime alerts (Pusher/Reverb). */
export function useAdminNotificationRealtime(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const userId = store.getState().auth.user?.id
    if (!userId) return

    let channel: { listen: (e: string, cb: (p: unknown) => void) => void } | null = null
    let cancelled = false

    ensureEcho().then((echo) => {
      if (cancelled || !echo) return
      channel = echo.private(`admin-notifications.${userId}`)
      channel.listen('.admin.alert', (payload: unknown) => {
        const p = payload as { title?: string; body?: string }
        toast(p.title || 'New notification', { duration: 5000 })
        if (p.body) toast(p.body, { icon: '🔔', duration: 6000 })
      })
      channel.listen('.integration.test', (payload: unknown) => {
        const p = payload as { message?: string }
        toast.success(p.message || 'Realtime connection OK')
      })
    })

    return () => {
      cancelled = true
      const echo = getEcho()
      if (echo && channel) {
        echo.leave(`admin-notifications.${userId}`)
      }
    }
  }, [enabled])
}
