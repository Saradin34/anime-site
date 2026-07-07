// Хранилище темы (light / dark / system) с применением через class на <html>.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  /** Текущее эффективное значение после разрешения 'system' */
  resolved: 'light' | 'dark'
  setMode: (m: ThemeMode) => void
  toggle: () => void
  init: () => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Применяет тему к <html> и возвращает финальное значение (resolved).
 * Гарантирует, что в любой момент времени есть РОВНО один класс: light или dark.
 */
function applyTheme(mode: ThemeMode): 'light' | 'dark' {
  const resolved: 'light' | 'dark' = mode === 'system' ? getSystemTheme() : mode
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    // Удаляем ОБА класса и ставим только нужный
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    // На всякий случай: meta theme-color для мобильной строки браузера
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', resolved === 'light' ? '#f5f3fc' : '#08060f')
    }
  }
  return resolved
}

let systemListenerAttached = false

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      resolved: 'dark',

      setMode: (m) => {
        const resolved = applyTheme(m)
        set({ mode: m, resolved })
      },

      toggle: () => {
        // Простой бинарный тоггл: тёмная ↔ светлая (игнорируем system)
        const cur = get().resolved
        const next: ThemeMode = cur === 'dark' ? 'light' : 'dark'
        const resolved = applyTheme(next)
        set({ mode: next, resolved })
      },

      init: () => {
        // Применяем тему повторно (на случай если inline-скрипт что-то пропустил)
        const resolved = applyTheme(get().mode)
        set({ resolved })

        // Реактивно следим за системной темой только если режим = system
        if (!systemListenerAttached && typeof window !== 'undefined' && window.matchMedia) {
          const mq = window.matchMedia('(prefers-color-scheme: light)')
          const onChange = () => {
            if (get().mode === 'system') {
              const r = applyTheme('system')
              set({ resolved: r })
            }
          }
          if (mq.addEventListener) {
            mq.addEventListener('change', onChange)
          } else if ((mq as any).addListener) {
            (mq as any).addListener(onChange)
          }
          systemListenerAttached = true
        }
      },
    }),
    {
      name: 'animeflux:theme',
      partialize: (s) => ({ mode: s.mode }),
      // После загрузки из localStorage применяем тему НЕМЕДЛЕННО
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          applyTheme(state.mode)
        }
      },
    }
  )
)
