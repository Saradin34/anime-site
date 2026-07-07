// Netlify Function: прокси к npm-пакету `aniwatch` (HiAnime scraper).
// Все запросы /api/aniwatch/<endpoint>?... попадают сюда через rewrite в netlify.toml.
//
// Endpoints:
//   GET /api/aniwatch/home
//   GET /api/aniwatch/search?q=naruto&page=1
//   GET /api/aniwatch/info?id=steinsgate-3
//   GET /api/aniwatch/episodes?id=steinsgate-3
//   GET /api/aniwatch/servers?episodeId=steinsgate-3?ep=213
//   GET /api/aniwatch/sources?episodeId=steinsgate-3?ep=213&server=hd-1&category=sub
//   GET /api/aniwatch/schedule?date=2026-06-29&tz=-180
//   GET /api/aniwatch/category?name=most-popular&page=1
//   GET /api/aniwatch/genre?name=action&page=1

import type { Handler, HandlerEvent } from '@netlify/functions'
import { HiAnime } from 'aniwatch'

const hianime = new HiAnime.Scraper()

// In-memory кэш (живёт только пока контейнер тёплый, обычно 5-15 минут)
const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
}

function json(statusCode: number, body: any) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' })
  }

  // path выглядит как "/api/aniwatch/search" — берём последний сегмент
  const fullPath = event.path || ''
  const segments = fullPath.replace(/^\/+|\/+$/g, '').split('/')
  const endpoint = segments[segments.length - 1] || ''
  const q = event.queryStringParameters || {}

  const cacheKey = `${endpoint}?${JSON.stringify(q)}`
  const hit = cache.get(cacheKey)
  if (hit && hit.expires > Date.now()) {
    return json(200, { success: true, data: hit.data, cached: true })
  }

  try {
    let data: any

    switch (endpoint) {
      case 'home':
        data = await hianime.getHomePage()
        break

      case 'search': {
        const query = (q.q || '').trim()
        const page = Number(q.page || 1)
        if (!query) return json(400, { error: 'Query "q" is required' })
        data = await hianime.search(query, page)
        break
      }

      case 'suggest': {
        const query = (q.q || '').trim()
        if (!query) return json(400, { error: 'Query "q" is required' })
        data = await hianime.searchSuggestions(query)
        break
      }

      case 'info': {
        const id = (q.id || '').trim()
        if (!id) return json(400, { error: 'Param "id" is required' })
        data = await hianime.getInfo(id)
        break
      }

      case 'episodes': {
        const id = (q.id || '').trim()
        if (!id) return json(400, { error: 'Param "id" is required' })
        data = await hianime.getEpisodes(id)
        break
      }

      case 'servers': {
        const episodeId = (q.episodeId || '').trim()
        if (!episodeId) return json(400, { error: 'Param "episodeId" is required' })
        data = await hianime.getEpisodeServers(episodeId)
        break
      }

      case 'sources': {
        const episodeId = (q.episodeId || '').trim()
        const server = (q.server || 'hd-1') as any
        const category = (q.category || 'sub') as 'sub' | 'dub' | 'raw'
        if (!episodeId) return json(400, { error: 'Param "episodeId" is required' })
        data = await hianime.getEpisodeSources(episodeId, server, category)
        break
      }

      case 'schedule': {
        const date = q.date || new Date().toISOString().slice(0, 10)
        const tz = Number(q.tz || -180)
        data = await hianime.getEstimatedSchedule(date, tz)
        break
      }

      case 'category': {
        const name = (q.name || 'most-popular') as any
        const page = Number(q.page || 1)
        data = await hianime.getCategoryAnime(name, page)
        break
      }

      case 'genre': {
        const name = (q.name || '').trim()
        const page = Number(q.page || 1)
        if (!name) return json(400, { error: 'Param "name" is required' })
        data = await hianime.getGenreAnime(name, page)
        break
      }

      default:
        return json(404, {
          error: 'Unknown endpoint',
          available: ['home', 'search', 'suggest', 'info', 'episodes', 'servers', 'sources', 'schedule', 'category', 'genre'],
        })
    }

    cache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL })
    return json(200, { success: true, data })
  } catch (e: any) {
    console.error(`[aniwatch] ${endpoint} error:`, e?.message || e)
    return json(500, {
      success: false,
      error: e?.message || 'Unknown error',
      endpoint,
    })
  }
}
