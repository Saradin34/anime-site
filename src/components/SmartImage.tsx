// Лёгкая картинка с поддержкой webp+jpg fallback, lazy/eager loading
// и опциональным blur-up плейсхолдером (только для hero, не для каждой карточки).
// Оптимизировано для мобильных: минимум DOM, без crossOrigin.

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
  /** 'hero' (full HD, eager, blur-up) / 'card' (medium, lazy) / 'thumb' (small) */
  priority?: 'hero' | 'card' | 'thumb'
  fit?: 'cover' | 'contain'
}

function abs(path?: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return `${STORAGE_HOST}${path}`
  return path
}

function resolveSources(poster: PosterLike | string | null | undefined, priority: Props['priority']) {
  if (!poster) return { webp: null, jpg: null, blur: null, useFull: false }
  if (typeof poster === 'string') {
    return { webp: null, jpg: abs(poster), blur: null, useFull: false }
  }
  // Для карточек используем thumbnail (~50КБ) вместо полного постера (~150КБ)
  // Для hero — полный размер
  const useFull = priority === 'hero'
  const webp = useFull
    ? abs(poster.optimized?.src || poster.optimized?.preview || poster.optimized?.thumbnail)
    : abs(poster.optimized?.preview || poster.optimized?.thumbnail || poster.optimized?.src)
  const jpg = useFull
    ? abs(poster.src || poster.preview || poster.thumbnail)
    : abs(poster.preview || poster.thumbnail || poster.src)
  const blur = abs(poster.optimized?.thumbnail || poster.thumbnail)
  return { webp, jpg, blur, useFull }
}

export default function SmartImage({
  poster, alt, className, priority = 'card', fit = 'cover',
}: Props) {
  const { webp, jpg, blur, useFull } = resolveSources(poster, priority)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

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
  // Blur-up плейсхолдер только для hero — на карточках он создаёт лишние DOM-узлы
  const showBlur = isEager && blur && !loaded

  return (
    <div className={clsx('relative overflow-hidden bg-bg-card', className)}>
      {showBlur && (
        <img
          src={blur!}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: fit,
            filter: 'blur(24px)',
            transform: 'scale(1.1)',
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
          ref={(el) => {
            if (el) {
              if (isEager) el.setAttribute('fetchpriority', 'high')
              if (el.hasAttribute('crossorigin')) el.removeAttribute('crossorigin')
            }
            imgRef.current = el
          }}
          onLoad={() => setLoaded(true)}
          className={clsx(
            'relative w-full h-full',
            // Кроссфейд только если есть blur-up, иначе картинка появляется сразу
            showBlur ? 'transition-opacity duration-500' : '',
            loaded || !showBlur ? 'opacity-100' : 'opacity-0',
          )}
          style={{ objectFit: fit }}
        />
      </picture>
    </div>
  )
}
