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
    title: 'Смотреть аниме онлайн бесплатно в HD',
    description: 'AnimeFlux — бесплатный онлайн-кинотеатр аниме в HD-качестве (720p, 1080p). Тысячи тайтлов с русской озвучкой и субтитрами: новинки сезона, онгоинги 2026, культовая классика, сёнэн, романтика, фэнтези, исекай. Смотрите на телефоне и ПК без рекламы.',
    canonical: '/',
    type: 'website',
    keywords: 'аниме онлайн, смотреть аниме, аниме бесплатно, аниме HD, аниме 1080p, аниме с русской озвучкой, аниме на русском, новинки аниме, онгоинги 2026, аниме без рекламы, каталог аниме, онлайн кинотеатр аниме',
    breadcrumbs: [{ name: 'Главная', url: '/' }],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'AnimeFlux — главная страница',
      description: 'Онлайн-кинотеатр аниме: свежие релизы, онгоинги, каталог с фильтрами',
      url: 'https://anime-flux.netlify.app/',
      inLanguage: 'ru-RU',
      isPartOf: { '@id': 'https://anime-flux.netlify.app/#website' },
    },
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
      {/* SEO-заголовок H1: невидим визуально (sr-only), но виден поисковикам.
          Единственный H1 на странице — правильная семантика для Google. */}
      <h1 className="sr-only">
        AnimeFlux — смотреть аниме онлайн бесплатно в HD с русской озвучкой
      </h1>

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

      {/* SEO-текст: смысловой контент с LSI-фразами для поисковиков.
          Не отвлекает от UI, но помогает Яндексу и Google понимать тематику. */}
      <section className="mt-16 mb-10 glass rounded-2xl p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold mb-4">Что такое AnimeFlux</h2>
        <div className="max-w-none text-text-muted leading-relaxed space-y-3 text-sm md:text-base">
          <p>
            <strong>AnimeFlux</strong> — это современный онлайн-кинотеатр аниме, где можно
            смотреть тысячи тайтлов в HD-качестве (<strong>720p и 1080p</strong>) абсолютно
            бесплатно и без надоедливой рекламы. У нас представлены аниме-сериалы, полнометражные
            фильмы и OVA с профессиональной русской озвучкой от студии AniLibria и английскими
            субтитрами от HiAnime.
          </p>
          <p>
            В нашем каталоге вы найдёте <strong>свежие онгоинги 2026 года</strong>, культовую
            классику и хиты прошлых сезонов. Смотрите в любимых жанрах: экшен, романтика,
            фэнтези, исекай, сёнэн, комедия, школа, приключения, психологическое, спорт,
            мистика. Удобный <strong>плеер работает на телефоне, планшете и компьютере</strong> —
            с поддержкой полноэкранного режима и адаптивным качеством видео.
          </p>
        </div>

        <h3 className="font-display text-xl font-bold mt-6 mb-3">Возможности сайта</h3>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-text-muted">
          <li>✨ Онлайн-просмотр аниме в HD 1080p</li>
          <li>🎙️ Русская озвучка и субтитры</li>
          <li>📅 Расписание выхода новых серий</li>
          <li>🔥 Топ-100 лучших аниме всех времён</li>
          <li>📚 Личные списки: смотрю, запланировано, просмотрено, брошено</li>
          <li>❤️ Избранное и оценки от 1 до 10</li>
          <li>🔔 Уведомления о новых сериях любимых онгоингов</li>
          <li>📊 Статистика просмотра и достижения</li>
        </ul>

        <h3 className="font-display text-xl font-bold mt-6 mb-3">Популярные жанры аниме</h3>
        <p className="text-sm text-text-muted mb-3">
          Выберите подборку по своему настроению — от эпичных сражений до трогательных
          романтических историй:
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <a href="/genres/%D0%AD%D0%BA%D1%88%D0%B5%D0%BD" className="chip hover:bg-hover-strong">Экшен</a>
          <a href="/genres/%D0%A0%D0%BE%D0%BC%D0%B0%D0%BD%D1%82%D0%B8%D0%BA%D0%B0" className="chip hover:bg-hover-strong">Романтика</a>
          <a href="/genres/%D0%A4%D1%8D%D0%BD%D1%82%D0%B5%D0%B7%D0%B8" className="chip hover:bg-hover-strong">Фэнтези</a>
          <a href="/genres/%D0%98%D1%81%D0%B5%D0%BA%D0%B0%D0%B9" className="chip hover:bg-hover-strong">Исекай</a>
          <a href="/genres/%D0%9A%D0%BE%D0%BC%D0%B5%D0%B4%D0%B8%D1%8F" className="chip hover:bg-hover-strong">Комедия</a>
          <a href="/genres/%D0%A1%D1%91%D0%BD%D0%B5%D0%BD" className="chip hover:bg-hover-strong">Сёнэн</a>
          <a href="/genres/%D0%A8%D0%BA%D0%BE%D0%BB%D0%B0" className="chip hover:bg-hover-strong">Школа</a>
          <a href="/genres/%D0%9F%D1%80%D0%B8%D0%BA%D0%BB%D1%8E%D1%87%D0%B5%D0%BD%D0%B8%D1%8F" className="chip hover:bg-hover-strong">Приключения</a>
        </div>
      </section>
    </div>
  )
}
