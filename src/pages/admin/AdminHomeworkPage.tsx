import { useCallback, useEffect, useState } from 'react'
import { Eye, Plus, RefreshCw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AdminPageHeader, AdminPageShell, AdminPanel, AdminBtn, AdminBadge, AdminModal,
} from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { homeworkApi } from '@/api/services'

interface HomeworkRow {
  id: number
  title: string
  class_name?: string
  due: string
  status: string
  emoji: string
  submissions_count?: number
  teacher_name?: string
}

interface SubmissionRow {
  id: number
  student_name?: string
  status: string
  submitted_at?: string
  notes?: string
  attachment_path?: string
}

const emptyForm = {
  title: '',
  body: '',
  class_name: 'Nursery',
  due_date: '',
  emoji: '📚',
}

export default function AdminHomeworkPage() {
  const [rows, setRows] = useState<HomeworkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [activeTitle, setActiveTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await homeworkApi.list()
      setRows(res.data.data ?? [])
    } catch {
      toast.error('Failed to load homework')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (row: HomeworkRow) => {
    setEditingId(row.id)
    setForm({
      title: row.title,
      body: '',
      class_name: row.class_name ?? 'Nursery',
      due_date: '',
      emoji: row.emoji,
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, due_date: form.due_date || undefined }
      if (editingId) {
        await homeworkApi.update(editingId, payload)
        toast.success('Homework updated')
      } else {
        await homeworkApi.create(payload)
        toast.success('Homework created')
      }
      setModalOpen(false)
      void load()
    } catch {
      toast.error('Could not save')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this homework?')) return
    try {
      await homeworkApi.delete(id)
      toast.success('Deleted')
      void load()
    } catch {
      toast.error('Could not delete')
    }
  }

  const viewSubmissions = async (row: HomeworkRow) => {
    try {
      const res = await homeworkApi.submissions(row.id)
      setSubmissions(res.data.data ?? [])
      setActiveTitle(row.title)
      setViewOpen(true)
    } catch {
      toast.error('Could not load submissions')
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Homework"
        subtitle="Manage assignments and view student submissions"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Homework' }]}
        actions={
          <>
            <AdminBtn variant="secondary" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</AdminBtn>
            <AdminBtn variant="primary" onClick={openCreate}><Plus className="h-4 w-4" /> Add homework</AdminBtn>
          </>
        }
      />

      {loading ? (
        <p className="p-4 text-sm text-slate-500">Loading...</p>
      ) : (
        <AdminPanel noPadding>
        <AdminDataTable<HomeworkRow>
          data={rows}
          rowKey={(r) => r.id}
          onRefresh={load}
          emptyMessage="No homework yet."
          columns={[
            { key: 'title', header: 'Title', cell: (r) => <span>{r.emoji} {r.title}</span> },
            { key: 'class', header: 'Class', cell: (r) => r.class_name ?? 'All' },
            { key: 'due', header: 'Due', cell: (r) => r.due },
            { key: 'subs', header: 'Submissions', cell: (r) => r.submissions_count ?? 0 },
            { key: 'status', header: 'Status', cell: (r) => <AdminBadge tone="info">{r.status}</AdminBadge> },
            {
              key: 'actions',
              header: '',
              cell: (r) => (
                <div className="flex gap-2">
                  <button type="button" className="text-violet-600" onClick={() => void viewSubmissions(r)}><Eye className="h-4 w-4" /></button>
                  <button type="button" className="text-slate-600" onClick={() => openEdit(r)}>Edit</button>
                  <button type="button" className="text-red-500" onClick={() => void remove(r.id)}><Trash2 className="h-4 w-4" /></button>
                </div>
              ),
            },
          ]}
        />
      </AdminPanel>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit homework' : 'New homework'}
        footer={<><AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => void save()} disabled={saving}>Save</AdminBtn></>}>
        <div className="space-y-4">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Instructions" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })}>
              <option value="Nursery">Nursery</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
            </Select>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <Input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
        </div>
      </AdminModal>

      <AdminModal open={viewOpen} onClose={() => setViewOpen(false)} title={`Submissions — ${activeTitle}`}
        footer={<AdminBtn variant="secondary" onClick={() => setViewOpen(false)}>Close</AdminBtn>}>
        {submissions.length === 0 ? (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        ) : (
          <ul className="space-y-3">
            {submissions.map((s) => (
              <li key={s.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                <p className="font-semibold text-ink">{s.student_name}</p>
                <p className="text-slate-500">{s.submitted_at ?? '—'} · <AdminBadge tone="info">{s.status}</AdminBadge></p>
                {s.notes && <p className="mt-1 text-slate-600">{s.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </AdminModal>
    </AdminPageShell>
  )
}
