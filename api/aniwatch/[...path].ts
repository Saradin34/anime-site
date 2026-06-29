// Vercel Serverless Function: прокси к npm-пакету `aniwatch` (HiAnime scraper).
// Все запросы /api/aniwatch/<endpoint> обрабатываются здесь.
//
// Endpoints:
//   GET /api/aniwatch/home
//   GET /api/aniwatch/search?q=naruto&page=1
//   GET /api/aniwatch/info?id=steinsgate-3
//   GET /api/aniwatch/episodes?id=steinsgate-3
//   GET /api/aniwatch/servers?episodeId=steinsgate-3?ep=213
//   GET /api/aniwatch/sources?episodeId=steinsgate-3?ep=213&server=hd-1&category=sub
//   GET /api/aniwatch/schedule?date=2026-06-29&tz=-180

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { HiAnime } from 'aniwatch'

const hianime = new HiAnime.Scraper()

// Простой in-memory кэш на 5 минут (сбрасывается при перезапуске функции).
const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const segments = (req.query.path as string[] | undefined) || []
  const endpoint = segments[0] || ''
  const cacheKey = req.url || endpoint

  // Cache hit
  const hit = cache.get(cacheKey)
  if (hit && hit.expires > Date.now()) {
    return res.status(200).json({ success: true, data: hit.data, cached: true })
  }

  try {
    let data: any

    switch (endpoint) {
      case 'home': {
        data = await hianime.getHomePage()
        break
      }
      case 'search': {
        const q = String(req.query.q || '').trim()
        const page = Number(req.query.page || 1)
        if (!q) return res.status(400).json({ error: 'Query "q" is required' })
        data = await hianime.search(q, page)
        break
      }
      case 'suggest': {
        const q = String(req.query.q || '').trim()
        if (!q) return res.status(400).json({ error: 'Query "q" is required' })
        data = await hianime.searchSuggestions(q)
        break
      }
      case 'info': {
        const id = String(req.query.id || '').trim()
        if (!id) return res.status(400).json({ error: 'Param "id" is required' })
        data = await hianime.getInfo(id)
        break
      }
      case 'episodes': {
        const id = String(req.query.id || '').trim()
        if (!id) return res.status(400).json({ error: 'Param "id" is required' })
        data = await hianime.getEpisodes(id)
        break
      }
      case 'servers': {
        const episodeId = String(req.query.episodeId || '').trim()
        if (!episodeId) return res.status(400).json({ error: 'Param "episodeId" is required' })
        data = await hianime.getEpisodeServers(episodeId)
        break
      }
      case 'sources': {
        const episodeId = String(req.query.episodeId || '').trim()
        const server = String(req.query.server || 'hd-1')
        const category = String(req.query.category || 'sub') as 'sub' | 'dub' | 'raw'
        if (!episodeId) return res.status(400).json({ error: 'Param "episodeId" is required' })
        data = await hianime.getEpisodeSources(episodeId, server as any, category)
        break
      }
      case 'schedule': {
        const date = String(req.query.date || new Date().toISOString().slice(0, 10))
        const tz = Number(req.query.tz || -180) // default -180 = Europe/Minsk
        data = await hianime.getEstimatedSchedule(date, tz)
        break
      }
      case 'category': {
        // /api/aniwatch/category?name=most-popular&page=1
        const name = String(req.query.name || 'most-popular') as any
        const page = Number(req.query.page || 1)
        data = await hianime.getCategoryAnime(name, page)
        break
      }
      case 'genre': {
        const name = String(req.query.name || '')
        const page = Number(req.query.page || 1)
        if (!name) return res.status(400).json({ error: 'Param "name" is required' })
        data = await hianime.getGenreAnime(name, page)
        break
      }
      default:
        return res.status(404).json({
          error: 'Unknown endpoint',
          available: ['home', 'search', 'suggest', 'info', 'episodes', 'servers', 'sources', 'schedule', 'category', 'genre'],
        })
    }

    cache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL })
    return res.status(200).json({ success: true, data })
  } catch (e: any) {
    console.error(`[aniwatch] ${endpoint} error:`, e?.message || e)
    return res.status(500).json({
      success: false,
      error: e?.message || 'Unknown error',
      endpoint,
    })
  }
}
