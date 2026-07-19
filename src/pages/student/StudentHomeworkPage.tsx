import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Upload } from 'lucide-react'
import { AdminPageHeader, AdminPageShell, AdminPanel, AdminBadge, AdminBtn, AdminModal } from '@/components/admin/AdminUi'
import { Textarea } from '@/components/ui/Textarea'
import { portalBreadcrumbs, studentPortalConfig } from '@/config/erpPortals'
import { fileApi, homeworkApi, portalApi } from '@/api/services'
import { useT } from '@/i18n/LanguageContext'

interface HomeworkRow {
  id: number
  title: string
  due: string
  status: string
  emoji: string
  body?: string
  can_submit?: boolean
}

export default function StudentHomeworkPage() {
  const { locale } = useT()
  const [homework, setHomework] = useState<HomeworkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [activeHw, setActiveHw] = useState<HomeworkRow | null>(null)
  const [notes, setNotes] = useState('')
  const [attachmentPath, setAttachmentPath] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.studentHomework(locale)
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

  const openSubmit = (hw: HomeworkRow) => {
    setActiveHw(hw)
    setNotes('')
    setAttachmentPath('')
    setSubmitOpen(true)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fileApi.uploadHomework(form)
      const path = (res.data.data as { path?: string })?.path
      if (path) {
        setAttachmentPath(path)
        toast.success('File uploaded')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const submitHomework = async () => {
    if (!activeHw) return
    setSaving(true)
    try {
      await homeworkApi.submit(activeHw.id, {
        notes: notes || undefined,
        attachment_path: attachmentPath || undefined,
      })
      toast.success('Homework submitted!')
      setSubmitOpen(false)
      void load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Could not submit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Homework"
        subtitle="Complete your assignments and earn stars!"
        breadcrumbs={portalBreadcrumbs(studentPortalConfig.portalLabel, studentPortalConfig.homePath, 'Homework')}
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : homework.length === 0 ? (
        <AdminPanel><p className="p-5 text-sm text-slate-500">No homework right now — enjoy your day!</p></AdminPanel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {homework.map((h) => (
            <AdminPanel key={h.id} noPadding>
              <div className="p-5">
                <span className="text-3xl">{h.emoji}</span>
                <p className="font-display font-bold text-ink mt-3">{h.title}</p>
                {h.body && <p className="text-sm text-slate-600 mt-2">{h.body}</p>}
                <p className="text-sm text-slate-500 mt-2">Due: {h.due}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <AdminBadge tone={h.status === 'Submitted' ? 'success' : h.status === 'Overdue' ? 'danger' : 'warning'}>
                    {h.status}
                  </AdminBadge>
                  {h.can_submit && (
                    <AdminBtn variant="primary" onClick={() => openSubmit(h)}>
                      Submit homework
                    </AdminBtn>
                  )}
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}

      <AdminModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title={activeHw ? `Submit: ${activeHw.title}` : 'Submit homework'}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setSubmitOpen(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={() => void submitHomework()} disabled={saving || uploading}>
              {saving ? 'Submitting...' : 'Submit'}
            </AdminBtn>
          </>
        }
      >
        <div className="space-y-4">
          <Textarea
            placeholder="Notes for your teacher (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void uploadFile(file)
              }}
            />
            <AdminBtn variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : attachmentPath ? 'Change attachment' : 'Attach photo or PDF'}
            </AdminBtn>
            {attachmentPath && <p className="text-xs text-emerald-600 mt-2">Attachment ready</p>}
          </div>
        </div>
      </AdminModal>
    </AdminPageShell>
  )
}
