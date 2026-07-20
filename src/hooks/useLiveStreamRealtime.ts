import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import { liveStreamApi } from '@/api/services'
import { ensureEcho, getEcho, refreshEchoAuth } from '@/realtime/echo'
import { useVisibilityAwareInterval } from '@/hooks/useVisibilityAwareInterval'
import type { LiveStreamRealtimePayload, LiveStreamStaff, LiveStreamViewer, LiveStreamWatch } from '@/types/liveStream'

const POLL_WAITING_MS = 4000
const POLL_LIVE_CONNECTED_MS = 5000
const POLL_LIVE_FALLBACK_MS = 2000
const POLL_ADMIN_CONNECTED_MS = 6000
const POLL_ADMIN_FALLBACK_MS = 2500

function applyRealtimePayload(
  payload: LiveStreamRealtimePayload,
  setActive: (v: LiveStreamViewer) => void,
  setWatch: (v: LiveStreamWatch | null) => void,
  setCameraId: (v: number | null) => void,
  cameraRef: MutableRefObject<number | null>,
) {
  setActive(payload.viewer)
  if (payload.watch) {
    setWatch(payload.watch)
    const camId = payload.watch.active_camera?.id ?? null
    if (camId !== cameraRef.current) {
      cameraRef.current = camId
      setCameraId(camId)
    }
    return
  }
  if (payload.viewer.is_watchable && payload.viewer.id) {
    liveStreamApi.watch(payload.viewer.id).then((res) => {
      const wd = res.data.data as LiveStreamWatch
      setWatch(wd)
      const camId = wd.active_camera?.id ?? null
      if (camId !== cameraRef.current) {
        cameraRef.current = camId
        setCameraId(camId)
      }
    }).catch(() => setWatch(null))
  } else {
    setWatch(null)
    cameraRef.current = null
    setCameraId(null)
  }
}

export function useLiveStreamRealtime(
  streamId: number | null,
  options: {
    viewer?: boolean
    onUpdate?: (payload: LiveStreamRealtimePayload, staff?: LiveStreamStaff) => void
    onNotFound?: () => void
  } = {},
) {
  const { viewer = false, onUpdate, onNotFound } = options
  const [viewerState, setViewerState] = useState<LiveStreamViewer | null>(null)
  const [watchState, setWatchState] = useState<LiveStreamWatch | null>(null)
  const [connected, setConnected] = useState(false)
  const onUpdateRef = useRef(onUpdate)
  const onNotFoundRef = useRef(onNotFound)
  const streamIdRef = useRef<number | null>(streamId)
  const abortRef = useRef<AbortController | null>(null)
  onUpdateRef.current = onUpdate
  onNotFoundRef.current = onNotFound
  streamIdRef.current = streamId

  const refresh = useCallback(async () => {
    if (!streamId) return
    const requestId = streamId
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    try {
      if (viewer) {
        const res = await liveStreamApi.watch(requestId, { signal: controller.signal })
        if (streamIdRef.current !== requestId || controller.signal.aborted) return
        const data = res.data.data as LiveStreamWatch
        setWatchState(data)
        setViewerState(data)
      } else {
        const res = await liveStreamApi.get(requestId, { signal: controller.signal })
        if (streamIdRef.current !== requestId || controller.signal.aborted) return
        const staff = res.data.data as LiveStreamStaff
        onUpdateRef.current?.({
          action: 'poll',
          stream_id: requestId,
          viewer: {
            id: staff.id,
            title: staff.title,
            status: staff.status,
            display_status: staff.display_status ?? staff.status,
            status_label: staff.status_label,
            is_watchable: ['live', 'paused'].includes(staff.status),
            active_camera: staff.active_camera
              ? {
                  id: staff.active_camera.id,
                  name: staff.active_camera.name,
                  location: staff.active_camera.location,
                  stream_type: staff.active_camera.stream_type,
                }
              : null,
          },
          timestamp: new Date().toISOString(),
        }, staff)
      }
    } catch (err: unknown) {
      if (controller.signal.aborted || streamIdRef.current !== requestId) return
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) {
        onNotFoundRef.current?.()
      }
    }
  }, [streamId, viewer])

  useEffect(() => {
    if (!streamId) {
      abortRef.current?.abort()
      abortRef.current = null
      setConnected(false)
      return
    }

    void refresh()

    let cancelled = false
    let streamChannel: {
      listen: (e: string, cb: (p: LiveStreamRealtimePayload) => void) => void
      stopListening: (e: string) => void
      subscribed: (cb: () => void) => void
      error: (cb: () => void) => void
    } | null = null

    ensureEcho().then((echo) => {
      if (cancelled || !echo || streamIdRef.current !== streamId) return
      refreshEchoAuth()

      const onEvent = (payload: LiveStreamRealtimePayload) => {
        if (streamIdRef.current !== streamId) return
        setConnected(true)
        onUpdateRef.current?.(payload, payload.staff)
        if (viewer) {
          setViewerState(payload.viewer)
          if (payload.watch) {
            setWatchState(payload.watch)
          }
        }
      }

      streamChannel = echo.private(`live-stream.${streamId}`)
      streamChannel.listen('.stream.updated', onEvent)
      streamChannel.subscribed(() => setConnected(true))
      streamChannel.error(() => setConnected(false))
    }).catch(() => {
      // Echo optional — polling still works
    })

    return () => {
      cancelled = true
      abortRef.current?.abort()
      abortRef.current = null
      const echo = getEcho()
      if (echo && streamChannel) {
        streamChannel.stopListening('.stream.updated')
        echo.leave(`live-stream.${streamId}`)
      }
    }
  }, [streamId, viewer, refresh])

  const pollMs = streamId
    ? (connected ? POLL_ADMIN_CONNECTED_MS : POLL_ADMIN_FALLBACK_MS)
    : null

  useVisibilityAwareInterval(refresh, pollMs, Boolean(streamId))

  return { viewerState, watchState, connected, refresh }
}

