// Универсальный интерфейс провайдера источника видео.
// Любой источник (AniLibria, HiAnime, ...) реализует этот контракт,
// а UI агрегирует их в одном плеере.

export interface VideoQuality {
  label: string         // '1080p' | '720p' | '480p' | 'auto'
  url: string           // ссылка на .m3u8 (HLS) или mp4
  type: 'hls' | 'mp4'
}

export interface SourceTrack {
  /** ID источника-провайдера: 'anilibria' | 'hianime' */
  providerId: string
  /** Человекочитаемое имя в UI: "AniLibria · Дубляж" / "HiAnime · Sub · HD-1" */
  label: string
  /** Язык/категория для значка: 'ru-dub' | 'jp-sub' | 'en-sub' | 'en-dub' */
  language: 'ru-dub' | 'jp-sub' | 'en-sub' | 'en-dub' | 'raw' | string
  /** Сама дорожка с одним или несколькими качествами */
  qualities: VideoQuality[]
  /** Поддерживается ли прямое HLS-воспроизведение (false если требуется iframe) */
  embedOnly?: boolean
  /** Iframe URL (если embedOnly) */
  iframeUrl?: string
  /** Субтитры (vtt) */
  subtitles?: { lang: string; url: string; label?: string }[]
  /** Метаданные эпизода (опционально) */
  intro?: { start: number; end: number }
  outro?: { start: number; end: number }
}

export interface UniversalEpisode {
  number: number
  title?: string | null
  /** Все доступные дорожки из всех провайдеров */
  sources: SourceTrack[]
  /** Превью для списка эпизодов */
  thumbnail?: string | null
  /** Длительность в секундах */
  duration?: number | null
}

/** Краткая инфа об аниме у конкретного провайдера (для маппинга) */
export interface ProviderMatch {
  providerId: string
  /** Внутренний ID у провайдера (alias / kebab-case slug) */
  id: string
  title: string
  /** Точность совпадения 0..1 */
  score: number
  /** Кол-во эпизодов sub/dub */
  episodesSub?: number
  episodesDub?: number
}
