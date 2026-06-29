// Каталог + сайдбар с фильтрами (год, жанры) + бесконечный скролл.
// Используется и на главной (без поиска), и на странице /catalog (с поиском в URL).

import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Filter, X, Tags, CalendarRange } from 'lucide-react'
import { animeApi } from '@/api/anilibria'
import type { ReleaseShort, Genre } from '@/types/anime'
import AnimeGrid from '@/components/AnimeGrid'
import InfiniteSentinel from '@/components/InfiniteSentinel'
import clsx from 'clsx'

interface Props {
  /** Заранее заданный жанр (URL /genres/:genre) */
  initialGenre?: string
  /** Заголовок над каталогом */
  title?: string
  /** Скрыть заголовок (для встраивания на главную, где есть собственный) */
  hideTitle?: boolean
  /** Показать строку поиска (только на /catalog) */
  showSearchBar?: boolean
}

export default function CatalogSection({ initialGenre, title = 'Каталог аниме', hideTitle, showSearchBar }: Props) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const year = params.get('year') || ''

  const [items, setItems] = useState<ReleaseShort[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [genres, setGenres] = useState<Genre[]>([])
  const [years, setYears] = useState<number[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const currentGenre = genres.find((g) => g.name === decodeURIComponent(initialGenre || ''))

  useEffect(() => {
    animeApi.genresRef().then(setGenres).catch(() => {})
    animeApi.years().then((y) => setYears(y.slice().reverse())).catch(() => {})
  }, [])

  // Сброс пагинации при смене фильтров
  useEffect(() => {
    setPage(1); setItems([]); setHasMore(true)
  }, [q, initialGenre, year])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    animeApi.catalog({
      search: q || undefined,
      genres: currentGenre ? [currentGenre.id] : undefined,
      years: year ? { from_year: Number(year), to_year: Number(year) } : undefined,
      page,
      limit: 24,
      sort: 'FRESH_AT_DESC',
    }).then((res) => {
      if (cancelled) return
      setItems((prev) => (page === 1 ? res.data : [...prev, ...res.data]))
      setHasMore(page < res.meta.pagination.total_pages)
      setTotal(res.meta.pagination.total)
    }).catch((e) => {
      console.error(e); setHasMore(false)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [q, currentGenre?.id, year, page])

  const setYear = (y: string) => {
    const next = new URLSearchParams(params)
    if (y) next.set('year', y); else next.delete('year')
    setParams(next, { replace: true })
  }

  const goToGenre = (g: Genre) => {
    if (currentGenre?.id === g.id) {
      // снять фильтр
      navigate(showSearchBar ? '/catalog' : '/')
    } else {
      navigate(`/genres/${encodeURIComponent(g.name)}`)
    }
  }

  return (
    <section className="mb-12">
      {!hideTitle && (
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
            <p className="text-text-muted text-sm mt-1">
              {total > 0 ? `Всего: ${total.toLocaleString('ru-RU')} аниме` : loading ? 'Загрузка...' : ''}
            </p>
          </div>
          <button onClick={() => setFiltersOpen((v) => !v)} className="btn-ghost lg:hidden">
            <Filter size={16} /> Фильтры
          </button>
        </div>
      )}

      {(year || currentGenre) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {currentGenre && (
            <button onClick={() => navigate(showSearchBar ? '/catalog' : '/')} className="chip chip-active flex items-center gap-1">
              {currentGenre.name} <X size={12} />
            </button>
          )}
          {year && (
            <button onClick={() => setYear('')} className="chip chip-active flex items-center gap-1">
              {year} <X size={12} />
            </button>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className={clsx('lg:block', filtersOpen ? 'block' : 'hidden')}>
          <div className="glass rounded-2xl p-5 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="font-semibold">Фильтры</h3>
              <button onClick={() => setFiltersOpen(false)} className="text-text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-text-muted">
              <CalendarRange size={14} /> Год
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {years.slice(0, 30).map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(year === String(y) ? '' : String(y))}
                  className={clsx(
                    'chip text-xs hover:bg-bg-card/70 transition',
                    year === String(y) && 'chip-active'
                  )}
                >
                  {y}
                </button>
              ))}
            </div>

            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-text-muted">
              <Tags size={14} /> Жанры
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => goToGenre(g)}
                  className={clsx(
                    'chip text-xs hover:bg-bg-card/70 transition',
                    currentGenre?.id === g.id && 'chip-active'
                  )}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <AnimeGrid items={items} loading={loading && page === 1} />
          {items.length > 0 && (
            <InfiniteSentinel
              onLoadMore={() => setPage((p) => p + 1)}
              hasMore={hasMore}
              loading={loading}
            />
          )}
        </div>
      </div>
    </section>
  )
}
