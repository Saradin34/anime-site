import { Link, useParams, NavLink } from 'react-router-dom'
import { ListVideo, Trash2, Star, Heart } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import type { ListFilter, ListType } from '@/types/anime'
import clsx from 'clsx'

const TABS: { id: ListFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'watching', label: 'Смотрю' },
  { id: 'planned', label: 'Запланировано' },
  { id: 'completed', label: 'Просмотрено' },
  { id: 'dropped', label: 'Брошено' },
  { id: 'favorite', label: 'Избранное' },
]

const STATUS_LABEL: Record<ListType, string> = {
  watching: 'Смотрю',
  planned: 'Запланировано',
  completed: 'Просмотрено',
  dropped: 'Брошено',
}

export default function ListsPage() {
  const { list } = useParams<{ list?: ListFilter }>()
  const { user } = useAuthStore()
  const {
    getList, removeFromList, setRating,
    toggleFavorite, clearListStatus,
  } = useUserStore()

  if (!user) return null

  const activeTab: ListFilter = (list as ListFilter) || 'all'
  const items = getList(user.uid, activeTab)

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon-sm">
          <ListVideo size={28} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Мои списки</h1>
          <p className="text-text-muted text-sm">{items.length} аниме</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {TABS.map((t) => (
          <NavLink
            key={t.id}
            to={t.id === 'all' ? '/lists' : `/lists/${t.id}`}
            end
            className={({ isActive }) =>
              clsx(
                'shrink-0 px-4 py-2 rounded-xl font-medium transition text-sm',
                isActive
                  ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-neon-sm'
                  : 'bg-hover border border-app hover:bg-hover-strong text-text-muted',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl">
          <ListVideo size={48} className="mx-auto text-text-dim mb-4" />
          <p className="text-text-muted mb-6">Пока ничего не добавлено</p>
          <Link to="/catalog" className="btn-primary">К каталогу</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((e) => (
            <div key={e.animeId} className="glass rounded-2xl p-3 flex gap-3 items-center group">
              <Link to={`/anime/${e.alias}`} className="shrink-0">
                <img src={e.poster} alt="" className="w-16 h-22 rounded-lg object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/anime/${e.alias}`} className="block font-semibold truncate hover:text-neon-pink transition">
                  {e.title}
                </Link>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted mt-1">
                  {e.list && (
                    <span className="chip text-[10px] py-0">{STATUS_LABEL[e.list]}</span>
                  )}
                  {e.isFavorite && (
                    <span className="chip text-[10px] py-0 text-neon-pink border-neon-pink/40">
                      <Heart size={10} fill="currentColor" /> Избранное
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 mt-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRating(user.uid, e.animeId, i + 1)}
                      className={clsx(
                        'transition',
                        (e.rating || 0) > i ? 'text-neon-pink' : 'text-text-dim hover:text-text',
                      )}
                      title={`${i + 1}/10`}
                    >
                      <Star size={14} fill={(e.rating || 0) > i ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Действия */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                {/* В активной вкладке Избранное — только убрать из избранного */}
                {activeTab === 'favorite' && e.isFavorite ? (
                  <button
                    onClick={() =>
                      toggleFavorite(user.uid, {
                        animeId: e.animeId,
                        alias: e.alias,
                        title: e.title,
                        poster: e.poster,
                      })
                    }
                    className="text-text-dim hover:text-red-400 transition p-2"
                    aria-label="Убрать из избранного"
                    title="Убрать из избранного"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                ) : activeTab !== 'all' && activeTab !== 'favorite' && e.list ? (
                  <button
                    onClick={() => clearListStatus(user.uid, e.animeId)}
                    className="text-text-dim hover:text-red-400 transition p-2"
                    aria-label="Убрать из списка"
                    title="Убрать из этого списка"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => removeFromList(user.uid, e.animeId)}
                    className="text-text-dim hover:text-red-400 transition p-2"
                    aria-label="Удалить полностью"
                    title="Удалить полностью"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
