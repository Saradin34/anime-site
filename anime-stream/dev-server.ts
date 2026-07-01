// Dev-сервер для Aniwatch endpoints (используется в Vite через middleware).
// В production эти же эндпоинты обслуживаются Vercel Functions из /api/aniwatch/[...path].ts

import type { Connect } from 'vite'
import { HiAnime } from 'aniwatch'

const hianime = new HiAnime.Scraper()
const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000

export function aniwatchDevMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/aniwatch/')) return next()

    const url = new URL(req.url, 'http://localhost')
    const segments = url.pathname.replace('/api/aniwatch/', '').split('/').filter(Boolean)
    const endpoint = segments[0] || ''
    const q = url.searchParams

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')

    const cacheKey = req.url
    const hit = cache.get(cacheKey)
    if (hit && hit.expires > Date.now()) {
      res.statusCode = 200
      return res.end(JSON.stringify({ success: true, data: hit.data, cached: true }))
    }

    try {
      let data: any
      switch (endpoint) {
        case 'home':
          data = await hianime.getHomePage(); break
        case 'search':
          if (!q.get('q')) throw new Error('Query "q" is required')
          data = await hianime.search(q.get('q')!, Number(q.get('page') || 1)); break
        case 'suggest':
          if (!q.get('q')) throw new Error('Query "q" is required')
          data = await hianime.searchSuggestions(q.get('q')!); break
        case 'info':
          if (!q.get('id')) throw new Error('Param "id" is required')
          data = await hianime.getInfo(q.get('id')!); break
        case 'episodes':
          if (!q.get('id')) throw new Error('Param "id" is required')
          data = await hianime.getEpisodes(q.get('id')!); break
        case 'servers':
          if (!q.get('episodeId')) throw new Error('Param "episodeId" is required')
          data = await hianime.getEpisodeServers(q.get('episodeId')!); break
        case 'sources':
          if (!q.get('episodeId')) throw new Error('Param "episodeId" is required')
          data = await hianime.getEpisodeSources(
            q.get('episodeId')!,
            (q.get('server') || 'hd-1') as any,
            ((q.get('category') as any) || 'sub') as any
          ); break
        case 'schedule':
          data = await hianime.getEstimatedSchedule(
            q.get('date') || new Date().toISOString().slice(0, 10),
            Number(q.get('tz') || -180)
          ); break
        case 'category':
          data = await hianime.getCategoryAnime((q.get('name') || 'most-popular') as any, Number(q.get('page') || 1)); break
        case 'genre':
          if (!q.get('name')) throw new Error('Param "name" is required')
          data = await hianime.getGenreAnime(q.get('name')!, Number(q.get('page') || 1)); break
        default:
          res.statusCode = 404
          return res.end(JSON.stringify({ error: 'Unknown endpoint', endpoint }))
      }
      cache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL })
      res.statusCode = 200
      res.end(JSON.stringify({ success: true, data }))
    } catch (e: any) {
      console.error(`[aniwatch:${endpoint}]`, e?.message || e)
      res.statusCode = 500
      res.end(JSON.stringify({ success: false, error: e?.message || 'Unknown error', endpoint }))
    }
  }
}
