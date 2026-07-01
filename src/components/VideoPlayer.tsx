// Универсальный HLS-видеоплеер с поддержкой нескольких источников (SourceTrack[])
// Источник можно переключать в выпадающем меню — это позволяет агрегировать
// дорожки от разных провайдеров (AniLibria, HiAnime sub/dub и т.д.)

import { useEffect, useMemo, useRef, useState } from 'react'
import Hls from 'hls.js'
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, SkipBack, Settings, Loader2, Languages,
} from 'lucide-react'
import clsx from 'clsx'
import type { SourceTrack, VideoQuality } from '@/api/providers/types'

interface Props {
  /** Список доступных источников (от разных провайдеров) */
  sources: SourceTrack[]
  /** Постер до старта */
  poster?: string | null
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onNext?: () => void
  onPrev?: () => void
  autoplay?: boolean
  /** Колбэк когда меняется источник (для аналитики/истории) */
  onSourceChange?: (source: SourceTrack) => void
}

const LANG_BADGE: Record<string, { label: string; color: string }> = {
  'ru-dub': { label: 'RU дубляж', color: 'bg-neon-pink/20 text-neon-pink border-neon-pink/30' },
  'jp-sub': { label: 'JP+субтитры', color: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30' },
  'en-sub': { label: 'EN субтитры', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  'en-dub': { label: 'EN дубляж', color: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30' },
  'raw': { label: 'RAW', color: 'bg-hover-strong text-white border-app-strong' },
}

export default function VideoPlayer({
  sources, poster, onTimeUpdate, onEnded, onNext, onPrev, autoplay, onSourceChange,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const [sourceIdx, setSourceIdx] = useState(0)
  const currentSource = sources[sourceIdx] || null
  const qualities = currentSource?.qualities || []

  const [quality, setQuality] = useState<VideoQuality | null>(qualities[0] || null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hideTimer = useRef<number | null>(null)
  // Индикатор двойного тапа: 'left' (−10s) / 'right' (+10s) / null
  const [seekFlash, setSeekFlash] = useState<'left' | 'right' | null>(null)
  const lastTapRef = useRef<{ time: number; x: number } | null>(null)
  const flashTimer = useRef<number | null>(null)

  // При смене источника сбрасываем quality на первое доступное
  useEffect(() => {
    const next = sources[sourceIdx]?.qualities[0] || null
    setQuality(next)
    if (sources[sourceIdx] && onSourceChange) onSourceChange(sources[sourceIdx])
  }, [sourceIdx, sources, onSourceChange])

  // Если первая инициализация и нет sourceIdx
  useEffect(() => {
    if (sources.length > 0 && !quality) {
      setQuality(sources[0].qualities[0] || null)
    }
  }, [sources])

  // Setup HLS / MP4
  useEffect(() => {
    const video = videoRef.current
    if (!video || !quality) return

    setLoading(true)
    setError(null)

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (quality.type === 'mp4') {
      video.src = quality.url
      if (autoplay) video.play().catch(() => {})
      return
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false })
      hls.loadSource(quality.url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => { if (autoplay) video.play().catch(() => {}) })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal:', data)
          setError(`Ошибка загрузки видео (${data.type})`)
        }
      })
      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = quality.url
      if (autoplay) video.play().catch(() => {})
    } else {
      setError('Браузер не поддерживает HLS')
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    }
  }, [quality?.url, quality?.type, autoplay])

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onLoaded = () => { setDuration(v.duration); setLoading(false) }
    const onTime = () => {
      setCurrent(v.currentTime)
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1))
      onTimeUpdate?.(v.currentTime, v.duration)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onWaiting = () => setLoading(true)
    const onPlaying = () => setLoading(false)
    const onEndedEv = () => { setPlaying(false); onEnded?.() }
    const onVol = () => { setVolume(v.volume); setMuted(v.muted) }

    v.addEventListener('loadedmetadata', onLoaded)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('progress', onTime)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('waiting', onWaiting)
    v.addEventListener('playing', onPlaying)
    v.addEventListener('ended', onEndedEv)
    v.addEventListener('volumechange', onVol)
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('progress', onTime)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('waiting', onWaiting)
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('ended', onEndedEv)
      v.removeEventListener('volumechange', onVol)
    }
  }, [onTimeUpdate, onEnded])

  // Псевдо-fullscreen (CSS-режим во весь экран) для iOS Safari и старых браузеров,
  // где обычный Fullscreen API на контейнере не работает.
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false)

  useEffect(() => {
    const onFs = () => {
      const active = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).webkitCurrentFullScreenElement,
      )
      setFullscreen(active)
    }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs as any)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs as any)
    }
  }, [])

  // На псевдо-fullscreen блокируем скролл body
  useEffect(() => {
    if (pseudoFullscreen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [pseudoFullscreen])

  // Выход из псевдо-fullscreen по Escape
  useEffect(() => {
    if (!pseudoFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPseudoFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pseudoFullscreen])

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return
    if (v.paused) v.play(); else v.pause()
  }
  const toggleMute = () => { const v = videoRef.current; if (!v) return; v.muted = !v.muted }
  const setVol = (val: number) => { const v = videoRef.current; if (!v) return; v.volume = val; v.muted = val === 0 }
  const seek = (val: number) => { const v = videoRef.current; if (!v) return; v.currentTime = val }
  const skip = (sec: number) => {
    const v = videoRef.current; if (!v) return
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + sec))
  }

  /**
   * Cross-browser fullscreen с поддержкой iOS Safari и автоповоротом на мобиле.
   * iOS Safari НЕ поддерживает Fullscreen API на <div> — только на <video> через webkitEnterFullscreen().
   * Поэтому стратегия:
   *  1. Пробуем стандартный requestFullscreen на контейнере (Android, Desktop)
   *  2. Если не получилось — webkitEnterFullscreen на самом video (iOS iPhone)
   *  3. Если и это не сработало — включаем псевдо-fullscreen (CSS, fixed inset-0)
   * После fullscreen пробуем заблокировать ориентацию в landscape на телефоне.
   */
  const toggleFullscreen = async () => {
    const isInFs = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      pseudoFullscreen,
    )

    if (isInFs) {
      // Выход
      try {
        // Снимаем lock ориентации
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock()
        }
      } catch {}
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {})
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      }
      setPseudoFullscreen(false)
      return
    }

    // Вход
    const container = containerRef.current
    const video = videoRef.current as any
    let entered = false

    // 1) Стандартный API на контейнере
    if (container && container.requestFullscreen) {
      try {
        await container.requestFullscreen()
        entered = true
      } catch {}
    } else if (container && (container as any).webkitRequestFullscreen) {
      try {
        (container as any).webkitRequestFullscreen()
        entered = true
      } catch {}
    }

    // 2) iOS Safari fallback — fullscreen на самом video
    if (!entered && video && video.webkitEnterFullscreen) {
      try {
        video.webkitEnterFullscreen()
        entered = true
      } catch {}
    }

    // 3) Псевдо-fullscreen через CSS
    if (!entered) {
      setPseudoFullscreen(true)
    }

    // Поворот в landscape только на мобиле и если поддерживается
    try {
      const isMobile = window.matchMedia('(max-width: 900px)').matches
      if (isMobile && screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape').catch(() => {})
      }
    } catch {}
  }

  const isFullscreenLike = fullscreen || pseudoFullscreen

  const showControls = () => {
    setControlsVisible(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => { if (playing) setControlsVisible(false) }, 3000)
  }

  // Группируем источники по providerId для красивого выпадайки
  const groupedSources = useMemo(() => {
    const groups: Record<string, { providerId: string; tracks: SourceTrack[] }> = {}
    sources.forEach((s) => {
      if (!groups[s.providerId]) groups[s.providerId] = { providerId: s.providerId, tracks: [] }
      groups[s.providerId].tracks.push(s)
    })
    return Object.values(groups)
  }, [sources])

  if (!currentSource || !quality) {
    return (
      <div className="aspect-video w-full bg-bg-card rounded-2xl flex items-center justify-center text-text-muted">
        Видео для этой серии недоступно
      </div>
    )
  }

  const langBadge = LANG_BADGE[currentSource.language] || { label: currentSource.language, color: 'bg-hover-strong text-white border-app-strong' }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseMove={showControls}
      onTouchStart={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      className={clsx(
        'group focus:outline-none bg-black overflow-hidden',
        pseudoFullscreen
          // Псевдо-fullscreen: fixed во весь viewport (для iOS Safari и старых браузеров)
          ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none'
          : 'relative w-full aspect-video rounded-2xl',
      )}
      style={pseudoFullscreen ? { height: '100dvh' } : undefined}
    >
      <video
        ref={videoRef}
        poster={poster || undefined}
        className="w-full h-full object-contain"
        playsInline
        // iOS Safari требует webkit-playsinline атрибут (lowercase!) для inline-плеера
        // @ts-ignore — нестандартный атрибут
        webkit-playsinline="true"
        // x5-video-* — для китайских мобильных браузеров (UC, QQ)
        // @ts-ignore
        x5-video-player-type="h5"
        // @ts-ignore
        x5-video-player-fullscreen="true"
        controlsList="nodownload"
        disablePictureInPicture={false}
        onClick={(e) => {
          // Детекция двойного тапа: если клик в течение 300мс на той же стороне → перемотка
          const now = Date.now()
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const half = rect.width / 2
          const last = lastTapRef.current
          if (last && now - last.time < 300) {
            // Двойной тап — определяем сторону
            const dir: 'left' | 'right' = x < half ? 'left' : 'right'
            skip(dir === 'left' ? -10 : 10)
            setSeekFlash(dir)
            if (flashTimer.current) window.clearTimeout(flashTimer.current)
            flashTimer.current = window.setTimeout(() => setSeekFlash(null), 500)
            lastTapRef.current = null
            return
          }
          lastTapRef.current = { time: now, x }
          // Одиночный клик: пауза/плей через 250мс (если за это время не было второго клика)
          window.setTimeout(() => {
            if (lastTapRef.current && Date.now() - lastTapRef.current.time >= 250) {
              togglePlay()
              lastTapRef.current = null
            }
          }, 260)
        }}
      />

      {/* Индикатор перемотки при двойном тапе */}
      {seekFlash && (
        <div
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center',
            'w-24 h-24 rounded-full bg-white/15 backdrop-blur-md animate-fade-in',
            seekFlash === 'left' ? 'left-[15%]' : 'right-[15%]',
          )}
        >
          <div className="text-white text-center">
            <div className="text-2xl">{seekFlash === 'left' ? '⏪' : '⏩'}</div>
            <div className="text-xs font-semibold mt-1">10 сек</div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <Loader2 size={48} className="text-neon-purple animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center p-6">
          <p className="text-red-400 font-semibold mb-2">⚠️ Видео недоступно</p>
          <p className="text-sm text-text-muted mb-4">{error}</p>
          {sources.length > 1 && (
            <button onClick={() => setSourceIdx((i) => (i + 1) % sources.length)} className="btn-primary text-sm">
              Попробовать другой источник
            </button>
          )}
        </div>
      )}

      {/* Big center play */}
      {!playing && !loading && !error && (
        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/30 group/play">
          <div className="w-20 h-20 rounded-full bg-gradient-neon flex items-center justify-center shadow-neon group-hover/play:scale-110 transition">
            <Play size={32} fill="white" className="text-white ml-1" />
          </div>
        </button>
      )}

      {/* Source badge (top-left) */}
      <div className={clsx('absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold border backdrop-blur-md transition-opacity', controlsVisible ? 'opacity-100' : 'opacity-0', langBadge.color)}>
        {langBadge.label}
      </div>

      {/* Controls */}
      <div className={clsx(
        'absolute inset-x-0 bottom-0 px-4 pb-3 pt-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity',
        controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <div className="relative h-1.5 bg-hover-strong rounded-full mb-3 cursor-pointer">
          <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: duration ? `${(buffered / duration) * 100}%` : '0%' }} />
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full" style={{ width: duration ? `${(current / duration) * 100}%` : '0%' }} />
          <input type="range" min={0} max={duration || 0} step={0.1} value={current} onChange={(e) => seek(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" aria-label="Прогресс" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-white">
          <button onClick={togglePlay} className="hover:text-neon-pink transition p-1.5 sm:p-1" aria-label="Play/Pause">
            {playing ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
          </button>
          {/* Prev/Next — скрыты на узких экранах (есть кнопки рядом с плеером) */}
          {onPrev && (
            <button onClick={onPrev} className="hidden sm:inline-flex hover:text-neon-pink transition p-1" aria-label="Предыдущая">
              <SkipBack size={20} />
            </button>
          )}
          <button onClick={() => skip(-10)} className="hidden sm:inline-flex hover:text-neon-pink transition px-1 text-xs font-semibold opacity-70 hover:opacity-100">-10s</button>
          <button onClick={() => skip(10)} className="hidden sm:inline-flex hover:text-neon-pink transition px-1 text-xs font-semibold opacity-70 hover:opacity-100">+10s</button>
          {onNext && (
            <button onClick={onNext} className="hidden sm:inline-flex hover:text-neon-pink transition p-1" aria-label="Следующая">
              <SkipForward size={20} />
            </button>
          )}

          {/* Громкость — на мобиле только иконка, без слайдера */}
          <div className="flex items-center gap-2 group/vol">
            <button onClick={toggleMute} className="hover:text-neon-pink transition p-1.5 sm:p-1" aria-label="Mute">
              {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVol(Number(e.target.value))}
              className="hidden sm:block w-0 group-hover/vol:w-20 transition-all accent-neon-pink"
              aria-label="Громкость"
            />
          </div>

          <div className="text-[10px] sm:text-xs text-white/70 ml-0.5 sm:ml-1 font-mono whitespace-nowrap">
            {fmtTime(current)} / {fmtTime(duration)}
          </div>

          <div className="flex-1" />

          {/* Sources switcher */}
          {sources.length > 1 && (
            <div className="relative">
              <button
                onClick={() => { setShowSources((v) => !v); setShowSettings(false) }}
                className="hover:text-neon-pink transition p-1 flex items-center gap-1 text-xs font-semibold"
                title="Сменить источник"
              >
                <Languages size={18} />
                <span className="hidden sm:inline truncate max-w-[120px]">{currentSource.providerId}</span>
              </button>
              {showSources && (
                <div className="absolute bottom-full right-0 mb-2 glass-strong rounded-xl p-2 min-w-[240px] max-h-[300px] overflow-y-auto">
                  <div className="text-[10px] uppercase tracking-wider text-text-dim px-2 mb-1">Источники</div>
                  {groupedSources.map((g) => (
                    <div key={g.providerId} className="mb-2 last:mb-0">
                      <div className="text-[10px] font-bold uppercase text-text-muted px-2 py-1">
                        {g.providerId === 'anilibria' ? '🇷🇺 AniLibria' : g.providerId === 'hianime' ? '🌐 HiAnime' : g.providerId}
                      </div>
                      {g.tracks.map((t) => {
                        const idx = sources.indexOf(t)
                        const isActive = idx === sourceIdx
                        const badge = LANG_BADGE[t.language]
                        return (
                          <button
                            key={idx}
                            onClick={() => { setSourceIdx(idx); setShowSources(false) }}
                            className={clsx(
                              'w-full text-left px-2 py-2 rounded-lg text-xs hover:bg-hover-strong transition flex items-center gap-2',
                              isActive && 'bg-hover-strong'
                            )}
                          >
                            <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', isActive ? 'bg-neon-pink' : 'bg-white/30')} />
                            <span className="flex-1 truncate">{t.label}</span>
                            {badge && <span className={clsx('text-[9px] px-1.5 py-0.5 rounded border', badge.color)}>{badge.label}</span>}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quality */}
          {qualities.length > 1 && (
            <div className="relative">
              <button
                onClick={() => { setShowSettings((v) => !v); setShowSources(false) }}
                className="hover:text-neon-pink transition p-1 flex items-center gap-1 text-xs font-semibold"
                aria-label="Качество"
              >
                <Settings size={18} />
                <span className="hidden xs:inline">{quality.label}</span>
                <span className="xs:hidden">{quality.label.replace('p', '')}</span>
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 glass-strong rounded-xl p-1 min-w-[100px]">
                  {qualities.map((q) => (
                    <button
                      key={q.url}
                      onClick={() => { setQuality(q); setShowSettings(false) }}
                      className={clsx(
                        'w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-hover-strong transition',
                        q.url === quality.url && 'text-neon-pink font-semibold'
                      )}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="hover:text-neon-pink transition p-1"
            aria-label={isFullscreenLike ? 'Выйти из полноэкранного режима' : 'На весь экран'}
            title={isFullscreenLike ? 'Выйти (Esc)' : 'На весь экран (F)'}
          >
            {isFullscreenLike ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}

function fmtTime(t: number) {
  if (!Number.isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60).toString().padStart(2, '0')
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}:${(m % 60).toString().padStart(2, '0')}:${s}`
  return `${m}:${s}`
}
