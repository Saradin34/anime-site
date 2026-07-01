// Модалка выбора аниме для витрины (макс 10) из избранного / списков.

import { X, Check } from 'lucide-react'
import type { ReleaseShort } from '@/types/anime'
import { posterUrl } from '@/api/anilibria'
import clsx from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
  candidates: ReleaseShort[]
  selectedIds: number[]
  onToggle: (id: number) => void
}

export default function ShowcasePicker({ open, onClose, candidates, selectedIds, onToggle }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="glass-strong rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-bold">Витрина любимых</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Выбрано: <span className="text-text font-semibold">{selectedIds.length}</span>/10
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text"><X size={20} /></button>
        </div>

        {candidates.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center text-text-muted">
            <div>
              <span className="text-4xl block mb-2">❤️</span>
              <p>Сначала добавьте аниме в Избранное или списки —<br />тогда сможете выставить их на витрину.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto pr-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {candidates.map((a) => {
              const sel = selectedIds.includes(a.id)
              const disabled = !sel && selectedIds.length >= 10
              return (
                <button
                  key={a.id}
                  onClick={() => !disabled && onToggle(a.id)}
                  disabled={disabled}
                  className={clsx(
                    'group relative aspect-[2/3] rounded-xl overflow-hidden border-2 transition',
                    sel ? 'border-neon-pink shadow-neon-sm' : 'border-app hover:border-neon-purple',
                    disabled && 'opacity-40 cursor-not-allowed',
                  )}
                  title={a.name.main}
                >
                  <img src={posterUrl(a.poster)} alt={a.name.main} className="w-full h-full object-cover" />
                  <div className={clsx(
                    'absolute inset-0 flex items-center justify-center transition',
                    sel ? 'bg-neon-pink/30' : 'bg-black/0 group-hover:bg-black/30',
                  )}>
                    {sel && (
                      <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center shadow-neon">
                        <Check size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-[10px] text-white line-clamp-1">{a.name.main}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button onClick={onClose} className="btn-primary">Готово</button>
        </div>
      </div>
    </div>
  )
}
