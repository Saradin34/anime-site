import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AnimeCard from './AnimeCard'
import type { ReleaseShort } from '@/types/anime'

interface Props {
  title: string
  subtitle?: string
  items: ReleaseShort[]
  loading?: boolean
}

export default function HorizontalRail({ title, subtitle, items, loading }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return
    const w = ref.current.clientWidth * 0.8
    ref.current.scrollBy({ left: dir === 'left' ? -w : w, behavior: 'smooth' })
  }

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
        </div>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-bg-card/40 border border-app hover:bg-bg-card/70 flex items-center justify-center transition" aria-label="Назад">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-bg-card/40 border border-app hover:bg-bg-card/70 flex items-center justify-center transition" aria-label="Вперёд">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={ref} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0 w-[170px] sm:w-[190px] rounded-2xl bg-bg-card border border-app overflow-hidden snap-start">
                <div className="aspect-[2/3] bg-bg-elevated/50 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-bg-elevated/70 rounded animate-pulse" />
                  <div className="h-2 bg-bg-elevated/50 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))
          : items.map((a) => (
              <div key={a.id} className="shrink-0 w-[170px] sm:w-[190px] snap-start">
                <AnimeCard anime={a} size="lg" />
              </div>
            ))}
      </div>
    </section>
  )
}
