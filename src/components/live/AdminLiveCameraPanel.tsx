import { useState } from 'react'
import {
  Eye, Radio, Volume2, VolumeX, User, Wifi, Battery, Clock, Video, Loader2,
} from 'lucide-react'
import { AdminBadge, AdminBtn } from '@/components/admin/AdminUi'
import { LiveKitViewer } from '@/components/live/LiveKitViewer'
import type { LiveStreamCameraStaff, LiveStreamStaff } from '@/types/liveStream'

interface AdminLiveCameraPanelProps {
  stream: LiveStreamStaff
  busy: boolean
  switchingId: number | null
  isBroadcasting: boolean
  layoutMode?: number
  layoutDraftIds?: number[]
  onToggleInclude?: (cameraId: number) => void
  onSwitch: (camera: LiveStreamCameraStaff) => void
  onPreview: (camera: LiveStreamCameraStaff) => void
  onDisconnect: (camera: LiveStreamCameraStaff) => void
  onMute: (camera: LiveStreamCameraStaff, muted: boolean) => void
}

function statusTone(status?: string): 'success' | 'warning' | 'neutral' | 'danger' {
  switch (status) {
    case 'live': return 'success'
    case 'ready':
    case 'connected': return 'warning'
    case 'connecting': return 'neutral'
    case 'disconnected':
    case 'offline': return 'danger'
    default: return 'neutral'
  }
}

function formatJoinTime(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function AdminLiveCameraPanel({
  stream,
  busy,
  switchingId,
  isBroadcasting,
  layoutMode = 1,
  layoutDraftIds = [],
  onToggleInclude,
  onSwitch,
  onPreview,
  onDisconnect,
  onMute,
}: AdminLiveCameraPanelProps) {
  const [previewId, setPreviewId] = useState<number | null>(null)

  const mobileCameras = stream.cameras
    .filter((c) => c.is_mobile_publisher || c.publisher_user_id)
    .sort((a, b) => a.display_order - b.display_order)

  if (mobileCameras.length === 0) {
    return (
      <div className="admin-live-studio__empty px-6 py-10">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-600">
          <Video className="h-6 w-6" />
        </div>
        <p className="font-semibold text-slate-700">No mobile cameras yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Teachers and staff can join from their phones via Join Live.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {mobileCameras.map((camera) => {
        const isPrimary = Boolean(camera.is_primary)
        const inGrid = Boolean(camera.is_active)
        const isLive = inGrid && isBroadcasting
        const showPreview = previewId === camera.id && camera.stream_type === 'builtin_camera'

        const isMobile = Boolean(camera.is_mobile_publisher || camera.publisher_user_id)
        const mobileReady = !isMobile || ['ready', 'connected', 'live'].includes(camera.connection_status ?? '')
        const canSelectLive = camera.is_enabled && mobileReady

        return (
          <div
            key={camera.id}
            className={`rounded-2xl border overflow-hidden bg-white shadow-sm transition ${
              isLive
                ? 'border-rose-300 ring-2 ring-rose-100 shadow-rose-100/60'
                : 'border-slate-200/90 hover:border-sky-200 hover:shadow-md'
            }`}
          >
            <div className="relative aspect-video bg-slate-900">
              {showPreview && isBroadcasting ? (
                <LiveKitViewer
                  streamId={stream.id}
                  participantIdentity={`camera-${camera.id}`}
                  muted
                  className="w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Video className="h-8 w-8 opacity-40" />
                  <p className="text-xs">Tap Preview to watch feed</p>
                </div>
              )}
              {isLive && isPrimary && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                  <Radio className="h-3 w-3" /> Primary
                </span>
              )}
              {isLive && !isPrimary && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                  In Grid
                </span>
              )}
            </div>

            <div className="p-3 space-y-3">
              <div className="flex items-start gap-2.5">
                {camera.publisher_photo_url ? (
                  <img
                    src={camera.publisher_photo_url}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover border border-slate-100"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-sky-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-ink truncate">
                    {camera.publisher_name || camera.name}
                  </p>
                  <p className="text-xs text-slate-500">{camera.publisher_role || 'Staff'}</p>
                </div>
                <AdminBadge tone={statusTone(camera.connection_status)}>
                  {camera.connection_status_label || camera.connection_status || 'Offline'}
                </AdminBadge>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p><span className="text-slate-400">Camera:</span> {camera.name}</p>
                <p><span className="text-slate-400">Location:</span> {camera.location || '—'}</p>
                {camera.device_name && (
                  <p className="truncate"><span className="text-slate-400">Device:</span> {camera.device_name}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                {camera.battery_level != null && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                    <Battery className="h-3 w-3" /> {camera.battery_level}%
                  </span>
                )}
                {camera.signal_strength != null && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                    <Wifi className="h-3 w-3" /> {camera.signal_strength}%
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                  <Clock className="h-3 w-3" /> Joined {formatJoinTime(camera.joined_at)}
                </span>
              </div>

              {layoutMode > 1 && camera.is_enabled && onToggleInclude && (
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    checked={layoutDraftIds.includes(camera.id)}
                    disabled={busy}
                    onChange={() => onToggleInclude(camera.id)}
                  />
                  Include in layout (max {layoutMode})
                </label>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                <AdminBtn
                  variant="secondary"
                  className="!px-2 !py-1.5 text-xs"
                  onClick={() => {
                    setPreviewId(previewId === camera.id ? null : camera.id)
                    onPreview(camera)
                  }}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </AdminBtn>
                <AdminBtn
                  variant={isPrimary ? 'primary' : 'secondary'}
                  className="!px-2 !py-1.5 text-xs"
                  disabled={!canSelectLive || isPrimary || switchingId === camera.id || busy}
                  title={!mobileReady ? 'Camera is still connecting — wait for Ready status' : undefined}
                  onClick={() => onSwitch(camera)}
                >
                  {switchingId === camera.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Radio className="h-3.5 w-3.5" />
                      {isPrimary ? 'Primary' : isBroadcasting ? 'Make primary' : 'Go Live'}
                    </>
                  )}
                </AdminBtn>
                <AdminBtn
                  variant="secondary"
                  className="!px-2 !py-1.5 text-xs"
                  disabled={busy}
                  onClick={() => onMute(camera, !camera.audio_muted)}
                  title={camera.audio_muted ? 'Unmute audio' : 'Mute audio'}
                >
                  {camera.audio_muted ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </AdminBtn>
                <AdminBtn
                  variant="secondary"
                  className="!px-2 !py-1.5 text-xs text-rose-600"
                  disabled={busy}
                  onClick={() => onDisconnect(camera)}
                >
                  Disconnect
                </AdminBtn>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
