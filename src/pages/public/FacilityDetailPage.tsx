import { Navigate, useParams } from 'react-router-dom'
import { DetailLayout } from '@/components/public/DetailLayout'
import { useFacility } from '@/hooks/useCmsContent'
import { useT } from '@/i18n/LanguageContext'

export default function FacilityDetailPage() {
  const { slug } = useParams()
  const { t } = useT()
  const p = t.pages.facilities
  const item = useFacility(slug)

  if (!item.loading && !item.item) return <Navigate to="/facilities" replace />
  if (!item.item) return <div className="section text-center text-slate-400 py-20">Loading...</div>
  const facility = item.item

  return (
    <DetailLayout
      label={p.label}
      title={facility.title}
      subtitle={facility.summary}
      breadcrumbs={[{ label: p.label, to: '/facilities' }, { label: facility.title }]}
      image={facility.image}
      imageAlt={facility.title}
      detail={facility.detail}
      highlights={facility.highlights}
      backHref="/facilities"
      backLabel={p.backToList}
      ctaHref="/book-tour"
      ctaLabel={t.common.bookVisit}
      heroImageKey="page_facilities_image"
      heroBackgroundImage={facility.image}
    />
  )
}
