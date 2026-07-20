import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { LiveStreamPlayer } from '@/components/live/LiveStreamPlayer'
import { usePublicLiveStream } from '@/hooks/usePublicLiveStream'
import { useActiveLiveStream } from '@/hooks/useLiveStreamRealtime'
import type { LiveStreamViewer, LiveStreamWatch } from '@/types/liveStream'

type LiveKeepAliveState = {
  active: LiveStreamViewer | null
  watch: LiveStreamWatch | null
  cameraId: number | null
  connected?: boolean
  upcoming?: LiveStreamViewer[]
  isLive?: boolean
  isUpcoming?: boolean
  reload: () => void
  setDock: (el: HTMLElement | null) => void
  pageVisible: boolean
}

const PublicLiveKeepAliveContext = createContext<LiveKeepAliveState | null>(null)
const ParentLiveKeepAliveContext = createContext<LiveKeepAliveState | null>(null)

type DockRect = { top: number; left: number; width: number; height: number }

/**
 * Keep the player in one stable DOM node. Moving iframes (createPortal) reloads
 * YouTube/Vimeo — so we park off-screen and only reposition with CSS when the live page dock is present.
 */
function PersistentPlayerShell({
  active,
  watch,
  cameraId,
  pageVisible,
  dock,
  webrtcAuth,
  armed,
}: {
  active: LiveStreamViewer | null
  watch: LiveStreamWatch | null
  cameraId: number | null
  pageVisible: boolean
  dock: HTMLElement | null
  webrtcAuth: 'public' | 'authenticated'
  /** Only keep the player alive after the user has opened the live page once this session. */
  armed: boolean
}) {
  const [rect, setRect] = useState<DockRect | null>(null)

  const canPlay = Boolean(
    active?.is_watchable && (watch?.playback || (watch?.playbacks && watch.playbacks.length > 0)),
  )
  const docked = Boolean(pageVisible && dock && canPlay)

  const syncRect = useCallback(() => {
    if (!dock || !pageVisible) {
      setRect(null)
      return
    }
    const r = dock.getBoundingClientRect()
    setRect({
      top: r.top,
      left: r.left,
      width: Math.max(1, r.width),
      height: Math.max(1, r.height),
    })
  }, [dock, pageVisible])

  useLayoutEffect(() => {
    syncRect()
  }, [syncRect, canPlay])

  useEffect(() => {
    if (!dock || !pageVisible) return
    syncRect()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => syncRect()) : null
    ro?.observe(dock)
    window.addEventListener('resize', syncRect)
    window.addEventListener('scroll', syncRect, true)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', syncRect)
      window.removeEventListener('scroll', syncRect, true)
    }
  }, [dock, pageVisible, syncRect])

  // Wait until live page was opened so we do not burn bandwidth site-wide.
  if (!armed || !canPlay || !active || !watch) return null

  // Silent while off the live page so audio does not follow the user around the site.
  const muted = !pageVisible || active.audio_enabled === false

  const style: CSSProperties = docked && rect
    ? {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: 40,
        opacity: 1,
        pointerEvents: 'auto',
      }
    : {
        // Keep in the layout tree (no visibility:hidden) so YouTube/Vimeo keep playing.
        position: 'fixed',
        top: 0,
        left: 0,
        width: 'min(100vw, 960px)',
        height: 'min(56.25vw, 540px)',
        transform: 'translate(-120%, -120%)',
        zIndex: -1,
        opacity: 0,
        pointerEvents: 'none',
      }

  return (
    <div
      className={docked ? 'live-keepalive-shell live-keepalive-shell--docked' : 'live-keepalive-shell live-keepalive-shell--parked'}
      style={style}
      aria-hidden={!docked}
    >
      <LiveStreamPlayer
        immersive
        lockPlayback
        cameraId={cameraId}
        playback={watch.playback}
        playbacks={watch.playbacks}
        layoutMode={watch.layout_mode ?? active.layout_mode}
        title={active.title}
        cameraName={watch.active_camera?.name}
        cameraLocation={watch.active_camera?.location ?? undefined}
        status={active.status}
        muted={muted}
        webrtcAuth={webrtcAuth}
      />
    </div>
  )
}

