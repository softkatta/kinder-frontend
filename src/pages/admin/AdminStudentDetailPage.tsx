import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, IdCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBadge, AdminBtn, AdminRecordFields } from '@/components/admin/AdminUi'
import { AdminAvatar } from '@/components/admin/AdminStats'
import { idCardApi, paymentApi } from '@/api/services'
import { mediaUrl } from '@/utils/mediaUrl'

interface CardDetail {
  id: number
  full_name: string
  card_number: string
  status: string
  photo_path?: string | null
  photo_url?: string | null
  blood_group?: string | null
  academic_year?: string | null
  emergency_contact?: string | null
  meta?: Record<string, string> | null
  issue_date?: string
  expiry_date?: string
}

interface FeeSummary {
  fee_total?: number
  fee_paid?: number
  fee_balance?: number
  verified_total?: number
  pending_total?: number
  assigned_fees?: { title: string; balance: number; status: string }[]
}

interface TimelinePayment {
  id: number
  payer_name?: string | null
  amount: number
  amount_label: string
  payment_method: string
  method_label: string
  status: string
  status_label: string
  date: string
}

export default function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [card, setCard] = useState<CardDetail | null>(null)
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null)
  const [timeline, setTimeline] = useState<TimelinePayment[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [cardRes, feeRes, timelineRes] = await Promise.all([
        idCardApi.get(Number(id)),
        paymentApi.studentSummary(Number(id)),
        paymentApi.studentTimeline(Number(id)),
      ])
      setCard(cardRes.data.data as CardDetail)
      setFeeSummary(feeRes.data.data as FeeSummary)
      setTimeline((timelineRes.data.data as TimelinePayment[]) ?? [])
    } catch {
      toast.error('Student not found')
      setCard(null)
      setFeeSummary(null)
      setTimeline([])
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void load() }, [load])

  const meta = card?.meta ?? {}
  const photo = card?.photo_url || (card?.photo_path ? mediaUrl(card.photo_path) : '')

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={card?.full_name ?? 'Student profile'}
        subtitle="Student ID card and admission details"
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Students', to: '/admin/students' },
          { label: card?.full_name ?? 'Profile' },
        ]}
        actions={
          <AdminBtn variant="secondary" to="/admin/students">
            <ArrowLeft className="h-4 w-4" /> Back
          </AdminBtn>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : !card ? (
        <AdminPanel><p className="p-5 text-sm text-slate-500">Student record not found.</p></AdminPanel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <AdminPanel noPadding>
            <div className="p-6 text-center">
              {photo ? (
                <img src={photo} alt={card.full_name} className="mx-auto h-40 w-40 rounded-2xl object-cover border border-slate-100" />
              ) : (
                <AdminAvatar name={card.full_name} size="lg" className="mx-auto h-40 w-40 text-3xl" />
              )}
              <h2 className="font-display text-xl font-bold text-ink mt-4">{card.full_name}</h2>
              <p className="text-sm text-slate-500 font-mono">{card.card_number}</p>
              <div className="mt-3">
                <AdminBadge tone={card.status === 'active' ? 'success' : 'neutral'}>{card.status}</AdminBadge>
              </div>
              <AdminBtn variant="primary" className="mt-5 w-full justify-center" to="/admin/id-cards">
                <IdCard className="h-4 w-4" /> Open ID Cards
              </AdminBtn>
            </div>
          </AdminPanel>

          <div className="space-y-6">
          {feeSummary && (
            <AdminPanel title="Fees & payments">
              <div className="grid gap-4 sm:grid-cols-3 mb-4">
                <div className="rounded-xl bg-violet-50 p-4">
                  <p className="text-xs text-slate-500">Fee assigned</p>
                  <p className="font-bold text-ink">₹{Number(feeSummary.fee_total ?? 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs text-slate-500">Fee paid</p>
                  <p className="font-bold text-ink">₹{Number(feeSummary.fee_paid ?? 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs text-slate-500">Balance</p>
                  <p className="font-bold text-ink">₹{Number(feeSummary.fee_balance ?? 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              {(feeSummary.assigned_fees ?? []).length > 0 && (
                <ul className="divide-y divide-slate-100 text-sm">
                  {feeSummary.assigned_fees!.map((f, i) => (
                    <li key={i} className="flex justify-between py-2">
                      <span>{f.title}</span>
                      <span className="flex items-center gap-2">
                        <AdminBadge tone={f.status === 'paid' ? 'success' : 'warning'}>{f.status}</AdminBadge>
                        ₹{Number(f.balance).toLocaleString('en-IN')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <AdminBtn variant="secondary" className="mt-4" to="/admin/payments">
                View all payments
              </AdminBtn>
            </AdminPanel>
          )}

          {timeline.length > 0 && (
            <AdminPanel title="Payment history">
              <ul className="divide-y divide-slate-100 text-sm">
                {timeline.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="font-semibold text-ink">{p.amount_label}</p>
                      <p className="text-xs text-slate-500">
                        {p.date} · {p.method_label} · {p.payer_name ?? '—'}
                      </p>
                    </div>
                    <AdminBadge tone={p.status === 'verified' ? 'success' : p.status === 'pending' ? 'warning' : 'neutral'}>
                      {p.status_label}
                    </AdminBadge>
                  </li>
                ))}
              </ul>
            </AdminPanel>
          )}

          <AdminPanel>
            <AdminRecordFields
              fields={[
                { label: 'Class', value: meta.class_name ?? meta.class ?? '—' },
                { label: 'Section', value: meta.section_name ?? '—' },
                { label: 'Admission No.', value: meta.admission_number ?? card.card_number },
                { label: 'Roll No.', value: meta.roll_number ?? '—' },
                { label: 'Academic Year', value: card.academic_year ?? '—' },
                { label: 'Blood Group', value: card.blood_group ?? '—' },
                { label: 'Parent Name', value: meta.parent_name ?? '—' },
                { label: 'Parent Email', value: meta.parent_email ?? '—' },
                { label: 'Parent Phone', value: meta.parent_phone ?? card.emergency_contact ?? '—' },
                { label: 'Emergency Contact', value: card.emergency_contact ?? '—' },
                { label: 'Issue Date', value: card.issue_date ?? '—' },
                { label: 'Expiry Date', value: card.expiry_date ?? '—' },
                { label: 'Date of Birth', value: meta.dob ?? '—' },
                { label: 'Gender', value: meta.gender ?? '—' },
              ]}
            />
            {meta.admission_id && (
              <p className="mt-4 text-sm text-slate-500">
                From admission #{meta.admission_id} —{' '}
                <Link to="/admin/admissions" className="font-semibold text-violet-600 hover:text-orange-500">view applications</Link>
              </p>
            )}
          </AdminPanel>
          </div>
        </div>
      )}
    </AdminPageShell>
  )
}
