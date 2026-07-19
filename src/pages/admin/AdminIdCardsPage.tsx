import { useCallback, useEffect, useState } from 'react'
import { Eye, IdCard, Pencil, Plus, Printer, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminBtn, AdminBadge, AdminTableActions, AdminModal } from '@/components/admin/AdminUi'
import { AdminAdvancedFilters } from '@/components/admin/AdminAdvancedFilters'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormGrid, FormStack } from '@/components/ui/Form'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { idCardApi } from '@/api/services'
import { useTableBulkDelete } from '@/hooks/useTableBulkDelete'
import { IdCardTemplate } from '@/components/idcards/IdCardTemplate'
import { printIdCards } from '@/utils/printIdCard'
import {
  ID_CARD_TYPE_LABELS, META_FIELDS, type IdCardType, type IdCardViewData,
} from '@/components/idcards/idCardTheme'

interface IdCardRow extends IdCardViewData {
  id: number
}

const CARD_TYPES = Object.keys(ID_CARD_TYPE_LABELS) as IdCardType[]

const emptyForm = {
  card_type: 'student' as IdCardType,
  full_name: '',
  status: 'active',
  blood_group: '',
  academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  issue_date: new Date().toISOString().slice(0, 10),
  expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
  emergency_contact: '',
  photo_path: '',
  meta: {} as Record<string, string>,
}

