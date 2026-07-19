import { useRef, useState } from 'react'
import { Upload, X, Loader2, FileText } from 'lucide-react'
import { fileApi } from '@/api/services'
import { mediaUrl } from '@/utils/mediaUrl'
import toast from 'react-hot-toast'

interface FileUploadProps {
  value?: string
  onChange: (path: string) => void
  label?: string
  accept?: string
  hint?: string
  variant?: 'image' | 'document'
  className?: string
}

export function FileUpload({
  value,
  onChange,
  label = 'Upload File',
  accept,
  hint,
  variant = 'document',
  className = '',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')

  const defaultAccept = variant === 'image'
    ? 'image/jpeg,image/png,image/webp,image/gif'
    : '.pdf,.doc,.docx,image/jpeg,image/png'

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = variant === 'image'
        ? await fileApi.uploadCms(fd)
        : await fileApi.uploadDocument(fd)
      const data = res.data.data as { path?: string; url?: string }
      const stored = data?.url || data?.path
      if (stored) {
        onChange(stored)
        setFileName(file.name)
        toast.success('File uploaded')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const isImage = value && /\.(jpe?g|png|webp|gif)$/i.test(value)

  return (
    <div className={className}>
      {label && <label className="form-label block mb-2">{label}</label>}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          {isImage ? (
            <img src={mediaUrl(value)} alt="Upload preview" className="w-full h-40 object-cover" />
          ) : (
            <div className="flex items-center gap-3 p-4">
              <FileText className="h-8 w-8 text-violet-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{fileName || 'Uploaded file'}</p>
                <p className="text-xs text-slate-500 truncate">{value}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => { onChange(''); setFileName('') }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 shadow hover:bg-white"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="admin-file-upload-zone w-full"
        >
          {uploading ? <Loader2 className="h-8 w-8 text-violet-500 animate-spin" /> : <Upload className="h-8 w-8 text-slate-400" />}
          <span className="text-sm text-slate-600 font-semibold">{uploading ? 'Uploading...' : 'Click to upload'}</span>
          <span className="text-xs text-slate-400">{hint ?? (variant === 'image' ? 'JPG, PNG, WebP · Max 5MB' : 'PDF, DOC, DOCX · Max 10MB')}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? defaultAccept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
