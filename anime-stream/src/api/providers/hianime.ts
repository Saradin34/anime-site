// Клиент к нашему собственному Aniwatch-прокси на /api/aniwatch/*
// (Vercel Function в проде, vite middleware в dev).

import type { ProviderMatch, SourceTrack, VideoQuality } from './types'

// Базовый URL прокси. По умолчанию — относительный (тот же домен),
// но можно переопределить в .env.local через VITE_ANIWATCH_BASE.
const BASE = (import.meta.env.VITE_ANIWATCH_BASE || '/api/aniwatch').replace(/\/$/, '')

export const HIANIME_ENABLED = import.meta.env.VITE_ENABLE_HIANIME !== 'false'

interface ApiResp<T> {
  success: boolean
  data?: T
  error?: string
  cached?: boolean
}

async function get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
  if (!HIANIME_ENABLED) throw new Error('HiAnime disabled')
  const isAbsolute = BASE.startsWith('http')
  const url = isAbsolute
    ? new URL(`${BASE}/${endpoint}`)
    : new URL(`${BASE}/${endpoint}`, window.location.origin)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const res = await fetch(url.toString())
  const json: ApiResp<T> = await res.json().catch(() => ({ success: false, error: 'Invalid JSON' } as ApiResp<T>))
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error || `HiAnime API error: ${res.status}`)
  }
  return json.data
}

// ----- Типы из пакета aniwatch (упрощённые) -----
interface HiAnimeSearchItem {
  id: string
  name: string
  jname: string | null
  poster: string
  duration?: string
  type?: string
  rating?: string | null
  episodes?: { sub: number | null; dub: number | null }
}

interface HiAnimeInfo {
  anime: {
    info: {
      id: string
      name: string
      poster: string
      description: string
      stats: { rating?: string; quality?: string; episodes: { sub: number; dub: number }; type?: string; duration?: string }
    }
    moreInfo: Record<string, any>
  }
  mostPopularAnimes?: HiAnimeSearchItem[]
  relatedAnimes?: HiAnimeSearchItem[]
  recommendedAnimes?: HiAnimeSearchItem[]
  seasons?: any[]
}

interface HiAnimeEpisode {
  number: number
  title: string | null
  episodeId: string  // "steinsgate-3?ep=213"
  isFiller: boolean
}

interface HiAnimeServers {
  episodeId: string
  episodeNo: number
  sub: { serverId: number; serverName: string }[]
  dub: { serverId: number; serverName: string }[]
  raw?: { serverId: number; serverName: string }[]
}

interface HiAnimeSources {
  headers?: Record<string, string>
  sources: { url: string; type: 'hls' | 'mp4' }[]
  subtitles?: { lang: string; url: string }[]
  anilistID?: number | null
  malID?: number | null
  intro?: { start: number; end: number }
  outro?: { start: number; end: number }
}

export const hianimeApi = {
  async search(query: string): Promise<HiAnimeSearchItem[]> {
    if (!query.trim()) return []
    try {
      const res = await get<{ animes: HiAnimeSearchItem[] }>('search', { q: query, page: 1 })
      return res.animes || []
    } catch {
      return []
    }
  },

  async info(id: string): Promise<HiAnimeInfo> {
    return get<HiAnimeInfo>('info', { id })
  },

  async episodes(id: string): Promise<{ totalEpisodes: number; episodes: HiAnimeEpisode[] }> {
    return get<{ totalEpisodes: number; episodes: HiAnimeEpisode[] }>('episodes', { id })
  },

  async servers(episodeId: string): Promise<HiAnimeServers> {
    return get<HiAnimeServers>('servers', { episodeId })
  },

  async sources(episodeId: string, server = 'hd-1', category: 'sub' | 'dub' | 'raw' = 'sub'): Promise<HiAnimeSources> {
    return get<HiAnimeSources>('sources', { episodeId, server, category })
  },
}

// ----- Утилиты для агрегатора -----

/**
 * Нечёткое сравнение названий (нормализация + ratio).
 * Возвращает 0..1
 */
function similarity(a: string, b: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9а-яё ]/gi, '').replace(/\s+/g, ' ').trim()
  const A = norm(a), B = norm(b)
  if (!A || !B) return 0
  if (A === B) return 1
  if (A.includes(B) || B.includes(A)) return 0.85
  // Levenshtein normalized
  const len = Math.max(A.length, B.length)
  const dp = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0))
  for (let i = 0; i <= A.length; i++) dp[i][0] = i
  for (let j = 0; j <= B.length; j++) dp[0][j] = j
  for (let i = 1; i <= A.length; i++) {
    for (let j = 1; j <= B.length; j++) {
      dp[i][j] = A[i-1] === B[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return 1 - dp[A.length][B.length] / len
}

/**
 * Найти лучшее совпадение на HiAnime по нескольким вариантам названия
 */
export async function findBestHiAnimeMatch(titles: string[]): Promise<ProviderMatch | null> {
  const queries = titles.filter(Boolean).slice(0, 3)
  let best: ProviderMatch | null = null

  for (const q of queries) {
    const results = await hianimeApi.search(q)
    for (const r of results) {
      const candidateTitles = [r.name, r.jname].filter(Boolean) as string[]
      const score = Math.max(...candidateTitles.map((t) => similarity(t, q)))
      if (!best || score > best.score) {
        best = {
          providerId: 'hianime',
          id: r.id,
          title: r.name,
          score,
          episodesSub: r.episodes?.sub ?? undefined,
          episodesDub: r.episodes?.dub ?? undefined,
        }
        if (score >= 0.95) return best  // ранний выход при отличном совпадении
      }
    }
  }
  // Возвращаем только при достаточной уверенности
  return best && best.score >= 0.55 ? best : null
}

/**
 * Получить SourceTrack для конкретной серии HiAnime (sub + dub если есть)
 */
export async function getHiAnimeSources(animeId: string, episodeNumber: number): Promise<SourceTrack[]> {
  const epList = await hianimeApi.episodes(animeId).catch(() => null)
  if (!epList) return []
  const ep = epList.episodes.find((e) => e.number === episodeNumber)
  if (!ep) return []

  const servers = await hianimeApi.servers(ep.episodeId).catch(() => null)
  if (!servers) return []

  const tracks: SourceTrack[] = []

  // Берём первые рабочие серверы для sub/dub
  const trySource = async (category: 'sub' | 'dub', servNames: string[]) => {
    for (const name of servNames) {
      try {
        const src = await hianimeApi.sources(ep.episodeId, name, category)
        if (!src?.sources?.length) continue
        const qualities: VideoQuality[] = src.sources.map((s, i) => ({
          label: src.sources.length === 1 ? 'auto' : `auto #${i + 1}`,
          url: s.url,
          type: s.type || 'hls',
        }))
        tracks.push({
          providerId: 'hianime',
          label: `HiAnime · ${category === 'sub' ? 'Sub' : 'Dub'} · ${name}`,
          language: category === 'sub' ? 'jp-sub' : 'en-dub',
          qualities,
          subtitles: src.subtitles?.map((s) => ({ lang: s.lang, url: s.url, label: s.lang })),
          intro: src.intro,
          outro: src.outro,
        })
        return  // нашли — выходим
      } catch (e) {
        console.warn(`HiAnime source failed for ${name}/${category}`, e)
      }
    }
  }

  const subNames = servers.sub?.map((s) => s.serverName) || []
  const dubNames = servers.dub?.map((s) => s.serverName) || []
  await Promise.all([trySource('sub', subNames), trySource('dub', dubNames)])
  return tracks
}
