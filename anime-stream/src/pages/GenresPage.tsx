import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tags } from 'lucide-react'
import { animeApi, posterUrl } from '@/api/anilibria'
import type { Genre } from '@/types/anime'
import { useSeo } from '@/hooks/useSeo'

const GENRE_EMOJI: Record<string, string> = {
  'Боевые искусства': '🥋', 'Вампиры': '🧛', 'Гарем': '🌸', 'Демоны': '👹', 'Детектив': '🔍',
  'Дзёсей': '💄', 'Драма': '🎭', 'Игры': '🎮', 'Исекай': '🌀', 'Исторический': '📜',
  'Киберпанк': '🤖', 'Комедия': '😂', 'Магия': '✨', 'Меха': '🤖', 'Мистика': '🔮',
  'Музыка': '🎵', 'Пародия': '🎪', 'Повседневность': '🍵', 'Приключения': '🗺️',
  'Психологическое': '🧠', 'Романтика': '💕', 'Сверхъестественное': '👻', 'Сёдзе': '🎀',
  'Сёдзе-ай': '🌷', 'Сейнен': '⚔️', 'Сёнен': '🔥', 'Спорт': '⚽', 'Супер сила': '💪',
  'Триллер': '🔪', 'Ужасы': '😱', 'Фантастика': '🛸', 'Фэнтези': '🐉', 'Школа': '🎓',
  'Экшен': '💥', 'Этти': '🔥',
}

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  useSeo({
    title: 'Жанры аниме — все категории и подборки',
    description: 'Все жанры аниме на AnimeFlux: экшен, романтика, фэнтези, исекай, комедия, сёнэн, школа, приключения, драма, мистика. Найдите свой любимый жанр и смотрите тысячи тайтлов в HD с русской озвучкой онлайн бесплатно.',
    canonical: '/genres',
    keywords: 'жанры аниме, категории аниме, аниме экшен, аниме романтика, аниме фэнтези, аниме исекай, аниме комедия, аниме сёнэн, аниме школа, подборки аниме',
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Жанры', url: '/genres' },
    ],
  })

  useEffect(() => {
    animeApi.genres()
      .then((g) => setGenres(g.sort((a, b) => (b.total_releases || 0) - (a.total_releases || 0))))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon-sm">
          <Tags size={28} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Жанры</h1>
          <p className="text-text-muted text-sm">Выберите жанр, чтобы открыть подборку</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-32 bg-bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {genres.map((g) => (
            <Link
              key={g.id}
              to={`/genres/${encodeURIComponent(g.name)}`}
              className="relative h-32 rounded-2xl overflow-hidden group border border-app hover:border-neon-purple/40 transition"
            >
              {g.image ? (
                <img src={posterUrl(g.image)} alt={`Аниме в жанре ${g.name}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition duration-500" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/20" />
              <div className="relative h-full flex flex-col justify-between p-4">
                <div className="text-2xl">{GENRE_EMOJI[g.name] || '🎬'}</div>
                <div>
                  <div className="font-semibold group-hover:text-neon-pink transition">{g.name}</div>
                  {g.total_releases !== undefined && (
                    <div className="text-xs text-text-muted">{g.total_releases} релизов</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
