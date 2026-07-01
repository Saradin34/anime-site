// Агрегатор источников: AniLibria + HiAnime в один список SourceTrack для плеера.

import type { Release, Episode as LibriaEpisode } from '@/types/anime'
import type { SourceTrack, UniversalEpisode, ProviderMatch, VideoQuality } from './types'
import { findBestHiAnimeMatch, getHiAnimeSources, hianimeApi, HIANIME_ENABLED } from './hianime'

/**
 * Конвертируем эпизод AniLibria в SourceTrack
 */
export function libriaToSource(ep: LibriaEpisode, voiceLabel?: string): SourceTrack {
  const qualities: VideoQuality[] = []
  if (ep.hls_1080) qualities.push({ label: '1080p', url: ep.hls_1080, type: 'hls' })
  if (ep.hls_720) qualities.push({ label: '720p', url: ep.hls_720, type: 'hls' })
  if (ep.hls_480) qualities.push({ label: '480p', url: ep.hls_480, type: 'hls' })
  return {
    providerId: 'anilibria',
    label: `AniLibria · Русский дубляж${voiceLabel ? ` · ${voiceLabel}` : ''}`,
    language: 'ru-dub',
    qualities,
    intro: ep.opening ? { start: ep.opening.start, end: ep.opening.stop } : undefined,
    outro: ep.ending ? { start: ep.ending.start, end: ep.ending.stop } : undefined,
  }
}

/**
 * Соберём универсальный массив эпизодов на основе релиза AniLibria,
 * с возможностью динамически догружать HiAnime sources по запросу.
 */
export function buildUniversalEpisodes(release: Release, voiceLabel?: string): UniversalEpisode[] {
  const sorted = [...release.episodes].sort((a, b) => a.ordinal - b.ordinal)
  return sorted.map((ep) => ({
    number: ep.ordinal,
    title: ep.name,
    thumbnail: ep.preview?.optimized?.thumbnail || ep.preview?.thumbnail || null,
    duration: ep.duration,
    sources: [libriaToSource(ep, voiceLabel)],
  }))
}

/**
 * Найти HiAnime-маппинг для релиза AniLibria (асинхронно).
 * Возвращает null если соответствие не найдено или функция API недоступна.
 */
export async function matchHiAnimeForRelease(release: Release): Promise<ProviderMatch | null> {
  if (!HIANIME_ENABLED) return null
  const candidates = [
    release.name.english,
    release.name.main,
    release.name.alternative,
  ].filter(Boolean) as string[]
  if (!candidates.length) return null
  try {
    return await findBestHiAnimeMatch(candidates)
  } catch (e) {
    console.warn('HiAnime match failed:', e)
    return null
  }
}

/**
 * Загрузить HiAnime-источники для конкретной серии и вернуть их.
 */
export async function fetchHiAnimeForEpisode(
  hianimeId: string,
  episodeNumber: number
): Promise<SourceTrack[]> {
  try {
    return await getHiAnimeSources(hianimeId, episodeNumber)
  } catch (e) {
    console.warn(`HiAnime sources failed for ${hianimeId} ep${episodeNumber}:`, e)
    return []
  }
}

/**
 * Получить кол-во эпизодов на HiAnime для отображения статистики.
 */
export async function getHiAnimeEpisodeCount(hianimeId: string): Promise<{ total: number; sub: number; dub: number } | null> {
  try {
    const epList = await hianimeApi.episodes(hianimeId)
    const info = await hianimeApi.info(hianimeId).catch(() => null)
    return {
      total: epList.totalEpisodes,
      sub: info?.anime?.info?.stats?.episodes?.sub ?? 0,
      dub: info?.anime?.info?.stats?.episodes?.dub ?? 0,
    }
  } catch {
    return null
  }
}
