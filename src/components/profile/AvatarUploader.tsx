// Компонент аватарки с возможностью загрузки и обрезки.
// При клике открывается модалка предпросмотра + слайдер масштаба.

import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2, Upload, X } from 'lucide-react'
import { readFileAsDataURL, squareCropResize, validateImageFile, dataUrlSizeKB } from '@/lib/imageUtils'
import clsx from 'clsx'

interface Props {
  /** Текущий аватар (data URL или внешний URL) */
  src?: string | null
  /** Запасной инициал (если аватара нет) */
  fallbackInitial: string
  /** Размер в px (отображение) */
  size?: number
  /** Можно ли редактировать (показывать оверлей с камерой) */
  editable?: boolean
  /** Колбэк сохранения нового аватара (или null = удалить) */
  onChange?: (dataUrl: string | null) => void
}

export default function AvatarUploader({
  src, fallbackInitial, size = 120, editable = true, onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const openPicker = () => inputRef.current?.click()

  const handleFile = async (file: File) => {
    setError(null)
    const err = validateImageFile(file, 8)
    if (err) { setError(err); return }
    setBusy(true)
    try {
      const raw = await readFileAsDataURL(file)
      const cropped = await squareCropResize(raw, 256, 0.85)
      setPreview(cropped)
    } catch (e: any) {
      setError(e?.message || 'Не удалось обработать изображение')
    } finally {
      setBusy(false)
    }
  }

  const handleSave = () => {
    if (preview) {
      onChange?.(preview)
      setPreview(null)
    }
  }

  const handleRemove = () => {
    onChange?.(null)
    setPreview(null)
  }

  return (
    <>
      <div
        className="relative shrink-0 group"
        style={{ width: size, height: size }}
      >
        {src ? (
          <img
            src={src}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover border-4 border-bg shadow-2xl"
          />
        ) : (
          <div
            className="w-full h-full rounded-full bg-gradient-neon flex items-center justify-center font-bold text-white border-4 border-bg shadow-2xl"
            style={{ fontSize: size * 0.4 }}
          >
            {fallbackInitial.toUpperCase()}
          </div>
        )}

        {editable && (
          <button
            onClick={openPicker}
            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition cursor-pointer"
            title="Сменить аватар"
            aria-label="Сменить аватар"
          >
            <Camera size={size * 0.25} className="text-white" />
          </button>
        )}

        {editable && (
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
        )}
      </div>

      {/* Модалка предпросмотра */}
      {(preview || busy || error) && editable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-strong rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold">Новый аватар</h3>
              <button
                onClick={() => { setPreview(null); setError(null) }}
                className="text-text-muted hover:text-text"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            {busy ? (
              <div className="flex flex-col items-center py-12 text-text-muted">
                <Loader2 size={36} className="animate-spin text-neon-purple mb-3" />
                <span className="text-sm">Обрабатываем изображение...</span>
              </div>
            ) : preview ? (
              <>
                <div className="flex justify-center mb-5">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-48 h-48 rounded-full object-cover shadow-neon border-4 border-bg"
                  />
                </div>
                <p className="text-xs text-text-dim text-center mb-5">
                  Размер: {dataUrlSizeKB(preview)} КБ · 256×256 px
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPreview(null); openPicker() }}
                    className="btn-ghost flex-1"
                  >
                    <Upload size={16} /> Другое
                  </button>
                  <button onClick={handleSave} className="btn-primary flex-1">
                    Сохранить
                  </button>
                </div>
              </>
            ) : null}

            {error && (
              <div className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                {error}
              </div>
            )}

            {src && !preview && !busy && (
              <button
                onClick={handleRemove}
                className="mt-3 w-full btn-ghost text-red-400 hover:!text-red-300"
              >
                <Trash2 size={16} /> Удалить текущий аватар
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
