// Динамический sitemap для аниме-страниц.
// Тянет последние ~500 релизов из AniLibria API и генерирует sitemap.xml
// Доступен по адресу /sitemap-anime.xml (см. redirect в netlify.toml)

import type { Handler } from '@netlify/functions'

const SITE = 'https://anime-flux.netlify.app'
const API = 'https://api.anilibria.app/api/v1'

interface Release {
  alias: string
  updated_at?: string
  fresh_at?: string
  poster?: {
    src?: string | null
    optimized?: { preview?: string | null } | null
  }
  name?: { main?: string }
}

function xmlEscape(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] || c
  ))
}

async function fetchPage(page: number, limit = 100): Promise<Release[]> {
  try {
    const res = await fetch(`${API}/anime/catalog/releases?page=${page}&limit=${limit}&f%5Bsort%5D=FRESH_AT_DESC`)
    if (!res.ok) return []
    const json: any = await res.json()
    return (json?.data as Release[]) || []
  } catch {
    return []
  }
}

export const handler: Handler = async () => {
  // Собираем 5 страниц по 100 = 500 самых свежих аниме
  const pages = await Promise.all([1, 2, 3, 4, 5].map((p) => fetchPage(p, 100)))
  const releases = pages.flat()

  const urls = releases.map((r) => {
    const lastmod = (r.updated_at || r.fresh_at || new Date().toISOString()).slice(0, 10)
    const posterPath = r.poster?.optimized?.preview || r.poster?.src
    const poster = posterPath ? `https://anilibria.top${posterPath}` : null
    const title = r.name?.main ? xmlEscape(r.name.main) : ''

    return `  <url>
    <loc>${SITE}/anime/${encodeURIComponent(r.alias)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>${poster ? `
    <image:image>
      <image:loc>${xmlEscape(poster)}</image:loc>
      <image:title>${title}</image:title>
    </image:image>` : ''}
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemaps/image/1.1">
${urls}
</urlset>`

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
    body: xml,
  }
}
