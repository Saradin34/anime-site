import { useParams, useSearchParams } from 'react-router-dom'
import CatalogSection from '@/components/CatalogSection'
import { Film } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'

export default function CatalogPage() {
  const { genre } = useParams()
  const [params] = useSearchParams()
  const q = params.get('q') || ''

  const title = q
    ? `Поиск: «${q}»`
    : genre
    ? `Жанр: ${decodeURIComponent(genre)}`
    : 'Каталог аниме'

  const decodedGenre = genre ? decodeURIComponent(genre) : ''

  useSeo({
    title: q
      ? `Поиск аниме «${q}»`
      : decodedGenre
      ? `Аниме в жанре ${decodedGenre} — смотреть онлайн`
      : 'Каталог аниме — полный список тайтлов',
    description: q
      ? `Результаты поиска аниме по запросу «${q}» на AnimeFlux. Тысячи тайтлов в HD с русской озвучкой и субтитрами.`
      : decodedGenre
      ? `Смотреть аниме в жанре ${decodedGenre} онлайн бесплатно в HD-качестве. Лучшие тайтлы с русской озвучкой и английскими субтитрами. Новинки, онгоинги, классика.`
      : 'Полный каталог аниме на AnimeFlux: сортировка по году, жанрам, статусу. Тысячи сериалов, фильмов и OVA в HD с русской озвучкой. Смотрите онлайн бесплатно без рекламы.',
    canonical: q ? '/catalog' : decodedGenre ? `/genres/${genre}` : '/catalog',
    keywords: decodedGenre
      ? `аниме ${decodedGenre}, ${decodedGenre} аниме онлайн, смотреть ${decodedGenre}, ${decodedGenre} с озвучкой, лучшие аниме ${decodedGenre}`
      : 'каталог аниме, все аниме, аниме список, аниме по жанрам, аниме по годам, аниме HD',
    noindex: !!q,
    breadcrumbs: decodedGenre
      ? [
          { name: 'Главная', url: '/' },
          { name: 'Жанры', url: '/genres' },
          { name: decodedGenre, url: `/genres/${genre}` },
        ]
      : [
          { name: 'Главная', url: '/' },
          { name: 'Каталог', url: '/catalog' },
        ],
  })

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
      <div className="flex items-center gap-3 mb-6 mt-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-neon flex items-center justify-center shadow-neon-sm shrink-0">
          <Film size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">{title}</h1>
          <p className="text-text-muted text-sm">Используйте фильтры слева</p>
        </div>
      </div>

      <CatalogSection initialGenre={genre} hideTitle showSearchBar />
    </div>
  )
}
