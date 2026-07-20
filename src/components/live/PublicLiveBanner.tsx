import { Link } from 'react-router-dom'
import { Radio, Calendar } from 'lucide-react'
import { usePublicLiveStatus } from '@/hooks/usePublicLiveStream'
import { useT } from '@/i18n/LanguageContext'

export function PublicLiveBanner() {
  const status = usePublicLiveStatus()
  const { t } = useT()

  if (status === 'off') return null

  const isLive = status === 'live'
  const isPaused = status === 'paused'

  return (
    <Link
      to="/live"
      className={`flex items-center justify-center gap-2 text-white text-sm font-bold py-2.5 px-4 transition-colors ${
        isLive
          ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 hover:from-rose-700 hover:to-orange-600'
          : isPaused
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
      }`}
    >
      {isLive ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <Radio className="h-4 w-4" />
          {t.pages.live.bannerCta}
        </>
      ) : isPaused ? (
        <>
          <Radio className="h-4 w-4" />
          Live paused — tap to wait
        </>
      ) : (
        <>
          <Calendar className="h-4 w-4" />
          Upcoming Live — View Countdown
        </>
      )}
    </Link>
  )
}