/** Parent / viewer: auto-start when admin goes live + instant camera switch (no page reload). */
export function useActiveLiveStream() {
  const [active, setActive] = useState<LiveStreamViewer | null>(null)
  const [watch, setWatch] = useState<LiveStreamWatch | null>(null)
  const [cameraId, setCameraId] = useState<number | null>(null)
  const [connected, setConnected] = useState(false)
  const cameraRef = useRef<number | null>(null)

  const sync = useCallback(async () => {
    try {
      const res = await liveStreamApi.viewerActive()
      const data = res.data.data as LiveStreamViewer | null

      if (!data) {
        setActive(null)
        setWatch(null)
        cameraRef.current = null
        setCameraId(null)
        return
      }

      setActive(data)

      if (!data.is_watchable) {
        setWatch(null)
        cameraRef.current = null
        setCameraId(null)
        return
      }

      const watchRes = await liveStreamApi.watch(data.id)
      const watchData = watchRes.data.data as LiveStreamWatch
      setWatch(watchData)
      const camId = watchData.active_camera?.id ?? null
      if (camId !== cameraRef.current) {
        cameraRef.current = camId
        setCameraId(camId)
      }
    } catch {
      setActive(null)
      setWatch(null)
      cameraRef.current = null
      setCameraId(null)
    }
  }, [])

  const handleRealtime = useCallback((payload: LiveStreamRealtimePayload) => {
    applyRealtimePayload(payload, setActive, setWatch, setCameraId, cameraRef)
  }, [])

  const activeIdRef = useRef<number | null>(null)
  activeIdRef.current = active?.id ?? null

  useEffect(() => {
    sync()

    let cancelled = false
    let eventsChannel: {
      listen: (e: string, cb: (p: LiveStreamRealtimePayload) => void) => void
      stopListening: (e: string) => void
      subscribed: (cb: () => void) => void
      error: (cb: () => void) => void
    } | null = null

    ensureEcho().then((echo) => {
      if (cancelled || !echo) return
      refreshEchoAuth()

      eventsChannel = echo.private('live-events')
      eventsChannel.listen('.stream.updated', (payload: LiveStreamRealtimePayload) => {
        setConnected(true)
        handleRealtime(payload)
      })
      eventsChannel.subscribed(() => setConnected(true))
      eventsChannel.error(() => setConnected(false))
    })

    return () => {
      cancelled = true
      const echo = getEcho()
      if (echo && eventsChannel) {
        eventsChannel.stopListening('.stream.updated')
        echo.leave('live-events')
      }
    }
  }, [sync, handleRealtime])

  useEffect(() => {
    const streamId = activeIdRef.current
    if (!streamId) return

    let cancelled = false
    let streamChannel: {
      listen: (e: string, cb: (p: LiveStreamRealtimePayload) => void) => void
      stopListening: (e: string) => void
    } | null = null

    ensureEcho().then((echo) => {
      if (cancelled || !echo) return

      streamChannel = echo.private(`live-stream.${streamId}`)
      streamChannel.listen('.stream.updated', (payload: LiveStreamRealtimePayload) => {
        handleRealtime(payload)
      })
    })

    return () => {
      cancelled = true
      const echo = getEcho()
      if (echo && streamChannel) {
        streamChannel.stopListening('.stream.updated')
        echo.leave(`live-stream.${streamId}`)
      }
    }
  }, [active?.id, handleRealtime])

  const pollMs = active?.is_watchable
    ? (connected ? POLL_LIVE_CONNECTED_MS : POLL_LIVE_FALLBACK_MS)
    : POLL_WAITING_MS

  useVisibilityAwareInterval(sync, pollMs, true)

  return { active, watch, cameraId, connected, reload: sync }
}
