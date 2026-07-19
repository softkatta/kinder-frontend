import { useEffect, useRef, useState } from 'react'
import { Camera, RefreshCw, Upload, X } from 'lucide-react'
import { Button } from './Button'

interface CameraCaptureProps {
  value?: string | null
  onChange: (file: File | null, previewUrl: string | null) => void
  label?: string
}

export function CameraCapture({ value, onChange, label = 'Photo' }: CameraCaptureProps) {
  const [active, setActive] = useState(false)
  const [facing, setFacing] = useState<'user' | 'environment'>('environment')
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setActive(false)
  }

  const startCamera = async (mode: 'user' | 'environment') => {
    stopCamera()
    setError('')
    setFacing(mode)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      })
      streamRef.current = stream
      setActive(true)
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
    } catch {
      setError('Camera not available. Use upload instead.')
    }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      setPreview(url)
      onChange(file, url)
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(file, url)
    stopCamera()
  }

  const clear = () => {
    setPreview(null)
    onChange(null, null)
    stopCamera()
  }

  useEffect(() => () => stopCamera(), [])

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-32 h-32 rounded-2xl object-cover border-2 border-primary-100" />
          <button type="button" onClick={clear} className="absolute -top-2 -right-2 p-1 rounded-full bg-error text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : active ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary-200 max-w-xs">
          <video ref={videoRef} className="w-full aspect-square object-cover bg-black" playsInline muted />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-2">
            <Button type="button" size="sm" variant="primary" onClick={capture}>Capture</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => startCamera(facing === 'user' ? 'environment' : 'user')}>
              <RefreshCw className="h-4 w-4" /> Switch
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => startCamera('environment')}>
            <Camera className="h-4 w-4" /> Open Camera
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Upload Photo
          </Button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
