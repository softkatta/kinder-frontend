import { useCallback, useEffect, useState } from 'react'
import { CalendarRange, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AdminPageHeader, AdminPageShell, AdminBtn, AdminBadge, AdminTableActions, AdminModal,
} from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormGrid, FormStack } from '@/components/ui/Form'
import { academicApi } from '@/api/services'
import { useTableBulkDelete } from '@/hooks/useTableBulkDelete'

interface AcademicYear {
  id: number
  name: string
  label?: string | null
  start_date: string
  end_date: string
  is_current: boolean
  status: string
  exams_count?: number
}

const emptyForm = {
  name: '',
  label: '',
  start_date: '',
  end_date: '',
  is_current: false,
  status: 'active',
}

export default function AdminAcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AcademicYear | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await academicApi.years()
      setYears(res.data.data ?? [])
    } catch {
      toast.error('Failed to load academic years')
      setYears([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row: AcademicYear) => {
    setEditing(row)
    setForm({
      name: row.name,
      label: row.label ?? '',
      start_date: row.start_date?.slice(0, 10) ?? '',
      end_date: row.end_date?.slice(0, 10) ?? '',
      is_current: row.is_current,
      status: row.status,
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      toast.error('Name and dates are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        label: form.label || null,
        is_current: Boolean(form.is_current),
      }
      if (editing) {
        await academicApi.updateYear(editing.id, payload)
        toast.success('Academic year updated')
      } else {
        await academicApi.createYear(payload)
        toast.success('Academic year created')
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

  const { selection, bulkDelete, dropFromSelection, bulkDeleting } = useTableBulkDelete<AcademicYear>({
    deleteOne: async (id) => { await academicApi.deleteYear(id) },
    onDone: load,
    confirmMany: (ids) => {
      const selected = years.filter((y) => ids.includes(y.id))
      const examTotal = selected.reduce((sum, y) => sum + (y.exams_count ?? 0), 0)
      const examNote = examTotal > 0 ? ` Linked exams (${examTotal}) will also be deleted.` : ''
      return `Delete ${ids.length} selected academic year(s)?${examNote}`
    },
  })

  const remove = async (row: AcademicYear) => {
    const examNote = row.exams_count
      ? `\n\nThis will also delete ${row.exams_count} linked exam(s) and their results.`
      : ''
    if (!confirm(`Delete academic year ${row.name}?${examNote}`)) return
    try {
      const res = await academicApi.deleteYear(row.id)
      dropFromSelection(row.id)
      toast.success(res.data.message || 'Deleted')
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Cannot delete')
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Academic Years"
        subtitle="Manage school academic sessions — set current year for exams and reports."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Academic Years' }]}
        actions={
          <AdminBtn variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Year
          </AdminBtn>
        }
      />

      {loading && years.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">Loading academic years...</p>
      )}

      <AdminDataTable<AcademicYear>
        data={years}
        rowKey={(row) => row.id}
        onRefresh={load}
        title="All Academic Years"
        subtitle={`${years.length} sessions`}
        searchPlaceholder="Search by name or label..."
        searchKeys={['name', 'label']}
        pageSize={10}
        selection={selection}
        onBulkDelete={bulkDelete}
        bulkDeleting={bulkDeleting}
        columns={[
          {
            key: 'name',
            header: 'Year',
            sortable: true,
            cell: (row) => (
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-violet-500" />
                <span className="font-semibold text-ink">{row.name}</span>
                {row.is_current && <AdminBadge tone="success">Current</AdminBadge>}
              </div>
            ),
          },
          { key: 'label', header: 'Label', cell: (row) => row.label || '—' },
          {
            key: 'start_date',
            header: 'Period',
            cell: (row) => (
              <span className="text-sm text-slate-600">
                {row.start_date?.slice(0, 10)} → {row.end_date?.slice(0, 10)}
              </span>
            ),
          },
          {
            key: 'exams_count',
            header: 'Exams',
            cell: (row) => (
              <span className="text-sm text-slate-600">{row.exams_count ?? 0}</span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <AdminBadge tone={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</AdminBadge>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-28',
            cell: (row) => (
              <AdminTableActions
                actions={[
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
        title={editing ? 'Edit Academic Year' : 'New Academic Year'}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </AdminBtn>
          </>
        }
      >
        <FormStack>
          <Input label="Year Code" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="2025-26" />
          <Input label="Display Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Academic Year 2025-26" />
          <FormGrid cols={2}>
            <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </FormGrid>
          <Checkbox
            label="Set as current academic year"
            checked={form.is_current}
            onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
          />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </FormStack>
      </AdminModal>
    </AdminPageShell>
  )
}
