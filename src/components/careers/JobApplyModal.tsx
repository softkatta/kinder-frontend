import { X } from 'lucide-react'
import { JobApplyForm } from '@/components/careers/JobApplyForm'

export interface JobItem {
  id: number
  slug?: string
  title: string
  description?: string
  summary?: string
  department?: string
  location?: string
  application_deadline?: string
  meta?: Record<string, string>
}

interface JobApplyModalProps {
  job: JobItem | null
  onClose: () => void
  labels: {
    applyFor: string
    fullName: string
    email: string
    phone: string
    qualification: string
    experience: string
    coverLetter: string
    resume: string
    submit: string
    submitting: string
    success: string
  }
}

export function JobApplyModal({ job, onClose, labels }: JobApplyModalProps) {
  if (!job) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 rounded-t-3xl">
          <div>
            <p className="text-xs font-bold uppercase text-violet-500">{labels.applyFor}</p>
            <h2 className="font-display text-xl font-bold text-ink">{job.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <JobApplyForm
            jobId={job.id}
            jobTitle={job.title}
            labels={labels}
            onSuccess={onClose}
            showHeader={false}
          />
        </div>
      </div>
    </div>
  )
}

