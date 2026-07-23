import { useRef, useState } from 'react'
import { FileVideo, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { fileApi } from '@/api/services'

interface VideoUploadProps {
  value?: string
  onChange: (path: string) => void
  label?: string
}

export function VideoUpload({ value, onChange, label = 'Video file' }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fileApi.uploadCmsVideo(formData)
      const data = response.data.data as { path?: string; url?: string }
      const stored = data.url || data.path
      if (!stored) throw new Error('Upload did not return a file path')
      onChange(stored)
      toast.success('Video uploaded')
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      toast.error(ax.response?.data?.errors?.file?.[0] ?? ax.response?.data?.message ?? 'Video upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="form-label">{label}</label>
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3 text-sm text-slate-600">
            <FileVideo className="h-5 w-5 shrink-0 text-primary" />
            <span className="truncate">Video uploaded</span>
          </div>
          <button type="button" onClick={() => onChange('')} className="rounded-lg p-1.5 hover:bg-white" aria-label="Remove video">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="admin-file-upload-zone w-full">
          {uploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <FileVideo className="h-8 w-8 text-slate-400" />}
          <span className="text-sm font-medium text-slate-500">{uploading ? 'Uploading video...' : 'Click to upload video'}</span>
          <span className="text-xs text-slate-400">MP4, WebM, MOV · Max 100MB</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(event) => {
        const file = event.target.files?.[0]
        if (file) handleFile(file)
        event.target.value = ''
      }} />
    </div>
  )
}
