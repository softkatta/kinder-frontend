import { Radio, Wifi, WifiOff, Calendar } from 'lucide-react'
import { LiveStreamPlayer } from '@/components/live/LiveStreamPlayer'
import { LiveStreamUpcomingPanel } from '@/components/live/LiveStreamUpcomingPanel'
import { useActiveLiveStream } from '@/hooks/useLiveStreamRealtime'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { DEFAULT_SCHOOL_TIMEZONE } from '@/config/timezones'

export default function ParentLivePage() {
  const { profile } = useSchoolBranding()
  const { active, watch, cameraId, connected, reload } = useActiveLiveStream()
  const timeZone = profile?.timezone || DEFAULT_SCHOOL_TIMEZONE

  const isLive = active?.status === 'live' || active?.status === 'paused'
  const isUpcoming = Boolean(active?.is_upcoming || active?.display_status === 'upcoming')
  const isScheduled = Boolean(
    active?.is_scheduled || active?.status === 'scheduled' || active?.display_status === 'scheduled',
  )
  const canPlay = Boolean(active?.is_watchable && (watch?.playback || (watch?.playbacks && watch.playbacks.length > 0)))
  const showWaiting = Boolean(active && !canPlay && active.status !== 'stopped')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">School Live</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Feed starts automatically when school goes live — camera switches without refresh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <Wifi className="h-3.5 w-3.5" /> Real-time
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <WifiOff className="h-3.5 w-3.5" /> Auto-sync
            </span>
          )}
          {isLive && (
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              LIVE
            </span>
          )}
          {isUpcoming && (
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
              <Calendar className="h-3.5 w-3.5" /> UPCOMING
            </span>
          )}
          {isScheduled && !isLive && !isUpcoming && (
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
              <Calendar className="h-3.5 w-3.5" /> SCHEDULED
            </span>
          )}
        </div>
      </div>

      {!active ? (
        <div className="live-viewer-empty rounded-3xl border border-slate-100 bg-slate-50/80 p-12 text-center">
          <Radio className="h-10 w-10 text-violet-400 mx-auto mb-3 animate-pulse" />
          <p className="font-semibold text-ink">Waiting for live event…</p>
          <p className="text-sm text-slate-500 mt-1">
            Stay on this page — the stream will start automatically when admin goes live.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {showWaiting && (
            <div className="live-viewer-screen">
              <LiveStreamUpcomingPanel
              title={active.title}
              description={active.description}
              banner={active.banner}
              scheduledStartAt={active.scheduled_start_at}
              countdownSeconds={active.countdown_seconds}
              enableCountdown={active.enable_countdown}
              timeZone={timeZone}
              onCountdownComplete={reload}
              badgeLabel={
                isUpcoming ? 'UPCOMING LIVE' : isScheduled ? 'SCHEDULED' : 'STARTING SOON'
              }
            />
            </div>
          )}

          {canPlay ? (
            <div className="live-viewer-screen">
            <LiveStreamPlayer
              immersive
              cameraId={cameraId}
              playback={watch?.playback}
              playbacks={watch?.playbacks}
              layoutMode={watch?.layout_mode ?? active.layout_mode}
              title={active.title}
              cameraName={watch?.active_camera?.name}
              cameraLocation={watch?.active_camera?.location ?? undefined}
              status={active.status}
              muted={active.audio_enabled === false}
            />
            </div>
          ) : active?.status === 'stopped' ? (
            <div className="live-viewer-empty rounded-3xl border border-slate-100 bg-slate-50/80 p-12 text-center">
              <p className="font-semibold text-ink">Broadcast ended</p>
            </div>
          ) : null}

          {canPlay && (watch?.active_cameras?.length ?? 0) > 1 ? (
            <p className="text-center text-sm text-slate-500">
              Now showing:{' '}
              <span className="font-semibold text-ink">
                {watch!.active_cameras!.map((c) => c.name).join(' · ')}
              </span>
            </p>
          ) : watch?.active_camera && canPlay ? (
            <p className="text-center text-sm text-slate-500">
              Now showing: <span className="font-semibold text-ink">{watch.active_camera.name}</span>
              {watch.active_camera.location ? ` · ${watch.active_camera.location}` : ''}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
