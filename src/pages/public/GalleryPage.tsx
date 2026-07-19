import { useEffect, useState } from 'react'
import { fetchLocalizedPublic } from '@/hooks/useCmsContent'
import { publicApi } from '@/api/services'
import { Image, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { FadeIn } from '@/components/ui/Motion'
import { mediaUrl } from '@/utils/mediaUrl'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'

interface GalleryItem { id: number; title?: string; image?: string; media_path?: string; caption?: string; album?: string }

function galleryImage(item: GalleryItem): string {
  return mediaUrl(item.image || item.media_path || '')
}

export default function GalleryPage() {
  const { t, locale } = useT()
  const p = t.pages.gallery
  const [albums, setAlbums] = useState<Record<string, unknown>[]>([])
  const [filter, setFilter] = useState('all')
  const [lightbox, setLightbox] = useState<{ item: GalleryItem } | null>(null)

  useEffect(() => {
    fetchLocalizedPublic((loc) => publicApi.gallery(loc), locale)
      .then((data) => setAlbums((data as Record<string, unknown>[]) || []))
      .catch(() => {})
  }, [locale])

  const items: GalleryItem[] = albums.flatMap((album) => {
    const albumItems = (album.items as GalleryItem[]) || []
    if (albumItems.length) {
      return albumItems.map((item) => ({
        ...item,
        image: item.image || (item as { media_path?: string }).media_path,
        album: (album.name as string) || (album.title as string) || 'Gallery',
      }))
    }
    const row = album as { id?: number; name?: string; title?: string; image?: string }
    return [{
      id: row.id as number,
      title: row.title || row.name,
      album: row.name || row.title || 'Gallery',
      image: row.image,
    }]
  })

  const categories = ['all', ...new Set(items.map((i) => i.album).filter(Boolean) as string[])]
  const filtered = filter === 'all' ? items : items.filter((i) => i.album === filter)
  const hasImage = (item: GalleryItem) => Boolean(galleryImage(item))

  const navigateLightbox = (dir: 1 | -1) => {
    if (!lightbox) return
    const withMedia = filtered.filter(hasImage)
    const idx = withMedia.findIndex((i) => i.id === lightbox.item.id)
    const next = (idx + dir + withMedia.length) % withMedia.length
    setLightbox({ item: withMedia[next] })
  }

  return (
    <div>
      <PublicPageHero imageKey="page_gallery_image" label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="gallery" />
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button key={cat} type="button" onClick={() => setFilter(cat)} className={`kidscholl-filter-pill ${filter === cat ? 'active' : ''}`}>
                {cat === 'all' ? t.common.allPhotos : cat}
              </button>
            ))}
          </div>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((item, i) => (
              <FadeIn key={`${item.id}-${i}`} delay={i * 0.03}>
                <button type="button" onClick={() => hasImage(item) && setLightbox({ item })} className="break-inside-avoid w-full rounded-2xl overflow-hidden bg-white shadow-md group cursor-pointer text-left border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all">
                  <div className={`relative overflow-hidden ${i % 3 === 0 ? 'h-64' : 'h-48'}`}>
                    {hasImage(item) ? (
                      <img src={galleryImage(item)} alt={item.title || 'Gallery'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-200 to-orange-100 flex items-center justify-center">
                        <Image className="h-10 w-10 text-violet-400/60" />
                      </div>
                    )}
                  </div>
                  {(item.title || item.album) && (
                    <div className="p-3">
                      <p className="font-display font-bold text-sm text-ink">{item.title || item.album}</p>
                    </div>
                  )}
                </button>
              </FadeIn>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center text-slate-400 py-12">{t.common.emptyGallery}</p>}
        </div>
      </section>
      {lightbox && hasImage(lightbox.item) && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button type="button" className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white" onClick={() => setLightbox(null)}><X className="h-6 w-6" /></button>
          <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1) }}><ChevronLeft className="h-6 w-6" /></button>
          <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 text-white" onClick={(e) => { e.stopPropagation(); navigateLightbox(1) }}><ChevronRight className="h-6 w-6" /></button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={galleryImage(lightbox.item)} alt={lightbox.item.title || 'Gallery'} className="w-full rounded-2xl max-h-[80vh] object-contain" />
            <p className="text-white text-center mt-4 font-display font-bold">{lightbox.item.title || lightbox.item.album}</p>
          </div>
        </div>
      )}
    </div>
  )
}
