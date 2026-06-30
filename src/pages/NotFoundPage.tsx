import { Link } from 'react-router-dom'
import { useSeo } from '@/hooks/useSeo'

export default function NotFoundPage() {
  useSeo({ title: '404 — страница не найдена', noindex: true })
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="font-display font-bold text-7xl md:text-9xl neon-text mb-2">404</div>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Страница не найдена</h1>
      <p className="text-text-muted mb-6">Кажется, мы потеряли эту главу аниме...</p>
      <Link to="/" className="btn-primary">На главную</Link>
    </div>
  )
}
