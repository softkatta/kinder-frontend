import { useCallback, useEffect, useMemo, useState } from 'react'
import { Radio, Wifi, WifiOff, Calendar, Volume2 } from 'lucide-react'
import { LiveBroadcastPausedPanel, isLiveBroadcastPaused } from '@/components/live/LiveBroadcastPausedPanel'
import { LiveStreamPlayer } from '@/components/live/LiveStreamPlayer'
import { useLiveRouteVisible } from '@/components/live/LiveRouteKeepAlive'
import { LiveStreamUpcomingPanel } from '@/components/live/LiveStreamUpcomingPanel'
import { useActiveLiveStream } from '@/hooks/useLiveStreamRealtime'
import { useLiveViewerPresence } from '@/hooks/useLiveViewerPresence'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { DEFAULT_SCHOOL_TIMEZONE } from '@/config/timezones'
import { parseWallClockInTimeZone } from '@/utils/scheduleTime'
import { readLiveSoundUnlocked } from '@/utils/liveSoundUnlock'

export default function ParentLivePage() {
  const { profile } = useSchoolBranding()
  const routeVisible = useLiveRouteVisible()
  const { active, watch, cameraId, connected, reload } = useActiveLiveStream()
  const timeZone = profile?.timezone || DEFAULT_SCHOOL_TIMEZONE
  const [soundUnlocked, setSoundUnlocked] = useState(() => readLiveSoundUnlocked())

  useEffect(() => {
    const sync = () => setSoundUnlocked(readLiveSoundUnlocked())
    sync()
    window.addEventListener('kinder-live-sound-unlock', sync)
    window.addEventListener('pointerdown', sync, { capture: true })
    return () => {
      window.removeEventListener('kinder-live-sound-unlock', sync)
      window.removeEventListener('pointerdown', sync, { capture: true })
    }
  }, [])

  const broadcastPaused = isLiveBroadcastPaused(active?.status, active?.display_status)
  const isLive = active?.status === 'live'
  const isUpcoming = Boolean(active?.is_upcoming || active?.display_status === 'upcoming')
  const isScheduled = Boolean(
    active?.is_scheduled || active?.status === 'scheduled' || active?.display_status === 'scheduled',
  )

  const countdownElapsed = useMemo(() => {
    if (!active?.scheduled_start_at || active.enable_countdown === false) return true
    if (typeof active.countdown_seconds === 'number' && active.countdown_seconds <= 0) return true
    const at = parseWallClockInTimeZone(active.scheduled_start_at, timeZone)
    if (Number.isNaN(at)) return true
    return at <= Date.now() + 1000
  }, [active?.scheduled_start_at, active?.enable_countdown, active?.countdown_seconds, timeZone])

  const hasFeed = Boolean(watch?.playback || (watch?.playbacks && watch.playbacks.length > 0))
  const canPlay = Boolean(
    hasFeed
    && (active?.status === 'live' || active?.status === 'paused')
    && (active?.is_watchable || active?.status === 'paused')
  )
  const showWaiting = Boolean(active && !canPlay && !broadcastPaused && active.status !== 'stopped')

  useLiveViewerPresence(active?.id, Boolean(routeVisible && canPlay))

  const startDue = Boolean(active && countdownElapsed && !canPlay && !broadcastPaused)

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
      if (n >= 60) window.clearInterval(timer)
    }, 1200)
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
                enableCountdown={active.enable_countdown !== false && !countdownElapsed && !canPlay}
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
            <>
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
              {!soundUnlocked && !broadcastPaused && (
                <p className="text-center text-sm text-slate-600 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
                  <Volume2 className="inline-block h-4 w-4 mr-1.5 text-sky-600 align-text-bottom" />
                  Tap or click once on this page to enable sound. Browsers block automatic sound for privacy.
                </p>
              )}
            </>
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
