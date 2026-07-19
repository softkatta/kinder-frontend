import { useCallback, useEffect, useRef, useState } from 'react'
import { publicApi } from '@/api/services'
import { ensureEcho, getEcho, refreshEchoAuth } from '@/realtime/echo'
import { useVisibilityAwareInterval } from '@/hooks/useVisibilityAwareInterval'
import type { LiveStreamRealtimePayload, LiveStreamViewer, LiveStreamWatch } from '@/types/liveStream'

const POLL_WAITING_MS = 4000
const POLL_LIVE_CONNECTED_MS = 8000
const POLL_LIVE_FALLBACK_MS = 2500
const POLL_UPCOMING_MS = 30000
const BANNER_STATUS_MS = 30000

export function usePublicLiveStream() {
  const [active, setActive] = useState<LiveStreamViewer | null>(null)
  const [upcoming, setUpcoming] = useState<LiveStreamViewer[]>([])
  const [watch, setWatch] = useState<LiveStreamWatch | null>(null)
  const [cameraId, setCameraId] = useState<number | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const cameraRef = useRef<number | null>(null)

  const applyWatch = useCallback((watchData: LiveStreamWatch | null, viewer: LiveStreamViewer | null) => {
    setActive(viewer)
    setWatch(watchData)
    const camId = watchData?.active_camera?.id ?? null
    if (camId !== cameraRef.current) {
      cameraRef.current = camId
      setCameraId(camId)
    }
  }, [])

  const loadUpcoming = useCallback(async () => {
    try {
      const res = await publicApi.liveUpcoming()
      setUpcoming((res.data.data ?? []) as LiveStreamViewer[])
    } catch {
      setUpcoming([])
    }
  }, [])

  const syncActive = useCallback(async () => {
    try {
      const res = await publicApi.liveActive()
      const viewer = res.data.data as LiveStreamViewer | null

      if (!viewer?.id) {
        applyWatch(null, null)
        return
      }

      if (viewer.is_watchable) {
        const watchRes = await publicApi.liveWatch(viewer.id)
        applyWatch(watchRes.data.data as LiveStreamWatch, viewer)
        return
      }

      applyWatch(null, viewer)
    } catch {
      applyWatch(null, null)
    }
  }, [applyWatch])

  const handleRealtime = useCallback((payload: LiveStreamRealtimePayload) => {
    if (payload.viewer.is_watchable && payload.viewer.id) {
      if (payload.watch) {
        applyWatch(payload.watch, payload.viewer)
      } else {
        publicApi.liveWatch(payload.viewer.id).then((res) => {
          applyWatch(res.data.data as LiveStreamWatch, payload.viewer)
        }).catch(() => applyWatch(null, payload.viewer))
      }
    } else {
      applyWatch(null, payload.viewer)
    }
  }, [applyWatch])

  useEffect(() => {
    syncActive()
    loadUpcoming()

    let cancelled = false
    let channel: { listen: (e: string, cb: (p: LiveStreamRealtimePayload) => void) => void; stopListening: (e: string) => void; subscribed: (cb: () => void) => void; error: (cb: () => void) => void } | null = null

    ensureEcho().then((echo) => {
      if (cancelled || !echo) return
      refreshEchoAuth()
      channel = echo.channel('live-public')
      channel.listen('.stream.updated', (payload: LiveStreamRealtimePayload) => {
        setRealtimeConnected(true)
        handleRealtime(payload)
      })
      channel.subscribed(() => setRealtimeConnected(true))
      channel.error(() => setRealtimeConnected(false))
    })

    return () => {
      cancelled = true
      const echo = getEcho()
      if (echo && channel) {
        channel.stopListening('.stream.updated')
        echo.leave('live-public')
      }
    }
  }, [syncActive, loadUpcoming, handleRealtime])

  const pollMs = active?.is_watchable
    ? (realtimeConnected ? POLL_LIVE_CONNECTED_MS : POLL_LIVE_FALLBACK_MS)
    : POLL_WAITING_MS

  useVisibilityAwareInterval(syncActive, pollMs, true)
  useVisibilityAwareInterval(loadUpcoming, POLL_UPCOMING_MS, true)

  const isLive = active?.status === 'live'
  const isUpcoming = Boolean(active?.is_upcoming || active?.display_status === 'upcoming')

  return { active, watch, upcoming, cameraId, isLive, isUpcoming, reload: syncActive }
}

/** Lightweight banner check — no WebSocket, slow polling only. */
export function usePublicLiveStatus() {
  const [status, setStatus] = useState<'live' | 'upcoming' | 'off'>('off')

  const check = useCallback(() => {
    publicApi.liveActive().then((res) => {
      const d = res.data.data as LiveStreamViewer | null
      if (!d) {
        setStatus('off')
        return
      }
      if (d.is_watchable) {
        setStatus('live')
      } else if (d.is_upcoming || d.display_status === 'upcoming') {
        setStatus('upcoming')
      } else {
        setStatus('off')
      }
    }).catch(() => setStatus('off'))
  }, [])

  useEffect(() => {
    check()
  }, [check])

  useVisibilityAwareInterval(check, BANNER_STATUS_MS, true)

  return status
}
