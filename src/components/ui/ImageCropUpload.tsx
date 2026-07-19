import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Upload, X, Loader2, Crop, ZoomIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminBtn, AdminModal } from '@/components/admin/AdminUi'
import { fileApi } from '@/api/services'
import { mediaUrl } from '@/utils/mediaUrl'
import { getCroppedImageBlob } from '@/utils/cropImage'

type PreviewMode = 'wide' | 'square' | 'cover'

interface ImageCropUploadProps {
  value?: string
  onChange: (path: string) => void
  label?: string
  hint?: string
  aspect: number
  outputWidth: number
  outputHeight: number
  previewMode?: PreviewMode
  className?: string
  cropTitle?: string
}

const previewClass: Record<PreviewMode, string> = {
  wide: 'h-24 w-full object-contain bg-slate-50',
  square: 'h-24 w-24 object-contain bg-slate-50 mx-auto',
  cover: 'w-full h-40 object-cover',
}

export function ImageCropUpload({
  value,
  onChange,
  label = 'Upload Image',
  hint,
  aspect,
  outputWidth,
  outputHeight,
  previewMode = 'cover',
  className = '',
  cropTitle = 'Crop image',
}: ImageCropUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  const resetCropState = () => {
    setCropOpen(false)
    setImageSrc('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
  }

  const openFilePicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp,image/gif'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        setImageSrc(String(reader.result))
        setCropOpen(true)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const uploadBlob = async (blob: Blob, filename: string) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', blob, filename)
      const res = await fileApi.uploadCms(fd)
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

  const applyCrop = async () => {
    if (!imageSrc || !croppedArea) return
    setUploading(true)
    try {
      const mime: 'image/png' | 'image/jpeg' = aspect === 1 ? 'image/png' : 'image/png'
      const blob = await getCroppedImageBlob(imageSrc, croppedArea, outputWidth, outputHeight, mime)
      const ext = mime === 'image/png' ? 'png' : 'jpg'
      await uploadBlob(blob, `cropped-${outputWidth}x${outputHeight}.${ext}`)
      resetCropState()
    } catch {
      toast.error('Could not crop image')
      setUploading(false)
    }
  }

  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      {hint && <p className="text-xs text-slate-500 -mt-1 mb-2">{hint}</p>}

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-white">
          <img src={mediaUrl(value)} alt="Upload preview" className={previewClass[previewMode]} />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={openFilePicker}
              className="p-1.5 rounded-lg bg-white/90 shadow hover:bg-white"
              title="Replace & crop"
            >
              <Crop className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg bg-white/90 shadow hover:bg-white"
              title="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={openFilePicker}
          className="admin-file-upload-zone w-full"
        >
          {uploading ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <Upload className="h-8 w-8 text-slate-400" />}
          <span className="text-sm text-slate-500 font-medium">{uploading ? 'Uploading...' : 'Choose image & crop'}</span>
          <span className="text-xs text-slate-400">JPG, PNG, WebP · Max 5MB</span>
        </button>
      )}

      <AdminModal
        open={cropOpen}
        onClose={resetCropState}
        title={cropTitle}
        wide
        footer={(
          <>
            <AdminBtn variant="secondary" onClick={resetCropState}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={() => void applyCrop()} disabled={uploading || !croppedArea}>
              {uploading ? 'Saving...' : 'Apply crop'}
            </AdminBtn>
          </>
        )}
      >
        <div className="image-crop-stage">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />
          )}
        </div>
        <div className="image-crop-zoom mt-4">
          <ZoomIn className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary-600"
            aria-label="Zoom"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Drag to reposition · scroll or slider to zoom · output {outputWidth}×{outputHeight}px
        </p>
      </AdminModal>
    </div>
  )
}
