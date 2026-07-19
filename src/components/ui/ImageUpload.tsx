import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { fileApi } from '@/api/services'
import { mediaUrl } from '@/utils/mediaUrl'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value?: string
  onChange: (path: string) => void
  label?: string
  className?: string
  uploadTarget?: 'cms' | 'guest'
}

export function ImageUpload({ value, onChange, label = 'Upload Image', className = '', uploadTarget = 'cms' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const uploadFn = uploadTarget === 'guest' ? fileApi.uploadGuest : fileApi.uploadCms
      const res = await uploadFn(fd)
      const data = res.data.data as { path?: string; url?: string }
      const stored = data?.url || data?.path
      if (stored) {
        onChange(stored)
        toast.success('Image uploaded')
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const msg =
        ax.response?.data?.errors?.file?.[0]
        ?? ax.response?.data?.message
        ?? 'Upload failed'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
          <img src={mediaUrl(value)} alt="Upload preview" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 shadow hover:bg-white"
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
          {uploading ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <Upload className="h-8 w-8 text-slate-400" />}
          <span className="text-sm text-slate-500 font-medium">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
          <span className="text-xs text-slate-400">JPG, PNG, WebP · Max 5MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
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
