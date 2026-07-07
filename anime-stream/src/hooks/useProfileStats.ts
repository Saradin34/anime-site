// Хук агрегации статистики пользователя для страницы профиля.
// Считает: часы просмотра, среднюю оценку, распределение по жанрам,
// heatmap активности, топ-5 по оценкам.

import { useEffect, useMemo, useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useProfileStore } from '@/store/profileStore'
import { animeApi } from '@/api/anilibria'
import type { ReleaseShort, UserListEntry, HistoryEntry } from '@/types/anime'
import { buildContext, evaluateAchievements } from '@/lib/achievements'

const AVG_EP_MIN = 22

export interface ProfileStats {
  totalEntries: number
  watching: number
  planned: number
  completed: number
  dropped: number
  favorites: number
  ratingsCount: number
  averageRating: number
  uniqueEpisodes: number
  totalMinutes: number
  totalHours: number
  totalDays: number
  daysOnSite: number
  genreDistribution: { name: string; count: number }[]
  activityHeatmap: { date: string; count: number }[]
  topRated: ReleaseShort[]
  enrichedLists: Map<number, ReleaseShort>
  loading: boolean
}

const EMPTY_ARR: any[] = []

export function useProfileStats(uid: string | null): ProfileStats {
  // Подписываемся НАПРЯМУЮ на срезы стора — тогда zustand отследит изменения
  // и хук пересчитается при добавлении/удалении записей.
  const lists: UserListEntry[] = useUserStore(
    (s) => (uid ? s.lists[uid] : EMPTY_ARR) || EMPTY_ARR,
  )
  const history: HistoryEntry[] = useUserStore(
    (s) => (uid ? s.history[uid] : EMPTY_ARR) || EMPTY_ARR,
  )
  // Профиль тоже напрямую — чтобы joinedAt подхватился
  const profile = useProfileStore((s) => (uid ? s.profiles[uid] : null))
  const unlockAchievement = useProfileStore((s) => s.unlockAchievement)

  const [enriched, setEnriched] = useState<Map<number, ReleaseShort>>(new Map())
  const [loading, setLoading] = useState(false)

  // Обогащение: загружаем полные карточки аниме по alias (для жанров и постеров витрины).
  // Триггерится когда меняется набор ID в списках.
  const listIdsKey = useMemo(() => lists.map((e) => e.animeId).sort().join(','), [lists])

  useEffect(() => {
    if (!uid || lists.length === 0) return
    // Находим что ещё не загружено (порциями по 20 чтобы не долбить API)
    const toLoad = lists
      .filter((e) => !enriched.has(e.animeId))
      .slice(0, 20)
    if (toLoad.length === 0) return

    let cancelled = false
    setLoading(true)
    ;(async () => {
      const next = new Map(enriched)
      for (const entry of toLoad) {
        if (cancelled) return
        try {
          // Используем alias — стабильный идентификатор в API AniLibria
          const release = await animeApi.release(entry.alias)
          next.set(entry.animeId, release as unknown as ReleaseShort)
        } catch {
          // Молча пропускаем — тайтл может быть удалён / геоблок
        }
      }
      if (!cancelled) {
        setEnriched(next)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, listIdsKey])

  // Считаем всю статистику
  const stats = useMemo<Omit<ProfileStats, 'enrichedLists' | 'loading'>>(() => {
    const totalEntries = lists.length
    const watching = lists.filter((e) => e.list === 'watching').length
    const planned = lists.filter((e) => e.list === 'planned').length
    const completed = lists.filter((e) => e.list === 'completed').length
    const dropped = lists.filter((e) => e.list === 'dropped').length
    const favorites = lists.filter((e) => e.isFavorite).length

    const ratings = lists.filter((e) => (e.rating ?? 0) > 0)
    const ratingsCount = ratings.length
    const averageRating = ratingsCount > 0
      ? ratings.reduce((sum, e) => sum + (e.rating || 0), 0) / ratingsCount
      : 0

    // Уникальные серии — по (animeId + episode)
    const seen = new Set(history.map((h) => `${h.animeId}-${h.episode}`))
    const uniqueEpisodes = seen.size
    const totalMinutes = uniqueEpisodes * AVG_EP_MIN
    const totalHours = totalMinutes / 60
    const totalDays = totalHours / 24

    const joinedAt = profile?.joinedAt || Date.now()
    const daysOnSite = Math.max(1, Math.floor((Date.now() - joinedAt) / (1000 * 60 * 60 * 24)))

    // Распределение по жанрам (только по загруженным карточкам)
    const genreCounter = new Map<string, number>()
    for (const e of lists) {
      const r = enriched.get(e.animeId)
      const genres = (r as any)?.genres
      if (!Array.isArray(genres)) continue
      for (const g of genres) {
        if (g?.name) genreCounter.set(g.name, (genreCounter.get(g.name) || 0) + 1)
      }
    }
    const genreDistribution = Array.from(genreCounter.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Heatmap последних 90 дней
    const days = 90
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayMap = new Map<string, number>()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      dayMap.set(d.toISOString().slice(0, 10), 0)
    }
    for (const h of history) {
      const key = new Date(h.watchedAt).toISOString().slice(0, 10)
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + 1)
    }
    const activityHeatmap = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }))

    // Top-5 по личному рейтингу
    const topRated = ratings
      .slice()
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map((e) => enriched.get(e.animeId))
      .filter(Boolean) as ReleaseShort[]

    return {
      totalEntries, watching, planned, completed, dropped, favorites,
      ratingsCount, averageRating,
      uniqueEpisodes, totalMinutes, totalHours, totalDays,
      daysOnSite,
      genreDistribution,
      activityHeatmap,
      topRated,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists, history, profile?.joinedAt, enriched])

  // Проверка достижений (не блокирует рендер)
  useEffect(() => {
    if (!uid) return
    const ctx = buildContext(lists, history, stats.daysOnSite, AVG_EP_MIN)
    const shouldUnlock = evaluateAchievements(ctx)
    for (const id of shouldUnlock) {
      unlockAchievement(uid, id)
    }
  }, [uid, lists, history, stats.daysOnSite, unlockAchievement])

  return {
    ...stats,
    enrichedLists: enriched,
    loading,
  }
}
