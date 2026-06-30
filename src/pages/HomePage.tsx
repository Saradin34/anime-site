import { lazy, Suspense, useEffect, useState } from 'react'
import HeroSlider from '@/components/HeroSlider'
import HorizontalRail from '@/components/HorizontalRail'
import LazySection from '@/components/LazySection'
import { animeApi } from '@/api/anilibria'
import type { ReleaseShort } from '@/types/anime'
import { Sparkles, AlertCircle, Flame } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'

// Каталог — самая тяжёлая секция, грузим только при скролле
const CatalogSection = lazy(() => import('@/components/CatalogSection'))

export default function HomePage() {
  useSeo({
    title: 'Смотреть аниме онлайн в HD',
    description: 'AnimeFlux — тысячи аниме онлайн бесплатно: новинки сезона, онгоинги, классика. HD 1080p, русская озвучка от AniLibria, английские sub/dub от HiAnime. Без рекламы.',
    canonical: '/',
    type: 'website',
  })
  const [hero, setHero] = useState<ReleaseShort[]>([])
  const [updates, setUpdates] = useState<ReleaseShort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const latest = await animeApi.latest(20)
        if (cancelled) return
        setHero(latest.slice(0, 5))
        setUpdates(latest)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Не удалось загрузить данные')
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
      {/* Hero */}
      <div className="mb-10 mt-2">
        {loading ? (
          <div className="h-[60vh] min-h-[460px] rounded-3xl bg-bg-card animate-pulse" />
        ) : (
          <HeroSlider items={hero} />
        )}
      </div>

      {error && (
        <div className="mb-8 glass rounded-2xl p-4 flex items-center gap-3 border-red-500/30">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div className="text-sm">
            <div className="font-semibold text-red-400">Ошибка загрузки</div>
            <div className="text-text-muted">{error}</div>
          </div>
        </div>
      )}

      {/* Промо-баннер */}
      <div className="mb-10 relative overflow-hidden rounded-2xl p-6 md:p-8 glass">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-pink/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neon-purple/30 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon-sm shrink-0">
            <Sparkles size={26} className="text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl md:text-2xl">Тысячи аниме в одном месте</h2>
            <p className="text-text-muted text-sm mt-1">Бесплатно. Без рекламы. С русской озвучкой от AniLibria.</p>
          </div>
        </div>
      </div>

      {/* Последние обновления — горизонтальный рейл */}
      <HorizontalRail
        title="🆕 Последние обновления"
        subtitle="Свежие серии и новинки"
        items={updates}
        loading={loading}
      />

      {/* Каталог с сайдбаром — встроен прямо на главную */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center shadow-neon-sm shrink-0">
          <Flame size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Каталог аниме</h2>
          <p className="text-text-muted text-sm">Фильтры по году и жанрам — слева</p>
        </div>
      </div>

      <LazySection minHeight="600px" rootMargin="400px">
        <Suspense fallback={<div className="h-[600px] glass rounded-2xl animate-pulse" />}>
          <CatalogSection hideTitle />
        </Suspense>
      </LazySection>
    </div>
  )
}
