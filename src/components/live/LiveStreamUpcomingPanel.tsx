import { Calendar } from 'lucide-react'
import { LiveCountdown } from '@/components/live/LiveCountdown'
import { mediaUrl } from '@/utils/mediaUrl'

interface LiveStreamUpcomingPanelProps {
  title: string
  description?: string | null
  banner?: string | null
  scheduledStartAt?: string | null
  countdownSeconds?: number | null
  enableCountdown?: boolean
  timeZone?: string | null
  onCountdownComplete?: () => void
  badgeLabel?: string
}

export function LiveStreamUpcomingPanel({
  title,
  description,
  banner,
  scheduledStartAt,
  countdownSeconds,
  enableCountdown = true,
  timeZone,
  onCountdownComplete,
  badgeLabel = 'UPCOMING LIVE',
}: LiveStreamUpcomingPanelProps) {
  const bannerSrc = banner ? mediaUrl(banner) : ''

  return (
    <div className="live-upcoming-panel overflow-hidden border-y border-violet-100/80 shadow-lg">
      <div className="live-upcoming-banner-wrap">
        {bannerSrc ? (
          <img src={bannerSrc} alt="" className="live-upcoming-banner" />
        ) : (
          <div className="live-upcoming-banner live-upcoming-banner--placeholder" aria-hidden />
        )}
        <div className="live-upcoming-banner-shade" />

        <div className="live-upcoming-banner-content">
          <span className="live-upcoming-banner-badge">
            <Calendar className="h-3.5 w-3.5" /> {badgeLabel}
          </span>

          <h2 className="live-upcoming-title">{title}</h2>
          {description && (
            <p className="live-upcoming-summary">{description}</p>
          )}

          {enableCountdown && scheduledStartAt && (
            <LiveCountdown
              variant="overlay"
              targetIso={scheduledStartAt}
              initialSeconds={countdownSeconds}
              timeZone={timeZone}
              onComplete={onCountdownComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
