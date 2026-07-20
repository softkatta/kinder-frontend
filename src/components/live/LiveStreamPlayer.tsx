import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, Radio, RotateCw } from 'lucide-react'
import { LiveKitViewer, type WebrtcAuthMode } from '@/components/live/LiveKitViewer'
import type { LivePlayback } from '@/types/liveStream'

type Rotation = 0 | 90 | 180 | 270

interface LiveStreamPlayerProps {
  playback?: LivePlayback | null
  playbacks?: LivePlayback[] | null
  layoutMode?: number
  cameraId?: number | null
  title?: string
  cameraName?: string
  cameraLocation?: string
  status?: string
  className?: string
  /** Edge-to-edge wide player on viewer pages */
  immersive?: boolean
  /** Mute playback — controlled by admin audio toggle */
  muted?: boolean
  /** WebRTC token endpoint for built-in camera feeds */
  webrtcAuth?: WebrtcAuthMode
  /** Show viewer rotate control (public/parent). Default true when immersive. */
  showRotate?: boolean
}

interface FeedLayer {
  id: string
  playback: LivePlayback
  cameraName?: string
  cameraLocation?: string
}

function layerId(cameraId: number | null | undefined, playback: LivePlayback): string {
  const cam = playback.camera_id ?? cameraId ?? 0
  if (playback.mode === 'builtin_camera') {
    return `${cam}-builtin-${playback.participant_identity ?? playback.camera_id ?? 'stream'}`
  }
  return `${cam}-${playback.mode}-${playback.video_id ?? playback.src ?? 'stream'}`
}

function readyDelay(mode: LivePlayback['mode']): number {
  if (mode === 'youtube') return 1200
  if (mode === 'vimeo') return 800
  if (mode === 'builtin_camera') return 500
  return 300
}

function youtubeEmbedSrc(videoId: string, muted: boolean): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: muted ? '1' : '0',
    rel: '0',
    playsinline: '1',
    modestbranding: '1',
    fs: '1',
  })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

function resolvePanes(
  playback: LivePlayback | null | undefined,
  playbacks: LivePlayback[] | null | undefined,
  layoutMode: number | undefined,
  cameraId: number | null | undefined,
  cameraName?: string,
  cameraLocation?: string,
): FeedLayer[] {
  const list = (playbacks && playbacks.length > 0)
    ? playbacks
    : (playback ? [playback] : [])

  const cap = Math.max(1, Math.min(4, layoutMode ?? list.length ?? 1))
  return list.slice(0, cap).map((pb, index) => ({
    id: layerId(pb.camera_id ?? cameraId, pb),
    playback: pb,
    cameraName: pb.camera_name ?? (index === 0 ? cameraName : undefined),
    cameraLocation: pb.camera_location ?? (index === 0 ? cameraLocation : undefined) ?? undefined,
  }))
}

function FeedEmbed({
  layer,
  onReady,
  muted,
  webrtcAuth,
}: {
  layer: FeedLayer
  onReady?: () => void
  muted: boolean
  webrtcAuth: WebrtcAuthMode
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readyRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  const markReady = useCallback(() => {
    if (!onReady || readyRef.current) return
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      if (readyRef.current) return
      readyRef.current = true
      onReady()
    }, readyDelay(layer.playback.mode))
  }, [layer.playback.mode, onReady])

  useEffect(() => {
    readyRef.current = false
    if (timerRef.current) window.clearTimeout(timerRef.current)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [layer.id])

  useEffect(() => {
    if (layer.playback.mode !== 'signed_redirect' || !layer.playback.src) return
    const video = videoRef.current
    if (!video) return
    video.src = layer.playback.src
    video.muted = muted
    video.load()
    const play = () => video.play().catch(() => {
      if (!muted) {
        video.muted = true
        video.play().catch(() => {})
      }
    })
    play()
  }, [layer.id, layer.playback.mode, layer.playback.src, muted])

  if (layer.playback.mode === 'youtube' && layer.playback.video_id) {
    return (
      <iframe
        title={layer.cameraName || 'Live stream'}
        src={youtubeEmbedSrc(layer.playback.video_id, muted)}
        className="live-player-iframe"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        onLoad={markReady}
      />
    )
  }

  if (
    layer.playback.mode === 'builtin_camera'
    && layer.playback.stream_id
    && layer.playback.participant_identity
  ) {
    return (
      <LiveKitViewer
        streamId={layer.playback.stream_id}
        participantIdentity={layer.playback.participant_identity}
        muted={muted}
        webrtcAuth={webrtcAuth}
        onReady={markReady}
        className="live-player-video"
      />
    )
  }

  if (layer.playback.mode === 'vimeo' && layer.playback.video_id) {
    const mutedParam = muted ? '1' : '0'
    return (
      <iframe
        title={layer.cameraName || 'Live stream'}
        src={`https://player.vimeo.com/video/${layer.playback.video_id}?autoplay=1&muted=${mutedParam}`}
        className="live-player-iframe"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        onLoad={markReady}
      />
    )
  }

  return (
    <video
      ref={videoRef}
      className="live-player-video"
      controls
      playsInline
      autoPlay
      muted={muted}
      onLoadedData={markReady}
      onCanPlay={markReady}
    />
  )
}

