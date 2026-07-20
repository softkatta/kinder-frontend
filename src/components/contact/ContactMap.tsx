import { ExternalLink, MapPin, Navigation } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ContactMapProps {
  address: string
  schoolName: string
  mapLabel: string
  openMapsLabel: string
  /** Optional CMS / profile override: full Google/OSM embed URL */
  mapEmbedUrl?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  /** Compact footer / sidebar embed */
  compact?: boolean
  className?: string
}

function buildEmbedSrc({
  address,
  mapEmbedUrl,
  latitude,
  longitude,
}: Pick<ContactMapProps, 'address' | 'mapEmbedUrl' | 'latitude' | 'longitude'>): string {
  if (mapEmbedUrl && /^https?:\/\//i.test(mapEmbedUrl)) {
    return mapEmbedUrl
  }

  const lat = latitude != null && latitude !== '' ? Number(latitude) : NaN
  const lng = longitude != null && longitude !== '' ? Number(longitude) : NaN
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const delta = 0.02
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`
  }

  const query = encodeURIComponent(address || 'India')
  return `https://maps.google.com/maps?q=${query}&z=15&output=embed`
}

function buildOpenMapsHref({
  address,
  latitude,
  longitude,
}: Pick<ContactMapProps, 'address' | 'latitude' | 'longitude'>): string {
  const lat = latitude != null && latitude !== '' ? Number(latitude) : NaN
  const lng = longitude != null && longitude !== '' ? Number(longitude) : NaN
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps?q=${lat},${lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`
}

export function ContactMap({
  address,
  schoolName,
  mapLabel,
  openMapsLabel,
  mapEmbedUrl,
  latitude,
  longitude,
  compact = false,
  className,
}: ContactMapProps) {
  const embedSrc = buildEmbedSrc({ address, mapEmbedUrl, latitude, longitude })
  const openHref = buildOpenMapsHref({ address, latitude, longitude })

  return (
    <div className={cn('contact-map', compact && 'contact-map--compact', className)}>
      <div className="contact-map-frame">
        <iframe
          title={`${schoolName} map`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="contact-map-iframe"
        />
        <div className="contact-map-glow" aria-hidden />
      </div>

      <div className="contact-map-bar">
        <div className="contact-map-pin">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="contact-map-label">{mapLabel}</p>
          <p className="contact-map-address">{address || schoolName}</p>
        </div>
        <a
          href={openHref}
          target="_blank"
          rel="noreferrer"
          className="contact-map-open"
        >
          <Navigation className="h-4 w-4" />
          <span>{openMapsLabel}</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </a>
      </div>
    </div>
  )
}
