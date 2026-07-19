import { useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'

interface LocalFileUploadProps {
  label?: string
  accept?: string
  hint?: string
  file: File | null
  onChange: (file: File | null) => void
}

export function LocalFileUpload({ label, accept = '.pdf,.doc,.docx', hint = 'PDF, DOC, DOCX · Max 10MB', file, onChange }: LocalFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      {label && <label className="form-label block mb-2">{label}</label>}
      {file ? (
        <div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <FileText className="h-8 w-8 text-violet-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button type="button" onClick={() => onChange(null)} className="p-1.5 rounded-lg hover:bg-white" aria-label="Remove">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="admin-file-upload-zone w-full">
          <Upload className="h-8 w-8 text-slate-400" />
          <span className="text-sm text-slate-600 font-semibold">Click to upload resume</span>
          <span className="text-xs text-slate-400">{hint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onChange(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
