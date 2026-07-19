import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, RefreshCw, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AdminPageHeader, AdminPageShell, AdminPanel, AdminBtn, AdminBadge, AdminModal,
} from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { feeCategoryApi, studentApi, studentFeeApi } from '@/api/services'

interface FeeCategory {
  id: number
  name: string
  code?: string
  amount: number
  frequency: string
  grade_level?: string
  is_active: boolean
}

interface StudentFeeRow {
  id: number
  id_card_id?: number
  student_name?: string
  title: string
  amount: number
  paid_amount: number
  balance: number
  due_date?: string
  status: string
}

interface StudentOption {
  id: number
  full_name: string
}

const emptyCategory = {
  name: '',
  code: '',
  amount: '',
  frequency: 'yearly',
  grade_level: '',
}

export default function AdminStudentFeesPage() {
  const [categories, setCategories] = useState<FeeCategory[]>([])
  const [fees, setFees] = useState<StudentFeeRow[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [catModal, setCatModal] = useState(false)
  const [editingCatId, setEditingCatId] = useState<number | null>(null)
  const [assignModal, setAssignModal] = useState(false)
  const [bulkModal, setBulkModal] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [catForm, setCatForm] = useState(emptyCategory)
  const [assignForm, setAssignForm] = useState({ id_card_id: '', fee_category_id: '', due_date: '' })
  const [bulkForm, setBulkForm] = useState({ fee_category_id: '', due_date: '', student_ids: [] as number[] })
  const [payForm, setPayForm] = useState({ id: 0, paid_amount: '', status: 'partial' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [cats, feeRows, studentRows] = await Promise.all([
        feeCategoryApi.list(),
        studentFeeApi.list(),
        studentApi.list(),
      ])
      setCategories(cats.data.data ?? [])
      setFees(feeRows.data.data ?? [])
      setStudents((studentRows.data.data ?? []).map((s: { id: number; full_name: string }) => ({
        id: s.id,
        full_name: s.full_name,
      })))
    } catch {
      toast.error('Failed to load fees')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const openNewCategory = () => {
    setEditingCatId(null)
    setCatForm(emptyCategory)
    setCatModal(true)
  }

  const openEditCategory = (c: FeeCategory) => {
    setEditingCatId(c.id)
    setCatForm({
      name: c.name,
      code: c.code ?? '',
      amount: String(c.amount),
      frequency: c.frequency,
      grade_level: c.grade_level ?? '',
    })
    setCatModal(true)
  }

  const saveCategory = async () => {
    if (!catForm.name.trim() || !catForm.amount) {
      toast.error('Name and amount are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: catForm.name,
        code: catForm.code || null,
        amount: Number(catForm.amount),
        frequency: catForm.frequency,
        grade_level: catForm.grade_level || null,
      }
      if (editingCatId) {
        await feeCategoryApi.update(editingCatId, payload)
        toast.success('Category updated')
      } else {
        await feeCategoryApi.create(payload)
        toast.success('Category created')
      }
      setCatModal(false)
      setCatForm(emptyCategory)
      void load()
    } catch {
      toast.error('Could not save category')
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (id: number) => {
    if (!confirm('Delete this fee category?')) return
    try {
      await feeCategoryApi.delete(id)
      toast.success('Category deleted')
      void load()
    } catch {
      toast.error('Could not delete category')
    }
  }

  const assignFee = async () => {
    if (!assignForm.id_card_id || !assignForm.fee_category_id) {
      toast.error('Select student and fee category')
      return
    }
    setSaving(true)
    try {
      await studentFeeApi.assign({
        id_card_id: Number(assignForm.id_card_id),
        fee_category_id: Number(assignForm.fee_category_id),
        due_date: assignForm.due_date || undefined,
      })
      toast.success('Fee assigned')
      setAssignModal(false)
      setAssignForm({ id_card_id: '', fee_category_id: '', due_date: '' })
      void load()
    } catch {
      toast.error('Could not assign fee')
    } finally {
      setSaving(false)
    }
  }

  const bulkAssign = async () => {
    if (!bulkForm.fee_category_id || bulkForm.student_ids.length === 0) {
      toast.error('Select category and at least one student')
      return
    }
    setSaving(true)
    try {
      await studentFeeApi.bulkAssign({
        fee_category_id: Number(bulkForm.fee_category_id),
        id_card_ids: bulkForm.student_ids,
        due_date: bulkForm.due_date || undefined,
      })
      toast.success(`Assigned to ${bulkForm.student_ids.length} students`)
      setBulkModal(false)
      setBulkForm({ fee_category_id: '', due_date: '', student_ids: [] })
      void load()
    } catch {
      toast.error('Bulk assign failed')
    } finally {
      setSaving(false)
    }
  }

  const openMarkPaid = (row: StudentFeeRow) => {
    setPayForm({
      id: row.id,
      paid_amount: String(row.paid_amount),
      status: row.status === 'waived' ? 'waived' : row.paid_amount >= row.amount ? 'paid' : 'partial',
    })
    setPayModal(true)
  }

  const savePayment = async () => {
    setSaving(true)
    try {
      await studentFeeApi.update(payForm.id, {
        paid_amount: Number(payForm.paid_amount),
        status: payForm.status,
      })
      toast.success('Fee updated')
      setPayModal(false)
      void load()
    } catch {
      toast.error('Could not update fee')
    } finally {
      setSaving(false)
    }
  }

  const removeFee = async (id: number) => {
    if (!confirm('Remove this fee record?')) return
    try {
      await studentFeeApi.delete(id)
      toast.success('Removed')
      void load()
    } catch {
      toast.error('Could not remove')
    }
  }

  const toggleBulkStudent = (id: number) => {
    setBulkForm((f) => ({
      ...f,
      student_ids: f.student_ids.includes(id)
        ? f.student_ids.filter((x) => x !== id)
        : [...f.student_ids, id],
    }))
  }

  const statusTone = (status: string) => {
    if (status === 'paid') return 'success'
    if (status === 'partial') return 'warning'
    if (status === 'waived') return 'neutral'
    return 'danger'
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Student Fees"
        subtitle="Fee categories and per-student assignments"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Student Fees' }]}
        actions={
          <>
            <AdminBtn variant="secondary" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </AdminBtn>
            <AdminBtn variant="secondary" onClick={openNewCategory}>
              <Plus className="h-4 w-4" /> Category
            </AdminBtn>
            <AdminBtn variant="secondary" onClick={() => setBulkModal(true)}>
              <Users className="h-4 w-4" /> Bulk assign
            </AdminBtn>
            <AdminBtn variant="primary" onClick={() => setAssignModal(true)}>
              <Plus className="h-4 w-4" /> Assign fee
            </AdminBtn>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminPanel title="Fee categories" className="lg:col-span-1">
          {loading ? (
            <p className="p-4 text-sm text-slate-500">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No categories yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink truncate">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      ₹{Number(c.amount).toLocaleString('en-IN')} · {c.frequency}
                      {c.grade_level ? ` · ${c.grade_level}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <AdminBadge tone={c.is_active ? 'success' : 'neutral'}>
                      {c.is_active ? 'Active' : 'Off'}
                    </AdminBadge>
                    <button type="button" className="p-1 text-slate-500 hover:text-ink" onClick={() => openEditCategory(c)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" className="p-1 text-red-500" onClick={() => void deleteCategory(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel title="Assigned fees" className="lg:col-span-2" noPadding>
          {loading && fees.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Loading...</p>
          ) : (
            <AdminDataTable<StudentFeeRow>
              data={fees}
              rowKey={(row) => row.id}
              onRefresh={load}
              emptyMessage="No student fees assigned yet."
              columns={[
                { key: 'student', header: 'Student', cell: (r) => r.student_name ?? '—' },
                { key: 'title', header: 'Fee', cell: (r) => r.title },
                { key: 'amount', header: 'Amount', cell: (r) => `₹${Number(r.amount).toLocaleString('en-IN')}` },
                { key: 'balance', header: 'Balance', cell: (r) => `₹${Number(r.balance).toLocaleString('en-IN')}` },
                { key: 'due', header: 'Due', cell: (r) => r.due_date ?? '—' },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (r) => <AdminBadge tone={statusTone(r.status)}>{r.status}</AdminBadge>,
                },
                {
                  key: 'actions',
                  header: '',
                  cell: (r) => (
                    <div className="flex gap-2">
                      <button type="button" className="text-violet-600 text-xs font-semibold" onClick={() => openMarkPaid(r)}>
                        Record pay
                      </button>
                      <button type="button" className="text-red-500" onClick={() => void removeFee(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </AdminPanel>
      </div>

      <AdminModal
        open={catModal}
        onClose={() => setCatModal(false)}
        title={editingCatId ? 'Edit fee category' : 'New fee category'}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setCatModal(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={() => void saveCategory()} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </AdminBtn>
          </>
        }
      >
        <div className="space-y-4">
          <Input placeholder="Name" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
          <Input placeholder="Code" value={catForm.code} onChange={(e) => setCatForm({ ...catForm, code: e.target.value })} />
          <Input type="number" placeholder="Amount" value={catForm.amount} onChange={(e) => setCatForm({ ...catForm, amount: e.target.value })} />
          <Select value={catForm.frequency} onChange={(e) => setCatForm({ ...catForm, frequency: e.target.value })}>
            <option value="yearly">Yearly</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
            <option value="one_time">One time</option>
          </Select>
          <Input placeholder="Grade (optional)" value={catForm.grade_level} onChange={(e) => setCatForm({ ...catForm, grade_level: e.target.value })} />
        </div>
      </AdminModal>

      <AdminModal open={assignModal} onClose={() => setAssignModal(false)} title="Assign fee to student"
        footer={<><AdminBtn variant="secondary" onClick={() => setAssignModal(false)}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => void assignFee()} disabled={saving}>{saving ? 'Saving...' : 'Assign'}</AdminBtn></>}>
        <div className="space-y-4">
          <Select value={assignForm.id_card_id} onChange={(e) => setAssignForm({ ...assignForm, id_card_id: e.target.value })}>
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <Select value={assignForm.fee_category_id} onChange={(e) => setAssignForm({ ...assignForm, fee_category_id: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name} — ₹{c.amount}</option>)}
          </Select>
          <Input type="date" value={assignForm.due_date} onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })} />
        </div>
      </AdminModal>

      <AdminModal open={bulkModal} onClose={() => setBulkModal(false)} title="Bulk assign fee"
        footer={<><AdminBtn variant="secondary" onClick={() => setBulkModal(false)}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => void bulkAssign()} disabled={saving}>Assign {bulkForm.student_ids.length} students</AdminBtn></>}>
        <div className="space-y-4">
          <Select value={bulkForm.fee_category_id} onChange={(e) => setBulkForm({ ...bulkForm, fee_category_id: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name} — ₹{c.amount}</option>)}
          </Select>
          <Input type="date" value={bulkForm.due_date} onChange={(e) => setBulkForm({ ...bulkForm, due_date: e.target.value })} />
          <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-3">
            {students.map((s) => (
              <Checkbox
                key={s.id}
                label={s.full_name}
                checked={bulkForm.student_ids.includes(s.id)}
                onChange={() => toggleBulkStudent(s.id)}
              />
            ))}
          </div>
        </div>
      </AdminModal>

      <AdminModal open={payModal} onClose={() => setPayModal(false)} title="Record payment"
        footer={<><AdminBtn variant="secondary" onClick={() => setPayModal(false)}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => void savePayment()} disabled={saving}>Save</AdminBtn></>}>
        <div className="space-y-4">
          <Input type="number" placeholder="Paid amount" value={payForm.paid_amount} onChange={(e) => setPayForm({ ...payForm, paid_amount: e.target.value })} />
          <Select value={payForm.status} onChange={(e) => setPayForm({ ...payForm, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </Select>
        </div>
      </AdminModal>
    </AdminPageShell>
  )
}
