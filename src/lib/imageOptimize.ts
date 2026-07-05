export interface OptimizeImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export async function optimizeImage(file: File, options: OptimizeImageOptions = {}): Promise<File> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = options

  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality))
  if (!blob) return file

  const optimizedName = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([blob], optimizedName, { type: 'image/webp' })
}
