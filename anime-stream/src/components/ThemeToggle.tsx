import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/store/themeStore'
import clsx from 'clsx'

const OPTIONS: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Светлая', icon: Sun },
  { id: 'dark', label: 'Тёмная', icon: Moon },
  { id: 'system', label: 'Системная', icon: Monitor },
]

export default function ThemeToggle() {
  const { mode, resolved, setMode, toggle } = useThemeStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Иконка текущей темы (показывает противоположную — то, на что переключится)
  // Если сейчас тёмная — показываем солнце (намекая что клик → светлая)
  // Если светлая — показываем луну
  const ToggleIcon = resolved === 'dark' ? Sun : Moon
  const title = resolved === 'dark' ? 'Переключить на светлую' : 'Переключить на тёмную'

  // Закрытие меню по клику снаружи
  useEffect(() => {
    if (!menuOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  return (
    <div ref={wrapRef} className="relative flex items-center">
      {/* Главная кнопка — быстрый тоггл */}
      <button
        onClick={toggle}
        className="w-10 h-10 flex items-center justify-center rounded-l-lg bg-hover hover:bg-hover-strong border border-app transition group"
        aria-label={title}
        title={title}
      >
        <ToggleIcon size={18} className="text-text group-hover:text-neon-pink transition" />
      </button>
      {/* Маленькая стрелка — открывает меню выбора режима (light/dark/system) */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="h-10 px-1 flex items-center justify-center rounded-r-lg bg-hover hover:bg-hover-strong border border-l-0 border-app transition group"
        aria-label="Выбрать режим темы"
        title="Выбрать режим"
      >
        <ChevronDown size={12} className="text-text-muted group-hover:text-neon-pink transition" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 glass-strong rounded-xl p-1 z-50 animate-fade-in">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => { setMode(o.id); setMenuOpen(false) }}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                mode === o.id
                  ? 'bg-hover-strong text-neon-pink'
                  : 'text-text-muted hover:text-text hover:bg-hover'
              )}
            >
              <o.icon size={16} />
              <span>{o.label}</span>
              {mode === o.id && <span className="ml-auto text-xs">●</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
