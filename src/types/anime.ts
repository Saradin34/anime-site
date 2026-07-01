// Типы AniLiberty API v1 (https://anilibria.top/api/docs/v1)
// Старый api.anilibria.tv/v3 отключён 7 августа 2025.

export interface ValueDesc<T = string> {
  value: T
  description: string
}

export interface PosterImage {
  src: string | null
  preview: string | null
  thumbnail: string | null
  optimized?: {
    src?: string | null
    preview?: string | null
    thumbnail?: string | null
  }
}

export interface ReleaseName {
  main: string
  english: string | null
  alternative: string | null
}

export interface AgeRating {
  value: string
  label: string
  is_adult: boolean
  description: string
}

export interface Genre {
  id: number
  name: string
  image?: PosterImage
  total_releases?: number
}

export interface Member {
  id: string
  role: ValueDesc
  nickname: string
  user: { id: number; nickname: string; avatar?: PosterImage } | null
}

export interface Episode {
  id: string
  name: string | null
  name_english: string | null
  ordinal: number
  opening?: { start: number; stop: number } | null
  ending?: { start: number; stop: number } | null
  preview?: PosterImage
  hls_480: string | null
  hls_720: string | null
  hls_1080: string | null
  duration: number | null
  rutube_id: string | null
  youtube_id: string | null
  updated_at: string
  sort_order: number
  release_id: number
}

/** Краткое представление релиза (используется в списках) */
export interface ReleaseShort {
  id: number
  type: ValueDesc
  year: number | null
  name: ReleaseName
  alias: string
  season: ValueDesc<string | null>
  poster: PosterImage
  fresh_at: string | null
  created_at: string
  updated_at: string
  is_ongoing: boolean
  age_rating: AgeRating
  publish_day: ValueDesc<number>
  description: string | null
  notification?: string | null
  episodes_total: number | null
  is_in_production?: boolean
  is_blocked_by_geo?: boolean
  is_blocked_by_copyrights?: boolean
  added_in_users_favorites?: number
  average_duration_of_episode?: number | null
  genres?: Genre[]
}

/** Полная карточка релиза (с эпизодами и членами команды) */
export interface Release extends ReleaseShort {
  members: Member[]
  episodes: Episode[]
  sponsors?: any[]
  torrents?: any[]
  external_player?: string | null
}

export interface ScheduleItem {
  release: ReleaseShort
  full_season_is_released?: boolean
  release_date?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    pagination: {
      total: number
      count: number
      per_page: number
      current_page: number
      total_pages: number
      links: { next?: string; previous?: string }
    }
  }
}

// ----- Пользовательские локальные типы (наша БД в localStorage) -----

/**
 * Статусы списков просмотра. "favorite" вынесено в отдельный флаг `isFavorite`,
 * потому что аниме может быть одновременно "В избранном" И "Смотрю".
 */
export type ListType = 'watching' | 'planned' | 'completed' | 'dropped'

/** Все типы для UI-фильтров (включая favorite как отдельный псевдо-список) */
export type ListFilter = ListType | 'favorite' | 'all'

export interface UserListEntry {
  animeId: number
  alias: string
  title: string
  poster: string
  addedAt: number
  /** Статус просмотра (null если только в избранном) */
  list: ListType | null
  /** Флаг "в избранном" — независимо от статуса просмотра */
  isFavorite: boolean
  /** Личная оценка 1..10 */
  rating?: number
}

export interface HistoryEntry {
  animeId: number
  alias: string
  title: string
  poster: string
  episode: number
  progress: number
  watchedAt: number
}

export interface Comment {
  id: string
  animeId: number
  userId: string
  userName: string
  userAvatar: string | null
  text: string
  createdAt: number
  likes: string[]
}

export interface NotificationItem {
  id: string
  animeId: number
  alias: string
  title: string
  poster: string
  episode: number
  createdAt: number
  read: boolean
}

// ----- Профиль пользователя (расширенный, локальный) -----

export interface SocialLinks {
  discord?: string
  telegram?: string
  twitter?: string
  vk?: string
  mal?: string
  shikimori?: string
  website?: string
}

export interface UserProfile {
  /** Кастомный аватар (data URL base64 от загруженной картинки) */
  avatar?: string | null
  /** Кастомная обложка профиля (data URL) */
  cover?: string | null
  /** Никнейм для отображения (переопределяет displayName из Firebase) */
  displayName?: string | null
  /** Биография */
  bio?: string
  /** Любимая цитата */
  quote?: string
  /** Любимые жанры (ID из API) */
  favoriteGenres?: number[]
  /** ID любимых аниме для витрины (макс 10) */
  showcaseAnimeIds?: number[]
  /** Социальные ссылки */
  social?: SocialLinks
  /** Когда создан профиль (для статы «На сайте N дней») */
  joinedAt?: number
  /** Дата последнего обновления профиля */
  updatedAt?: number
}

/** Разблокированное достижение */
export interface UnlockedAchievement {
  id: string
  unlockedAt: number
}
