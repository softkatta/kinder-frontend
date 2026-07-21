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

function hasPlaybacks(watch: LiveStreamWatch | null | undefined): boolean {
  return Boolean(watch?.playback || (watch?.playbacks && watch.playbacks.length > 0))
}

/** Keep last embeds while paused so public player does not remount on resume. */
function mergeWatchPreservingPlaybacks(
  incoming: LiveStreamWatch | null,
  previous: LiveStreamWatch | null,
  viewer: LiveStreamViewer | null,
): LiveStreamWatch | null {
  if (!viewer && !incoming) return null
  const status = viewer?.status ?? incoming?.status ?? previous?.status
  const base = incoming ?? previous
  if (!base) return null

  if (status === 'paused') {
    const keep = hasPlaybacks(incoming) ? incoming : previous
    return {
      ...base,
      ...(viewer ?? {}),
      status: 'paused',
      playback: keep?.playback ?? previous?.playback,
      playbacks: keep?.playbacks ?? previous?.playbacks ?? [],
    } as LiveStreamWatch
  }

  return incoming ?? previous
}

export function usePublicLiveStream() {
  const [active, setActive] = useState<LiveStreamViewer | null>(null)
  const [upcoming, setUpcoming] = useState<LiveStreamViewer[]>([])
  const [watch, setWatch] = useState<LiveStreamWatch | null>(null)
  const [cameraId, setCameraId] = useState<number | null>(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const cameraRef = useRef<number | null>(null)
  const syncGenRef = useRef(0)
  const watchRef = useRef<LiveStreamWatch | null>(null)
  watchRef.current = watch

  const applyWatch = useCallback((watchData: LiveStreamWatch | null, viewer: LiveStreamViewer | null) => {
    setActive(viewer)
    setWatch((prev) => {
      const merged = mergeWatchPreservingPlaybacks(watchData, prev, viewer)
      const camId = merged?.active_camera?.id ?? viewer?.active_camera?.id ?? null
      if (camId !== cameraRef.current) {
        cameraRef.current = camId
        setCameraId(camId)
      }
      return merged
    })
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
    const gen = ++syncGenRef.current
    try {
      const res = await publicApi.liveActive()
      if (gen !== syncGenRef.current) return
      const viewer = res.data.data as LiveStreamViewer | null

      if (!viewer?.id) {
        applyWatch(null, null)
        return
      }

      if (viewer.is_watchable || viewer.status === 'paused') {
        if (viewer.status === 'paused') {
          applyWatch(watchRef.current ?? (viewer as LiveStreamWatch), viewer)
          return
        }
        // /public/live/active now includes playbacks when live — skip a second round-trip.
        if (hasPlaybacks(viewer as LiveStreamWatch)) {
          applyWatch(viewer as LiveStreamWatch, viewer)
          return
        }
        const watchRes = await publicApi.liveWatch(viewer.id)
        if (gen !== syncGenRef.current) return
        applyWatch(watchRes.data.data as LiveStreamWatch, viewer)
        return
      }

      applyWatch(null, viewer)
    } catch {
      // Keep last good snapshot on transient API failures so the player does not remount.
    }
  }, [applyWatch])

  const handleRealtime = useCallback((payload: LiveStreamRealtimePayload) => {
    // Invalidate in-flight polls so a stale "live" response cannot overwrite pause.
    syncGenRef.current += 1
    if (payload.viewer.is_watchable || payload.viewer.status === 'paused') {
      if (payload.viewer.status === 'paused') {
        applyWatch((payload.watch ?? watchRef.current ?? payload.viewer) as LiveStreamWatch, payload.viewer)
        return
      }
      if (payload.watch) {
        applyWatch(payload.watch, payload.viewer)
      } else {
        const gen = syncGenRef.current
        publicApi.liveWatch(payload.viewer.id).then((res) => {
          if (gen !== syncGenRef.current) return
          applyWatch(res.data.data as LiveStreamWatch, payload.viewer)
        }).catch(() => {
          if (gen !== syncGenRef.current) return
          applyWatch(watchRef.current, payload.viewer)
        })
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
  const isPaused = active?.status === 'paused'
  const isUpcoming = Boolean(active?.is_upcoming || active?.display_status === 'upcoming')

  return { active, watch, upcoming, cameraId, isLive, isPaused, isUpcoming, reload: syncActive }
}

/** Lightweight banner check — no WebSocket, slow polling only. */
export function usePublicLiveStatus() {
  const [status, setStatus] = useState<'live' | 'upcoming' | 'paused' | 'off'>('off')

  const check = useCallback(() => {
    publicApi.liveActive().then((res) => {
      const d = res.data.data as LiveStreamViewer | null
      if (!d) {
        setStatus('off')
        return
      }
      if (d.status === 'paused') {
        setStatus('paused')
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