export default function AdminIdCardsPage() {
  const [filterType, setFilterType] = useState<string>('')
  const [cards, setCards] = useState<IdCardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<IdCardViewData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<IdCardRow | null>(null)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await idCardApi.list(filterType ? { type: filterType } : {})
      setCards(res.data.data ?? [])
    } catch {
      setCards([])
    } finally {
      setLoading(false)
    }
  }, [filterType])

  const { selection, bulkDelete, dropFromSelection, bulkDeleting, selectedIds } = useTableBulkDelete<IdCardRow>({
    deleteOne: async (id) => { await idCardApi.delete(id) },
    onDone: load,
    confirmMany: (ids) => `Delete ${ids.length} selected ID card(s)?`,
  })

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, card_type: (filterType as IdCardType) || 'student', meta: {} })
    setModalOpen(true)
  }

  const openEdit = (card: IdCardRow) => {
    setEditing(card)
    setForm({
      card_type: card.card_type,
      full_name: card.full_name,
      status: card.status,
      blood_group: card.blood_group ?? '',
      academic_year: card.academic_year ?? '',
      issue_date: card.issue_date_raw ?? card.issue_date,
      expiry_date: card.expiry_date_raw ?? card.expiry_date,
      emergency_contact: card.emergency_contact ?? '',
      photo_path: '',
      meta: { ...(card.meta ?? {}) },
    })
    setModalOpen(true)
  }

  const save = async () => {
    try {
      const payload = {
        ...form,
        meta: form.meta,
        photo_path: form.photo_path || undefined,
      }
      if (editing) {
        await idCardApi.update(editing.id, payload)
        toast.success('ID card updated')
      } else {
        await idCardApi.create(payload)
        toast.success('ID card created')
      }
      setModalOpen(false)
      load()
    } catch {
      toast.error('Save failed')
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this ID card?')) return
    try {
      await idCardApi.delete(id)
      dropFromSelection(id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const printCard = (card: IdCardViewData) => {
    printIdCards([card])
  }

  const bulkPrint = () => {
    if (!selectedIds.length) return toast.error('Select cards first')
    const toPrint = cards.filter((c) => selectedIds.includes(c.id))
    if (!toPrint.length) return
    printIdCards(toPrint)
  }

  const metaFields = META_FIELDS[form.card_type] ?? []

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="PVC ID Cards"
        subtitle="Premium CR80 identity cards for students, teachers, staff, parents & guests — preview, print & QR verify."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'ID Cards' }]}
        actions={
          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <AdminBtn variant="secondary" onClick={bulkPrint}>
                <Printer className="h-4 w-4" /> Print {selectedIds.length} Cards
              </AdminBtn>
            )}
            <AdminBtn variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4" /> New Card
            </AdminBtn>
          </div>
        }
      />

      <AdminAdvancedFilters
        className="mb-5"
        subtitle="card type"
        fields={[{
          key: 'type',
          label: 'Card Type',
          options: [
            { value: 'all', label: 'All Types' },
            ...CARD_TYPES.map((t) => ({ value: t, label: ID_CARD_TYPE_LABELS[t] })),
          ],
        }]}
        values={{ type: filterType || 'all' }}
        onChange={(_key, value) => setFilterType(value === 'all' ? '' : value)}
        onReset={() => setFilterType('')}
      />

      {loading ? (
        <p className="text-slate-400 text-sm py-12 text-center">Loading...</p>
      ) : (
        <AdminDataTable<IdCardRow>
          data={cards}
          rowKey={(r) => r.id}
          onRefresh={load}
          title="ID Cards"
          subtitle={`${cards.length} cards · CR80 85.6×54mm`}
          searchPlaceholder="Search name, card number..."
          searchKeys={['full_name', 'card_number', 'card_type']}
          pageSize={8}
          selection={selection}
          onBulkDelete={bulkDelete}
          bulkDeleting={bulkDeleting}
          columns={[
            { key: 'type', header: 'Type', cell: (r) => <AdminBadge tone="violet">{ID_CARD_TYPE_LABELS[r.card_type]}</AdminBadge> },
            { key: 'name', header: 'Name', sortable: true, cell: (r) => <span className="font-semibold text-ink">{r.full_name}</span> },
            { key: 'number', header: 'Card #', className: 'font-mono text-xs', cell: (r) => r.card_number },
            { key: 'status', header: 'Status', cell: (r) => <AdminBadge tone={r.status === 'active' ? 'success' : 'warning'}>{r.status}</AdminBadge> },
            { key: 'expiry', header: 'Expires', cell: (r) => r.expiry_date },
            {
              key: 'actions',
              header: 'Actions',
              headerClassName: 'text-right',
              className: 'text-right',
              cell: (r) => (
                <AdminTableActions
                  actions={[
                    { label: 'Preview', icon: Eye, onClick: () => setPreview(r) },
                    { label: 'Print', icon: Printer, onClick: () => printCard(r) },
                    { label: 'Edit', icon: Pencil, onClick: () => openEdit(r) },
                    { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => remove(r.id) },
                  ]}
                />
              ),
            },
          ]}
        />
      )}

      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreview(null)} aria-label="Close" />
          <div className="relative z-10 max-w-4xl w-full rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IdCard className="h-5 w-5 text-violet-500" />
                <h3 className="font-display font-bold text-lg">{preview.full_name}</h3>
                <AdminBadge tone="violet">{preview.role_label}</AdminBadge>
              </div>
              <AdminBtn variant="secondary" onClick={() => printCard(preview)}>
                <Printer className="h-4 w-4" /> Print
              </AdminBtn>
            </div>
            <IdCardTemplate card={preview} scale={1.05} />
            <p className="text-center text-xs text-slate-400 mt-4">Print-ready CR80 · 300 DPI · Front & Back</p>
          </div>
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editing ? 'Edit' : 'Create'} ID Card`}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={save}>Save</AdminBtn>
          </>
        }
      >
        <FormStack>
          <Select label="Card Type" value={form.card_type} onChange={(e) => setForm({ ...form, card_type: e.target.value as IdCardType, meta: {} })}>
            {CARD_TYPES.map((t) => <option key={t} value={t}>{ID_CARD_TYPE_LABELS[t]}</option>)}
          </Select>
          <Input label="Full Name" requiredMark value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <FormGrid cols={2}>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
              <option value="expired">Expired</option>
            </Select>
            <Input label="Blood Group" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} />
          </FormGrid>
          <Input label="Academic Year" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} />
          <Input label="Emergency Contact" value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
          <FormGrid cols={2}>
            <Input label="Issue Date" type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
            <Input label="Expiry Date" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          </FormGrid>
          <ImageUpload label="Photo" value={form.photo_path} onChange={(path) => setForm({ ...form, photo_path: path })} />
          <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
            <p className="text-xs font-bold uppercase text-violet-600">Role-specific fields</p>
            {metaFields.map((f) => (
              <Input
                key={f.key}
                label={f.label}
                value={form.meta[f.key] ?? ''}
                onChange={(e) => setForm({ ...form, meta: { ...form.meta, [f.key]: e.target.value } })}
              />
            ))}
          </div>
        </FormStack>
      </AdminModal>
    </AdminPageShell>
  )
}
