/** Keep under typical PHP upload_max_filesize (often 2M on Windows). */
const MAX_BYTES = 1.8 * 1024 * 1024
const MAX_DIMENSION = 2480

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image compression failed'))),
      type,
      type === 'image/jpeg' ? quality : undefined,
    )
  })
}

/** Resize/compress large certificate or marksheet backgrounds for upload. */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const img = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / img.width, MAX_DIMENSION / img.height)
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))

  if (file.size <= MAX_BYTES && scale >= 1) return file

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, width, height)

  const tryEncode = async (type: string, quality: number) => canvasToBlob(canvas, type, quality)

  let blob = await tryEncode('image/jpeg', 0.9)
  if (blob.size > MAX_BYTES) blob = await tryEncode('image/jpeg', 0.8)
  if (blob.size > MAX_BYTES) blob = await tryEncode('image/jpeg', 0.7)
  if (blob.size > MAX_BYTES) blob = await tryEncode('image/jpeg', 0.6)
  if (blob.size > MAX_BYTES) {
    blob = await canvasToBlob(canvas, 'image/png')
  }

  const ext = blob.type === 'image/png' ? 'png' : 'jpg'
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'background'
  return new File([blob], `${baseName}.${ext}`, { type: blob.type, lastModified: Date.now() })
}
