import { Link, useLocation } from 'react-router-dom'
import { Radio, Calendar } from 'lucide-react'
import { usePublicLiveStatus } from '@/hooks/usePublicLiveStream'
import { useT } from '@/i18n/LanguageContext'
import { unlockLiveSound } from '@/utils/liveSoundUnlock'

type BannerVariant = 'bar' | 'inline'

export function PublicLiveBanner({ variant = 'bar' }: { variant?: BannerVariant }) {
  const status = usePublicLiveStatus()
  const { t } = useT()
  const { pathname } = useLocation()

  if (status === 'off') return null

  const isLive = status === 'live'
  const isPaused = status === 'paused'
  const onLivePage = pathname === '/live' || pathname.startsWith('/live/')

  const label = isLive
    ? t.pages.live.bannerCta
    : isPaused
      ? 'Live paused — tap to wait'
      : 'Upcoming Live — View Countdown'

  const toneClass = isLive
    ? 'from-rose-600 via-rose-500 to-orange-500 hover:from-rose-700 hover:to-orange-600'
    : isPaused
      ? 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
      : 'from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'

  const content = (
    <>
      {isLive ? (
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
      ) : null}
      {isLive || isPaused ? <Radio className="h-4 w-4 shrink-0" /> : <Calendar className="h-4 w-4 shrink-0" />}
      <span>{label}</span>
    </>
  )

  const sharedClass =
    variant === 'inline'
      ? `public-live-inline-notice bg-gradient-to-r ${toneClass}`
      : `flex items-center justify-center gap-2 text-white text-sm font-bold py-2.5 px-4 transition-colors bg-gradient-to-r ${toneClass}`

  // Already on /live — show status chip, no navigation.
  if (onLivePage) {
    return (
      <div className={sharedClass} role="status">
        {content}
      </div>
    )
  }

  return (
    <Link
      to="/live"
      onClick={() => unlockLiveSound()}
      className={sharedClass}
    >
      {content}
    </Link>
  )
}
