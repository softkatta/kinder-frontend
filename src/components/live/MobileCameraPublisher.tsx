import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ConnectionQuality,
  ConnectionState,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client'
import {
  Camera, CameraOff, Mic, MicOff, Wifi, AlertCircle, Loader2, Radio, Smartphone,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { liveStreamApi } from '@/api/services'
import { ensureEcho, getEcho } from '@/realtime/echo'
import { connectionQualityLabel } from '@/components/live/LiveKitViewer'
import type { LiveStreamRealtimePayload, PublisherCamera } from '@/types/liveStream'

function livekitConnectionHint(url?: string | null): string {
  const host = url || 'ws://localhost:7880'
  return `Cannot reach LiveKit at ${host}. Run: npm run dev:livekit`
}

function isLivekitConnectionError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return /connection refused|couldn't connect|failed to fetch|websocket|network/i.test(message)
}

function isNegotiationError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return /negotiation|NegotiationError|PeerConnection/i.test(message)
}

async function tearDownLiveKitRoom(room: Room | null) {
  if (!room) return
  room.removeAllListeners()
  try {
    await room.disconnect(true)
  } catch {
    // ignore cleanup errors
  }
}

type FacingMode = 'user' | 'environment'

const BACK_CAMERA_LABEL = /back|rear|environment|पिछ|trás|arrière/i
const FRONT_CAMERA_LABEL = /front|user|face|selfie|facetime|समो/i

async function resolveVideoCaptureOptions(mode: FacingMode): Promise<{ deviceId?: string; facingMode?: FacingMode }> {
  const cameras = (await navigator.mediaDevices.enumerateDevices())
    .filter((d) => d.kind === 'videoinput')

  const labelMatch = cameras.find((d) => {
    const label = d.label.toLowerCase()
    return mode === 'environment'
      ? BACK_CAMERA_LABEL.test(label)
      : FRONT_CAMERA_LABEL.test(label)
  })
  if (labelMatch?.deviceId) {
    return { deviceId: labelMatch.deviceId }
  }

  if (cameras.length >= 2) {
    const pick = mode === 'user' ? cameras[0] : cameras[1]
    if (pick?.deviceId) return { deviceId: pick.deviceId }
  }

  return { facingMode: mode }
}

async function attachLocalPreview(room: Room, videoEl: HTMLVideoElement | null) {
  if (!videoEl) return
  const pub = room.localParticipant.getTrackPublication(Track.Source.Camera)
  const track = pub?.videoTrack
  if (!track) return
  track.detach(videoEl)
  track.attach(videoEl)
  await videoEl.play().catch(() => {})
}

interface MobileCameraPublisherProps {
  streamId: number
  eventTitle: string
  canJoin: boolean
}

type Phase = 'idle' | 'preview' | 'connected'

