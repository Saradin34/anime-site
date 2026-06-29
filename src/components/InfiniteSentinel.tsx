import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
  /** Расстояние до триггера в пикселях */
  rootMargin?: string
}

/**
 * Невидимый элемент-сторож, который вызывает onLoadMore когда попадает в область видимости.
 * Используется вместо кнопки "Показать ещё" для бесконечной прокрутки.
 */
export default function InfiniteSentinel({ onLoadMore, hasMore, loading, rootMargin = '600px' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || loading) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore()
      },
      { rootMargin, threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onLoadMore, hasMore, loading, rootMargin])

  if (!hasMore) {
    return (
      <div className="text-center py-8 text-text-dim text-sm">
        ✨ Вы посмотрели все результаты
      </div>
    )
  }

  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-10 gap-3" aria-live="polite">
      <Loader2 className="animate-spin text-neon-purple" size={28} />
      <span className="text-text-dim text-sm">Подгружаем ещё...</span>
    </div>
  )
}
