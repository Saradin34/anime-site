// Обложка профиля: широкий баннер с возможностью загрузки.
// При клике на кнопку — выбор файла, ресайз до 1600x600, сохранение в data URL.

import { useRef, useState } from 'react'
import { Image as ImageIcon, Trash2, Loader2 } from 'lucide-react'
import { readFileAsDataURL, fitResize, validateImageFile } from '@/lib/imageUtils'

interface Props {
  src?: string | null
  editable?: boolean
  onChange?: (dataUrl: string | null) => void
  children?: React.ReactNode
}

export default function CoverUploader({ src, editable = true, onChange, children }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    const err = validateImageFile(file, 8)
    if (err) { setError(err); return }
    setBusy(true)
    try {
      const raw = await readFileAsDataURL(file)
      const resized = await fitResize(raw, 1600, 600, 0.82)
      onChange?.(resized)
    } catch (e: any) {
      setError(e?.message || 'Не удалось обработать изображение')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-2xl group bg-gradient-to-br from-neon-purple/30 via-neon-pink/20 to-neon-cyan/20">
      {src && (
        <img
          src={src}
          alt="Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Декоративное затемнение снизу для читаемости контента */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent pointer-events-none" />
      {!src && (
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at top left, rgba(255,61,240,0.5), transparent 60%), ' +
              'radial-gradient(ellipse at bottom right, rgba(34,211,238,0.4), transparent 60%)',
          }}
        />
      )}

      {children}

      {/* Кнопки управления (правый верх) */}
      {editable && (
        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-medium hover:bg-black/80 transition flex items-center gap-1.5 disabled:opacity-50"
            title="Загрузить обложку"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
            {src ? 'Сменить' : 'Загрузить обложку'}
          </button>
          {src && (
            <button
              onClick={() => onChange?.(null)}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-medium hover:bg-red-500/80 transition flex items-center gap-1.5 disabled:opacity-50"
              title="Удалить обложку"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />

      {error && (
        <div className="absolute bottom-3 left-3 right-3 z-10 px-3 py-2 rounded-lg bg-red-500/90 text-white text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