function useDockState() {
  const [dock, setDockState] = useState<HTMLElement | null>(null)
  const setDock = useCallback((el: HTMLElement | null) => {
    setDockState(el)
  }, [])
  return { dock, setDock }
}

export function PublicLiveKeepAliveProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const pageVisible = location.pathname === '/live'
  const [armed, setArmed] = useState(false)
  const stream = usePublicLiveStream()
  const { dock, setDock } = useDockState()

  useEffect(() => {
    if (pageVisible) setArmed(true)
  }, [pageVisible])

  const value = useMemo<LiveKeepAliveState>(() => ({
    active: stream.active,
    watch: stream.watch,
    cameraId: stream.cameraId,
    upcoming: stream.upcoming,
    isLive: stream.isLive,
    isUpcoming: stream.isUpcoming,
    reload: stream.reload,
    setDock,
    pageVisible,
  }), [stream, setDock, pageVisible])

  return (
    <PublicLiveKeepAliveContext.Provider value={value}>
      {children}
      <PersistentPlayerShell
        active={stream.active}
        watch={stream.watch}
        cameraId={stream.cameraId}
        pageVisible={pageVisible}
        dock={dock}
        webrtcAuth="public"
        armed={armed}
      />
    </PublicLiveKeepAliveContext.Provider>
  )
}

export function ParentLiveKeepAliveProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const pageVisible = location.pathname === '/parent/live'
  const [armed, setArmed] = useState(false)
  const stream = useActiveLiveStream()
  const { dock, setDock } = useDockState()

  useEffect(() => {
    if (pageVisible) setArmed(true)
  }, [pageVisible])

  const value = useMemo<LiveKeepAliveState>(() => ({
    active: stream.active,
    watch: stream.watch,
    cameraId: stream.cameraId,
    connected: stream.connected,
    reload: stream.reload,
    setDock,
    pageVisible,
  }), [stream, setDock, pageVisible])

  return (
    <ParentLiveKeepAliveContext.Provider value={value}>
      {children}
      <PersistentPlayerShell
        active={stream.active}
        watch={stream.watch}
        cameraId={stream.cameraId}
        pageVisible={pageVisible}
        dock={dock}
        webrtcAuth="authenticated"
        armed={armed}
      />
    </ParentLiveKeepAliveContext.Provider>
  )
}

export function usePublicLiveKeepAlive(): LiveKeepAliveState {
  const ctx = useContext(PublicLiveKeepAliveContext)
  if (!ctx) {
    throw new Error('usePublicLiveKeepAlive must be used within PublicLiveKeepAliveProvider')
  }
  return ctx
}

export function useParentLiveKeepAlive(): LiveKeepAliveState {
  const ctx = useContext(ParentLiveKeepAliveContext)
  if (!ctx) {
    throw new Error('useParentLiveKeepAlive must be used within ParentLiveKeepAliveProvider')
  }
  return ctx
}

/** Placeholder on the live page — keep-alive player is positioned over this slot. */
export function LivePlayerDock({ className = '' }: { className?: string }) {
  const publicCtx = useContext(PublicLiveKeepAliveContext)
  const parentCtx = useContext(ParentLiveKeepAliveContext)
  const setDock = publicCtx?.setDock ?? parentCtx?.setDock
  const watch = publicCtx?.watch ?? parentCtx?.watch
  const active = publicCtx?.active ?? parentCtx?.active
  const canPlay = Boolean(
    active?.is_watchable && (watch?.playback || (watch?.playbacks && watch.playbacks.length > 0)),
  )

  const refCb = useCallback((el: HTMLDivElement | null) => {
    setDock?.(el)
  }, [setDock])

  // Reserve immersive height so the page layout does not jump under the fixed player.
  return (
    <div
      ref={refCb}
      className={className}
      style={canPlay ? { minHeight: '100dvh' } : undefined}
      aria-hidden
    />
  )
}
