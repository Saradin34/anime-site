// Хук для динамического управления meta-тегами (title, description, og:*, canonical, JSON-LD).
// Используется на конкретных страницах вместо react-helmet-async (чтобы не тащить зависимость).

import { useEffect } from 'react'

const SITE_URL = 'https://anime-flux.netlify.app'
const SITE_NAME = 'AnimeFlux'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

export interface SeoOptions {
  title?: string
  description?: string
  /** Полный URL картинки для соцсетей */
  image?: string
  /** Относительный путь (например /catalog) или абсолютный URL */
  canonical?: string
  /** og:type: website | article | video.tv_show | video.episode и т.д. */
  type?: 'website' | 'article' | 'video.tv_show' | 'video.episode' | 'video.movie'
  /** Дополнительные теги вроде video:release_date */
  meta?: { property?: string; name?: string; content: string }[]
  /** JSON-LD структурированные данные */
  jsonLd?: object | null
  /** Если страница не должна индексироваться */
  noindex?: boolean
}

/** Установить/обновить meta-тег по атрибуту (name или property) */
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    el.dataset.dynamic = '1'
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.dataset.dynamic = '1'
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(data: object | null) {
  // Удаляем предыдущий динамический JSON-LD (но не статический в index.html — у него нет data-dynamic)
  document
    .querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"][data-dynamic="1"]')
    .forEach((el) => el.remove())

  if (data) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.dynamic = '1'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }
}

export function useSeo(opts: SeoOptions) {
  useEffect(() => {
    const title = opts.title
      ? `${opts.title} — ${SITE_NAME}`
      : `${SITE_NAME} — смотреть аниме онлайн в HD бесплатно`
    document.title = title

    const description = opts.description ||
      'AnimeFlux — тысячи аниме онлайн бесплатно: новинки, онгоинги, классика. HD-качество, русская озвучка.'

    const image = opts.image || DEFAULT_IMAGE
    const canonical = opts.canonical
      ? (opts.canonical.startsWith('http') ? opts.canonical : SITE_URL + opts.canonical)
      : SITE_URL + window.location.pathname

    setMeta('name', 'description', description)
    setLink('canonical', canonical)

    // robots
    setMeta('name', 'robots', opts.noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1',
    )

    // Open Graph
    setMeta('property', 'og:title', opts.title || SITE_NAME)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:image', image)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:type', opts.type || 'website')
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'ru_RU')

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', opts.title || SITE_NAME)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', image)

    // Дополнительные теги
    if (opts.meta) {
      for (const m of opts.meta) {
        if (m.property) setMeta('property', m.property, m.content)
        if (m.name) setMeta('name', m.name, m.content)
      }
    }

    // JSON-LD
    setJsonLd(opts.jsonLd || null)
  }, [opts.title, opts.description, opts.image, opts.canonical, opts.type, opts.noindex, JSON.stringify(opts.meta), JSON.stringify(opts.jsonLd)])
}
