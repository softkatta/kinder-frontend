import { Navigate, useParams } from 'react-router-dom'
import { DetailLayout } from '@/components/public/DetailLayout'
import { useActivity } from '@/hooks/useCmsContent'
import { useT } from '@/i18n/LanguageContext'

export default function ActivityDetailPage() {
  const { slug } = useParams()
  const { t } = useT()
  const p = t.pages.activities
  const { item, loading } = useActivity(slug)

  if (!loading && !item) return <Navigate to="/activities" replace />
  if (!item) return <div className="section text-center text-slate-400 py-20">Loading...</div>

  return (
    <DetailLayout
      label={p.label}
      title={item.title}
      subtitle={item.summary}
      breadcrumbs={[{ label: p.label, to: '/activities' }, { label: item.title }]}
      image={item.image}
      imageAlt={item.title}
      detail={item.detail}
      highlights={item.highlights}
      backHref="/activities"
      backLabel={p.backToList}
      ctaHref="/book-tour"
      ctaLabel={t.common.bookVisit}
      heroImageKey="page_activities_image"
      heroBackgroundImage={item.image}
    />
  )
}
