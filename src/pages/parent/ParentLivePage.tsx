import { useCallback, useEffect, useMemo } from 'react'
import { Radio, Wifi, WifiOff, Calendar } from 'lucide-react'
import { LiveBroadcastPausedPanel, isLiveBroadcastPaused } from '@/components/live/LiveBroadcastPausedPanel'
import { LiveStreamPlayer } from '@/components/live/LiveStreamPlayer'
import { useLiveRouteVisible } from '@/components/live/LiveRouteKeepAlive'
import { LiveStreamUpcomingPanel } from '@/components/live/LiveStreamUpcomingPanel'
import { useActiveLiveStream } from '@/hooks/useLiveStreamRealtime'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { DEFAULT_SCHOOL_TIMEZONE } from '@/config/timezones'
import { parseWallClockInTimeZone } from '@/utils/scheduleTime'

export default function ParentLivePage() {
  const { profile } = useSchoolBranding()
  const routeVisible = useLiveRouteVisible()
  const { active, watch, cameraId, connected, reload } = useActiveLiveStream()
  const timeZone = profile?.timezone || DEFAULT_SCHOOL_TIMEZONE

  const broadcastPaused = isLiveBroadcastPaused(active?.status, active?.display_status)
  const isLive = active?.status === 'live'
  const isUpcoming = Boolean(active?.is_upcoming || active?.display_status === 'upcoming')
  const isScheduled = Boolean(
    active?.is_scheduled || active?.status === 'scheduled' || active?.display_status === 'scheduled',
  )

  const scheduleReady = useMemo(() => {
    if (!active?.scheduled_start_at) return true
    if (active.enable_countdown === false) return true
    const at = parseWallClockInTimeZone(active.scheduled_start_at, timeZone)
    return Number.isNaN(at) || at <= Date.now()
  }, [active?.scheduled_start_at, active?.enable_countdown, timeZone])

  const hasFeed = Boolean(watch?.playback || (watch?.playbacks && watch.playbacks.length > 0))
  const canPlay = Boolean(
    scheduleReady
    && hasFeed
    && (active?.status === 'live' || active?.status === 'paused')
  )
  const showWaiting = Boolean(active && !canPlay && !broadcastPaused && active.status !== 'stopped')

  const startDue = Boolean(active && scheduleReady && !canPlay && !broadcastPaused)

  const onCountdownComplete = useCallback(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (!startDue || canPlay || broadcastPaused) return
    reload()
    let n = 0
    const timer = window.setInterval(() => {
      n += 1
      reload()
      if (n >= 40) window.clearInterval(timer)
    }, 1500)
    return () => window.clearInterval(timer)
  }, [startDue, canPlay, broadcastPaused, reload])

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
          {isLive && canPlay && (
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              LIVE
            </span>
          )}
          {broadcastPaused && (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              PAUSED
            </span>
          )}
          {isUpcoming && (
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
              <Calendar className="h-3.5 w-3.5" /> UPCOMING
            </span>
          )}
          {isScheduled && !isLive && !isUpcoming && !broadcastPaused && (
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
                enableCountdown={active.enable_countdown !== false && !scheduleReady}
                timeZone={timeZone}
                onCountdownComplete={onCountdownComplete}
                badgeLabel={
                  startDue
                    ? 'STARTING…'
                    : isUpcoming
                      ? 'UPCOMING LIVE'
                      : isScheduled
                        ? 'SCHEDULED'
                        : 'STARTING SOON'
                }
                footnote={startDue
                  ? 'Start time reached — waiting for auto-start. If this stays here, ask admin to connect a camera and click Start Now.'
                  : undefined}
              />
            </div>
          )}

          {canPlay ? (
            <div className="live-viewer-screen">
              <LiveStreamPlayer
                immersive
                lockPlayback
                cameraId={cameraId}
                playback={watch?.playback}
                playbacks={watch?.playbacks}
                layoutMode={watch?.layout_mode ?? active.layout_mode}
                title={active.title}
                cameraName={watch?.active_camera?.name}
                cameraLocation={watch?.active_camera?.location ?? undefined}
                status={active.status}
                muted={!routeVisible || active.audio_enabled === false}
              />
            </div>
          ) : broadcastPaused ? (
            <div className="live-viewer-screen">
              <LiveBroadcastPausedPanel title={active.title} />
            </div>
          ) : active?.status === 'stopped' ? (
            <div className="live-viewer-empty rounded-3xl border border-slate-100 bg-slate-50/80 p-12 text-center">
              <p className="font-semibold text-ink">Broadcast ended</p>
            </div>
          ) : null}

          {!broadcastPaused && canPlay && (watch?.active_cameras?.length ?? 0) > 1 ? (
            <p className="text-center text-sm text-slate-500">
              Now showing:{' '}
              <span className="font-semibold text-ink">
                {watch!.active_cameras!.map((c) => c.name).join(' · ')}
              </span>
            </p>
          ) : !broadcastPaused && watch?.active_camera && canPlay ? (
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
