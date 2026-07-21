import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react'
import { Maximize2, Minimize2, Radio, RotateCw } from 'lucide-react'
import type { WebrtcAuthMode } from '@/components/live/LiveKitViewer'
import type { LivePlayback } from '@/types/liveStream'
import { isPipLayout, layoutPaneCount } from '@/types/liveStream'
import { readLivePlaybackUnlocked, readLiveSoundUnlocked, unlockLivePlayback, unlockLiveSound } from '@/utils/liveSoundUnlock'

const LiveKitViewer = lazy(() =>
  import('@/components/live/LiveKitViewer').then((m) => ({ default: m.LiveKitViewer })),
)

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
  playback: LivePlayback | null
  cameraName?: string
  cameraLocation?: string
  empty?: boolean
}

function layerId(cameraId: number | null | undefined, playback: LivePlayback): string {
  const cam = playback.camera_id ?? cameraId ?? 0
  if (playback.mode === 'builtin_camera') {
    return `${cam}-builtin-${playback.participant_identity ?? playback.camera_id ?? 'stream'}`
  }
  // Never include signed URL query strings — they rotate every poll and remount the feed.
  const stable = playback.video_id
    ?? playback.participant_identity
    ?? (playback.src ? playback.src.split('?')[0] : 'feed')
  return `${cam}-${playback.mode}-${stable}`
}

function readyDelay(mode: LivePlayback['mode']): number {
  if (mode === 'youtube') return 400
  if (mode === 'vimeo') return 300
  if (mode === 'builtin_camera') return 200
  return 150
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
  func: string,
  args: unknown[] = [],
  widgetId?: number,
) {
  try {
    iframe?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args, id: widgetId ?? 1 }),
      '*',
    )
  } catch {
    // YouTube may throw during teardown / before widget API is ready.
  }
}

/** Tell the embed we listen for API events — required before reliable commands. */
function postYoutubeListening(iframe: HTMLIFrameElement | null, widgetId: number) {
  try {
    iframe?.contentWindow?.postMessage(
      JSON.stringify({ event: 'listening', id: widgetId, channel: 'widget' }),
      '*',
    )
  } catch {
    /* ignore */
  }
}

/** Stable numeric id for YouTube postMessage routing (must differ per pane). */
function youtubeWidgetId(layerKey: string): number {
  let hash = 0
  for (let i = 0; i < layerKey.length; i += 1) {
    hash = ((hash << 5) - hash) + layerKey.charCodeAt(i)
    hash |= 0
  }
  return (Math.abs(hash) % 900000) + 1000
}

/** True if message came from this iframe or a nested frame inside it. */
function isMessageFromIframe(event: MessageEvent, iframe: HTMLIFrameElement | null): boolean {
  if (!iframe?.contentWindow || !event.source) return false
  if (event.source === iframe.contentWindow) return true
  try {
    let win: Window | null = event.source as Window
    for (let i = 0; i < 6 && win; i += 1) {
      if (win === iframe.contentWindow) return true
      if (win === win.parent) break
      win = win.parent
    }
  } catch {
    /* cross-origin parent walk can throw — fall through */
  }
  return false
}

function postVimeoCommand(iframe: HTMLIFrameElement | null, method: string, value?: number | string) {
  const payload: { method: string; value?: number | string } = { method }
  if (value !== undefined) payload.value = value
  try {
    iframe?.contentWindow?.postMessage(JSON.stringify(payload), '*')
  } catch {
    /* ignore */
  }
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

  const cap = layoutPaneCount(layoutMode ?? list.length ?? 1)
  const filled: FeedLayer[] = list.slice(0, cap).map((pb, index) => ({
    id: layerId(pb.camera_id ?? cameraId, pb),
    playback: pb,
    cameraName: pb.camera_name ?? (index === 0 ? cameraName : undefined),
    cameraLocation: pb.camera_location ?? (index === 0 ? cameraLocation : undefined) ?? undefined,
  }))

  // Pad to full layout so public grid matches admin selection (empty slots if fewer cameras).
  while (filled.length < cap) {
    const slot = filled.length
    filled.push({
      id: `empty-slot-${slot}`,
      playback: null,
      empty: true,
    })
  }
  return filled
}


