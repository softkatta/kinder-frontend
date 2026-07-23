import { useCallback, useEffect, useState } from 'react'
import { BookOpenCheck, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AdminPageHeader, AdminPageShell, AdminBtn, AdminBadge, AdminTableActions, AdminModal, AdminPanel,
} from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormGrid } from '@/components/ui/Form'
import { academicApi, examApi, idCardApi } from '@/api/services'
import { useTableBulkDelete } from '@/hooks/useTableBulkDelete'

interface AcademicYear { id: number; name: string }

interface Exam {
  id: number
  name: string
  exam_type: string
  class_name: string
  subject?: string | null
  exam_date?: string | null
  max_marks: number
  status: string
  academic_year_id: number
  academic_year?: { name: string }
  results_count?: number
}

interface ExamResult {
  id: number
  student_name: string
  roll_number?: string | null
  marks_obtained: number
  grade?: string | null
  result_status: string
}

interface StudentOption {
  id: number
  full_name: string
  meta?: Record<string, unknown>
}

const EXAM_TYPES = ['unit', 'midterm', 'term', 'final', 'annual']
const EXAM_STATUSES = ['scheduled', 'ongoing', 'completed', 'published']
const CLASS_OPTIONS = ['Nursery A', 'Nursery B', 'LKG A', 'LKG B', 'UKG A', 'UKG B']

const emptyExam = {
  academic_year_id: 0,
  name: '',
  exam_type: 'term',
  class_name: 'UKG A',
  subject: '',
  exam_date: '',
  max_marks: 100,
  status: 'scheduled',
  remarks: '',
}

const emptyResult = {
  student_id: '',
  student_name: '',
  roll_number: '',
  marks_obtained: '',
  result_status: 'pass',
  remarks: '',
}

