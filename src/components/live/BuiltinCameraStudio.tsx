import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ConnectionQuality,
  ConnectionState,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client'
import {
  Camera, CameraOff, Mic, MicOff, Radio, Wifi, AlertCircle, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { liveStreamApi } from '@/api/services'
import { AdminBtn } from '@/components/admin/AdminUi'
import { Select } from '@/components/ui/Select'
import { connectionQualityLabel } from '@/components/live/LiveKitViewer'

function livekitConnectionHint(url?: string | null): string {
  const host = url || 'ws://localhost:7880'
  return `Cannot reach LiveKit at ${host}. Open a terminal in the project folder and run: npm run dev:livekit`
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

interface BuiltinCameraStudioProps {
  streamId: number
  cameraId: number
  cameraName: string
  isActive: boolean
  isBroadcasting: boolean
  streamPaused: boolean
  /** When admin mutes this camera for parents, also cut the publisher mic. */
  remoteAudioMuted?: boolean
}

type StudioPhase = 'idle' | 'preview' | 'live'

export function BuiltinCameraStudio({
  streamId,
  cameraId,
  cameraName,
  isActive,
  isBroadcasting,
  streamPaused,
  remoteAudioMuted = false,
}: BuiltinCameraStudioProps) {
  const previewRef = useRef<HTMLVideoElement>(null)
  const roomRef = useRef<Room | null>(null)
  const previewStreamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animRef = useRef<number | null>(null)

  const [phase, setPhase] = useState<StudioPhase>('idle')
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDeviceId, setVideoDeviceId] = useState('')
  const [audioDeviceId, setAudioDeviceId] = useState('')
  const [videoLabel, setVideoLabel] = useState('')
  const [audioLabel, setAudioLabel] = useState('')
  const [micLevel, setMicLevel] = useState(0)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [quality, setQuality] = useState<ConnectionQuality>(ConnectionQuality.Unknown)

  const stopPreviewStream = useCallback(() => {
    previewStreamRef.current?.getTracks().forEach((t) => t.stop())
    previewStreamRef.current = null
    if (previewRef.current) previewRef.current.srcObject = null
  }, [])

  const stopMicMeter = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = null
    analyserRef.current = null
  }, [])

  const startMicMeter = useCallback((stream: MediaStream) => {
    stopMicMeter()
    const audioTrack = stream.getAudioTracks()[0]
    if (!audioTrack) return

    try {
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)))
        animRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      // AudioContext may be blocked until user gesture
    }
  }, [stopMicMeter])

  const loadDevices = useCallback(async () => {
    const list = await navigator.mediaDevices.enumerateDevices()
    const cams = list.filter((d) => d.kind === 'videoinput')
    const mics = list.filter((d) => d.kind === 'audioinput')
    setDevices(list)
    if (!videoDeviceId && cams[0]) setVideoDeviceId(cams[0].deviceId)
    if (!audioDeviceId && mics[0]) setAudioDeviceId(mics[0].deviceId)
    return { cams, mics }
  }, [videoDeviceId, audioDeviceId])

  const openPreview = useCallback(async () => {
    setPermissionError(null)
    setConnecting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
      })
      stopPreviewStream()
      previewStreamRef.current = stream
      if (previewRef.current) {
        previewRef.current.srcObject = stream
        await previewRef.current.play().catch(() => {})
      }
      const { cams, mics } = await loadDevices()
      const vId = stream.getVideoTracks()[0]?.getSettings().deviceId
      const aId = stream.getAudioTracks()[0]?.getSettings().deviceId
      if (vId) {
        setVideoDeviceId(vId)
        setVideoLabel(cams.find((d) => d.deviceId === vId)?.label || 'Camera')
      }
      if (aId) {
        setAudioDeviceId(aId)
        setAudioLabel(mics.find((d) => d.deviceId === aId)?.label || 'Microphone')
      }
      startMicMeter(stream)
      setPhase('preview')
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setPermissionError('Camera and microphone access was denied. Allow permissions in your browser settings and try again.')
      } else if (name === 'NotFoundError') {
        setPermissionError('No camera or microphone found on this device.')
      } else {
        setPermissionError('Could not access camera or microphone. Check device connections and try again.')
      }
    } finally {
      setConnecting(false)
    }
  }, [videoDeviceId, audioDeviceId, loadDevices, startMicMeter, stopPreviewStream])

  const disconnectRoom = useCallback(async () => {
    const room = roomRef.current
    if (room) {
      await tearDownLiveKitRoom(room)
      roomRef.current = null
    }
    setConnectionStatus('disconnected')
    setPhase('idle')
    stopPreviewStream()
    stopMicMeter()
  }, [stopPreviewStream, stopMicMeter])

  const goLive = useCallback(async () => {
    setConnecting(true)
    setConnectionStatus('connecting')
    setPermissionError(null)
    let room: Room | null = null
    let setupActive = true
    try {
      const res = await liveStreamApi.webrtcToken(streamId, { role: 'publisher', camera_id: cameraId })
      const { token, url } = res.data.data as { token: string; url: string }

      // Release preview stream before opening the camera through LiveKit
      stopPreviewStream()
      stopMicMeter()

      room = new Room({
        // Publisher-only: subscriber optimizations cause spurious quality/reconnect noise
        adaptiveStream: false,
        dynacast: false,
        videoCaptureDefaults: videoDeviceId ? { deviceId: videoDeviceId } : undefined,
        audioCaptureDefaults: audioDeviceId ? { deviceId: audioDeviceId } : undefined,
        publishDefaults: {
          simulcast: false,
          videoCodec: 'vp8',
        },
      })
      roomRef.current = room

      room.on(RoomEvent.ConnectionQualityChanged, (_quality, participant) => {
        if (participant.isLocal) setQuality(_quality)
      })
      room.on(RoomEvent.Connected, () => setConnectionStatus('connected'))
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

      const videoOpts = videoDeviceId ? { deviceId: videoDeviceId } : undefined
      const audioOpts = audioDeviceId ? { deviceId: audioDeviceId } : undefined

      if (micEnabled) {
        await room.localParticipant.setMicrophoneEnabled(true, audioOpts)
      } else {
        await room.localParticipant.setMicrophoneEnabled(false)
      }
      if (cameraEnabled) {
        await room.localParticipant.setCameraEnabled(true, videoOpts)
      } else {
        await room.localParticipant.setCameraEnabled(false)
      }

      setupActive = false
      setPhase('live')
      setConnectionStatus('connected')
      toast.success(`${cameraName} is broadcasting`)
    } catch (err: unknown) {
      setupActive = false
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      const bag = data?.errors
      let message =
        data?.message
        || (bag?.livekit?.[0])
        || (err instanceof Error ? err.message : 'Failed to go live')
      if (isNegotiationError(err) || isNegotiationError(message)) {
        message = 'WebRTC negotiation failed. Restart LiveKit (npm run dev:livekit), allow TCP 7881 and UDP 7882 through Windows Firewall, then try Go live again.'
      } else if (!data?.message && isLivekitConnectionError(err)) {
        message = livekitConnectionHint()
      }
      toast.error(message)
      setPermissionError(message)
      setConnectionStatus('disconnected')
      await tearDownLiveKitRoom(room)
      roomRef.current = null
      setPhase('preview')
      // Re-open preview so staff can retry without starting over
      if (previewRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
          audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        })
        previewStreamRef.current = stream
        previewRef.current.srcObject = stream
        await previewRef.current.play().catch(() => {})
        startMicMeter(stream)
      }
    } finally {
      setConnecting(false)
    }
  }, [
    streamId, cameraId, cameraName, videoDeviceId, audioDeviceId,
    cameraEnabled, micEnabled, stopPreviewStream, stopMicMeter, startMicMeter,
  ])

  const toggleCamera = useCallback(async () => {
    const room = roomRef.current
    const next = !cameraEnabled
    setCameraEnabled(next)
    if (room && phase === 'live') {
      await room.localParticipant.setCameraEnabled(next)
    } else if (previewStreamRef.current) {
      previewStreamRef.current.getVideoTracks().forEach((t) => { t.enabled = next })
    }
  }, [cameraEnabled, phase])

  const toggleMic = useCallback(async () => {
    if (remoteAudioMuted) {
      toast.error('Admin muted this camera — unmute from the Volume button first')
      return
    }
    const room = roomRef.current
    const next = !micEnabled
    setMicEnabled(next)
    if (room && phase === 'live') {
      await room.localParticipant.setMicrophoneEnabled(next)
    } else if (previewStreamRef.current) {
      previewStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = next })
    }
  }, [micEnabled, phase, remoteAudioMuted])

  useEffect(() => {
    const room = roomRef.current
    if (remoteAudioMuted) {
      setMicEnabled(false)
      if (room && phase === 'live') {
        void room.localParticipant.setMicrophoneEnabled(false)
      } else if (previewStreamRef.current) {
        previewStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = false })
      }
      return
    }
    // Admin unmuted — restore publisher mic when live.
    if (room && phase === 'live') {
      void room.localParticipant.setMicrophoneEnabled(true)
      setMicEnabled(true)
    }
  }, [remoteAudioMuted, phase])

  const switchVideoDevice = useCallback(async (deviceId: string) => {
    setVideoDeviceId(deviceId)
    const label = devices.find((d) => d.deviceId === deviceId)?.label || 'Camera'
    setVideoLabel(label)

    if (phase === 'live' && roomRef.current) {
      await roomRef.current.switchActiveDevice('videoinput', deviceId)
      if (!cameraEnabled) {
        await roomRef.current.localParticipant.setCameraEnabled(false)
      }
    } else if (phase === 'preview') {
      stopPreviewStream()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
      })
      previewStreamRef.current = stream
      if (previewRef.current) {
        previewRef.current.srcObject = stream
        await previewRef.current.play().catch(() => {})
      }
      startMicMeter(stream)
    }
  }, [devices, phase, cameraEnabled, audioDeviceId, stopPreviewStream, startMicMeter])

  const switchAudioDevice = useCallback(async (deviceId: string) => {
    setAudioDeviceId(deviceId)
    const label = devices.find((d) => d.deviceId === deviceId)?.label || 'Microphone'
    setAudioLabel(label)

    if (phase === 'live' && roomRef.current) {
      await roomRef.current.switchActiveDevice('audioinput', deviceId)
      if (!micEnabled) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(false)
      }
    } else if (phase === 'preview') {
      stopPreviewStream()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
        audio: { deviceId: { exact: deviceId } },
      })
      previewStreamRef.current = stream
      if (previewRef.current) {
        previewRef.current.srcObject = stream
        await previewRef.current.play().catch(() => {})
      }
      startMicMeter(stream)
    }
  }, [devices, phase, micEnabled, videoDeviceId, stopPreviewStream, startMicMeter])

  useEffect(() => {
    return () => {
      disconnectRoom()
    }
  }, [disconnectRoom])

  if (!isBroadcasting) {
    return (
      <p className="text-xs text-slate-500 mt-1">
        Start the live event, then use the studio below to broadcast from this device.
      </p>
    )
  }

  const videoInputs = devices.filter((d) => d.kind === 'videoinput')
  const audioInputs = devices.filter((d) => d.kind === 'audioinput')

  return (
    <div className={`mt-3 rounded-xl border p-3 space-y-3 ${isActive ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/60'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Built-in camera studio
          {isActive && <span className="ml-2 text-emerald-600">· Active feed</span>}
        </p>
        {phase === 'live' && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
            <Radio className="h-3 w-3" /> Broadcasting
          </span>
        )}
      </div>

      {permissionError && (
        <div className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{permissionError}</p>
        </div>
      )}

      {(phase === 'preview' || phase === 'live') && (
        <div className="relative aspect-video max-w-md rounded-lg overflow-hidden bg-black">
          <video ref={previewRef} className="w-full h-full object-cover" playsInline muted autoPlay />
          {phase === 'live' && streamPaused && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold">
              Stream paused for viewers
            </div>
          )}
        </div>
      )}

      {(phase === 'preview' || phase === 'live') && (
        <div className="grid gap-2 sm:grid-cols-2 text-xs">
          <div>
            <p className="text-slate-500 mb-1">Camera</p>
            <p className="font-medium text-ink truncate">{videoLabel || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Microphone</p>
            <p className="font-medium text-ink truncate">{audioLabel || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Connection</p>
            <p className="font-medium text-ink capitalize">{connectionStatus}</p>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500">Quality:</span>
            <span className="font-medium text-ink">
              {phase === 'live' ? connectionQualityLabel(quality) : '—'}
            </span>
          </div>
        </div>
      )}

      {phase === 'preview' && (
        <div>
          <p className="text-xs text-slate-500 mb-1">Microphone level</p>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-75"
              style={{ width: `${micLevel}%` }}
            />
          </div>
        </div>
      )}

      {(phase === 'preview' || phase === 'live') && videoInputs.length > 0 && (
        <Select
          label="Switch camera"
          value={videoDeviceId}
          onChange={(e) => switchVideoDevice(e.target.value)}
        >
          {videoInputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </Select>
      )}

      {(phase === 'preview' || phase === 'live') && audioInputs.length > 0 && (
        <Select
          label="Switch microphone"
          value={audioDeviceId}
          onChange={(e) => switchAudioDevice(e.target.value)}
        >
          {audioInputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Mic ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </Select>
      )}

      <div className="flex flex-wrap gap-2">
        {phase === 'idle' && (
          <AdminBtn variant="primary" disabled={connecting} onClick={openPreview}>
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Allow camera & preview
          </AdminBtn>
        )}
        {phase === 'preview' && (
          <>
            <AdminBtn variant="primary" disabled={connecting} onClick={goLive}>
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
              Go live
            </AdminBtn>
            <AdminBtn variant="secondary" onClick={() => { stopPreviewStream(); stopMicMeter(); setPhase('idle') }}>
              Cancel
            </AdminBtn>
          </>
        )}
        {phase === 'live' && (
          <AdminBtn variant="secondary" onClick={disconnectRoom}>
            Stop broadcasting
          </AdminBtn>
        )}
        {(phase === 'preview' || phase === 'live') && (
          <>
            <AdminBtn variant="secondary" onClick={toggleCamera}>
              {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
              {cameraEnabled ? 'Camera on' : 'Camera off'}
            </AdminBtn>
            <AdminBtn variant="secondary" onClick={toggleMic}>
              {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              {micEnabled ? 'Mic on' : 'Mic off'}
            </AdminBtn>
          </>
        )}
      </div>
    </div>
  )
}
