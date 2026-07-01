import { Link } from 'react-router-dom'
import { Heart, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'

export default function FavoritesPage() {
  const { user } = useAuthStore()
  const items = useUserStore((s) => (user ? s.getList(user.uid, 'favorite') : []))
  const toggleFavorite = useUserStore((s) => s.toggleFavorite)

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon-sm">
          <Heart size={28} className="text-white" fill="white" />
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Избранное</h1>
          <p className="text-text-muted text-sm">{items.length} аниме</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl">
          <Heart size={48} className="mx-auto text-text-dim mb-4" />
          <p className="text-text-muted mb-6">Вы пока ничего не добавили в избранное</p>
          <Link to="/catalog" className="btn-primary">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((e) => (
            <div
              key={e.animeId}
              className="relative rounded-2xl overflow-hidden card-hover bg-bg-card border border-app group"
            >
              <Link to={`/anime/${e.alias}`} className="block">
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={e.poster}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-neon-pink transition">
                    {e.title}
                  </h3>
                </div>
              </Link>
              {/* Убрать из избранного */}
              {user && (
                <button
                  onClick={(ev) => {
                    ev.preventDefault()
                    ev.stopPropagation()
                    toggleFavorite(user.uid, {
                      animeId: e.animeId,
                      alias: e.alias,
                      title: e.title,
                      poster: e.poster,
                    })
                  }}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-red-500/80 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Убрать из избранного"
                  aria-label="Убрать из избранного"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
