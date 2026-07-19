import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FormGrid } from '@/components/ui/Form'
import { LocalFileUpload } from '@/components/ui/LocalFileUpload'
import { publicApi } from '@/api/services'

export interface JobApplyFormProps {
  jobId: number
  jobTitle: string
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
  onSuccess?: () => void
  className?: string
  showHeader?: boolean
}

export function JobApplyForm({ jobId, jobTitle, labels, onSuccess, className, showHeader = true }: JobApplyFormProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [resume, setResume] = useState<File | null>(null)

  const onSubmit = async (data: Record<string, string>) => {
    try {
      const formData = new FormData()
      formData.append('job_id', String(jobId))
      formData.append('full_name', data.full_name)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      if (data.qualification) formData.append('qualification', data.qualification)
      if (data.experience_years) formData.append('experience_years', data.experience_years)
      if (data.cover_letter) formData.append('cover_letter', data.cover_letter)
      if (resume) formData.append('resume', resume)

      await publicApi.applyJob(formData)
      toast.success(labels.success)
      reset()
      setResume(null)
      onSuccess?.()
    } catch {
      toast.error('Application failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className ?? 'form-stack'}>
      {showHeader && (
        <div className="form-card-header !mb-4 !pb-4">
          <p className="text-xs font-bold uppercase text-violet-500">{labels.applyFor}</p>
          <h3 className="form-card-title">{jobTitle}</h3>
        </div>
      )}
      <FormGrid>
        <Input label={labels.fullName} requiredMark {...register('full_name', { required: true })} />
        <Input label={labels.email} type="email" requiredMark {...register('email', { required: true })} />
        <Input label={labels.phone} requiredMark {...register('phone', { required: true })} />
        <Input label={labels.qualification} {...register('qualification')} />
        <Input label={labels.experience} type="number" {...register('experience_years')} />
        <div className="span-full">
          <Textarea label={labels.coverLetter} rows={4} {...register('cover_letter')} />
        </div>
        <div className="span-full">
          <LocalFileUpload label={labels.resume} file={resume} onChange={setResume} />
        </div>
      </FormGrid>
      <button type="submit" className="btn-kidscholl w-full justify-center mt-4" disabled={isSubmitting}>
        {isSubmitting ? labels.submitting : labels.submit}
      </button>
    </form>
  )
}
