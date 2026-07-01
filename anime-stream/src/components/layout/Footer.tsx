import { Link } from 'react-router-dom'
import { Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-app bg-bg-soft/50 backdrop-blur-sm">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-neon flex items-center justify-center">
              <span className="font-display font-bold text-white">A</span>
            </div>
            <span className="font-display font-bold text-lg">Anime<span className="neon-text">Flux</span></span>
          </div>
          <p className="text-sm text-text-muted">
            Современный стриминг аниме с библиотекой AniLibria. Все права на контент принадлежат правообладателям.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-text-muted">Навигация</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/catalog" className="hover:text-text text-text-muted transition">Каталог</Link></li>
            <li><Link to="/top" className="hover:text-text text-text-muted transition">Топ-100</Link></li>
            <li><Link to="/genres" className="hover:text-text text-text-muted transition">Жанры</Link></li>
            <li><Link to="/schedule" className="hover:text-text text-text-muted transition">Расписание</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-text-muted">Аккаунт</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:text-text text-text-muted transition">Профиль</Link></li>
            <li><Link to="/lists" className="hover:text-text text-text-muted transition">Мои списки</Link></li>
            <li><Link to="/favorites" className="hover:text-text text-text-muted transition">Избранное</Link></li>
            <li><Link to="/history" className="hover:text-text text-text-muted transition">История</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-text-muted">Источники</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://anilibria.tv" target="_blank" rel="noopener noreferrer" className="hover:text-text text-text-muted transition">AniLibria.tv</a></li>
            <li><a href="https://github.com/anilibria/docs" target="_blank" rel="noopener noreferrer" className="hover:text-text text-text-muted transition flex items-center gap-1"><Github size={14}/>API Docs</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-app py-5 text-center text-xs text-text-dim flex items-center justify-center gap-1">
        © {new Date().getFullYear()} AnimeFlux. Сделано с <Heart size={12} className="text-neon-pink" /> на React + Vite
      </div>
    </footer>
  )
}
