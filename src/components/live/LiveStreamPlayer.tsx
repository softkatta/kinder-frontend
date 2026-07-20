import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, Radio, RotateCw } from 'lucide-react'
import { LiveKitViewer, type WebrtcAuthMode } from '@/components/live/LiveKitViewer'
import type { LivePlayback } from '@/types/liveStream'

type PlayerOrientation = 'landscape' | 'portrait'

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
  /** Block pause/seek/YouTube UI for public viewers. Default true when immersive. */
  lockPlayback?: boolean
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

function youtubeEmbedSrc(videoId: string, startMuted: boolean, lockPlayback: boolean): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: startMuted ? '1' : '0',
    enablejsapi: '1',
    rel: '0',
    playsinline: '1',
    modestbranding: '1',
    fs: lockPlayback ? '0' : '1',
    controls: lockPlayback ? '0' : '1',
    disablekb: lockPlayback ? '1' : '0',
    iv_load_policy: '3',
  })
  if (typeof window !== 'undefined') {
    params.set('origin', window.location.origin)
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

function vimeoEmbedSrc(videoId: string, startMuted: boolean, lockPlayback: boolean): string {
  const params = new URLSearchParams({
    autoplay: '1',
    muted: startMuted ? '1' : '0',
    playsinline: '1',
    api: '1',
  })
  if (lockPlayback) {
    params.set('controls', '0')
    params.set('background', '1')
    params.set('title', '0')
    params.set('byline', '0')
    params.set('portrait', '0')
  }
  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`
}

function postYoutubeCommand(
  iframe: HTMLIFrameElement | null,
  func: 'mute' | 'unMute' | 'playVideo' | 'pauseVideo',
) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func, args: [] }),
    '*',
  )
}

function postVimeoCommand(iframe: HTMLIFrameElement | null, method: string, value?: number) {
  const payload: { method: string; value?: number } = { method }
  if (value !== undefined) payload.value = value
  iframe?.contentWindow?.postMessage(JSON.stringify(payload), '*')
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
  paused = false,
  webrtcAuth,
  lockPlayback,
}: {
  layer: FeedLayer
  onReady?: () => void
  muted: boolean
  paused?: boolean
  webrtcAuth: WebrtcAuthMode
  lockPlayback: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const readyRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  // Keep initial mute in embed URL only — later toggles use player API (no restart).
  const startMutedRef = useRef(muted)
  const [embedSrc] = useState(() => {
    if (layer.playback.mode === 'youtube' && layer.playback.video_id) {
      return youtubeEmbedSrc(layer.playback.video_id, startMutedRef.current, lockPlayback)
    }
    if (layer.playback.mode === 'vimeo' && layer.playback.video_id) {
      return vimeoEmbedSrc(layer.playback.video_id, startMutedRef.current, lockPlayback)
    }
    return null
  })

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

  // HTML5 / HLS: mute + pause without reloading the stream
  useEffect(() => {
    if (layer.playback.mode !== 'signed_redirect' || !layer.playback.src) return
    const video = videoRef.current
    if (!video) return

    if (video.dataset.src !== layer.playback.src) {
      video.dataset.src = layer.playback.src
      video.src = layer.playback.src
      video.load()
      if (!paused) {
        video.play().catch(() => {
          video.muted = true
          video.play().catch(() => {})
        })
      }
    }

    video.muted = muted || paused
    if (paused) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }
  }, [layer.id, layer.playback.mode, layer.playback.src, muted, paused])

  // YouTube / Vimeo: mute + pause via postMessage — do not remount iframe
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    if (layer.playback.mode === 'youtube') {
      if (paused) {
        postYoutubeCommand(iframe, 'mute')
        postYoutubeCommand(iframe, 'pauseVideo')
        return
      }
      if (muted) {
        postYoutubeCommand(iframe, 'mute')
      } else {
        postYoutubeCommand(iframe, 'unMute')
      }
      postYoutubeCommand(iframe, 'playVideo')
      return
    }

    if (layer.playback.mode === 'vimeo') {
      if (paused) {
        postVimeoCommand(iframe, 'setVolume', 0)
        postVimeoCommand(iframe, 'setMuted', 1)
        postVimeoCommand(iframe, 'pause')
        return
      }
      postVimeoCommand(iframe, 'setVolume', muted ? 0 : 1)
      postVimeoCommand(iframe, 'setMuted', muted ? 1 : 0)
      postVimeoCommand(iframe, 'play')
    }
  }, [muted, paused, layer.playback.mode, layer.id])

  if (layer.playback.mode === 'youtube' && layer.playback.video_id && embedSrc) {
    return (
      <>
        <iframe
          ref={iframeRef}
          title={layer.cameraName || 'Live stream'}
          src={embedSrc}
          className={`live-player-iframe ${lockPlayback ? 'live-player-iframe--locked' : ''}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen={!lockPlayback}
          tabIndex={lockPlayback ? -1 : undefined}
          onLoad={() => {
            markReady()
            if (paused) {
              postYoutubeCommand(iframeRef.current, 'mute')
              postYoutubeCommand(iframeRef.current, 'pauseVideo')
            } else {
              postYoutubeCommand(iframeRef.current, muted ? 'mute' : 'unMute')
            }
          }}
        />
        {lockPlayback && <div className="live-player-lock-overlay" aria-hidden />}
      </>
    )
  }

  if (
    layer.playback.mode === 'builtin_camera'
    && layer.playback.stream_id
    && layer.playback.participant_identity
  ) {
    return (
      <>
        <LiveKitViewer
          streamId={layer.playback.stream_id}
          participantIdentity={layer.playback.participant_identity}
          muted={muted || paused}
          paused={paused}
          webrtcAuth={webrtcAuth}
          onReady={markReady}
          className={`live-player-video ${lockPlayback ? 'live-player-video--locked' : ''}`}
        />
        {lockPlayback && <div className="live-player-lock-overlay" aria-hidden />}
      </>
    )
  }

  if (layer.playback.mode === 'vimeo' && layer.playback.video_id && embedSrc) {
    return (
      <>
        <iframe
          ref={iframeRef}
          title={layer.cameraName || 'Live stream'}
          src={embedSrc}
          className={`live-player-iframe ${lockPlayback ? 'live-player-iframe--locked' : ''}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen={!lockPlayback}
          tabIndex={lockPlayback ? -1 : undefined}
          onLoad={() => {
            markReady()
            if (paused) {
              postVimeoCommand(iframeRef.current, 'setVolume', 0)
              postVimeoCommand(iframeRef.current, 'pause')
            } else {
              postVimeoCommand(iframeRef.current, 'setVolume', muted ? 0 : 1)
            }
          }}
        />
        {lockPlayback && <div className="live-player-lock-overlay" aria-hidden />}
      </>
    )
  }

  return (
    <>
      <video
        ref={videoRef}
        className={`live-player-video ${lockPlayback ? 'live-player-video--locked' : ''}`}
        controls={!lockPlayback}
        playsInline
        autoPlay={!paused}
        muted={muted || paused}
        onLoadedData={markReady}
        onCanPlay={markReady}
      />
      {lockPlayback && <div className="live-player-lock-overlay" aria-hidden />}
    </>
  )
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
  lockPlayback,
}: LiveStreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [orientation, setOrientation] = useState<PlayerOrientation>('landscape')

  const panes = resolvePanes(playback, playbacks, layoutMode, cameraId, cameraName, cameraLocation)
  // Always use grid path (even for 1 pane) so activate/deactivate does not remount existing feeds.
  const gridMode = Math.min(4, Math.max(1, panes.length || 1)) as 1 | 2 | 3 | 4
  const rotateEnabled = showRotate ?? immersive
  const playbackLocked = lockPlayback ?? immersive
  const isPortrait = orientation === 'portrait'

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

  if (panes.length === 0) {
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
      className={[
        'live-player live-player--with-badge live-player--grid-shell',
        immersive ? 'live-player--immersive' : '',
        isPaused ? 'is-paused' : '',
        isPortrait ? 'live-player--portrait' : 'live-player--landscape',
        className,
      ].filter(Boolean).join(' ')}
      data-orientation={orientation}
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
        <div className="live-player-toolbar">
          {rotateEnabled && (
            <button
              type="button"
              className="live-player-fs-btn live-player-rotate-btn"
              onClick={(e) => {
                e.stopPropagation()
                setOrientation((o) => (o === 'landscape' ? 'portrait' : 'landscape'))
              }}
              aria-label={isPortrait ? 'Switch to landscape' : 'Switch to portrait'}
            >
              <RotateCw className="h-4 w-4" />
              <span className="live-player-fs-label">{isPortrait ? 'Landscape' : 'Portrait'}</span>
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

      <div className="live-player-stage">
        <div className={`live-player-grid live-player-grid--${gridMode}`}>
          {panes.map((pane) => {
            const paneMuted = muted || Boolean(pane.playback.audio_muted)
            return (
              <div key={pane.id} className="live-player-pane">
                <FeedEmbed
                  layer={pane}
                  muted={paneMuted}
                  paused={isPaused}
                  webrtcAuth={webrtcAuth}
                  lockPlayback={playbackLocked}
                />
                {(pane.cameraName || pane.cameraLocation) && (
                  <div className="live-player-pane-caption">
                    {pane.cameraName && <span className="font-semibold">{pane.cameraName}</span>}
                    {pane.cameraLocation && <span> · {pane.cameraLocation}</span>}
                    {paneMuted && <span className="opacity-80"> · muted</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isPaused && (
        <div className="live-player-pause-overlay" aria-live="polite">
          <span className="live-player-badge live-player-badge--paused">Paused</span>
          {title && <p className="font-display font-bold text-white text-lg mt-3">{title}</p>}
          <p className="text-white/85 text-sm mt-1">The broadcast is paused. Please wait…</p>
        </div>
      )}
    </div>
  )
}
