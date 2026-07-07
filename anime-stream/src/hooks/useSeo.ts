// Хук для динамического управления meta-тегами (title, description, og:*, canonical, JSON-LD).
// Используется на конкретных страницах вместо react-helmet-async.

import { useEffect } from 'react'

const SITE_URL = 'https://anime-flux.netlify.app'
const SITE_NAME = 'AnimeFlux'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

export interface SeoOptions {
  title?: string
  description?: string
  image?: string
  canonical?: string
  type?: 'website' | 'article' | 'video.tv_show' | 'video.episode' | 'video.movie'
  meta?: { property?: string; name?: string; content: string }[]
  jsonLd?: object | object[] | null
  /** Хлебные крошки для JSON-LD BreadcrumbList */
  breadcrumbs?: { name: string; url: string }[]
  noindex?: boolean
  /** Ключевые слова конкретной страницы */
  keywords?: string
}

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

function setJsonLd(data: object | object[] | null) {
  document
    .querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"][data-dynamic="1"]')
    .forEach((el) => el.remove())

  if (data) {
    const items = Array.isArray(data) ? data : [data]
    for (const item of items) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.dynamic = '1'
      script.textContent = JSON.stringify(item)
      document.head.appendChild(script)
    }
  }
}

export function useSeo(opts: SeoOptions) {
  useEffect(() => {
    // Title: если задан кастомный, добавляем бренд через тире
    const title = opts.title
      ? `${opts.title} — ${SITE_NAME}`
      : `${SITE_NAME} — смотреть аниме онлайн бесплатно в HD с русской озвучкой`
    document.title = title

    const description = opts.description ||
      'AnimeFlux — бесплатный онлайн-кинотеатр аниме в HD (720p, 1080p) с русской озвучкой. Новинки, онгоинги, классика: сёнэн, романтика, фэнтези, исекай, экшен.'

    const image = opts.image || DEFAULT_IMAGE
    const canonical = opts.canonical
      ? (opts.canonical.startsWith('http') ? opts.canonical : SITE_URL + opts.canonical)
      : SITE_URL + (typeof window !== 'undefined' ? window.location.pathname : '')

    setMeta('name', 'description', description)
    setLink('canonical', canonical)

    if (opts.keywords) {
      setMeta('name', 'keywords', opts.keywords)
    }

    // robots
    setMeta('name', 'robots', opts.noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )

    // Open Graph
    setMeta('property', 'og:title', opts.title || SITE_NAME)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:image', image)
    setMeta('property', 'og:image:secure_url', image)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:type', opts.type || 'website')
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'ru_RU')

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', opts.title || SITE_NAME)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', image)
    setMeta('name', 'twitter:site', '@animeflux')

    if (opts.meta) {
      for (const m of opts.meta) {
        if (m.property) setMeta('property', m.property, m.content)
        if (m.name) setMeta('name', m.name, m.content)
      }
    }

    // JSON-LD: пользовательский + автоматические breadcrumbs если заданы
    const jsonLdItems: object[] = []
    if (opts.jsonLd) {
      const items = Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd]
      jsonLdItems.push(...items)
    }
    if (opts.breadcrumbs && opts.breadcrumbs.length > 0) {
      jsonLdItems.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: opts.breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: b.url.startsWith('http') ? b.url : SITE_URL + b.url,
        })),
      })
    }
    setJsonLd(jsonLdItems.length > 0 ? jsonLdItems : null)
  }, [
    opts.title, opts.description, opts.image, opts.canonical, opts.type,
    opts.noindex, opts.keywords,
    JSON.stringify(opts.meta), JSON.stringify(opts.jsonLd), JSON.stringify(opts.breadcrumbs),
  ])
}
