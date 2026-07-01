// Витрина любимых аниме (5-10 шт) — выбираются из избранного.

import { Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import type { ReleaseShort } from '@/types/anime'
import { posterUrl } from '@/api/anilibria'
import clsx from 'clsx'

interface Props {
  /** Аниме которые отображать на витрине (полные данные) */
  items: ReleaseShort[]
  /** Возможные кандидаты для добавления (из избранного) */
  candidates?: ReleaseShort[]
  /** Текущие ID на витрине */
  selectedIds: number[]
  /** Возможность редактирования */
  editable?: boolean
  onToggle?: (animeId: number) => void
  onOpenPicker?: () => void
}

export default function FavoritesShowcase({
  items, selectedIds, editable, onToggle, onOpenPicker,
}: Props) {
  if (items.length === 0 && !editable) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl font-bold flex items-center gap-2">
          ⭐ Витрина любимых
          <span className="text-xs text-text-dim font-normal">{items.length}/10</span>
        </h3>
        {editable && onOpenPicker && (
          <button onClick={onOpenPicker} className="btn-ghost text-sm">
            <Plus size={14} /> Управлять
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-center text-text-muted">
          <span className="text-3xl block mb-2">🎬</span>
          <p className="text-sm mb-3">Витрина пустая</p>
          {editable && (
            <button onClick={onOpenPicker} className="btn-primary text-sm">
              <Plus size={14} /> Добавить из избранного
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {items.map((a) => (
            <div key={a.id} className="relative group">
              <Link
                to={`/anime/${a.alias}`}
                className="block aspect-[2/3] rounded-xl overflow-hidden border border-app card-hover"
              >
                <img
                  src={posterUrl(a.poster)}
                  alt={a.name.main}
                  className="w-full h-full object-cover"
                />
              </Link>
              {editable && (
                <button
                  onClick={() => onToggle?.(a.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-red-500"
                  title="Убрать с витрины"
                >
                  <X size={12} />
                </button>
              )}
              <p className="text-[10px] text-text-muted text-center mt-1 truncate" title={a.name.main}>
                {a.name.main}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
