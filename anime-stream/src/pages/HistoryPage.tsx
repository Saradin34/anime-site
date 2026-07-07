import { Link } from 'react-router-dom'
import { History, Trash2, Play, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'

export default function HistoryPage() {
  const { user } = useAuthStore()
  const { getHistory, clearHistory, removeHistoryEntry } = useUserStore()
  const items = user ? getHistory(user.uid) : []

  return (
    <div className="max-w-[1100px] mx-auto px-4 lg:px-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon-sm">
            <History size={28} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">История просмотра</h1>
            <p className="text-text-muted text-sm">{items.length} записей</p>
          </div>
        </div>
        {items.length > 0 && user && (
          <button
            onClick={() => {
              if (confirm('Очистить всю историю просмотра?')) clearHistory(user.uid)
            }}
            className="btn-ghost text-red-400 border-red-500/30 hover:bg-red-500/10"
          >
            <Trash2 size={16} /> Очистить
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl">
          <History size={48} className="mx-auto text-text-dim mb-4" />
          <p className="text-text-muted mb-6">История пуста — начните смотреть аниме</p>
          <Link to="/catalog" className="btn-primary">К каталогу</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((e, i) => (
            <div
              key={`${e.animeId}-${e.episode}-${i}`}
              className="glass rounded-2xl p-3 flex items-center gap-4 hover:bg-hover transition group"
            >
              <Link to={`/anime/${e.alias}`} className="flex items-center gap-4 flex-1 min-w-0">
                <img src={e.poster} alt="" className="w-14 h-20 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-neon-pink transition truncate">{e.title}</h3>
                  <p className="text-sm text-text-muted">Серия {e.episode}</p>
                  <div className="mt-2 h-1.5 bg-hover-strong rounded-full overflow-hidden max-w-xs">
                    <div
                      className="h-full bg-gradient-to-r from-neon-pink to-neon-purple"
                      style={{ width: `${Math.round(e.progress * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-text-dim mt-1">
                    {new Date(e.watchedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <Play size={20} className="text-text-dim group-hover:text-neon-pink transition shrink-0" />
              </Link>
              {user && (
                <button
                  onClick={() => removeHistoryEntry(user.uid, e.animeId, e.episode)}
                  className="shrink-0 p-2 rounded-lg text-text-dim hover:text-red-400 hover:bg-hover transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Удалить из истории"
                  title="Удалить эту запись"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
