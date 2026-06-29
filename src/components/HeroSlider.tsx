import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Info, Star } from 'lucide-react'
import SmartImage from './SmartImage'
import type { ReleaseShort } from '@/types/anime'
import clsx from 'clsx'

export default function HeroSlider({ items }: { items: ReleaseShort[] }) {
  const [index, setIndex] = useState(0)
  const slides = items.slice(0, 5)

  useEffect(() => {
    if (slides.length === 0) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000)
    return () => clearInterval(t)
  }, [slides.length])

  // Превзагрузка следующего слайда
  useEffect(() => {
    const next = slides[(index + 1) % slides.length]
    if (!next?.poster) return
    const url =
      (next.poster.optimized?.src && `https://anilibria.top${next.poster.optimized.src}`) ||
      (next.poster.src && `https://anilibria.top${next.poster.src}`)
    if (!url) return
    const img = new Image()
    img.src = url
  }, [index, slides])

  if (slides.length === 0) {
    return <div className="relative h-[60vh] min-h-[420px] rounded-3xl bg-bg-card animate-pulse" />
  }

  const cur = slides[index]

  return (
    <div className="relative h-[60vh] min-h-[460px] rounded-3xl overflow-hidden border border-app">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={clsx(
            'absolute inset-0 transition-opacity duration-1000',
            i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <SmartImage
            poster={s.poster}
            alt={s.name.main}
            priority={i === index ? 'hero' : 'card'}
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
        </div>
      ))}

      <div className="relative h-full flex items-end p-6 md:p-12 z-10">
        <div className="max-w-2xl animate-slide-up" key={cur.id}>
          {/* Hero всегда показывает текст на тёмном overlay — для контраста с любым постером */}
          <div className="flex items-center gap-2 mb-3">
            <span className="chip bg-gradient-to-r from-neon-pink/40 to-neon-purple/40 border-neon-purple/50 text-white">
              ⚡ Новое
            </span>
            {cur.is_ongoing && <span className="chip bg-black/40 text-neon-cyan border-neon-cyan/40">Онгоинг</span>}
            {cur.year && <span className="chip bg-black/40 text-white/90 border-white/20">{cur.year}</span>}
            {cur.type?.description && <span className="chip bg-black/40 text-white/90 border-white/20">{cur.type.description}</span>}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-2 text-shadow leading-tight text-white">
            {cur.name.main}
          </h1>
          {cur.name.english && <p className="text-white/70 mb-4">{cur.name.english}</p>}
          <p className="text-white/80 text-sm md:text-base line-clamp-3 mb-5 max-w-xl">
            {cur.description?.replace(/\n/g, ' ') || 'Описание скоро появится.'}
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
            {(cur.added_in_users_favorites ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-neon-pink font-semibold">
                <Star size={14} fill="currentColor" /> {cur.added_in_users_favorites}
              </div>
            )}
            {cur.genres?.slice(0, 3).map((g) => (
              <span key={g.id} className="text-white/70">{g.name}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/anime/${cur.alias}`} className="btn-primary">
              <Play size={18} fill="white" /> Смотреть
            </Link>
            <Link to={`/anime/${cur.alias}`} className="btn-ghost">
              <Info size={18} /> Подробнее
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={clsx(
              'h-1.5 rounded-full transition-all',
              i === index ? 'w-8 bg-gradient-neon' : 'w-1.5 bg-text-dim/50 hover:bg-text-muted'
            )}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
