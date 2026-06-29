// Хук агрегации статистики пользователя для отображения на странице профиля.
// Считает: часы просмотра, среднюю оценку, распределение по жанрам, активность по дням и т.д.

import { useEffect, useMemo, useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { useProfileStore } from '@/store/profileStore'
import { animeApi } from '@/api/anilibria'
import type { ReleaseShort } from '@/types/anime'
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
  averageRating: number   // 0..10
  uniqueEpisodes: number
  totalMinutes: number
  totalHours: number
  totalDays: number
  daysOnSite: number
  /** Распределение по жанрам {genreName: count} (по реальным аниме из списков) */
  genreDistribution: { name: string; count: number }[]
  /** Heatmap активности: последние 90 дней [{date, count}] */
  activityHeatmap: { date: string; count: number }[]
  /** Топ-5 любимых тайтлов (по рейтингу) */
  topRated: ReleaseShort[]
  /** Все загруженные аниме из списков (для витрины и т.п.) */
  enrichedLists: Map<number, ReleaseShort>
  loading: boolean
}

export function useProfileStats(uid: string | null): ProfileStats {
  const lists = useUserStore((s) => (uid ? s.getList(uid) : []))
  const history = useUserStore((s) => (uid ? s.getHistory(uid) : []))
  const profile = useProfileStore((s) => (uid ? s.getProfile(uid) : null))
  const unlockAchievement = useProfileStore((s) => s.unlockAchievement)

  const [enriched, setEnriched] = useState<Map<number, ReleaseShort>>(new Map())
  const [loading, setLoading] = useState(false)

  // Загружаем подробности по аниме (для жанров и обложек витрины) — порционно
  useEffect(() => {
    if (!uid) return
    const idsToLoad = lists
      .map((e) => e.animeId)
      .filter((id) => !enriched.has(id))
      .slice(0, 30)  // загружаем порциями
    if (idsToLoad.length === 0) return

    let cancelled = false
    setLoading(true)
    ;(async () => {
      const map = new Map(enriched)
      for (const id of idsToLoad) {
        if (cancelled) return
        try {
          const release = await animeApi.release(id)
          map.set(id, release)
        } catch {
          // молча пропускаем — может быть удалено / геоблок
        }
      }
      if (!cancelled) {
        setEnriched(map)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, lists.length])

  const stats: ProfileStats = useMemo(() => {
    const totalEntries = lists.length
    const watching = lists.filter((e) => e.list === 'watching').length
    const planned = lists.filter((e) => e.list === 'planned').length
    const completed = lists.filter((e) => e.list === 'completed').length
    const dropped = lists.filter((e) => e.list === 'dropped').length
    const favorites = lists.filter((e) => e.isFavorite).length

    const ratings = lists.filter((e) => (e.rating ?? 0) > 0)
    const ratingsCount = ratings.length
    const averageRating = ratingsCount > 0
      ? ratings.reduce((s, e) => s + (e.rating || 0), 0) / ratingsCount
      : 0

    const seen = new Set(history.map((h) => `${h.animeId}-${h.episode}`))
    const uniqueEpisodes = seen.size
    const totalMinutes = uniqueEpisodes * AVG_EP_MIN
    const totalHours = totalMinutes / 60
    const totalDays = totalHours / 24

    const joinedAt = profile?.joinedAt || Date.now()
    const daysOnSite = Math.max(1, Math.floor((Date.now() - joinedAt) / (1000 * 60 * 60 * 24)))

    // Распределение по жанрам — считаем по обогащённым данным
    const genreCounter = new Map<string, number>()
    for (const e of lists) {
      const r = enriched.get(e.animeId)
      if (!r?.genres) continue
      for (const g of r.genres) {
        genreCounter.set(g.name, (genreCounter.get(g.name) || 0) + 1)
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
      enrichedLists: enriched,
      loading,
    }
  }, [lists, history, profile, enriched, loading])

  // Проверка достижений (выполняется когда меняется статистика)
  useEffect(() => {
    if (!uid) return
    const ctx = buildContext(lists, history, stats.daysOnSite, AVG_EP_MIN)
    const shouldUnlock = evaluateAchievements(ctx)
    for (const id of shouldUnlock) {
      unlockAchievement(uid, id)
    }
  }, [uid, lists, history, stats.daysOnSite, unlockAchievement])

  return stats
}
