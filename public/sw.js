// Простой Service Worker для кеша статики.
// Стратегия:
//  - HTML: network-first (всегда свежий)
//  - JS/CSS/PNG/WEBP: cache-first (мгновенно с диска)
//  - Картинки с anilibria.top: stale-while-revalidate

const VERSION = 'v1'
const STATIC = `static-${VERSION}`
const IMAGES = `images-${VERSION}`

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC && k !== IMAGES).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Не кэшируем API, аналитику, Firebase
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('firebaseio') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('google-analytics') ||
    url.hostname.includes('googletagmanager') ||
    url.hostname.includes('anilibria.app') ||
    url.hostname.includes('aniliberty')
  ) {
    return
  }

  // HTML — network-first
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('/'))),
    )
    return
  }

  // Картинки с CDN AniLibria — stale-while-revalidate
  if (url.hostname.includes('anilibria.top') && req.destination === 'image') {
    event.respondWith(
      caches.open(IMAGES).then(async (cache) => {
        const cached = await cache.match(req)
        const fetchPromise = fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone())
          return res
        }).catch(() => cached)
        return cached || fetchPromise
      }),
    )
    return
  }

  // Статика того же origin (JS/CSS/иконки) — cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const cached = await cache.match(req)
        if (cached) return cached
        try {
          const res = await fetch(req)
          if (res.ok) cache.put(req, res.clone())
          return res
        } catch {
          return cached || new Response('', { status: 504 })
        }
      }),
    )
  }
})
