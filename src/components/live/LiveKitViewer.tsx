import { useCallback, useEffect, useRef, useState } from 'react'
import { ConnectionQuality, Room, RoomEvent, Track } from 'livekit-client'
import { Volume2 } from 'lucide-react'
import { liveStreamApi, publicApi } from '@/api/services'

export type WebrtcAuthMode = 'authenticated' | 'public'

interface LiveKitViewerProps {
  streamId: number
  participantIdentity: string
  muted?: boolean
  className?: string
  onReady?: () => void
  webrtcAuth?: WebrtcAuthMode
}

async function fetchViewerToken(streamId: number, auth: WebrtcAuthMode) {
  const res =
    auth === 'public'
      ? await publicApi.liveWebrtcToken(streamId)
      : await liveStreamApi.webrtcToken(streamId, { role: 'viewer' })
  return res.data.data as {
    token: string
    url: string
    participant_identity: string | null
  }
}

export function LiveKitViewer({
  streamId,
  participantIdentity,
  muted = false,
  className = '',
  onReady,
  webrtcAuth = 'authenticated',
}: LiveKitViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const roomRef = useRef<Room | null>(null)
  const readyRef = useRef(false)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  const [status, setStatus] = useState<'connecting' | 'connected' | 'waiting' | 'error'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [audioBlocked, setAudioBlocked] = useState(false)

  const playRemoteAudio = useCallback(async (audioEl: HTMLAudioElement) => {
    audioEl.muted = muted
    try {
      await audioEl.play()
      setAudioBlocked(false)
    } catch {
      if (!muted) setAudioBlocked(true)
    }
  }, [muted])

  const attachRemoteAudio = useCallback(
    (track: Track) => {
      if (track.kind !== Track.Kind.Audio) return
      if (audioRef.current) {
        track.detach(audioRef.current)
        audioRef.current.remove()
        audioRef.current = null
      }
      const audioEl = track.attach() as HTMLAudioElement
      audioEl.autoplay = true
      audioEl.setAttribute('playsinline', 'true')
      audioRef.current = audioEl
      document.body.appendChild(audioEl)
      audioEl.style.display = 'none'
      void playRemoteAudio(audioEl)
    },
    [playRemoteAudio],
  )

  const markReady = useCallback(() => {
    if (readyRef.current) return
    readyRef.current = true
    onReadyRef.current?.()
  }, [])

  const detachAll = useCallback(() => {
    const container = containerRef.current
    if (container) {
      container.querySelectorAll('video').forEach((el) => el.remove())
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null
      audioRef.current.remove()
      audioRef.current = null
    }
  }, [])

  const attachParticipant = useCallback(
    (room: Room, identity: string) => {
      const container = containerRef.current
      if (!container) return false

      detachAll()

      const participant = room.remoteParticipants.get(identity)
      if (!participant) return false

      const videoPub = participant.getTrackPublication(Track.Source.Camera)
      if (videoPub?.track) {
        const el = videoPub.track.attach()
        el.className = 'live-player-video'
        container.appendChild(el)
        markReady()
        setStatus('connected')
      } else {
        setStatus('waiting')
      }

      const audioPub = participant.getTrackPublication(Track.Source.Microphone)
      if (audioPub?.track) {
        attachRemoteAudio(audioPub.track)
      }

      return Boolean(videoPub?.track)
    },
    [detachAll, markReady, attachRemoteAudio],
  )

  useEffect(() => {
    let cancelled = false
    let room: Room | null = null
    readyRef.current = false
    setStatus('connecting')
    setError(null)

    const connect = async () => {
      try {
        const { token, url } = await fetchViewerToken(streamId, webrtcAuth)
        if (cancelled) return

        room = new Room({ adaptiveStream: true, dynacast: true })
        roomRef.current = room

        const tryAttach = () => {
          if (!room || cancelled) return
          attachParticipant(room, participantIdentity)
        }

        room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
          if (participant.identity !== participantIdentity) return
          if (track.kind === Track.Kind.Audio) {
            attachRemoteAudio(track)
          } else {
            tryAttach()
          }
        })
        room.on(RoomEvent.ParticipantConnected, tryAttach)

        await room.connect(url, token)
        if (cancelled) return

        if (!attachParticipant(room, participantIdentity)) {
          setStatus('waiting')
        }
      } catch (err: unknown) {
        if (cancelled) return
        const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
        const bag = data?.errors
        const message =
          data?.message
          || bag?.livekit?.[0]
          || (err instanceof Error ? err.message : 'Failed to connect to live feed')
        setError(message)
        setStatus('error')
      }
    }

    connect()

    return () => {
      cancelled = true
      detachAll()
      room?.disconnect()
      roomRef.current = null
    }
  }, [streamId, participantIdentity, webrtcAuth, attachParticipant, attachRemoteAudio, detachAll])

  useEffect(() => {
    const room = roomRef.current
    if (!room) return
    readyRef.current = false
    if (!attachParticipant(room, participantIdentity)) {
      setStatus('waiting')
    }
  }, [participantIdentity, attachParticipant])

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return
    audioEl.muted = muted
    if (!muted) void playRemoteAudio(audioEl)
    else setAudioBlocked(false)
  }, [muted, playRemoteAudio])

  const unmutePlayback = useCallback(() => {
    const audioEl = audioRef.current
    if (!audioEl) return
    audioEl.muted = false
    void playRemoteAudio(audioEl)
  }, [playRemoteAudio])

  if (status === 'error') {
    return (
      <div className={`live-player-video flex items-center justify-center bg-slate-900 text-white text-sm p-6 ${className}`}>
        <p>{error || 'Unable to play live feed'}</p>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {status === 'waiting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-white text-sm">
          Waiting for camera feed…
        </div>
      )}
      {status === 'connecting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-white text-sm">
          Connecting…
        </div>
      )}
      {audioBlocked && !muted && status === 'connected' && (
        <button
          type="button"
          className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink shadow-lg"
          onClick={unmutePlayback}
        >
          <Volume2 className="h-4 w-4" />
          Tap to hear audio
        </button>
      )}
    </div>
  )
}

export function connectionQualityLabel(quality: ConnectionQuality): string {
  switch (quality) {
    case ConnectionQuality.Excellent:
      return 'Excellent'
    case ConnectionQuality.Good:
      return 'Good'
    case ConnectionQuality.Poor:
      return 'Poor'
    default:
      return 'Unknown'
  }
}
