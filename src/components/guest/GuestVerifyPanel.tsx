import { Calendar, LogIn, LogOut, Phone, UserSearch, Users } from 'lucide-react'
import { AdminBadge, AdminBtn } from '@/components/admin/AdminUi'
import { AdminAvatar } from '@/components/admin/AdminStats'

export interface GuestCompanion {
  id: number
  full_name: string
  phone?: string | null
  photo_url?: string | null
  relation?: string | null
  can_entry: boolean
}

export interface GuestEntryLog {
  id: number
  person_name: string
  direction: 'in' | 'out'
  scanned_at: string
  guest_companion_id?: number | null
}

export interface GuestViewData {
  id: number
  guest_code: string
  qr_token: string
  full_name: string
  phone?: string | null
  email?: string | null
  photo_url?: string | null
  qr_data_uri?: string
  event_name: string
  event_date?: string | null
  event_date_raw?: string | null
  event_location?: string | null
  valid_from: string
  valid_from_raw?: string
  valid_until: string
  valid_until_raw?: string
  status: string
  is_scannable: boolean
  companions: GuestCompanion[]
  entry_logs: GuestEntryLog[]
  portal_login?: {
    login_id: string
    email?: string | null
    can_login: boolean
    hint: string
  }
}

interface GuestVerifyPanelProps {
  guest: GuestViewData | null
  loading?: boolean
  onEntry?: (direction: 'in' | 'out', companionId?: number) => void
}

function PersonRow({
  name,
  phone,
  photoUrl,
  subtitle,
  canEntry,
  onIn,
  onOut,
  loading,
}: {
  name: string
  phone?: string | null
  photoUrl?: string | null
  subtitle?: string
  canEntry?: boolean
  onIn?: () => void
  onOut?: () => void
  loading?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
      {photoUrl ? (
        <img src={photoUrl} alt="" className="h-12 w-12 rounded-xl object-cover border border-slate-200" />
      ) : (
        <AdminAvatar name={name} size="md" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{name}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {phone && (
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Phone className="h-3 w-3" /> {phone}
          </p>
        )}
      </div>
      {onIn && onOut && (
        <div className="flex gap-2">
          <AdminBtn
            variant="secondary"
            className="!px-2.5 !py-1.5 text-xs"
            disabled={loading || canEntry === false}
            onClick={onIn}
          >
            <LogIn className="h-3.5 w-3.5" /> IN
          </AdminBtn>
          <AdminBtn
            variant="secondary"
            className="!px-2.5 !py-1.5 text-xs !text-amber-700 hover:!bg-amber-50"
            disabled={loading}
            onClick={onOut}
          >
            <LogOut className="h-3.5 w-3.5" /> OUT
          </AdminBtn>
        </div>
      )}
    </div>
  )
}

export function GuestVerifyPanel({ guest, loading, onEntry }: GuestVerifyPanelProps) {
  if (!guest) {
    return (
      <div className="attendance-panel-card flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
          <UserSearch className="h-10 w-10" strokeWidth={1.25} />
        </div>
        <p className="max-w-sm text-sm text-slate-500 leading-relaxed">
          Guest ID scan करा — guest, event, companions आणि entry logs येथे दिसतील.
        </p>
      </div>
    )
  }

  const statusTone = guest.is_scannable ? 'success' : 'warning'

  return (
    <div className="attendance-panel-card overflow-hidden space-y-0">
      <div className="border-b border-slate-100 bg-gradient-to-r from-primary-50 to-sky-50 px-5 py-5">
        <div className="flex flex-wrap items-start gap-4">
          {guest.photo_url ? (
            <img src={guest.photo_url} alt="" className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-md" />
          ) : (
            <AdminAvatar name={guest.full_name} size="xl" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-ink">{guest.full_name}</h2>
              <AdminBadge tone={statusTone}>{guest.status}</AdminBadge>
            </div>
            <p className="text-sm font-mono text-slate-500 mt-0.5">{guest.guest_code}</p>
            <p className="text-sm text-primary-700 font-semibold mt-1">{guest.event_name}</p>
            {guest.event_date && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" /> {guest.event_date}
                {guest.event_location ? ` · ${guest.event_location}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-400">Valid From</p>
            <p className="mt-1 font-semibold text-ink">{guest.valid_from}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-400">Valid Until</p>
            <p className="mt-1 font-semibold text-ink">{guest.valid_until}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Guest Entry
          </p>
          <PersonRow
            name={guest.full_name}
            phone={guest.phone}
            photoUrl={guest.photo_url}
            subtitle="Primary guest"
            onIn={onEntry ? () => onEntry('in') : undefined}
            onOut={onEntry ? () => onEntry('out') : undefined}
            loading={loading}
          />
        </div>

        {guest.companions.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Authorized Companions</p>
            <div className="space-y-2">
              {guest.companions.map((c) => (
                <PersonRow
                  key={c.id}
                  name={c.full_name}
                  phone={c.phone}
                  photoUrl={c.photo_url}
                  subtitle={[c.relation, c.can_entry ? 'Entry allowed' : 'No entry'].filter(Boolean).join(' · ')}
                  canEntry={c.can_entry}
                  onIn={onEntry ? () => onEntry('in', c.id) : undefined}
                  onOut={onEntry ? () => onEntry('out', c.id) : undefined}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        )}

        {guest.entry_logs.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Recent IN / OUT</p>
            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {guest.entry_logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-ink">{log.person_name}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <AdminBadge tone={log.direction === 'in' ? 'success' : 'warning'}>
                      {log.direction.toUpperCase()}
                    </AdminBadge>
                    {log.scanned_at}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
