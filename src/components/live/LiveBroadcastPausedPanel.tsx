/** Full-screen paused state — no iframes/videos mounted. */
export function LiveBroadcastPausedPanel({
  title,
  className = '',
}: {
  title?: string
  className?: string
}) {
  return (
    <div
      className={`live-player live-player--immersive live-player--landscape is-paused ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <span className="live-player-live-badge live-player-live-badge--paused">Paused</span>
      <div className="live-player-pause-overlay">
        <span className="live-player-badge live-player-badge--paused">Paused</span>
        {title ? <p className="font-display font-bold text-white text-lg mt-3">{title}</p> : null}
        <p className="text-white/85 text-sm mt-1">The broadcast is paused. Please wait…</p>
      </div>
    </div>
  )
}

export function isLiveBroadcastPaused(status?: string | null, displayStatus?: string | null): boolean {
  return status === 'paused' || displayStatus === 'paused'
}
