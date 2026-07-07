// Клиент для актуального AniLiberty API v1
// Документация: https://anilibria.top/api/docs/v1
// Старый api.anilibria.tv/v3 отключён 7 августа 2025.

import type {
  Release, ReleaseShort, Genre, ScheduleItem, PaginatedResponse,
} from '@/types/anime'

// Доступные хосты API (используются по очереди при недоступности)
const API_HOSTS = [
  'https://api.anilibria.app/api/v1',
  'https://anilibria.top/api/v1',
  'https://aniliberty.top/api/v1',
]
// Основной CDN AniLibria для изображений и видео
const STORAGE_HOST = 'https://anilibria.top'

let activeHostIndex = 0

async function get<T>(path: string, params?: Record<string, any>): Promise<T> {
  let lastError: any = null
  for (let attempt = 0; attempt < API_HOSTS.length; attempt++) {
    const host = API_HOSTS[(activeHostIndex + attempt) % API_HOSTS.length]
    const url = new URL(`${host}${path}`)
    if (params) appendParams(url, params)
    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        activeHostIndex = (activeHostIndex + attempt) % API_HOSTS.length
        return (await res.json()) as T
      }
      lastError = new Error(`API ${res.status} on ${host}${path}`)
    } catch (e) {
      lastError = e
    }
  }
  throw lastError || new Error('Все хосты API недоступны')
}

/** Конвертация вложенных объектов параметров в формат query AniLiberty: f[types][0]=TV */
function appendParams(url: URL, params: Record<string, any>, prefix?: string) {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    const fullKey = prefix ? `${prefix}[${key}]` : key
    if (Array.isArray(value)) {
      value.forEach((v, i) => url.searchParams.append(`${fullKey}[${i}]`, String(v)))
    } else if (typeof value === 'object') {
      appendParams(url, value, fullKey)
    } else {
      url.searchParams.set(fullKey, String(value))
    }
  }
}

/** Абсолютный URL для постера / превью */
export function posterUrl(img?: { src?: string | null; preview?: string | null; thumbnail?: string | null; optimized?: any } | string | null): string {
  if (!img) return '/placeholder-poster.svg'
  if (typeof img === 'string') {
    if (img.startsWith('http')) return img
    return `${STORAGE_HOST}${img}`
  }
  const path = img.optimized?.src || img.src || img.preview || img.thumbnail
  if (!path) return '/placeholder-poster.svg'
  if (path.startsWith('http')) return path
  return `${STORAGE_HOST}${path}`
}

export function thumbUrl(img?: { thumbnail?: string | null; preview?: string | null; optimized?: any } | null): string {
  if (!img) return '/placeholder-poster.svg'
  const path = img.optimized?.thumbnail || img.thumbnail || img.optimized?.preview || img.preview
  if (!path) return '/placeholder-poster.svg'
  if (path.startsWith('http')) return path
  return `${STORAGE_HOST}${path}`
}

// ============================================================
//                          API METHODS
// ============================================================

export interface CatalogFilters {
  page?: number
  limit?: number
  search?: string
  genres?: number[]
  types?: string[]
  years?: { from_year?: number; to_year?: number }
  /** sort: FRESH_AT_DESC, FRESH_AT_ASC, RATING_DESC, ... */
  sort?: string
}

export const animeApi = {
  /** Последние обновлённые релизы (главная) */
  async latest(limit = 20): Promise<ReleaseShort[]> {
    return get<ReleaseShort[]>('/anime/releases/latest', { limit })
  },

  /** Каталог с фильтрами и пагинацией */
  async catalog(filters: CatalogFilters = {}): Promise<PaginatedResponse<ReleaseShort>> {
    const { page = 1, limit = 24, search, genres, types, years, sort } = filters
    const query: any = { page, limit }
    if (search) query.search = search
    const f: any = {}
    if (genres && genres.length) f.genres = genres
    if (types && types.length) f.types = types
    if (years && (years.from_year || years.to_year)) f.years = years
    if (sort) f.sort = sort
    if (Object.keys(f).length) query.f = f
    return get<PaginatedResponse<ReleaseShort>>('/anime/catalog/releases', query)
  },

  /** Полная карточка релиза по alias или id */
  async release(aliasOrId: string | number): Promise<Release> {
    return get<Release>(`/anime/releases/${aliasOrId}`)
  },

  /** Случайные релизы */
  async random(limit = 5): Promise<ReleaseShort[]> {
    return get<ReleaseShort[]>('/anime/releases/random', { limit })
  },

  /** Список жанров со счётчиками и картинками */
  async genres(): Promise<Genre[]> {
    return get<Genre[]>('/anime/genres')
  },

  /** Простой справочник жанров (id+name) — для фильтров */
  async genresRef(): Promise<Genre[]> {
    return get<Genre[]>('/anime/catalog/references/genres')
  },

  /** Доступные годы */
  async years(): Promise<number[]> {
    return get<number[]>('/anime/catalog/references/years')
  },

  /** Типы (TV, ONA, MOVIE, ...) */
  async types(): Promise<{ value: string; description: string }[]> {
    return get<{ value: string; description: string }[]>('/anime/catalog/references/types')
  },

  /** Расписание выхода серий */
  async schedule(): Promise<ScheduleItem[]> {
    return get<ScheduleItem[]>('/anime/schedule/week')
  },

  /** Поиск (мгновенный, без фильтров) */
  async search(query: string, limit = 8): Promise<ReleaseShort[]> {
    return get<ReleaseShort[]>('/app/search/releases', { query, limit })
  },
}
