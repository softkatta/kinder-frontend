import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Users } from 'lucide-react'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBadge, AdminBtn, AdminModal } from '@/components/admin/AdminUi'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { portalBreadcrumbs, teacherPortalConfig } from '@/config/erpPortals'
import { homeworkApi, portalApi } from '@/api/services'
import { useT } from '@/i18n/LanguageContext'
import { mediaUrl } from '@/utils/mediaUrl'

interface HomeworkRow {
  id: number
  title: string
  due: string
  status: string
  emoji: string
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
  due: '',
  class_name: 'Nursery',
  emoji: '📚',
}

export default function TeacherHomeworkPage() {
  const { locale } = useT()
  const [homework, setHomework] = useState<HomeworkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [assignOpen, setAssignOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [activeHw, setActiveHw] = useState<HomeworkRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.teacherHomework(locale)
      setHomework((res.data.data as HomeworkRow[]) ?? [])
    } catch {
      toast.error('Could not load homework')
      setHomework([])
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    void load()
  }, [load])

  const assignHomework = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      await portalApi.createTeacherHomework(form)
      toast.success('Homework assigned')
      setAssignOpen(false)
      setForm(emptyForm)
      void load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Could not assign homework')
    } finally {
      setSaving(false)
    }
  }

  const openReview = async (hw: HomeworkRow) => {
    setActiveHw(hw)
    try {
      const res = await homeworkApi.submissions(hw.id)
      setSubmissions(res.data.data ?? [])
      setReviewOpen(true)
    } catch {
      toast.error('Could not load submissions')
    }
  }

  const reviewSubmission = async (id: number, status: 'reviewed' | 'returned') => {
    try {
      await homeworkApi.reviewSubmission(id, { status })
      toast.success(status === 'reviewed' ? 'Marked reviewed' : 'Returned to student')
      if (activeHw) {
        const res = await homeworkApi.submissions(activeHw.id)
        setSubmissions(res.data.data ?? [])
      }
    } catch {
      toast.error('Could not update submission')
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Homework"
        subtitle="Assign homework and review student submissions"
        breadcrumbs={portalBreadcrumbs(teacherPortalConfig.portalLabel, teacherPortalConfig.homePath, 'Homework')}
        actions={
          <AdminBtn variant="primary" onClick={() => setAssignOpen(true)}>
            <Plus className="h-4 w-4" /> Assign homework
          </AdminBtn>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : homework.length === 0 ? (
        <AdminPanel><p className="p-5 text-sm text-slate-500">No homework posted yet.</p></AdminPanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {homework.map((h) => (
            <AdminPanel key={h.id} noPadding>
              <div className="p-5">
                <span className="text-3xl">{h.emoji}</span>
                <p className="font-display font-bold text-ink mt-3">{h.title}</p>
                <p className="text-sm text-slate-500">Due: {h.due}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminBadge tone="warning">{h.status}</AdminBadge>
                  <AdminBtn variant="secondary" onClick={() => void openReview(h)}>
                    <Users className="h-4 w-4" /> Submissions
                  </AdminBtn>
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}

      <AdminModal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign homework"
        footer={<><AdminBtn variant="secondary" onClick={() => setAssignOpen(false)}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => void assignHomework()} disabled={saving}>{saving ? 'Saving...' : 'Publish'}</AdminBtn></>}>
        <div className="space-y-4">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Instructions" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Due date (e.g. Friday)" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
            <Select value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })}>
              <option value="Nursery">Nursery</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
            </Select>
          </div>
          <Input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
        </div>
      </AdminModal>

      <AdminModal open={reviewOpen} onClose={() => setReviewOpen(false)} title={activeHw ? `Submissions — ${activeHw.title}` : 'Submissions'}
        footer={<AdminBtn variant="secondary" onClick={() => setReviewOpen(false)}>Close</AdminBtn>}>
        {submissions.length === 0 ? (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        ) : (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
            {submissions.map((s) => (
              <li key={s.id} className="rounded-xl border border-slate-100 p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{s.student_name}</p>
                    <p className="text-slate-500 text-xs mt-1">{s.submitted_at ?? 'Not submitted'}</p>
                  </div>
                  <AdminBadge tone={s.status === 'reviewed' ? 'success' : s.status === 'returned' ? 'danger' : 'info'}>{s.status}</AdminBadge>
                </div>
                {s.notes && <p className="mt-2 text-slate-600">{s.notes}</p>}
                {s.attachment_path && (
                  <a href={mediaUrl(s.attachment_path)} target="_blank" rel="noreferrer" className="text-violet-600 text-xs font-semibold mt-2 inline-block">
                    View attachment
                  </a>
                )}
                {s.status === 'submitted' && (
                  <div className="flex gap-2 mt-3">
                    <AdminBtn variant="primary" onClick={() => void reviewSubmission(s.id, 'reviewed')}>Approve</AdminBtn>
                    <AdminBtn variant="secondary" onClick={() => void reviewSubmission(s.id, 'returned')}>Return</AdminBtn>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </AdminModal>
    </AdminPageShell>
  )
}
