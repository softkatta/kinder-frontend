import { useCallback, useEffect, useState } from 'react'
import { Eye, Pencil, Plus, Trash2, UserPlus, Ticket, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import { FormSection, FormGrid } from '@/components/ui/Form'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  AdminPageHeader, AdminPageShell, AdminBtn, AdminBadge, AdminTableActions, AdminModal, AdminRecordFields,
} from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { AdminAvatar } from '@/components/admin/AdminStats'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { guestApi } from '@/api/services'
import { useTableBulkDelete } from '@/hooks/useTableBulkDelete'
import type { GuestViewData } from '@/components/guest/GuestVerifyPanel'

interface GuestRow {
  id: number
  guest_code: string
  full_name: string
  phone?: string | null
  event_name: string
  event_date?: string | null
  valid_until: string
  status: string
  companions_count?: number
}

interface CompanionForm {
  full_name: string
  phone: string
  photo_path: string
  relation: string
  can_entry: boolean
}

const emptyForm = {
  full_name: '',
  phone: '',
  email: '',
  photo_path: '',
  event_name: '',
  event_date: '',
  event_location: '',
  valid_from: new Date().toISOString().slice(0, 10),
  valid_until: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  status: 'active',
  notes: '',
  portal_password: '',
}

const emptyCompanion = (): CompanionForm => ({
  full_name: '',
  phone: '',
  photo_path: '',
  relation: '',
  can_entry: true,
})

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewGuest, setViewGuest] = useState<GuestViewData | null>(null)
  const [editing, setEditing] = useState<GuestRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [companions, setCompanions] = useState<CompanionForm[]>([emptyCompanion()])
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await guestApi.list()
      setGuests(res.data.data ?? [])
    } catch {
      toast.error('Failed to load guests')
      setGuests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setCompanions([emptyCompanion()])
    setModalOpen(true)
  }

  const openEdit = async (row: GuestRow) => {
    try {
      const res = await guestApi.get(row.id)
      const g = res.data.data as GuestViewData
      setEditing(row)
      setForm({
        full_name: g.full_name,
        phone: g.phone ?? '',
        email: g.email ?? '',
        photo_path: g.photo_url ?? '',
        event_name: g.event_name,
        event_date: g.event_date_raw ?? '',
        event_location: g.event_location ?? '',
        valid_from: g.valid_from_raw ?? emptyForm.valid_from,
        valid_until: g.valid_until_raw ?? emptyForm.valid_until,
        status: g.status,
        notes: '',
        portal_password: '',
      })
      setCompanions(
        g.companions.length
          ? g.companions.map((c) => ({
              full_name: c.full_name,
              phone: c.phone ?? '',
              photo_path: c.photo_url ?? '',
              relation: c.relation ?? '',
              can_entry: c.can_entry,
            }))
          : [emptyCompanion()],
      )
      setModalOpen(true)
    } catch {
      toast.error('Failed to load guest')
    }
  }

  const openView = async (row: GuestRow) => {
    try {
      const res = await guestApi.get(row.id)
      setViewGuest(res.data.data as GuestViewData)
    } catch {
      toast.error('Failed to load guest')
    }
  }

  const save = async () => {
    if (!form.full_name || !form.event_name || !form.valid_from || !form.valid_until) {
      toast.error('Guest name, event and validity dates required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        phone: form.phone || null,
        email: form.email || null,
        photo_path: form.photo_path || null,
        event_date: form.event_date || null,
        event_location: form.event_location || null,
        notes: form.notes || null,
        portal_password: form.portal_password || undefined,
        companions: companions.filter((c) => c.full_name.trim()),
      }
      if (editing) {
        await guestApi.update(editing.id, payload)
        toast.success('Guest updated')
      } else {
        await guestApi.create(payload)
        toast.success('Guest created with QR pass')
      }
      setModalOpen(false)
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const { selection, bulkDelete, dropFromSelection, bulkDeleting } = useTableBulkDelete<GuestRow>({
    deleteOne: async (id) => { await guestApi.delete(id) },
    onDone: load,
    confirmMany: (ids) => `Delete ${ids.length} selected guest pass(es)?`,
  })

  const remove = async (row: GuestRow) => {
    if (!confirm(`Delete guest ${row.full_name}?`)) return
    try {
      await guestApi.delete(row.id)
      dropFromSelection(row.id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Guest Passes"
        subtitle="Event guests with QR ID — add companions who can enter with the guest."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Guests' }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminBtn variant="secondary" to="/admin/guests/scan">
              <QrCode className="h-4 w-4" /> QR Entry Scan
            </AdminBtn>
            <AdminBtn variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Guest
            </AdminBtn>
          </div>
        }
      />

      {loading && guests.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">Loading guests...</p>
      )}

      <AdminDataTable<GuestRow>
        data={guests}
        rowKey={(row) => row.id}
        onRefresh={load}
        title="All Guests"
        subtitle={`${guests.length} guest passes`}
        searchPlaceholder="Search name, code, event..."
        searchKeys={['full_name', 'guest_code', 'event_name']}
        pageSize={8}
        filterSubtitle="guest pass status"
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'blocked', label: 'Blocked' },
            ],
          },
        ]}
        filterConfigs={[
          { key: 'status', defaultValue: 'all', match: (row, v) => v === 'all' || row.status === v },
        ]}
        selection={selection}
        onBulkDelete={bulkDelete}
        bulkDeleting={bulkDeleting}
        columns={[
          {
            key: 'full_name',
            header: 'Guest',
            sortable: true,
            cell: (row) => (
              <div className="flex items-center gap-3">
                <AdminAvatar name={row.full_name} size="sm" />
                <div>
                  <p className="font-semibold text-ink">{row.full_name}</p>
                  <p className="text-xs font-mono text-slate-500">{row.guest_code}</p>
                </div>
              </div>
            ),
          },
          { key: 'event_name', header: 'Event', cell: (row) => row.event_name },
          { key: 'event_date', header: 'Event Date', cell: (row) => row.event_date || '—' },
          {
            key: 'companions',
            header: 'Companions',
            cell: (row) => (
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <UserPlus className="h-3.5 w-3.5" /> {row.companions_count ?? 0}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <AdminBadge tone={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</AdminBadge>,
          },
          {
            key: 'actions',
            header: '',
            className: 'w-32',
            cell: (row) => (
              <AdminTableActions
                actions={[
                  { label: 'View', icon: Eye, onClick: () => openView(row) },
                  { label: 'Edit', icon: Pencil, onClick: () => openEdit(row) },
                  { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => remove(row) },
                ]}
              />
            ),
          },
        ]}
      />

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Guest' : 'New Guest Pass'}
        wide
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</AdminBtn>
          </>
        }
      >
        <FormSection title="Guest Information" icon={UserPlus}>
          <FormGrid>
            <Input label="Guest Full Name" requiredMark value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input
              label="Portal Password"
              type="password"
              hint="Leave blank for default: password"
              value={form.portal_password}
              onChange={(e) => setForm({ ...form, portal_password: e.target.value })}
            />
            <div className="span-full">
              <ImageUpload label="Guest Photo" value={form.photo_path} onChange={(p) => setForm({ ...form, photo_path: p })} />
            </div>
          </FormGrid>
        </FormSection>

        <FormSection title="Event Details" icon={Ticket}>
          <FormGrid>
            <Input label="Event Name" requiredMark value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} />
            <Input label="Event Date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            <div className="span-full">
              <Input label="Location" value={form.event_location} onChange={(e) => setForm({ ...form, event_location: e.target.value })} />
            </div>
            <Input label="Valid From" type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
            <Input label="Valid Until" type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
          </FormGrid>
        </FormSection>

        <FormSection
          title="Companions"
          description="People authorized to enter with this guest"
          icon={UserPlus}
        >
          <div className="flex justify-end -mt-2 mb-2">
            <AdminBtn variant="secondary" className="!px-2.5 !py-1.5 text-xs" onClick={() => setCompanions([...companions, emptyCompanion()])}>
              <Plus className="h-3.5 w-3.5" /> Add companion
            </AdminBtn>
          </div>
          <div className="space-y-4">
            {companions.map((c, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <FormGrid>
                  <Input label="Name" value={c.full_name} onChange={(e) => {
                    const next = [...companions]
                    next[i] = { ...c, full_name: e.target.value }
                    setCompanions(next)
                  }} />
                  <Input label="Phone" value={c.phone} onChange={(e) => {
                    const next = [...companions]
                    next[i] = { ...c, phone: e.target.value }
                    setCompanions(next)
                  }} />
                  <Input label="Relation" value={c.relation} onChange={(e) => {
                    const next = [...companions]
                    next[i] = { ...c, relation: e.target.value }
                    setCompanions(next)
                  }} />
                  <ImageUpload label="Photo" value={c.photo_path} onChange={(p) => {
                    const next = [...companions]
                    next[i] = { ...c, photo_path: p }
                    setCompanions(next)
                  }} />
                </FormGrid>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Checkbox
                    label="Allow entry with guest"
                    checked={c.can_entry}
                    onChange={(e) => {
                      const next = [...companions]
                      next[i] = { ...c, can_entry: e.target.checked }
                      setCompanions(next)
                    }}
                  />
                  {companions.length > 1 && (
                    <AdminBtn variant="secondary" className="!px-2.5 !py-1.5 text-xs" onClick={() => setCompanions(companions.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </AdminBtn>
                  )}
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      </AdminModal>

      <AdminModal
        open={!!viewGuest}
        onClose={() => setViewGuest(null)}
        title="Guest Pass Details"
        wide
        footer={<AdminBtn variant="secondary" onClick={() => setViewGuest(null)}>Close</AdminBtn>}
      >
        {viewGuest && (
          <div className="space-y-4">
            {viewGuest.qr_data_uri && (
              <div className="flex justify-center">
                <img src={viewGuest.qr_data_uri} alt="Guest QR" className="h-40 w-40 rounded-xl border border-slate-200" />
              </div>
            )}
            <AdminRecordFields
              fields={[
                { label: 'Guest Code', value: viewGuest.guest_code },
                { label: 'Name', value: viewGuest.full_name },
                { label: 'Phone', value: viewGuest.phone },
                { label: 'Event', value: viewGuest.event_name },
                { label: 'Event Date', value: viewGuest.event_date ?? '—' },
                { label: 'Location', value: viewGuest.event_location ?? '—' },
                { label: 'Valid', value: `${viewGuest.valid_from} — ${viewGuest.valid_until}` },
                { label: 'Companions', value: String(viewGuest.companions.length) },
                ...(viewGuest.portal_login?.can_login
                  ? [
                      { label: 'Portal Login', value: viewGuest.portal_login.hint },
                      { label: 'Login Email', value: viewGuest.portal_login.email ?? '—' },
                    ]
                  : []),
              ]}
            />
          </div>
        )}
      </AdminModal>
    </AdminPageShell>
  )
}
