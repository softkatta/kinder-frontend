import { useMemo } from 'react'
import { Link } from 'react-router-dom'

/** Seconds each notice stays in view during the loop */
const SECONDS_PER_NOTICE = 4

export interface HeroNoticeItem {
  id?: number
  title: string
  link_url?: string
  meta?: { link_url?: string }
}

interface HeroNoticeStripProps {
  notices: HeroNoticeItem[]
  fallback: string
}

function noticeLink(notice: HeroNoticeItem): string | undefined {
  return notice.link_url?.trim() || notice.meta?.link_url?.trim() || undefined
}

function NoticeText({ notice }: { notice: HeroNoticeItem }) {
  const href = noticeLink(notice)
  if (!href) return <>{notice.title}</>
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={href} className="home-hero-admission-link">
        {notice.title}
      </a>
    )
  }
  return (
    <Link to={href} className="home-hero-admission-link">
      {notice.title}
    </Link>
  )
}

export function HeroNoticeStrip({ notices, fallback }: HeroNoticeStripProps) {
  const items = useMemo(
    () => (notices.length > 0 ? notices : [{ title: fallback }]),
    [notices, fallback],
  )

  const loop = useMemo(() => [...items, ...items], [items])
  const durationSec = items.length * SECONDS_PER_NOTICE

  if (items.length <= 1) {
    return (
      <div className="home-hero-admission" aria-live="polite">
        <div className="home-hero-admission-viewport">
          <div className="home-hero-admission-line">
            <NoticeText notice={items[0]!} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-hero-admission" aria-live="polite">
      <div className="home-hero-admission-viewport">
        <div
          className="home-hero-admission-track home-hero-admission-track--loop"
          style={{ animationDuration: `${durationSec}s` }}
        >
          {loop.map((notice, i) => (
            <div
              key={`${notice.id ?? notice.title}-${i}`}
              className="home-hero-admission-line"
            >
              <NoticeText notice={notice} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
