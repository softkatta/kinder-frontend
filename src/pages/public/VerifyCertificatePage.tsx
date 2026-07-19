import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react'
import { publicApi } from '@/api/services'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { KidschollSection } from '@/components/design/KidschollSection'
import { FadeIn } from '@/components/ui/Motion'

interface VerifyData {
  valid: boolean
  certificate_number: string
  student_name: string
  class_name?: string
  roll_number?: string
  academic_year?: string
  school_name?: string
  school_address?: string
  status?: string
  exam_name?: string
  grade?: string
  result_status?: string
  verified_at?: string
}

export default function VerifyCertificatePage() {
  const { certNumber } = useParams<{ certNumber: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<VerifyData | null>(null)

  useEffect(() => {
    if (!certNumber) {
      setError('Invalid certificate link.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    publicApi.verifyCertificate(certNumber)
      .then((res) => setData(res.data.data as VerifyData))
      .catch(() => setError('Certificate not found or invalid.'))
      .finally(() => setLoading(false))
  }, [certNumber])

  const isActive = data?.status === 'active'

  return (
    <div>
      <PublicPageHero
        imageKey="page_about_image"
        label="Certificate Verification"
        title="Verify Certificate"
        subtitle="Check authenticity of school certificates issued by our kindergarten."
      />

      <section className="section bg-[#FFF8F0] pb-20">
        <div className="mx-auto max-w-2xl px-4">
          <KidschollSection label="Verification" title="Certificate Details" />

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2 className="h-10 w-10 animate-spin text-violet-500 mb-4" />
              <p>Verifying certificate…</p>
            </div>
          )}

          {!loading && error && (
            <FadeIn>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="font-display text-xl font-bold text-red-800 mb-2">Not Verified</h2>
                <p className="text-red-700">{error}</p>
                <p className="text-sm text-red-600 mt-4 font-mono">{certNumber}</p>
              </div>
            </FadeIn>
          )}

          {!loading && data && (
            <FadeIn>
              <div className={`rounded-2xl border p-8 shadow-sm ${isActive ? 'border-emerald-200 bg-white' : 'border-amber-200 bg-amber-50'}`}>
                <div className="flex items-center gap-3 mb-6">
                  {isActive ? (
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 shrink-0" />
                  ) : (
                    <ShieldAlert className="h-10 w-10 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink">
                      {isActive ? 'Valid Certificate' : 'Certificate Found — Inactive Record'}
                    </h2>
                    <p className="text-sm text-slate-500 font-mono">{data.certificate_number}</p>
                  </div>
                </div>

                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Student Name" value={data.student_name} />
                  <Field label="Class" value={data.class_name} />
                  <Field label="Roll Number" value={data.roll_number} />
                  <Field label="Academic Year" value={data.academic_year} />
                  <Field label="School" value={data.school_name} className="sm:col-span-2" />
                  {data.exam_name && <Field label="Exam" value={data.exam_name} />}
                  {data.grade && <Field label="Grade" value={data.grade} />}
                  {data.result_status && <Field label="Result" value={data.result_status.toUpperCase()} />}
                </dl>

                {data.school_address && (
                  <p className="mt-6 text-sm text-slate-500 border-t border-slate-100 pt-4">{data.school_address}</p>
                )}

                <div className="mt-6 flex items-center gap-2 text-sm text-emerald-700">
                  <Award className="h-4 w-4" />
                  Verified on {data.verified_at ? new Date(data.verified_at).toLocaleString() : '—'}
                </div>
              </div>
            </FadeIn>
          )}

          <p className="text-center mt-8 text-sm text-slate-500">
            <Link to="/" className="text-violet-600 hover:underline">← Back to home</Link>
          </p>
        </div>
      </section>
    </div>
  )
}

function Field({ label, value, className = '' }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value || '—'}</dd>
    </div>
  )
}
