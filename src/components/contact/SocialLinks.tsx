import { cn } from '@/utils/cn'

export type SocialLinksData = {
  facebook_url?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  twitter_url?: string | null
  linkedin_url?: string | null
}

function IconWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      {children}
    </svg>
  )
}

const ICONS = {
  facebook: (className?: string) => (
    <IconWrap className={className}>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.4V9.41c0-2.37 1.41-3.68 3.56-3.68 1.03 0 2.11.18 2.11.18v2.32h-1.19c-1.17 0-1.54.73-1.54 1.48v1.78h2.62l-.42 2.9h-2.2V22c4.78-.75 8.44-4.91 8.44-9.93z" />
    </IconWrap>
  ),
  instagram: (className?: string) => (
    <IconWrap className={className}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.76.07-2.25.1-3.3 1.15-3.4 3.4-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.1 2.24 1.15 3.3 3.4 3.4 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c2.24-.1 3.3-1.16 3.4-3.4.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.1-2.25-1.16-3.3-3.4-3.4-1.24-.06-1.61-.07-4.76-.07zm0 3.06a4.98 4.98 0 1 1 0 9.96 4.98 4.98 0 0 1 0-9.96zm0 8.16a3.18 3.18 0 1 0 0-6.36 3.18 3.18 0 0 0 0 6.36zm6.24-8.4a1.16 1.16 0 1 1-2.32 0 1.16 1.16 0 0 1 2.32 0z" />
    </IconWrap>
  ),
  youtube: (className?: string) => (
    <IconWrap className={className}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </IconWrap>
  ),
  twitter: (className?: string) => (
    <IconWrap className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </IconWrap>
  ),
  linkedin: (className?: string) => (
    <IconWrap className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </IconWrap>
  ),
}

const NETWORKS: Array<{
  key: keyof SocialLinksData
  label: string
  icon: keyof typeof ICONS
}> = [
  { key: 'facebook_url', label: 'Facebook', icon: 'facebook' },
  { key: 'instagram_url', label: 'Instagram', icon: 'instagram' },
  { key: 'youtube_url', label: 'YouTube', icon: 'youtube' },
  { key: 'twitter_url', label: 'X', icon: 'twitter' },
  { key: 'linkedin_url', label: 'LinkedIn', icon: 'linkedin' },
]

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

interface SocialLinksProps {
  links: SocialLinksData
  className?: string
  linkClassName?: string
  label?: string
}

export function SocialLinks({ links, className, linkClassName, label }: SocialLinksProps) {
  const items = NETWORKS.flatMap((n) => {
    const href = normalizeUrl(String(links[n.key] || ''))
    return href ? [{ ...n, href }] : []
  })

  if (items.length === 0) return null

  return (
    <div className={cn('social-links', className)}>
      {label ? <p className="social-links-label">{label}</p> : null}
      <div className="social-links-row">
        {items.map(({ key, label: networkLabel, icon, href }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={networkLabel}
            title={networkLabel}
            className={cn('social-links-btn', linkClassName)}
          >
            {ICONS[icon]('h-4 w-4')}
          </a>
        ))}
      </div>
    </div>
  )
}
