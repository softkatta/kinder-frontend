import { Navigate, useParams } from 'react-router-dom'
import { DetailLayout } from '@/components/public/DetailLayout'
import { useProgram } from '@/hooks/useCmsContent'
import { useT } from '@/i18n/LanguageContext'
import { getProgramPrices, programPricesToMeta } from '@/utils/programPricing'

export default function ProgramDetailPage() {
  const { slug } = useParams()
  const { t, locale } = useT()
  const p = t.pages.programs
  const { item, loading } = useProgram(slug)

  if (!loading && !item) return <Navigate to="/programs" replace />
  if (!item) return <div className="section text-center text-slate-400 py-20">Loading...</div>

  const level = item.meta?.grade_level || item.slug
  const prices = getProgramPrices(item.meta as Record<string, unknown>, level, locale)
  const feeLabels = { monthly: p.feeMonthly, sixMonth: p.fee6Month, yearly: p.feeYearly }
  const feeMeta = programPricesToMeta(prices, feeLabels)

  const meta = item.meta?.ages || item.meta?.time || feeMeta.length
    ? [
        item.meta?.ages ? { label: p.ageLabel, value: item.meta.ages } : null,
        item.meta?.time ? { label: p.timeLabel, value: item.meta.time } : null,
        ...feeMeta,
      ].filter((m): m is { label: string; value: string } => Boolean(m))
    : undefined

  return (
    <DetailLayout
      label={p.label}
      title={item.title}
      subtitle={item.summary}
      breadcrumbs={[{ label: p.label, to: '/programs' }, { label: item.title }]}
      image={item.image}
      imageAlt={item.title}
      detail={item.detail}
      highlights={item.highlights}
      meta={meta}
      backHref="/programs"
      backLabel={p.backToList}
      heroImageKey="page_programs_image"
      heroBackgroundImage={item.image}
    />
  )
}
