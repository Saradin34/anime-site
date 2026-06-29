import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Star, Play } from 'lucide-react'
import { animeApi, posterUrl } from '@/api/anilibria'
import type { ReleaseShort } from '@/types/anime'
import clsx from 'clsx'

export default function TopPage() {
  const [items, setItems] = useState<ReleaseShort[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      animeApi.catalog({ page: 1, limit: 50, sort: 'RATING_DESC' }),
      animeApi.catalog({ page: 2, limit: 50, sort: 'RATING_DESC' }),
    ]).then(([a, b]) => {
      // Сортируем по in_favorites на клиенте, если sort не сработал
      const merged = [...a.data, ...b.data]
        .sort((x, y) => (y.added_in_users_favorites || 0) - (x.added_in_users_favorites || 0))
        .slice(0, 100)
      setItems(merged)
    }).catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon-sm">
          <Trophy size={28} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Топ-100</h1>
          <p className="text-text-muted text-sm">Лучшее аниме по версии пользователей</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-24 bg-bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((a, i) => (
            <Link
              key={a.id}
              to={`/anime/${a.alias}`}
              className="glass rounded-2xl p-3 flex items-center gap-4 hover:bg-hover transition group"
            >
              <div className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0',
                i < 3 ? 'bg-gradient-neon text-white shadow-neon-sm' : 'bg-hover text-text-muted'
              )}>
                {i + 1}
              </div>
              <img src={posterUrl(a.poster)} alt="" className="w-14 h-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-neon-pink transition truncate">{a.name.main}</h3>
                <p className="text-xs text-text-muted truncate">{a.name.english}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-text-dim">
                  <span>{a.year}</span>
                  <span>•</span>
                  <span>{a.type?.description}</span>
                  {a.genres?.length ? (<><span>•</span><span className="truncate">{a.genres.slice(0, 3).map(g => g.name).join(', ')}</span></>) : null}
                </div>
              </div>
              {(a.added_in_users_favorites ?? 0) > 0 && (
                <div className="hidden sm:flex items-center gap-1 text-neon-pink font-semibold text-sm shrink-0">
                  <Star size={14} fill="currentColor" /> {a.added_in_users_favorites}
                </div>
              )}
              <Play size={20} className="text-text-dim group-hover:text-neon-pink transition shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
