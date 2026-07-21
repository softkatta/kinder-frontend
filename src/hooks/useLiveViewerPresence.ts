import { useCallback, useEffect, useRef } from 'react'
import { liveStreamApi, publicApi } from '@/api/services'
import { useVisibilityAwareInterval } from '@/hooks/useVisibilityAwareInterval'

const HEARTBEAT_MS = 15_000
const STORAGE_KEY = 'kinder_live_viewer_key'

function getOrCreateViewerKey(): string {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY)
    if (existing && existing.length >= 16) return existing
    const key = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 64)
    const normalized = key.length >= 16 ? key : `${key}${Date.now()}`.slice(0, 64)
    sessionStorage.setItem(STORAGE_KEY, normalized)
    return normalized
  } catch {
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  }
}

/**
 * Pings the API while a parent/public viewer is on a watchable live page
 * so admin VIEWERS count reflects real presence.
 */
export function useLiveViewerPresence(
  streamId: number | null | undefined,
  enabled: boolean,
  options: { public?: boolean } = {},
) {
  const isPublic = options.public ?? false
  const keyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!keyRef.current) keyRef.current = getOrCreateViewerKey()
  }, [])

  const beat = useCallback(() => {
    if (!streamId || !enabled) return
    const viewerKey = keyRef.current ?? getOrCreateViewerKey()
    keyRef.current = viewerKey
    const req = isPublic
      ? publicApi.liveViewerHeartbeat(streamId, viewerKey)
      : liveStreamApi.viewerHeartbeat(streamId, viewerKey)
    void req.catch(() => { /* ignore transient failures */ })
  }, [streamId, enabled, isPublic])

  useEffect(() => {
    if (!streamId || !enabled) return
    beat()
  }, [streamId, enabled, beat])

  useVisibilityAwareInterval(beat, HEARTBEAT_MS, Boolean(streamId && enabled))
}
