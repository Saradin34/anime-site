import { useParams, useSearchParams } from 'react-router-dom'
import CatalogSection from '@/components/CatalogSection'
import { Film } from 'lucide-react'

export default function CatalogPage() {
  const { genre } = useParams()
  const [params] = useSearchParams()
  const q = params.get('q') || ''

  const title = q
    ? `Поиск: «${q}»`
    : genre
    ? `Жанр: ${decodeURIComponent(genre)}`
    : 'Каталог аниме'

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