function nextRotation(current: Rotation): Rotation {
  return ((current + 90) % 360) as Rotation
}

export function LiveStreamPlayer({
  playback,
  playbacks,
  layoutMode,
  cameraId,
  title,
  cameraName,
  cameraLocation,
  status,
  className = '',
  immersive = false,
  muted = false,
  webrtcAuth = 'authenticated',
  showRotate,
}: LiveStreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layers, setLayers] = useState<FeedLayer[]>([])
  const [visibleId, setVisibleId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [outgoingId, setOutgoingId] = useState<string | null>(null)
  const [fadeActive, setFadeActive] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotation, setRotation] = useState<Rotation>(0)
  const visibleIdRef = useRef<string | null>(null)
  const pendingIdRef = useRef<string | null>(null)

  const panes = resolvePanes(playback, playbacks, layoutMode, cameraId, cameraName, cameraLocation)
  const isGrid = panes.length > 1
  // Layout from actual active feeds only — do not reserve empty slots for unused layout_mode.
  const gridMode = Math.min(4, Math.max(1, panes.length)) as 1 | 2 | 3 | 4
  const rotateEnabled = showRotate ?? immersive
  const primaryPane = panes[0]
  const primaryKey = primaryPane?.id ?? null

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  useEffect(() => {
    visibleIdRef.current = visibleId
  }, [visibleId])

  useEffect(() => {
    pendingIdRef.current = pendingId
  }, [pendingId])

  // Single-feed crossfade stack
  useEffect(() => {
    if (isGrid) {
      setLayers([])
      setVisibleId(null)
      setPendingId(null)
      setOutgoingId(null)
      setFadeActive(false)
      return
    }

    if (!primaryPane || !primaryKey) return
    if (primaryKey === visibleIdRef.current || primaryKey === pendingIdRef.current) return

    setLayers((prev) => (prev.some((l) => l.id === primaryKey) ? prev : [...prev, primaryPane]))
    setPendingId(primaryKey)
  }, [isGrid, primaryKey, primaryPane])

  const handleReady = useCallback((id: string) => {
    if (id !== pendingIdRef.current && id !== visibleIdRef.current) return

    if (!visibleIdRef.current) {
      setVisibleId(id)
      setPendingId(null)
      return
    }

    if (id === visibleIdRef.current) return

    const previous = visibleIdRef.current
    setOutgoingId(previous)
    setVisibleId(id)
    setPendingId(null)
    setFadeActive(false)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFadeActive(true))
    })

    window.setTimeout(() => {
      setOutgoingId(null)
      setFadeActive(false)
      setLayers((prev) => prev.filter((l) => l.id === id))
    }, 780)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null
      webkitExitFullscreen?: () => Promise<void>
    }
    const elAny = el as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }

    const active = document.fullscreenElement ?? doc.webkitFullscreenElement
    if (active === el) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      } else {
        doc.webkitExitFullscreen?.()
      }
      return
    }

    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    } else {
      elAny.webkitRequestFullscreen?.()
    }
  }, [])

  const displayName = isGrid
    ? undefined
    : (cameraName || layers.find((l) => l.id === visibleId)?.cameraName)
  const displayLocation = isGrid
    ? undefined
    : (cameraLocation || layers.find((l) => l.id === visibleId)?.cameraLocation)

  if (panes.length === 0 && layers.length === 0) {
    return (
      <div className={`live-player live-player--empty ${className}`}>
        <p className="text-sm text-slate-500">Waiting for live feed…</p>
      </div>
    )
  }

  const isPaused = status === 'paused'
  const sideways = rotation === 90 || rotation === 270

  return (
    <div
      ref={containerRef}
      className={[
        'live-player live-player--with-badge',
        isGrid ? 'live-player--grid-shell' : 'live-player-stack',
        immersive ? 'live-player--immersive' : '',
        isPaused ? 'is-paused' : '',
        fadeActive ? 'is-fading' : '',
        sideways ? 'live-player--sideways' : '',
        className,
      ].filter(Boolean).join(' ')}
      data-rotation={rotation}
      onDoubleClick={toggleFullscreen}
    >
      <div
        className={`live-player-rotate-inner live-player-rotate-inner--${rotation}`}
        data-rot={rotation}
      >
        {status === 'live' && (
          <span className="live-player-live-badge">
            <Radio className="h-3 w-3" /> LIVE
          </span>
        )}
        {isPaused && (
          <span className="live-player-live-badge live-player-live-badge--paused">Paused</span>
        )}

        {!isPaused && (
          <div className="live-player-toolbar">
            {rotateEnabled && (
              <button
                type="button"
                className="live-player-fs-btn live-player-rotate-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setRotation((r) => nextRotation(r))
                }}
                aria-label="Rotate player"
              >
                <RotateCw className="h-4 w-4" />
                <span className="live-player-fs-label">Rotate</span>
              </button>
            )}
            <button
              type="button"
              className="live-player-fs-btn"
              onClick={(e) => {
                e.stopPropagation()
                toggleFullscreen()
              }}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="live-player-fs-label">{isFullscreen ? 'Exit' : 'Full screen'}</span>
            </button>
          </div>
        )}

        {isGrid ? (
          <div className={`live-player-grid live-player-grid--${gridMode}`}>
            {panes.map((pane, index) => (
              <div key={pane.id} className="live-player-pane">
                <FeedEmbed
                  key={`${pane.id}-${muted ? 'muted' : 'unmuted'}-${index}`}
                  layer={pane}
                  muted={muted || index > 0}
                  webrtcAuth={webrtcAuth}
                />
                {(pane.cameraName || pane.cameraLocation) && (
                  <div className="live-player-pane-caption">
                    {pane.cameraName && <span className="font-semibold">{pane.cameraName}</span>}
                    {pane.cameraLocation && <span> · {pane.cameraLocation}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          layers.map((layer) => {
            const isVisible = layer.id === visibleId
            const isPending = layer.id === pendingId
            const isOutgoing = layer.id === outgoingId
            const isFirst = !visibleId && layers.length === 1

            let roleClass = 'live-player-layer--hidden'
            if (isFirst || (isVisible && !isOutgoing)) {
              roleClass = fadeActive && isVisible && outgoingId ? 'live-player-layer--fade-in' : 'live-player-layer--show'
            } else if (isOutgoing) {
              roleClass = fadeActive ? 'live-player-layer--fade-out' : 'live-player-layer--show'
            } else if (isPending) {
              roleClass = 'live-player-layer--preload'
            }

            return (
              <div key={layer.id} className={`live-player-layer ${roleClass}`}>
                <FeedEmbed
                  key={`${layer.id}-${muted ? 'muted' : 'unmuted'}`}
                  layer={layer}
                  muted={muted}
                  webrtcAuth={webrtcAuth}
                  onReady={() => handleReady(layer.id)}
                />
              </div>
            )
          })
        )}

        {isPaused && (
          <div className="live-player-pause-overlay" aria-live="polite">
            <span className="live-player-badge live-player-badge--paused">Paused</span>
            {title && <p className="font-display font-bold text-white text-lg mt-3">{title}</p>}
            <p className="text-white/85 text-sm mt-1">The broadcast is paused. Please wait…</p>
          </div>
        )}

        {!isPaused && !isGrid && (displayName || displayLocation) && (
          <div className="live-player-caption live-player-caption--fade">
            {displayName && <span className="font-semibold">{displayName}</span>}
            {displayLocation && <span className="text-slate-400"> · {displayLocation}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