export default function AdminExamsPage() {
  const [years, setYears] = useState<AcademicYear[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [examModal, setExamModal] = useState(false)
  const [resultModal, setResultModal] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [activeExam, setActiveExam] = useState<Exam | null>(null)
  const [results, setResults] = useState<ExamResult[]>([])
  const [examForm, setExamForm] = useState(emptyExam)
  const [resultForm, setResultForm] = useState(emptyResult)
  const [students, setStudents] = useState<StudentOption[]>([])
  const [saving, setSaving] = useState(false)

  const studentRollNumber = (student: StudentOption): string => {
    const meta = student.meta ?? {}
    const roll = meta.roll_number ?? meta.roll_no ?? meta.rollNumber ?? ''

    return String(roll || '')
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [yRes, eRes, sRes] = await Promise.all([
        academicApi.years(),
        examApi.list(),
        idCardApi.list({ type: 'student', status: 'active' }).catch(() => ({ data: { data: [] } })),
      ])
      const yList = yRes.data.data ?? []
      setYears(yList)
      setExams(eRes.data.data ?? [])
      setStudents((sRes.data.data ?? []) as StudentOption[])
    } catch {
      toast.error('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreateExam = () => {
    const current = years.find((y) => (y as AcademicYear & { is_current?: boolean }).is_current) ?? years[0]
    setEditingExam(null)
    setExamForm({ ...emptyExam, academic_year_id: current?.id ?? 0 })
    setExamModal(true)
  }

  const openEditExam = (row: Exam) => {
    setEditingExam(row)
    setExamForm({
      academic_year_id: row.academic_year_id,
      name: row.name,
      exam_type: row.exam_type,
      class_name: row.class_name,
      subject: row.subject ?? '',
      exam_date: row.exam_date?.slice(0, 10) ?? '',
      max_marks: row.max_marks,
      status: row.status,
      remarks: '',
    })
    setExamModal(true)
  }

  const saveExam = async () => {
    if (!examForm.name || !examForm.academic_year_id) {
      toast.error('Name and academic year required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...examForm,
        subject: examForm.subject || null,
        exam_date: examForm.exam_date || null,
        max_marks: Number(examForm.max_marks),
      }
      if (editingExam) {
        await examApi.update(editingExam.id, payload)
        toast.success('Exam updated')
      } else {
        await examApi.create(payload)
        toast.success('Exam created')
      }
      setExamModal(false)
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const { selection, bulkDelete, dropFromSelection, bulkDeleting } = useTableBulkDelete<Exam>({
    deleteOne: async (id) => { await examApi.delete(id) },
    onDone: load,
    confirmMany: (ids) => `Delete ${ids.length} selected exam(s)?`,
  })

  const removeExam = async (row: Exam) => {
    if (!confirm(`Delete exam "${row.name}"?`)) return
    try {
      await examApi.delete(row.id)
      dropFromSelection(row.id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Cannot delete exam')
    }
  }

  const openResults = async (exam: Exam) => {
    setActiveExam(exam)
    try {
      const res = await examApi.results(exam.id)
      setResults(res.data.data ?? [])
    } catch {
      setResults([])
    }
    setResultForm(emptyResult)
    setResultModal(true)
  }

  const addResult = async () => {
    if (!activeExam || !resultForm.student_name || resultForm.marks_obtained === '') {
      toast.error('Student name and marks required')
      return
    }
    setSaving(true)
    try {
      await examApi.createResult(activeExam.id, {
        student_name: resultForm.student_name,
        roll_number: resultForm.roll_number || null,
        marks_obtained: Number(resultForm.marks_obtained),
        result_status: resultForm.result_status,
        remarks: resultForm.remarks || null,
      })
      toast.success('Result saved')
      const res = await examApi.results(activeExam.id)
      setResults(res.data.data ?? [])
      setResultForm(emptyResult)
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to save result')
    } finally {
      setSaving(false)
    }
  }

  const onStudentSelect = (studentIdValue: string) => {
    if (!studentIdValue) {
      setResultForm({ ...resultForm, student_id: '', student_name: '', roll_number: '' })

      return
    }

    const selected = students.find((s) => String(s.id) === studentIdValue)
    if (!selected) {
      setResultForm({ ...resultForm, student_id: studentIdValue })

      return
    }

    setResultForm({
      ...resultForm,
      student_id: studentIdValue,
      student_name: selected.full_name,
      roll_number: studentRollNumber(selected),
    })
  }

  const removeResult = async (id: number) => {
    if (!confirm('Delete this result?')) return
    try {
      await examApi.deleteResult(id)
      if (activeExam) {
        const res = await examApi.results(activeExam.id)
        setResults(res.data.data ?? [])
      }
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Exams"
        subtitle="Create exams, enter student marks, then print marksheets from Marksheets page."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Exams' }]}
        actions={
          <AdminBtn variant="primary" onClick={openCreateExam}>
            <Plus className="h-4 w-4" /> Add Exam
          </AdminBtn>
        }
      />

      {loading && exams.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">Loading exams...</p>
      )}

      <AdminDataTable<Exam>
        data={exams}
        rowKey={(row) => row.id}
        onRefresh={load}
        title="All Exams"
        subtitle={`${exams.length} exams`}
        searchPlaceholder="Search exam, class, subject..."
        searchKeys={['name', 'class_name', 'subject']}
        pageSize={8}
        filterSubtitle="exam status"
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'completed', label: 'Completed' },
              { value: 'published', label: 'Published' },
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
            key: 'name',
            header: 'Exam',
            sortable: true,
            cell: (row) => (
              <div>
                <p className="font-semibold text-ink flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-violet-500" />
                  {row.name}
                </p>
                <p className="text-xs text-slate-500">{row.academic_year?.name} · {row.exam_type}</p>
              </div>
            ),
          },
          { key: 'class_name', header: 'Class', cell: (row) => row.class_name },
          { key: 'subject', header: 'Subject', cell: (row) => row.subject || '—' },
          { key: 'max_marks', header: 'Max', className: 'font-mono text-xs', cell: (row) => row.max_marks },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => <AdminBadge tone="info">{row.status}</AdminBadge>,
          },
          {
            key: 'results',
            header: 'Results',
            cell: (row) => (
              <button
                type="button"
                onClick={() => openResults(row)}
                className="text-sm font-semibold text-violet-600 hover:underline flex items-center gap-1"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                {row.results_count ?? 0} entries
              </button>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-28',
            cell: (row) => (
              <AdminTableActions
                actions={[
                  { label: 'Edit', icon: Pencil, onClick: () => openEditExam(row) },
                  { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => removeExam(row) },
                ]}
              />
            ),
          },
        ]}
      />

      <AdminModal
        open={examModal}
        onClose={() => setExamModal(false)}
        title={editingExam ? 'Edit Exam' : 'New Exam'}
        wide
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setExamModal(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={saveExam} disabled={saving}>{saving ? 'Saving...' : 'Save'}</AdminBtn>
          </>
        }
      >
        <FormGrid>
          <div className="span-2">
            <Select label="Academic Year" value={examForm.academic_year_id} onChange={(e) => setExamForm({ ...examForm, academic_year_id: Number(e.target.value) })}>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
            </Select>
          </div>
          <Input label="Exam Name" value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} />
          <Select label="Type" value={examForm.exam_type} onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value })}>
            {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Class" value={examForm.class_name} onChange={(e) => setExamForm({ ...examForm, class_name: e.target.value })}>
            {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Subject" value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })} />
          <Input label="Exam Date" type="date" value={examForm.exam_date} onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })} />
          <Input label="Max Marks" type="number" value={String(examForm.max_marks)} onChange={(e) => setExamForm({ ...examForm, max_marks: Number(e.target.value) })} />
          <Select label="Status" value={examForm.status} onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}>
            {EXAM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </FormGrid>
      </AdminModal>

      <AdminModal
        open={resultModal}
        onClose={() => setResultModal(false)}
        title={activeExam ? `Results — ${activeExam.name}` : 'Exam Results'}
        wide
        footer={<AdminBtn variant="secondary" onClick={() => setResultModal(false)}>Close</AdminBtn>}
      >
        <AdminPanel title="Add Student Result" noPadding className="mb-4">
          <FormGrid cols={3} className="p-5 items-end lg:grid-cols-5">
            <Select label="Student" value={resultForm.student_id} onChange={(e) => onStudentSelect(e.target.value)}>
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}{studentRollNumber(s) ? ` (Roll ${studentRollNumber(s)})` : ''}
                </option>
              ))}
            </Select>
            <Input label="Roll No." value={resultForm.roll_number} onChange={(e) => setResultForm({ ...resultForm, roll_number: e.target.value })} />
            <Input label="Marks" type="number" value={resultForm.marks_obtained} onChange={(e) => setResultForm({ ...resultForm, marks_obtained: e.target.value })} />
            <Select label="Result" value={resultForm.result_status} onChange={(e) => setResultForm({ ...resultForm, result_status: e.target.value })}>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="absent">Absent</option>
            </Select>
            <AdminBtn variant="primary" onClick={addResult} disabled={saving}>Add</AdminBtn>
          </FormGrid>
        </AdminPanel>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No results yet</p>
          ) : (
            results.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <div>
                  <p className="font-semibold text-ink">{r.student_name}</p>
                  <p className="text-xs text-slate-500">
                    Roll {r.roll_number || '—'} · {r.marks_obtained} marks · Grade {r.grade || '—'} · {r.result_status}
                  </p>
                </div>
                <AdminBtn variant="secondary" className="!px-2 !py-1.5 text-xs" onClick={() => removeResult(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </AdminBtn>
              </div>
            ))
          )}
        </div>
      </AdminModal>
    </AdminPageShell>
  )
}
