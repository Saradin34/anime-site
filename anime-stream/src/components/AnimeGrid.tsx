import AnimeCard from './AnimeCard'
import type { ReleaseShort } from '@/types/anime'

export default function AnimeGrid({ items, loading }: { items: ReleaseShort[]; loading?: boolean }) {
  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-bg-card border border-app overflow-hidden">
            <div className="aspect-[2/3] bg-bg-elevated/50 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-bg-elevated/70 rounded animate-pulse" />
              <div className="h-2 bg-bg-elevated/50 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-20 text-text-muted">
        Ничего не найдено 😢
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((a) => (
        <AnimeCard key={a.id} anime={a} size="lg" />
      ))}
    </div>
  )
}
