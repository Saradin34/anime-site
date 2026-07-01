// Контейнер который рендерит children только когда близок к viewport.
// Используется для тяжёлых секций ниже first-screen, чтобы не блокировать LCP.

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Минимальная высота placeholder'а (чтобы scroll не "прыгал") */
  minHeight?: string | number
  /** Когда триггерить загрузку (отступ от viewport) */
  rootMargin?: string
  /** Загрузить сразу, без ожидания скролла */
  eager?: boolean
}

export default function LazySection({
  children, minHeight = '400px', rootMargin = '300px', eager,
}: Props) {
  const [shown, setShown] = useState(!!eager)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shown) return
    const el = ref.current
    if (!el) return

    // Fallback для старых браузеров без IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown, rootMargin])

  if (shown) return <>{children}</>

  return (
    <div
      ref={ref}
      style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
    />
  )
}
