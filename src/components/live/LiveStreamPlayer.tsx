import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, Radio } from 'lucide-react'
import { LiveKitViewer, type WebrtcAuthMode } from '@/components/live/LiveKitViewer'
import type { LivePlayback } from '@/types/liveStream'

interface LiveStreamPlayerProps {
  playback?: LivePlayback | null
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
}

interface FeedLayer {
  id: string
  playback: LivePlayback
  cameraName?: string
  cameraLocation?: string
}

function layerId(cameraId: number | null | undefined, playback: LivePlayback): string {
  if (playback.mode === 'builtin_camera') {
    return `${cameraId ?? 0}-builtin-${playback.participant_identity ?? playback.camera_id ?? 'stream'}`
  }
  return `${cameraId ?? 0}-${playback.mode}-${playback.video_id ?? playback.src ?? 'stream'}`
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

function FeedEmbed({
  layer,
  onReady,
  muted,
  webrtcAuth,
}: {
  layer: FeedLayer
  onReady: () => void
  muted: boolean
  webrtcAuth: WebrtcAuthMode
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readyRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  const markReady = useCallback(() => {
    if (readyRef.current) return
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

export function LiveStreamPlayer({
  playback,
  cameraId,
  title,
  cameraName,
  cameraLocation,
  status,
  className = '',
  immersive = false,
  muted = false,
  webrtcAuth = 'authenticated',
}: LiveStreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layers, setLayers] = useState<FeedLayer[]>([])
  const [visibleId, setVisibleId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [outgoingId, setOutgoingId] = useState<string | null>(null)
  const [fadeActive, setFadeActive] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const visibleIdRef = useRef<string | null>(null)
  const pendingIdRef = useRef<string | null>(null)

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

  useEffect(() => {
    if (!playback) return

    const id = layerId(cameraId, playback)
    if (id === visibleIdRef.current || id === pendingIdRef.current) return

    const next: FeedLayer = { id, playback, cameraName, cameraLocation }

    setLayers((prev) => (prev.some((l) => l.id === id) ? prev : [...prev, next]))
    setPendingId(id)
  }, [playback, cameraId, cameraName, cameraLocation])

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

  const displayName = cameraName || layers.find((l) => l.id === visibleId)?.cameraName
  const displayLocation = cameraLocation || layers.find((l) => l.id === visibleId)?.cameraLocation

  if (!playback && layers.length === 0) {
    return (
      <div className={`live-player live-player--empty ${className}`}>
        <p className="text-sm text-slate-500">Waiting for live feed…</p>
      </div>
    )
  }

  const isPaused = status === 'paused'

  return (
    <div
      ref={containerRef}
      className={`live-player live-player--with-badge live-player-stack ${immersive ? 'live-player--immersive' : ''} ${isPaused ? 'is-paused' : ''} ${fadeActive ? 'is-fading' : ''} ${className}`}
      onDoubleClick={toggleFullscreen}
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
      )}

      {layers.map((layer) => {
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
      })}

      {isPaused && (
        <div className="live-player-pause-overlay" aria-live="polite">
          <span className="live-player-badge live-player-badge--paused">Paused</span>
          {title && <p className="font-display font-bold text-white text-lg mt-3">{title}</p>}
          <p className="text-white/85 text-sm mt-1">The broadcast is paused. Please wait…</p>
        </div>
      )}

      {!isPaused && (displayName || displayLocation) && (
        <div className="live-player-caption live-player-caption--fade">
          {displayName && <span className="font-semibold">{displayName}</span>}
          {displayLocation && <span className="text-slate-400"> · {displayLocation}</span>}
        </div>
      )}
    </div>
  )
}