export function MobileCameraPublisher({ streamId, eventTitle, canJoin }: MobileCameraPublisherProps) {
  const previewRef = useRef<HTMLVideoElement>(null)
  const roomRef = useRef<Room | null>(null)
  const previewStreamRef = useRef<MediaStream | null>(null)
  const cameraIdRef = useRef<number | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [phase, setPhase] = useState<Phase>('idle')
  const [camera, setCamera] = useState<PublisherCamera | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>('environment')
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('offline')
  const [quality, setQuality] = useState<ConnectionQuality>(ConnectionQuality.Unknown)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [switchingCamera, setSwitchingCamera] = useState(false)

  const stopPreviewStream = useCallback(() => {
    previewStreamRef.current?.getTracks().forEach((t) => t.stop())
    previewStreamRef.current = null
    if (previewRef.current) previewRef.current.srcObject = null
  }, [])

  const readBattery = useCallback(async (): Promise<number | null> => {
    try {
      const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number }> }
      if (!nav.getBattery) return null
      const battery = await nav.getBattery()
      return Math.round(battery.level * 100)
    } catch {
      return null
    }
  }, [])

  const signalFromQuality = useCallback((q: ConnectionQuality): number => {
    switch (q) {
      case ConnectionQuality.Excellent: return 100
      case ConnectionQuality.Good: return 75
      case ConnectionQuality.Poor: return 40
      case ConnectionQuality.Lost: return 10
      default: return 50
    }
  }, [])

  const sendSessionUpdate = useCallback(async (status: string, extra?: Record<string, unknown>) => {
    const cameraId = cameraIdRef.current
    if (!cameraId) return
    const battery = await readBattery()
    if (battery !== null) setBatteryLevel(battery)
    try {
      const res = await liveStreamApi.updateCameraSession(streamId, cameraId, {
        connection_status: status,
        device_name: navigator.userAgent.slice(0, 120),
        battery_level: battery,
        signal_strength: signalFromQuality(quality),
        ...extra,
      })
      const data = res.data.data as { camera: PublisherCamera }
      setCamera(data.camera)
      setConnectionStatus(data.camera.connection_status)
    } catch {
      // heartbeat failures are non-fatal; admin dashboard polls too
    }
  }, [streamId, readBattery, signalFromQuality, quality])

  const openPreview = useCallback(async () => {
    if (!canJoin) {
      toast.error('This event is not open for camera connections yet.')
      return
    }
    setPermissionError(null)
    setConnecting(true)
    try {
      const videoOpts = await resolveVideoCaptureOptions(facingMode)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoOpts.deviceId ? { deviceId: { exact: videoOpts.deviceId } } : { facingMode: { ideal: videoOpts.facingMode ?? facingMode } },
        audio: true,
      })
      stopPreviewStream()
      previewStreamRef.current = stream
      if (previewRef.current) {
        previewRef.current.srcObject = stream
        await previewRef.current.play().catch(() => {})
      }
      setPhase('preview')
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setPermissionError('Camera and microphone access was denied. Allow permissions and try again.')
      } else if (name === 'NotFoundError') {
        setPermissionError('No camera or microphone found on this device.')
      } else {
        setPermissionError('Could not access camera or microphone.')
      }
    } finally {
      setConnecting(false)
    }
  }, [canJoin, facingMode, stopPreviewStream])

  const disconnectRoom = useCallback(async () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
    const room = roomRef.current
    if (room) {
      await tearDownLiveKitRoom(room)
      roomRef.current = null
    }
    const cameraId = cameraIdRef.current
    if (cameraId) {
      try {
        await liveStreamApi.disconnectCamera(streamId, cameraId)
      } catch {
        // already disconnected server-side
      }
    }
    cameraIdRef.current = null
    setCamera(null)
    setConnectionStatus('disconnected')
    stopPreviewStream()
    setPhase('idle')
  }, [streamId, stopPreviewStream])

  const connectCamera = useCallback(async () => {
    setConnecting(true)
    setConnectionStatus('connecting')
    setPermissionError(null)
    let room: Room | null = null
    let setupActive = true
    try {
      const joinRes = await liveStreamApi.joinCamera(streamId, {
        device_name: navigator.userAgent.slice(0, 120),
      })
      const joinData = joinRes.data.data as { camera: PublisherCamera }
      const joinedCamera = joinData.camera
      cameraIdRef.current = joinedCamera.id
      setCamera(joinedCamera)
      setConnectionStatus('connecting')

      const res = await liveStreamApi.webrtcToken(streamId, {
        role: 'publisher',
        camera_id: joinedCamera.id,
      })
      const { token, url } = res.data.data as { token: string; url: string }

      stopPreviewStream()

      room = new Room({
        adaptiveStream: false,
        dynacast: false,
        publishDefaults: { simulcast: false, videoCodec: 'vp8' },
      })
      roomRef.current = room

      room.on(RoomEvent.ConnectionQualityChanged, (_quality, participant) => {
        if (participant.isLocal) setQuality(_quality)
      })
      room.on(RoomEvent.Connected, () => {
        setConnectionStatus('connected')
        void sendSessionUpdate('connected')
      })
      room.on(RoomEvent.LocalTrackPublished, (publication) => {
        if (publication.kind === Track.Kind.Video && publication.track && previewRef.current) {
          publication.track.attach(previewRef.current)
        }
      })
      room.on(RoomEvent.Disconnected, () => {
        if (!setupActive) setConnectionStatus('disconnected')
      })
      room.on(RoomEvent.Reconnecting, () => {
        if (setupActive) void tearDownLiveKitRoom(room)
      })
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (!setupActive) return
        if (state === ConnectionState.Reconnecting || state === ConnectionState.Disconnected) {
          void tearDownLiveKitRoom(room)
        }
      })

      await room.connect(url, token, {
        autoSubscribe: false,
        peerConnectionTimeout: 20_000,
      })

      if (micEnabled) {
        await room.localParticipant.setMicrophoneEnabled(true)
      } else {
        await room.localParticipant.setMicrophoneEnabled(false)
      }
      if (cameraEnabled) {
        const videoOpts = await resolveVideoCaptureOptions(facingMode)
        await room.localParticipant.setCameraEnabled(true, videoOpts)
      } else {
        await room.localParticipant.setCameraEnabled(false)
      }

      await attachLocalPreview(room, previewRef.current)

      setupActive = false
      setPhase('connected')
      setConnectionStatus('ready')
      await sendSessionUpdate('ready')
      toast.success('Camera connected — waiting for admin to go live')

      heartbeatRef.current = setInterval(() => {
        void sendSessionUpdate(connectionStatus === 'live' ? 'live' : 'ready')
      }, 15_000)
    } catch (err: unknown) {
      setupActive = false
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data
      let message = data?.message || (err instanceof Error ? err.message : 'Failed to connect camera')
      if (isNegotiationError(err) || isNegotiationError(message)) {
        message = 'WebRTC negotiation failed. Ensure LiveKit is running (npm run dev:livekit).'
      } else if (!data?.message && isLivekitConnectionError(err)) {
        message = livekitConnectionHint()
      }
      toast.error(message)
      setPermissionError(message)
      setConnectionStatus('disconnected')
      await tearDownLiveKitRoom(room)
      roomRef.current = null
      if (cameraIdRef.current) {
        try {
          await liveStreamApi.disconnectCamera(streamId, cameraIdRef.current)
        } catch { /* ignore */ }
        cameraIdRef.current = null
      }
      setCamera(null)
      setPhase('preview')
      await openPreview()
    } finally {
      setConnecting(false)
    }
  }, [
    streamId, facingMode, cameraEnabled, micEnabled, stopPreviewStream,
    sendSessionUpdate, openPreview, connectionStatus,
  ])

  const toggleCamera = useCallback(async () => {
    const next = !cameraEnabled
    setCameraEnabled(next)
    if (roomRef.current && phase === 'connected') {
      await roomRef.current.localParticipant.setCameraEnabled(next)
    } else if (previewStreamRef.current) {
      previewStreamRef.current.getVideoTracks().forEach((t) => { t.enabled = next })
    }
  }, [cameraEnabled, phase])

  const toggleMic = useCallback(async () => {
    const next = !micEnabled
    setMicEnabled(next)
    if (roomRef.current && phase === 'connected') {
      await roomRef.current.localParticipant.setMicrophoneEnabled(next)
    } else if (previewStreamRef.current) {
      previewStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = next })
    }
  }, [micEnabled, phase])

  const switchFacing = useCallback(async (mode: FacingMode) => {
    if (mode === facingMode || switchingCamera) return

    setSwitchingCamera(true)
    try {
      const videoOpts = await resolveVideoCaptureOptions(mode)

      if (phase === 'connected' && roomRef.current) {
        const room = roomRef.current

        if (videoOpts.deviceId) {
          await room.switchActiveDevice('videoinput', videoOpts.deviceId)
        } else {
          const pub = room.localParticipant.getTrackPublication(Track.Source.Camera)
          const videoTrack = pub?.videoTrack
          if (videoTrack) {
            await videoTrack.restartTrack({ facingMode: videoOpts.facingMode ?? mode })
          } else {
            await room.localParticipant.setCameraEnabled(false)
            await room.localParticipant.setCameraEnabled(true, { facingMode: mode })
          }
        }

        if (!cameraEnabled) {
          await room.localParticipant.setCameraEnabled(false)
        }

        await attachLocalPreview(room, previewRef.current)
        setFacingMode(mode)
        return
      }

      if (phase === 'preview') {
        stopPreviewStream()
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoOpts.deviceId
            ? { deviceId: { exact: videoOpts.deviceId } }
            : { facingMode: { ideal: videoOpts.facingMode ?? mode } },
          audio: true,
        })
        previewStreamRef.current = stream
        if (previewRef.current) {
          previewRef.current.srcObject = stream
          await previewRef.current.play().catch(() => {})
        }
        setFacingMode(mode)
      }
    } catch {
      toast.error('Camera switch failed. Allow camera access and try again.')
    } finally {
      setSwitchingCamera(false)
    }
  }, [facingMode, switchingCamera, phase, cameraEnabled, stopPreviewStream])

  useEffect(() => {
    if (!streamId || !cameraIdRef.current) return

    let cancelled = false
    let channel: {
      listen: (e: string, cb: (p: LiveStreamRealtimePayload) => void) => void
      stopListening: (e: string) => void
    } | null = null

    ensureEcho().then((echo) => {
      if (cancelled || !echo) return
      const cameraId = cameraIdRef.current
      channel = echo.private(`live-stream.${streamId}`)
      channel.listen('.stream.updated', (payload: LiveStreamRealtimePayload) => {
        if (payload.action === 'camera_disconnected' && payload.camera_id === cameraId) {
          toast.error('Admin disconnected your camera')
          void disconnectRoom()
          return
        }
        const updated = payload.staff?.cameras.find((c) => c.id === cameraId)
        if (!updated) return
        if (updated.connection_status === 'live') {
          setConnectionStatus('live')
        }
        if (updated.audio_muted && roomRef.current) {
          void roomRef.current.localParticipant.setMicrophoneEnabled(false)
          setMicEnabled(false)
        }
      })
    })

    return () => {
      cancelled = true
      const echo = getEcho()
      if (echo && channel) {
        channel.stopListening('.stream.updated')
        echo.leave(`live-stream.${streamId}`)
      }
    }
  }, [streamId, camera?.id, disconnectRoom])

  useEffect(() => () => { void disconnectRoom() }, [disconnectRoom])

  const statusLabel = camera?.connection_status_label
    || (connectionStatus === 'live' ? 'Live' : connectionStatus === 'ready' ? 'Ready' : connectionStatus)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4">
        <div className="flex items-center gap-2 text-violet-700 mb-1">
          <Smartphone className="h-5 w-5" />
          <p className="font-bold text-sm">Mobile Camera</p>
        </div>
        <p className="text-sm text-slate-600">{eventTitle}</p>
        <p className="text-xs text-slate-500 mt-1">
          Connect your phone camera. Only the admin can put your feed on the public live stream.
        </p>
      </div>

      {permissionError && (
        <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{permissionError}</p>
        </div>
      )}

      {(phase === 'preview' || phase === 'connected') && (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
          <video ref={previewRef} className="w-full h-full object-cover" playsInline muted autoPlay />
          {connectionStatus === 'live' && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white">
              <Radio className="h-3 w-3" /> LIVE
            </span>
          )}
        </div>
      )}

      {(phase === 'preview' || phase === 'connected') && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Connection</p>
            <p className="font-semibold text-ink capitalize">{statusLabel}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 flex items-center gap-1">
            <Wifi className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Internet</p>
              <p className="font-semibold text-ink">
                {phase === 'connected' ? connectionQualityLabel(quality) : '—'}
              </p>
            </div>
          </div>
          {batteryLevel !== null && (
            <div className="rounded-lg bg-slate-50 px-3 py-2 col-span-2">
              <p className="text-xs text-slate-500">Battery</p>
              <p className="font-semibold text-ink">{batteryLevel}%</p>
            </div>
          )}
        </div>
      )}

      {(phase === 'preview' || phase === 'connected') && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={switchingCamera}
            onClick={() => void switchFacing('user')}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-1.5 ${facingMode === 'user' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {switchingCamera ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Front Camera
          </button>
          <button
            type="button"
            disabled={switchingCamera}
            onClick={() => void switchFacing('environment')}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-1.5 ${facingMode === 'environment' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {switchingCamera ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Back Camera
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {phase === 'idle' && (
          <button
            type="button"
            disabled={connecting || !canJoin}
            onClick={openPreview}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Join Live
          </button>
        )}
        {phase === 'preview' && (
          <>
            <button
              type="button"
              disabled={connecting}
              onClick={connectCamera}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
              Connect Camera
            </button>
            <button
              type="button"
              onClick={() => { stopPreviewStream(); setPhase('idle') }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
          </>
        )}
        {phase === 'connected' && (
          <button
            type="button"
            onClick={() => void disconnectRoom()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
          >
            Disconnect Camera
          </button>
        )}
        {(phase === 'preview' || phase === 'connected') && (
          <>
            <button type="button" onClick={toggleCamera} className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600">
              {cameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
            </button>
            <button type="button" onClick={toggleMic} className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600">
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
