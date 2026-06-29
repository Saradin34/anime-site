// Умная картинка с поддержкой:
// - <picture> webp + jpg fallback (выбираем оптимальный по поддержке браузера)
// - blur-up плейсхолдер через крошечный thumbnail (~800 байт)
// - lazy / eager loading
// - кроссфейд при загрузке оригинала
// - без потери качества: object-fit cover + image-rendering для retina
// - БЕЗ crossOrigin — чтобы не ломать загрузку с CDN которые не отдают CORS-заголовки

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

const STORAGE_HOST = 'https://anilibria.top'

interface PosterLike {
  src?: string | null
  preview?: string | null
  thumbnail?: string | null
  optimized?: {
    src?: string | null
    preview?: string | null
    thumbnail?: string | null
  }
}

interface Props {
  poster?: PosterLike | string | null
  alt: string
  className?: string
  /** 'hero' (full HD, eager) / 'card' (medium, lazy) / 'thumb' (small) */
  priority?: 'hero' | 'card' | 'thumb'
  /** object-fit, default 'cover' */
  fit?: 'cover' | 'contain'
}

function abs(path?: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return `${STORAGE_HOST}${path}`
  return path
}

/**
 * Возвращает оптимальные URL для разных размеров.
 * Согласно структуре AniLibria:
 *  - src / optimized.src — оригинал в полном разрешении (для hero)
 *  - preview / optimized.preview — то же что src (резерв)
 *  - thumbnail / optimized.thumbnail — крошечный для blur-up
 */
function resolveSources(poster?: PosterLike | string | null) {
  if (!poster) return { webp: null, jpg: null, blur: null }
  if (typeof poster === 'string') {
    return { webp: null, jpg: abs(poster), blur: null }
  }
  const webp = abs(poster.optimized?.src || poster.optimized?.preview)
  const jpg = abs(poster.src || poster.preview)
  // самый лёгкий thumbnail для blur-up
  const blur = abs(poster.optimized?.thumbnail || poster.thumbnail)
  return { webp, jpg, blur }
}

export default function SmartImage({
  poster, alt, className, priority = 'card', fit = 'cover',
}: Props) {
  const { webp, jpg, blur } = resolveSources(poster)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Уже закэширована браузером? (важно при back-навигации)
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [webp, jpg])

  if (!webp && !jpg) {
    return (
      <div className={clsx('bg-bg-card flex items-center justify-center', className)}>
        <span className="text-text-dim text-xs">Нет фото</span>
      </div>
    )
  }

  const isEager = priority === 'hero'

  return (
    <div className={clsx('relative overflow-hidden bg-bg-card', className)}>
      {/* LQIP — крошечная картинка в фоне, размытая */}
      {blur && !loaded && (
        <img
          src={blur}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: fit,
            filter: 'blur(24px)',
            transform: 'scale(1.1)',
            imageRendering: 'auto',
          }}
        />
      )}
      <picture>
        {webp && <source srcSet={webp} type="image/webp" />}
        {jpg && <source srcSet={jpg} type="image/jpeg" />}
        <img
          src={jpg || webp || ''}
          alt={alt}
          loading={isEager ? 'eager' : 'lazy'}
          decoding={isEager ? 'sync' : 'async'}
          // ВАЖНО: НЕ передаём crossOrigin — AniLibria CDN не отдаёт Access-Control-Allow-Origin.
          // React 18 не знает camelCase fetchPriority — ставим lowercase атрибут через ref.
          ref={(el) => {
            if (el) {
              if (isEager) el.setAttribute('fetchpriority', 'high')
              // На всякий случай убираем атрибут если react/что-то его добавил
              if (el.hasAttribute('crossorigin')) el.removeAttribute('crossorigin')
            }
            imgRef.current = el
          }}
          onLoad={() => setLoaded(true)}
          className={clsx(
            'relative w-full h-full transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            objectFit: fit,
            imageRendering: 'auto',
          }}
        />
      </picture>
    </div>
  )
}