function FeedEmbed({
  layer,
  onReady,
  muted,
  volume = 100,
  paused = false,
  webrtcAuth,
  lockPlayback,
  paneIndex = 0,
}: {
  layer: FeedLayer & { playback: LivePlayback }
  onReady?: () => void
  muted: boolean
  /** 0–100 parent volume for this camera feed. */
  volume?: number
  paused?: boolean
  webrtcAuth: WebrtcAuthMode
  lockPlayback: boolean
  /** Grid slot index — secondary panes load slightly later to avoid side-spinner races. */
  paneIndex?: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const readyRef = useRef(false)
  const ytApiReadyRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const recoverTimerRef = useRef<number | null>(null)
  const playingRef = useRef(false)
  /** True after YouTube/Vimeo reported playing at least once — avoids load-time kick loops. */
  const everPlayedRef = useRef(false)
  const autoKickCountRef = useRef(0)
  const ytWidgetIdRef = useRef(youtubeWidgetId(layer.id))
  // One viewer gesture unlocks sound + play for this tab — layout changes must not re-ask.
  const soundUnlockedRef = useRef(readLiveSoundUnlocked())
  const playUnlockedRef = useRef(readLivePlaybackUnlocked())
  const [embedSrc, setEmbedSrc] = useState<string | null>(() => {
    // Primary pane mounts immediately; side panes stagger so YouTube does not thrash.
    if (paneIndex > 0) return null
    if (layer.playback.mode === 'youtube' && layer.playback.video_id) {
      return youtubeEmbedSrc(layer.playback.video_id, true, lockPlayback)
    }
    if (layer.playback.mode === 'vimeo' && layer.playback.video_id) {
      return vimeoEmbedSrc(layer.playback.video_id, true, lockPlayback)
    }
    return null
  })
  const [gesturePrompt, setGesturePrompt] = useState<'play' | 'sound' | null>(null)

  useEffect(() => {
    ytWidgetIdRef.current = youtubeWidgetId(layer.id)
  }, [layer.id])

  // Stagger secondary/side camera iframes — prevents endless side-pane loading.
  useEffect(() => {
    if (layer.playback.mode !== 'youtube' && layer.playback.mode !== 'vimeo') return
    if (!layer.playback.video_id) return

    if (paneIndex <= 0) {
      if (layer.playback.mode === 'youtube') {
        setEmbedSrc(youtubeEmbedSrc(layer.playback.video_id, true, lockPlayback))
      } else {
        setEmbedSrc(vimeoEmbedSrc(layer.playback.video_id, true, lockPlayback))
      }
      return
    }

    setEmbedSrc(null)
    // Tiny stagger only — side cams must appear almost immediately.
    const delay = paneIndex * 80
    const timer = window.setTimeout(() => {
      if (layer.playback.mode === 'youtube') {
        setEmbedSrc(youtubeEmbedSrc(layer.playback.video_id!, true, lockPlayback))
      } else {
        setEmbedSrc(vimeoEmbedSrc(layer.playback.video_id!, true, lockPlayback))
      }
    }, delay)
    return () => window.clearTimeout(timer)
  }, [paneIndex, layer.id, layer.playback.mode, layer.playback.video_id, lockPlayback])

  const markSoundUnlocked = useCallback(() => {
    soundUnlockedRef.current = true
    playUnlockedRef.current = true
    unlockLiveSound()
  }, [])

  const markPlayUnlocked = useCallback(() => {
    playUnlockedRef.current = true
    unlockLivePlayback()
  }, [])

  const showPlayPrompt = useCallback(() => {
    if (playUnlockedRef.current || readLivePlaybackUnlocked()) {
      playUnlockedRef.current = true
      return
    }
    setGesturePrompt((p) => p ?? 'play')
  }, [])

  const applyMuteState = useCallback((
    iframe: HTMLIFrameElement | null,
    nextMuted: boolean,
    opts?: { play?: boolean },
  ) => {
    if (!iframe) return
    const wantPlay = opts?.play ?? true
    const level = Math.max(0, Math.min(100, volume))
    const silent = nextMuted || level === 0
    if (layer.playback.mode === 'youtube') {
      // Avoid YouTube widget crash (isExternalMethodAvailable) before API ready.
      if (!ytApiReadyRef.current) return
      const wid = ytWidgetIdRef.current
      if (silent) {
        postYoutubeCommand(iframe, 'mute', [], wid)
        postYoutubeCommand(iframe, 'setVolume', [0], wid)
      } else {
        postYoutubeCommand(iframe, 'unMute', [], wid)
        postYoutubeCommand(iframe, 'setVolume', [level], wid)
      }
      // Re-calling playVideo while already playing restarts the buffer spinner loop.
      if (wantPlay && !playingRef.current) postYoutubeCommand(iframe, 'playVideo', [], wid)
      return
    }
    if (layer.playback.mode === 'vimeo') {
      postVimeoCommand(iframe, 'setVolume', silent ? 0 : level / 100)
      postVimeoCommand(iframe, 'setMuted', silent ? 1 : 0)
      if (wantPlay && !playingRef.current) postVimeoCommand(iframe, 'play')
    }
  }, [layer.playback.mode, volume])

  const kickPlay = useCallback((iframe: HTMLIFrameElement | null, forceMute = false) => {
    if (!iframe) return
    const stayMuted = forceMute || muted || !soundUnlockedRef.current || volume === 0
    if (layer.playback.mode === 'youtube') {
      if (!ytApiReadyRef.current) {
        postYoutubeListening(iframe, ytWidgetIdRef.current)
        return
      }
      const wid = ytWidgetIdRef.current
      if (stayMuted) {
        postYoutubeCommand(iframe, 'mute', [], wid)
      } else {
        postYoutubeCommand(iframe, 'unMute', [], wid)
        postYoutubeCommand(iframe, 'setVolume', [Math.max(0, Math.min(100, volume))], wid)
      }
      postYoutubeCommand(iframe, 'playVideo', [], wid)
      return
    }
    if (layer.playback.mode === 'vimeo') {
      if (stayMuted) {
        postVimeoCommand(iframe, 'setVolume', 0)
        postVimeoCommand(iframe, 'setMuted', 1)
      } else {
        postVimeoCommand(iframe, 'setVolume', Math.max(0, Math.min(100, volume)) / 100)
      }
      postVimeoCommand(iframe, 'play')
    }
  }, [layer.playback.mode, muted, volume])

  /** Bounded autoplay kicks — unlimited playVideo is what causes hard-refresh spinner loops. */
  const autoKickPlay = useCallback((iframe: HTMLIFrameElement | null, forceMute = false) => {
    if (!iframe || paused) return
    if (playingRef.current) return
    if (autoKickCountRef.current >= 4) {
      showPlayPrompt()
      return
    }
    autoKickCountRef.current += 1
    kickPlay(iframe, forceMute)
  }, [kickPlay, paused, showPlayPrompt])

  const kickPlayRef = useRef(kickPlay)
  const autoKickPlayRef = useRef(autoKickPlay)
  const applyMuteStateRef = useRef(applyMuteState)
  kickPlayRef.current = kickPlay
  autoKickPlayRef.current = autoKickPlay
  applyMuteStateRef.current = applyMuteState

  const syncDesiredAudio = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe || paused) return
    // Only nudge play when not already playing — mute/volume alone must not restart video.
    const playIfNeeded = !playingRef.current
    if (!lockPlayback) {
      applyMuteState(iframe, muted, { play: playIfNeeded })
      if (!muted) soundUnlockedRef.current = true
      setGesturePrompt((p) => (p === 'sound' || p === 'play' ? null : p))
      return
    }
    if (muted) {
      applyMuteState(iframe, true, { play: playIfNeeded })
      setGesturePrompt((p) => (p === 'sound' ? null : p))
      return
    }
    if (!soundUnlockedRef.current && readLiveSoundUnlocked()) {
      soundUnlockedRef.current = true
    }
    if (soundUnlockedRef.current) {
      applyMuteState(iframe, false, { play: playIfNeeded })
      setGesturePrompt((p) => (p === 'sound' ? null : p))
      return
    }
    if (playingRef.current) {
      setGesturePrompt((p) => (p === 'play' ? p : 'sound'))
    }
  }, [muted, paused, lockPlayback, applyMuteState])

  // Ambient unlock: any tap/key on the page turns sound on (no button).
  useEffect(() => {
    if (!lockPlayback || muted || paused) return
    if (soundUnlockedRef.current || readLiveSoundUnlocked()) {
      soundUnlockedRef.current = true
      playUnlockedRef.current = true
      syncDesiredAudio()
      return
    }

    const onGesture = () => {
      markPlayUnlocked()
      markSoundUnlocked()
      syncDesiredAudio()
    }
    const onCustom = () => {
      soundUnlockedRef.current = true
      playUnlockedRef.current = true
      syncDesiredAudio()
    }

    window.addEventListener('pointerdown', onGesture, { capture: true })
    window.addEventListener('keydown', onGesture, { capture: true })
    window.addEventListener('touchstart', onGesture, { capture: true })
    window.addEventListener('kinder-live-sound-unlock', onCustom)
    window.addEventListener('kinder-live-play-unlock', onCustom)
    return () => {
      window.removeEventListener('pointerdown', onGesture, { capture: true })
      window.removeEventListener('keydown', onGesture, { capture: true })
      window.removeEventListener('touchstart', onGesture, { capture: true })
      window.removeEventListener('kinder-live-sound-unlock', onCustom)
      window.removeEventListener('kinder-live-play-unlock', onCustom)
    }
  }, [lockPlayback, muted, paused, markSoundUnlocked, markPlayUnlocked, syncDesiredAudio])

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
    playingRef.current = false
    everPlayedRef.current = false
    ytApiReadyRef.current = false
    autoKickCountRef.current = 0
    // Keep session unlock across remounts (layout change adds new panes).
    soundUnlockedRef.current = readLiveSoundUnlocked()
    playUnlockedRef.current = readLivePlaybackUnlocked()
    setGesturePrompt(null)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    if (recoverTimerRef.current) window.clearTimeout(recoverTimerRef.current)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      if (recoverTimerRef.current) window.clearTimeout(recoverTimerRef.current)
    }
  }, [layer.id])

  useEffect(() => {
    if (layer.playback.mode !== 'youtube' && layer.playback.mode !== 'vimeo') return

    const onMessage = (event: MessageEvent) => {
      const iframe = iframeRef.current
      if (!iframe) return

      if (typeof event.origin === 'string'
        && !event.origin.includes('youtube.com')
        && !event.origin.includes('youtube-nocookie.com')
        && !event.origin.includes('vimeo.com')) {
        return
      }
      let data: unknown = event.data
      if (typeof data === 'string') {
        try { data = JSON.parse(data) } catch { return }
      }
      if (!data || typeof data !== 'object') return
      const payload = data as { event?: string; id?: number | string; info?: number | { playerState?: number } }

      if (layer.playback.mode === 'youtube') {
        const wid = ytWidgetIdRef.current
        const msgId = payload.id !== undefined ? Number(payload.id) : NaN
        const idMatches = Number.isFinite(msgId) && msgId === wid
        const fromThisFrame = isMessageFromIframe(event, iframe)
        // Prefer widget id (unique per pane). Source check alone fails on nested YouTube frames
        // and caused side cameras to spin forever.
        if (!idMatches && !fromThisFrame) return
        if (Number.isFinite(msgId) && msgId !== wid) return

        const state = typeof payload.info === 'number'
          ? payload.info
          : payload.info && typeof payload.info === 'object'
            ? payload.info.playerState
            : undefined
        if (payload.event === 'onReady' || payload.event === 'initialDelivery') {
          ytApiReadyRef.current = true
          autoKickPlayRef.current(iframe, true)
        }
        if (state === 1) {
          ytApiReadyRef.current = true
          playingRef.current = true
          everPlayedRef.current = true
          autoKickCountRef.current = 0
          markPlayUnlocked()
          setGesturePrompt((p) => (p === 'play' ? null : p))
          syncDesiredAudio()
        } else if (state === 3) {
          if (everPlayedRef.current) playingRef.current = true
        } else if (state === 2 && !paused && everPlayedRef.current) {
          playingRef.current = false
          if (recoverTimerRef.current) window.clearTimeout(recoverTimerRef.current)
          recoverTimerRef.current = window.setTimeout(() => {
            autoKickPlayRef.current(iframeRef.current, true)
          }, 500)
        }
      }

      if (layer.playback.mode === 'vimeo') {
        if (!isMessageFromIframe(event, iframe)) return
        if (payload.event === 'play' || payload.event === 'playing') {
          playingRef.current = true
          everPlayedRef.current = true
          markPlayUnlocked()
          setGesturePrompt((p) => (p === 'play' ? null : p))
          syncDesiredAudio()
        }
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [layer.playback.mode, syncDesiredAudio, paused, markPlayUnlocked])

  // Autoload muted play — do NOT depend on `muted` / kickPlay identity (avoids restart loops).
  useEffect(() => {
    if (layer.playback.mode !== 'youtube' && layer.playback.mode !== 'vimeo') return
    if (!embedSrc) return
    if (paused) {
      const iframe = iframeRef.current
      if (layer.playback.mode === 'youtube') {
        if (ytApiReadyRef.current) {
          applyMuteStateRef.current(iframe, true, { play: false })
          postYoutubeCommand(iframe, 'pauseVideo', [], ytWidgetIdRef.current)
        }
      } else {
        applyMuteStateRef.current(iframe, true, { play: false })
        postVimeoCommand(iframe, 'pause')
      }
      return
    }

    if (readLivePlaybackUnlocked()) playUnlockedRef.current = true
    if (layer.playback.mode === 'youtube') {
      postYoutubeListening(iframeRef.current, ytWidgetIdRef.current)
    }
    autoKickPlayRef.current(iframeRef.current, true)

    const retries = [400, 1200, 2500].map((ms) =>
      window.setTimeout(() => {
        if (playingRef.current || paused || everPlayedRef.current) return
        if (layer.playback.mode === 'youtube') {
          postYoutubeListening(iframeRef.current, ytWidgetIdRef.current)
        }
        autoKickPlayRef.current(iframeRef.current, true)
        if (ms >= 1200) showPlayPrompt()
      }, ms),
    )

    return () => retries.forEach((id) => window.clearTimeout(id))
  }, [paused, layer.id, layer.playback.mode, showPlayPrompt, embedSrc])

  // Admin / route mute changes — apply immediately once sound is unlocked.
  useEffect(() => {
    if (layer.playback.mode !== 'youtube' && layer.playback.mode !== 'vimeo') return
    if (!playingRef.current && !paused) return
    syncDesiredAudio()
  }, [muted, paused, layer.playback.mode, syncDesiredAudio])

  const onGestureTap = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    markPlayUnlocked()
    markSoundUnlocked()
    autoKickCountRef.current = 0
    kickPlay(iframe, true)
    window.setTimeout(() => {
      playingRef.current = true
      everPlayedRef.current = true
      if (!muted) {
        applyMuteState(iframe, false, { play: true })
      }
      setGesturePrompt(null)
    }, 250)
  }, [kickPlay, applyMuteState, muted, markSoundUnlocked, markPlayUnlocked])

  // If another pane / Live CTA unlocked play, clear Tap to play and kick this feed.
  useEffect(() => {
    if (!lockPlayback) return
    const onUnlock = () => {
      playUnlockedRef.current = true
      soundUnlockedRef.current = readLiveSoundUnlocked()
      setGesturePrompt((p) => (p === 'play' ? null : p))
      if (!paused && !playingRef.current) {
        autoKickCountRef.current = 0
        autoKickPlayRef.current(iframeRef.current, true)
      }
    }
    window.addEventListener('kinder-live-play-unlock', onUnlock)
    window.addEventListener('kinder-live-sound-unlock', onUnlock)
    return () => {
      window.removeEventListener('kinder-live-play-unlock', onUnlock)
      window.removeEventListener('kinder-live-sound-unlock', onUnlock)
    }
  }, [lockPlayback, paused])

  useEffect(() => {
    if (layer.playback.mode !== 'signed_redirect' || !layer.playback.src) return
    const video = videoRef.current
    if (!video) return

    const nextSrc = layer.playback.src
    const base = nextSrc.split('?')[0]
    if (video.dataset.baseSrc !== base) {
      video.dataset.baseSrc = base
      video.dataset.src = nextSrc
      video.src = nextSrc
      video.muted = true
      video.load()
    }

    if (paused) {
      video.muted = true
      video.pause()
      return
    }

    if (muted) {
      video.muted = true
      video.volume = 0
      void video.play().catch(() => {})
      setGesturePrompt((p) => (p === 'sound' ? null : p))
      return
    }

    const level = Math.max(0, Math.min(100, volume)) / 100
    video.volume = level

    if (soundUnlockedRef.current) {
      video.muted = level === 0
      void video.play().then(() => {
        playingRef.current = true
        setGesturePrompt(null)
      }).catch(() => {
        video.muted = true
        if (!lockPlayback) setGesturePrompt('sound')
      })
      return
    }

    video.muted = true
    void video.play()
      .then(() => {
        playingRef.current = true
        if (!lockPlayback) {
          video.muted = level === 0
          video.volume = level
          void video.play().catch(() => {
            video.muted = true
            setGesturePrompt('sound')
          })
        }
      })
      .catch(() => {
        showPlayPrompt()
      })
  }, [layer.id, layer.playback.mode, layer.playback.src, muted, paused, lockPlayback, showPlayPrompt, volume])

  const unlockOverlay = useCallback(() => {
    if (muted || paused) return
    markPlayUnlocked()
    markSoundUnlocked()
    syncDesiredAudio()
  }, [muted, paused, markSoundUnlocked, markPlayUnlocked, syncDesiredAudio])

  if (
    (layer.playback.mode === 'youtube' || layer.playback.mode === 'vimeo')
    && layer.playback.video_id
    && !embedSrc
  ) {
    return (
      <div className="live-player-pane-loading" aria-busy="true">
        <span className="live-player-pane-loading__dot" />
      </div>
    )
  }

  if (layer.playback.mode === 'youtube' && layer.playback.video_id && embedSrc) {
    return (
      <>
        <iframe
          ref={iframeRef}
          title={layer.cameraName || 'Live stream'}
          src={embedSrc}
          className={`live-player-iframe ${lockPlayback ? 'live-player-iframe--locked' : ''} ${paused ? 'live-player-iframe--paused' : ''}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen={!lockPlayback}
          tabIndex={lockPlayback ? -1 : undefined}
          onLoad={() => {
            markReady()
            postYoutubeListening(iframeRef.current, ytWidgetIdRef.current)
            // Prefer embed autoplay; only nudge once via bounded kick (not unlimited playVideo).
            autoKickPlayRef.current(iframeRef.current, true)
            if (readLiveSoundUnlocked() && !muted) {
              soundUnlockedRef.current = true
              window.setTimeout(() => syncDesiredAudio(), 500)
            }
          }}
        />
        {lockPlayback && gesturePrompt !== 'play' && (
          <div
            className="live-player-lock-overlay"
            aria-hidden
            onPointerDown={unlockOverlay}
          />
        )}
        {gesturePrompt === 'play' && !paused && (
          <button type="button" className="live-player-gesture-btn" onClick={onGestureTap}>
            Tap to play
          </button>
        )}
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
        <Suspense fallback={<div className="live-player-pane-loading" aria-busy="true"><span className="live-player-pane-loading__dot" /></div>}>
          <LiveKitViewer
            streamId={layer.playback.stream_id}
            participantIdentity={layer.playback.participant_identity}
            muted={muted || paused || volume === 0}
            volume={volume}
            paused={paused}
            showUnmutePrompt={!lockPlayback}
            webrtcAuth={webrtcAuth}
            onReady={markReady}
            className={`live-player-video ${lockPlayback ? 'live-player-video--locked' : ''}`}
          />
        </Suspense>
        {lockPlayback && (
          <div className="live-player-lock-overlay" aria-hidden onPointerDown={unlockOverlay} />
        )}
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
          className={`live-player-iframe ${lockPlayback ? 'live-player-iframe--locked' : ''} ${paused ? 'live-player-iframe--paused' : ''}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen={!lockPlayback}
          tabIndex={lockPlayback ? -1 : undefined}
          onLoad={() => {
            markReady()
            // Register Vimeo play events so everPlayed / Tap-to-play state stays correct.
            postVimeoCommand(iframeRef.current, 'addEventListener', 'play')
            postVimeoCommand(iframeRef.current, 'addEventListener', 'playing')
            autoKickPlayRef.current(iframeRef.current, true)
            if (readLiveSoundUnlocked() && !muted) {
              soundUnlockedRef.current = true
              window.setTimeout(() => syncDesiredAudio(), 500)
            }
          }}
        />
        {lockPlayback && gesturePrompt !== 'play' && (
          <div className="live-player-lock-overlay" aria-hidden onPointerDown={unlockOverlay} />
        )}
        {gesturePrompt === 'play' && !paused && (
          <button type="button" className="live-player-gesture-btn" onClick={onGestureTap}>
            Tap to play
          </button>
        )}
      </>
    )
  }

  return (
    <>
      <video
        ref={videoRef}
        className={`live-player-video ${lockPlayback ? 'live-player-video--locked' : ''} ${paused ? 'live-player-video--paused' : ''}`}
        controls={!lockPlayback}
        playsInline
        autoPlay={!paused}
        muted
        onLoadedData={markReady}
        onCanPlay={markReady}
      />
      {lockPlayback && gesturePrompt !== 'play' && (
        <div className="live-player-lock-overlay" aria-hidden onPointerDown={unlockOverlay} />
      )}
        {gesturePrompt === 'play' && !paused && (
          <button
            type="button"
            className="live-player-gesture-btn"
            onClick={() => {
              const video = videoRef.current
              if (!video) return
              markPlayUnlocked()
              markSoundUnlocked()
              video.muted = true
              void video.play().then(() => {
                playingRef.current = true
                if (!muted) video.muted = false
                setGesturePrompt(null)
              }).catch(() => {})
            }}
          >
            Tap to play
          </button>
        )}
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
  // Grid follows admin layout_mode (1–4 / PiP), not just how many feeds are currently live.
  const pip = isPipLayout(layoutMode)
  const slotCount = layoutPaneCount(layoutMode ?? Math.max(1, panes.filter((p) => p.playback).length || 1))
  const gridMode = pip ? 'pip' : (Math.min(4, Math.max(1, slotCount)) as 1 | 2 | 3 | 4)
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

  if (!panes.some((p) => p.playback)) {
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

      {/* Keep embeds mounted while paused so resume does not restart YouTube. */}
      <div className={`live-player-stage ${isPaused ? 'live-player-stage--paused' : ''}`}>
        <div className={`live-player-grid live-player-grid--${gridMode}`}>
          {panes.map((pane, paneIndex) => {
            if (!pane.playback || pane.empty) {
              return (
                <div key={pane.id} className="live-player-pane live-player-pane--empty">
                  <p>Waiting for camera…</p>
                </div>
              )
            }
            const paneVolume = Math.max(0, Math.min(100, Number(pane.playback.audio_volume ?? 100)))
            const paneMuted = muted || Boolean(pane.playback.audio_muted) || paneVolume === 0
            return (
              <div key={pane.id} className="live-player-pane">
                <FeedEmbed
                  layer={pane as FeedLayer & { playback: LivePlayback }}
                  muted={paneMuted}
                  volume={paneVolume}
                  paused={isPaused}
                  webrtcAuth={webrtcAuth}
                  lockPlayback={playbackLocked}
                  paneIndex={paneIndex}
                />
                {(pane.cameraName || pane.cameraLocation) && (
                  <div className="live-player-pane-caption">
                    {pane.cameraName && <span className="font-semibold">{pane.cameraName}</span>}
                    {pane.cameraLocation && <span> · {pane.cameraLocation}</span>}
                    {paneMuted && !playbackLocked && <span className="opacity-80"> · muted</span>}
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
