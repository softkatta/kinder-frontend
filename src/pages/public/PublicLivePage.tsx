import { Link } from 'react-router-dom'
import { Radio, LogIn } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { LiveBroadcastPausedPanel, isLiveBroadcastPaused } from '@/components/live/LiveBroadcastPausedPanel'
import { LiveStreamPlayer } from '@/components/live/LiveStreamPlayer'
import { useLiveRouteVisible } from '@/components/live/LiveRouteKeepAlive'
import { LiveStreamUpcomingPanel } from '@/components/live/LiveStreamUpcomingPanel'
import { usePublicLiveStream } from '@/hooks/usePublicLiveStream'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { useT } from '@/i18n/LanguageContext'
import { FadeIn } from '@/components/ui/Motion'
import { DEFAULT_SCHOOL_TIMEZONE } from '@/config/timezones'

export default function PublicLivePage() {
  const { t } = useT()
  const { profile } = useSchoolBranding()
  const routeVisible = useLiveRouteVisible()
  const { active, watch, upcoming, cameraId, isLive, isPaused, isUpcoming, reload } = usePublicLiveStream()
  const timeZone = profile?.timezone || DEFAULT_SCHOOL_TIMEZONE

  const broadcastPaused = isPaused || isLiveBroadcastPaused(active?.status, active?.display_status)
  const showWaiting = Boolean(active && !active.is_watchable && !broadcastPaused)
  const canPlay = Boolean(
    !broadcastPaused
    && active?.is_watchable
    && (watch?.playback || (watch?.playbacks && watch.playbacks.length > 0)),
  )

  return (
    <div className="overflow-x-hidden">
      <PublicPageHero
        imageKey="page_live_image"
        label={t.nav.watchLive}
        title={t.pages.live.title}
        subtitle={t.pages.live.subtitle}
        breadcrumbs={[{ label: t.nav.watchLive }]}
      />

      <section className="live-viewer-section overflow-x-hidden">
          {isLive && (
            <div className="flex justify-center mb-3 px-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                LIVE NOW
              </span>
            </div>
          )}
          {broadcastPaused && (
            <div className="flex justify-center mb-3 px-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
                PAUSED
              </span>
            </div>
          )}

          {showWaiting && active && (
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
                badgeLabel={isUpcoming ? 'UPCOMING LIVE' : 'STARTING SOON'}
              />
            </div>
          )}

          {!active && upcoming.length === 0 ? (
            <FadeIn>
              <div className="live-viewer-layout">
                <div className="live-viewer-empty rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
                  <Radio className="h-12 w-12 text-violet-400 mx-auto mb-4 animate-pulse" />
                  <p className="font-display font-bold text-xl text-ink">{t.pages.live.waitingTitle}</p>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{t.pages.live.waitingDesc}</p>
                </div>
              </div>
            </FadeIn>
          ) : broadcastPaused && active ? (
            <div className="live-viewer-screen">
              <LiveBroadcastPausedPanel title={active.title} />
            </div>
          ) : canPlay && active ? (
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
                  webrtcAuth="public"
                />
              </div>
              <div className="live-viewer-meta">
                <h2 className="font-display text-xl font-bold text-ink text-center">{active.title}</h2>
                {(watch?.active_cameras?.length ?? 0) > 1 ? (
                  <p className="text-center text-sm text-slate-600 mt-2">
                    {t.pages.live.nowShowing}:{' '}
                    <strong>{watch!.active_cameras!.map((c) => c.name).join(' · ')}</strong>
                  </p>
                ) : watch?.active_camera ? (
                  <p className="text-center text-sm text-slate-600 mt-2">
                    {t.pages.live.nowShowing}: <strong>{watch.active_camera.name}</strong>
                    {watch.active_camera.location ? ` · ${watch.active_camera.location}` : ''}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
      </section>

      {(upcoming.length > 1 || active) && (
        <section className="live-viewer-section live-viewer-section--footer overflow-x-hidden">
          <div className="live-viewer-layout">
            {upcoming.length > 1 && (
              <div className="mb-8">
                <h3 className="font-display font-bold text-lg text-ink mb-4">More Upcoming Events</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {upcoming.slice(1).map((ev) => (
                    <div key={ev.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                      <p className="font-semibold text-ink">{ev.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{ev.status_label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-xs text-slate-400">
              {t.pages.live.portalHint}{' '}
              <Link to="/login" className="text-violet-600 font-semibold hover:underline inline-flex items-center gap-1">
                <LogIn className="h-3.5 w-3.5" /> {t.nav.portalLogin}
              </Link>
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
