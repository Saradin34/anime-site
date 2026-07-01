import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import SmartImage from './SmartImage'
import type { ReleaseShort } from '@/types/anime'
import clsx from 'clsx'

interface Props {
  anime: ReleaseShort
  size?: 'sm' | 'md' | 'lg'
  showInfo?: boolean
}

export default function AnimeCard({ anime, size = 'md', showInfo = true }: Props) {
  const totalEps = anime.episodes_total ?? null
  const ongoing = anime.is_ongoing
  const favorites = anime.added_in_users_favorites ?? 0

  return (
    <Link
      to={`/anime/${anime.alias}`}
      className={clsx(
        'group block relative rounded-2xl overflow-hidden card-hover',
        'bg-bg-card border border-app',
        size === 'sm' && 'w-[160px]',
        size === 'lg' && 'w-full'
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <SmartImage
          poster={anime.poster}
          alt={anime.name.main}
          priority="card"
          className="w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        {/* Тёмный градиент для читаемости badge-ов поверх постера (в любой теме) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 pointer-events-none" />

        {ongoing && (
          <div className="absolute top-2 left-2 chip backdrop-blur-md bg-black/40 text-[10px] text-neon-cyan border-neon-cyan/30">
            ● Онгоинг
          </div>
        )}

        {favorites > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] text-neon-pink font-semibold">
            <Star size={10} fill="currentColor" /> {formatCount(favorites)}
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-gradient-neon flex items-center justify-center shadow-neon transform scale-90 group-hover:scale-100 transition-transform">
            <Play size={22} className="text-white ml-1" fill="white" />
          </div>
        </div>

        {totalEps && (
          <div className="absolute bottom-2 right-2 chip backdrop-blur-md bg-black/50 text-[10px] text-white border-app">
            {totalEps} эп.
          </div>
        )}
        {anime.age_rating?.label && (
          <div className="absolute bottom-2 left-2 chip backdrop-blur-md bg-black/50 text-[10px] text-white border-app">
            {anime.age_rating.label}
          </div>
        )}
      </div>

      {showInfo && (
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-neon-pink transition-colors">
            {anime.name.main}
          </h3>
          {anime.name.english && (
            <p className="text-xs text-text-dim line-clamp-1 mt-0.5">{anime.name.english}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-[11px] text-text-muted">
            {anime.year && <span>{anime.year}</span>}
            {anime.type?.description && (
              <>
                <span className="w-1 h-1 rounded-full bg-text-dim" />
                <span>{anime.type.description}</span>
              </>
            )}
            {anime.genres?.[0]?.name && (
              <>
                <span className="w-1 h-1 rounded-full bg-text-dim" />
                <span className="truncate">{anime.genres[0].name}</span>
              </>
            )}
          </div>
        </div>
      )}
    </Link>
  )
}

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
