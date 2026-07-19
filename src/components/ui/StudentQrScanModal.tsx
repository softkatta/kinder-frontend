import { LogIn, LogOut, User, Phone, Mail, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from './Badge'
import { Button } from './Button'

export interface QrScanStudent {
  id: number
  full_name: string
  admission_number: string
  roll_number?: string
  photo_path?: string
  dob?: string
  gender?: string
  blood_group?: string
  status?: string
  address?: string
  class?: { name: string }
  section?: { name: string }
  parent?: { full_name: string; phone?: string; email?: string; relation_to_student?: string }
  qr_code?: string
}

export interface QrScanAttendance {
  date?: string
  status?: string
  check_in_time?: string
  check_out_time?: string
}

export interface QrScanFeesSummary {
  pending_count: number
  pending_total: number
  pending_fees: { id: number; amount: number; status: string; due_date?: string; category?: string }[]
}

export interface QrScanPayment {
  id: number
  amount: number
  status: string
  payment_method?: string
  receipt_number?: string
  paid_at?: string
}

export interface QrScanResult {
  action: 'check_in' | 'check_out' | 'already_complete' | 'verified'
  message: string
  student: QrScanStudent
  attendance?: QrScanAttendance
  fees_summary?: QrScanFeesSummary
  recent_payments?: QrScanPayment[]
}

interface StudentQrScanModalProps {
  open: boolean
  result: QrScanResult | null
  onClose: () => void
  onRecordPayment?: (admissionNumber: string) => void
}

function formatTime(t?: string) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = Number(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export function StudentQrScanModal({ open, result, onClose, onRecordPayment }: StudentQrScanModalProps) {
  if (!open || !result) return null

  const { student, attendance, fees_summary, recent_payments, action, message } = result
  const initials = student.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

  const actionConfig = {
    check_in: { label: 'CHECK IN', variant: 'success' as const, icon: LogIn, color: 'bg-green-50 text-green-700 border-green-200' },
    check_out: { label: 'CHECK OUT', variant: 'warning' as const, icon: LogOut, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    already_complete: { label: 'COMPLETE', variant: 'default' as const, icon: CheckCircle2, color: 'bg-slate-50 text-slate-600 border-slate-200' },
    verified: { label: 'VERIFIED', variant: 'default' as const, icon: CheckCircle2, color: 'bg-slate-50 text-slate-600 border-slate-200' },
  }[action]

  const ActionIcon = actionConfig.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-6 py-4 border-b flex items-center gap-3 ${actionConfig.color}`}>
          <ActionIcon className="h-6 w-6 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm tracking-wide">{actionConfig.label}</p>
            <p className="text-xs opacity-80 truncate">{message}</p>
          </div>
          <Badge variant={actionConfig.variant}>{student.status || 'active'}</Badge>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-slate-900">{student.full_name}</h2>
              <p className="text-sm font-mono text-slate-500">{student.admission_number}</p>
              <p className="text-sm text-slate-600 mt-1">
                {student.class?.name}{student.section?.name ? ` — ${student.section.name}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400 mb-1">DOB</p>
              <p className="font-semibold">{student.dob || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400 mb-1">Blood Group</p>
              <p className="font-semibold">{student.blood_group || '—'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> IN</p>
              <p className="font-semibold text-green-700">{formatTime(attendance?.check_in_time)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> OUT</p>
              <p className="font-semibold text-amber-700">{formatTime(attendance?.check_out_time)}</p>
            </div>
          </div>

          {student.parent && (
            <div className="p-4 rounded-xl border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <User className="h-3 w-3" /> Parent / Guardian
              </p>
              <p className="font-semibold">{student.parent.full_name}</p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                {student.parent.phone && (
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{student.parent.phone}</span>
                )}
                {student.parent.email && (
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{student.parent.email}</span>
                )}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-3">
              <CreditCard className="h-3 w-3" /> Fee Status
            </p>
            {fees_summary && fees_summary.pending_count > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-amber-700">
                    ₹{fees_summary.pending_total.toLocaleString('en-IN')} pending ({fees_summary.pending_count} fee{fees_summary.pending_count > 1 ? 's' : ''})
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm">
                  {fees_summary.pending_fees.slice(0, 4).map((f) => (
                    <li key={f.id} className="flex justify-between text-slate-600">
                      <span>{f.category || 'Fee'}{f.due_date ? ` · due ${f.due_date}` : ''}</span>
                      <span className="font-semibold">₹{f.amount.toLocaleString('en-IN')}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> No pending fees
              </p>
            )}
          </div>

          {recent_payments && recent_payments.length > 0 && (
            <div className="text-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Recent Payments</p>
              <ul className="space-y-1 text-slate-600">
                {recent_payments.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.receipt_number || p.payment_method} · {p.status}</span>
                    <span className="font-semibold">₹{p.amount.toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex gap-3">
          {onRecordPayment && fees_summary && fees_summary.pending_count > 0 && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => { onRecordPayment(student.admission_number); onClose() }}
            >
              Record Payment
            </Button>
          )}
          <Button variant="secondary" className="flex-1" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
