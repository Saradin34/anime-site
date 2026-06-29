// Утилиты для обработки изображений на клиенте:
// - чтение File → dataURL
// - ресайз через Canvas (квадрат для аватара / широкий для обложки)
// - JPEG-компрессия для уменьшения размера в localStorage

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = reject
    fr.readAsDataURL(file)
  })
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Обрезает картинку до квадрата (по центру) и ресайзит до size×size.
 * Возвращает data URL (JPEG, заданное качество).
 */
export async function squareCropResize(
  src: string,
  size = 256,
  quality = 0.85,
): Promise<string> {
  const img = await loadImage(src)
  const minSide = Math.min(img.width, img.height)
  const sx = (img.width - minSide) / 2
  const sy = (img.height - minSide) / 2

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * Ресайзит картинку, сохраняя пропорции, чтобы вписать в maxWidth×maxHeight.
 * Используется для обложки (ширина 1600px, аспект 3:1 примерно).
 */
export async function fitResize(
  src: string,
  maxWidth = 1600,
  maxHeight = 600,
  quality = 0.82,
): Promise<string> {
  const img = await loadImage(src)
  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}

/** Проверка валидности файла-картинки */
export function validateImageFile(file: File, maxMB = 8): string | null {
  if (!file.type.startsWith('image/')) return 'Это не изображение'
  if (file.size > maxMB * 1024 * 1024) return `Файл слишком большой (макс. ${maxMB} МБ)`
  return null
}

/** Размер строки base64 в килобайтах (приблизительно) */
export function dataUrlSizeKB(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || ''
  return Math.round((base64.length * 3) / 4 / 1024)
}
