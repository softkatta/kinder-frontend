import { UserSearch, Phone, Calendar, Droplets, GraduationCap, LogIn, LogOut, ScanLine } from 'lucide-react'
import { AdminBadge } from '@/components/admin/AdminUi'
import { AdminAvatar } from '@/components/admin/AdminStats'
import type { IdCardViewData } from '@/components/idcards/idCardTheme'

interface StudentVerifyProfileProps {
  card: IdCardViewData | null
}

function Field({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: typeof Phone }) {
  if (!value) return null
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}{label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}

export function StudentVerifyProfile({ card }: StudentVerifyProfileProps) {
  if (!card) {
    return (
      <div className="attendance-panel-card flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
          <UserSearch className="h-10 w-10" strokeWidth={1.25} />
        </div>
        <p className="max-w-sm text-sm text-slate-500 leading-relaxed">
          Scan a student ID card QR. Photo, class, admission, expiry, attendance — full profile appears here.
        </p>
      </div>
    )
  }

  const m = card.meta ?? {}

  return (
    <div className="attendance-panel-card overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-r from-primary-50 to-sky-50 px-5 py-5">
        <div className="flex flex-wrap items-start gap-4">
          {card.photo_url ? (
            <img src={card.photo_url} alt="" className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-md" />
          ) : (
            <AdminAvatar name={card.full_name} size="xl" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-ink">{card.full_name}</h2>
              <AdminBadge tone={card.status === 'active' ? 'success' : 'warning'}>{card.status}</AdminBadge>
            </div>
            <p className="text-sm font-mono text-slate-500 mt-0.5">{card.card_number}</p>
            <p className="text-sm text-primary-700 font-semibold mt-1">
              {[m.class_name, m.section_name].filter(Boolean).join(' · ') || 'Student'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 grid sm:grid-cols-2 gap-3">
        <Field label="Admission No." value={m.admission_number} icon={GraduationCap} />
        <Field label="Roll Number" value={m.roll_number} />
        <Field label="Parent / Guardian" value={m.parent_name} />
        <Field label="Parent Phone" value={m.parent_phone} icon={Phone} />
        <Field label="Blood Group" value={card.blood_group ?? undefined} icon={Droplets} />
        <Field label="Academic Year" value={card.academic_year} />
        <Field label="Valid Until" value={card.expiry_date} icon={Calendar} />
        <Field label="Emergency" value={card.emergency_contact} icon={Phone} />
      </div>

      <div className="mx-5 mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
        <p className="text-xs font-bold uppercase text-slate-400 mb-2">Card Validity</p>
        <p className="text-sm text-slate-600">{card.validity_label}</p>
        <p className="text-xs text-slate-400 mt-2">Issued {card.issue_date}</p>
      </div>
    </div>
  )
}

export interface ScanResultData {
  name: string
  subtitle?: string
  action: string
  message?: string
  checkIn?: string
  checkOut?: string
}

export function ScanResultPanel({ result }: { result: ScanResultData | null }) {
  if (!result) {
    return (
      <div className="attendance-panel-card flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-300">
          <ScanLine className="h-8 w-8" />
        </div>
        <p className="text-sm font-medium text-slate-600">Scan result will appear here</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><LogIn className="h-3.5 w-3.5 text-emerald-500" /> Check-in</span>
          <span className="flex items-center gap-1"><LogOut className="h-3.5 w-3.5 text-amber-500" /> Check-out</span>
        </div>
      </div>
    )
  }

  const actionMap: Record<string, { label: string; tone: 'success' | 'warning' | 'info' | 'neutral' }> = {
    check_in: { label: 'Check-in', tone: 'success' },
    check_out: { label: 'Check-out', tone: 'warning' },
    verified: { label: 'Verified', tone: 'info' },
    already_complete: { label: 'Complete', tone: 'neutral' },
  }
  const action = actionMap[result.action] ?? { label: result.action, tone: 'info' as const }

  return (
    <div className="attendance-panel-card p-6 space-y-4">
      <div>
        <AdminBadge tone={action.tone}>{action.label}</AdminBadge>
        <h2 className="mt-2 font-display text-xl font-bold text-ink">{result.name}</h2>
        {result.subtitle && <p className="text-sm text-slate-500">{result.subtitle}</p>}
      </div>
      {result.message && <p className="text-sm text-slate-600 rounded-xl bg-slate-50 p-3">{result.message}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1"><LogIn className="h-3 w-3" /> Check-in</p>
          <p className="mt-1 font-semibold text-ink">{result.checkIn ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
          <p className="text-[10px] font-bold uppercase text-amber-600 flex items-center gap-1"><LogOut className="h-3 w-3" /> Check-out</p>
          <p className="mt-1 font-semibold text-ink">{result.checkOut ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
