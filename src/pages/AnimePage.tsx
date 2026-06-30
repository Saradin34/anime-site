import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Clock, Star, Heart, Check, Play, ChevronDown,
  MessageCircle, Send, ThumbsUp, Trash2, Bell, BellOff, BookmarkPlus,
} from 'lucide-react'
import VideoPlayer from '@/components/VideoPlayer'
import { animeApi, posterUrl, thumbUrl } from '@/api/anilibria'
import type { Release, ListType, Episode } from '@/types/anime'
import type { SourceTrack, ProviderMatch } from '@/api/providers/types'
import {
  libriaToSource,
  matchHiAnimeForRelease,
  fetchHiAnimeForEpisode,
  getHiAnimeEpisodeCount,
} from '@/api/providers/aggregator'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useSeo } from '@/hooks/useSeo'
import clsx from 'clsx'
import { Globe, Loader2 } from 'lucide-react'

const LIST_LABELS: Record<ListType, string> = {
  watching: 'Смотрю',
  planned: 'Запланировано',
  completed: 'Просмотрено',
  dropped: 'Брошено',
}

export default function AnimePage() {
  const { code } = useParams<{ code: string }>()
  const [anime, setAnime] = useState<Release | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentEp, setCurrentEp] = useState<number | null>(null)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [showListMenu, setShowListMenu] = useState(false)

  // HiAnime интеграция (мульти-провайдер)
  const [hianimeMatch, setHianimeMatch] = useState<ProviderMatch | null>(null)
  const [hianimeStats, setHianimeStats] = useState<{ total: number; sub: number; dub: number } | null>(null)
  const [hianimeLoading, setHianimeLoading] = useState(false)
  const [extraSources, setExtraSources] = useState<Record<number, SourceTrack[]>>({}) // ep number -> sources
  const [loadingExtraForEp, setLoadingExtraForEp] = useState<number | null>(null)

  const { user } = useAuthStore()
  const {
    setListStatus, clearListStatus, getStatus,
    toggleFavorite, isFavorite,
    recordWatch,
    pushNotification, removeNotification, hasNotification, getNotifications,
  } = useUserStore()

  useEffect(() => {
    if (!code) return
    setLoading(true); setError(null)
    setHianimeMatch(null); setHianimeStats(null); setExtraSources({})
    animeApi.release(code)
      .then((data) => {
        setAnime(data)
        if (data.episodes?.length) setCurrentEp(data.episodes[0].ordinal)
      })
      .catch((e) => setError(e.message || 'Не удалось загрузить'))
      .finally(() => setLoading(false))
  }, [code])

  // Параллельно ищем HiAnime матч после загрузки релиза
  useEffect(() => {
    if (!anime) return
    let cancelled = false
    setHianimeLoading(true)
    matchHiAnimeForRelease(anime).then(async (match) => {
      if (cancelled) return
      setHianimeMatch(match)
      if (match) {
        const stats = await getHiAnimeEpisodeCount(match.id)
        if (!cancelled) setHianimeStats(stats)
      }
    }).finally(() => { if (!cancelled) setHianimeLoading(false) })
    return () => { cancelled = true }
  }, [anime?.id])

  // При смене серии — догружаем HiAnime sources для неё (если есть матч)
  useEffect(() => {
    if (!hianimeMatch || !currentEp) return
    if (extraSources[currentEp]) return
    setLoadingExtraForEp(currentEp)
    fetchHiAnimeForEpisode(hianimeMatch.id, currentEp).then((tracks) => {
      if (tracks.length) setExtraSources((prev) => ({ ...prev, [currentEp]: tracks }))
    }).finally(() => setLoadingExtraForEp(null))
  }, [hianimeMatch?.id, currentEp])

  const episodes = useMemo<Episode[]>(() => {
    if (!anime?.episodes) return []
    return [...anime.episodes].sort((a, b) => a.ordinal - b.ordinal)
  }, [anime])

  const currentEpisode = useMemo(
    () => episodes.find((e) => e.ordinal === currentEp) || null,
    [episodes, currentEp]
  )

  const voices = useMemo(() => {
    if (!anime?.members) return []
    return anime.members.filter((m) => m.role.value === 'voicing').map((m) => m.nickname)
  }, [anime])

  // Агрегированные источники для текущей серии: AniLibria + HiAnime (если найден)
  const allSources = useMemo<SourceTrack[]>(() => {
    if (!currentEpisode) return []
    const libria = libriaToSource(currentEpisode, voices[0])
    const extra = currentEp ? (extraSources[currentEp] || []) : []
    return [libria, ...extra]
  }, [currentEpisode, voices, extraSources, currentEp])

  const currentStatus = user && anime ? getStatus(user.uid, anime.id) : null
  const inFavorites = user && anime ? isFavorite(user.uid, anime.id) : false

  /** Базовая инфа для записи в список (одинаковая для всех операций) */
  const listEntryBase = anime
    ? {
        animeId: anime.id,
        alias: anime.alias,
        title: anime.name.main,
        poster: thumbUrl(anime.poster),
      }
    : null

  const handleSetStatus = (list: ListType) => {
    if (!user || !listEntryBase) return
    // Если уже стоит этот же статус — снимаем (toggle); иначе устанавливаем
    setListStatus(user.uid, listEntryBase, list)
    setShowListMenu(false)
  }

  const handleClearStatus = () => {
    if (!user || !anime) return
    clearListStatus(user.uid, anime.id)
    setShowListMenu(false)
  }

  const handleToggleFavorite = () => {
    if (!user || !listEntryBase) return
    toggleFavorite(user.uid, listEntryBase)
  }

  // Подписка на новые серии — toggle для последней серии
  const lastEp = episodes.length ? episodes[episodes.length - 1].ordinal : null
  const isSubscribed = user && anime && lastEp != null
    ? hasNotification(user.uid, anime.id, lastEp)
    : false

  const handleToggleNotification = () => {
    if (!user || !anime || lastEp == null) return
    if (isSubscribed) {
      // Найти и удалить ВСЕ уведомления для этого аниме (быстрая отписка)
      const userNotifs = getNotifications(user.uid)
      userNotifs
        .filter((n) => n.animeId === anime.id)
        .forEach((n) => removeNotification(user.uid, n.id))
    } else {
      pushNotification(user.uid, {
        animeId: anime.id,
        alias: anime.alias,
        title: anime.name.main,
        poster: thumbUrl(anime.poster),
        episode: lastEp,
      })
    }
  }

  const handleNextEp = () => {
    if (!currentEp) return
    const next = episodes.find((e) => e.ordinal > currentEp)
    if (next) setCurrentEp(next.ordinal)
  }
  const handlePrevEp = () => {
    if (!currentEp) return
    const prev = [...episodes].reverse().find((e) => e.ordinal < currentEp)
    if (prev) setCurrentEp(prev.ordinal)
  }

  const handleTimeUpdate = (cur: number, dur: number) => {
    if (!user || !anime || !currentEp || dur === 0) return
    if (cur / dur > 0.05 && Math.floor(cur) % 15 === 0) {
      recordWatch(user.uid, {
        animeId: anime.id,
        alias: anime.alias,
        title: anime.name.main,
        poster: thumbUrl(anime.poster),
        episode: currentEp,
        progress: cur / dur,
      })
    }
  }

  // ===== SEO: динамический title, описание, og:image и JSON-LD TVSeries =====
  useSeo(anime ? {
    title: `${anime.name.main} — смотреть онлайн`,
    description: anime.description
      ? `${anime.name.main}${anime.name.english ? ` (${anime.name.english})` : ''}. ${anime.description.slice(0, 200)}${anime.description.length > 200 ? '...' : ''}`
      : `Смотрите аниме «${anime.name.main}» онлайн в HD-качестве с русской озвучкой.`,
    image: posterUrl(anime.poster),
    canonical: `/anime/${anime.alias}`,
    type: 'video.tv_show',
    meta: anime.year ? [{ property: 'video:release_date', content: String(anime.year) }] : undefined,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': anime.type?.value === 'MOVIE' ? 'Movie' : 'TVSeries',
      name: anime.name.main,
      alternateName: anime.name.english || undefined,
      description: anime.description || undefined,
      image: posterUrl(anime.poster),
      url: `https://anime-flux.netlify.app/anime/${anime.alias}`,
      datePublished: anime.year ? `${anime.year}-01-01` : undefined,
      genre: anime.genres?.map((g) => g.name),
      numberOfEpisodes: anime.episodes_total || undefined,
      contentRating: anime.age_rating?.label || undefined,
      inLanguage: 'ru',
      aggregateRating: (anime.added_in_users_favorites ?? 0) > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: '8.5',
        ratingCount: anime.added_in_users_favorites,
        bestRating: '10',
        worstRating: '1',
      } : undefined,
    },
  } : { title: 'Загрузка...', noindex: true })

  if (loading) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 animate-pulse">
        <div className="h-[40vh] bg-bg-card rounded-3xl mb-8" />
        <div className="aspect-video bg-bg-card rounded-2xl" />
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Аниме не найдено</h1>
        <p className="text-text-muted mb-6">{error}</p>
        <Link to="/" className="btn-primary">На главную</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="relative h-[50vh] min-h-[380px] overflow-hidden">
        <img src={posterUrl(anime.poster)} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/30" />
      </div>

      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 -mt-48 relative z-10">
        <div className="grid md:grid-cols-[280px_1fr] gap-8 mb-10">
          <div className="mx-auto md:mx-0">
            <div className="w-[220px] md:w-[280px] rounded-2xl overflow-hidden border border-app shadow-2xl">
              <img src={posterUrl(anime.poster)} alt={anime.name.main} className="w-full aspect-[2/3] object-cover" />
            </div>
          </div>

          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              {anime.is_ongoing && <span className="chip text-neon-cyan border-neon-cyan/30">● Онгоинг</span>}
              {anime.year && <span className="chip">{anime.year}</span>}
              {anime.type?.description && <span className="chip">{anime.type.description}</span>}
              {anime.age_rating?.label && <span className="chip">{anime.age_rating.label}</span>}
              {anime.season?.description && <span className="chip">{anime.season.description}</span>}
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold mb-2">{anime.name.main}</h1>
            {anime.name.english && <p className="text-text-muted text-lg mb-4">{anime.name.english}</p>}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-5 text-sm text-text-muted">
              {(anime.added_in_users_favorites ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-neon-pink font-semibold">
                  <Star size={16} fill="currentColor" /> {anime.added_in_users_favorites} в избранном
                </div>
              )}
              {anime.episodes_total && (
                <div className="flex items-center gap-1">
                  <Play size={14} /> {episodes.length}/{anime.episodes_total} эп.
                </div>
              )}
              {anime.average_duration_of_episode && (
                <div className="flex items-center gap-1">
                  <Clock size={14} /> ~{Math.round(anime.average_duration_of_episode / 60)} мин
                </div>
              )}
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-5">
                {anime.genres.map((g) => (
                  <Link key={g.id} to={`/genres/${encodeURIComponent(g.name)}`} className="chip hover:bg-hover-strong">
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              {episodes.length > 0 && (
                <a href="#player" className="btn-primary">
                  <Play size={18} fill="white" /> Смотреть
                </a>
              )}
              {user ? (
                <>
                  {/* Избранное — независимый toggle */}
                  <button
                    onClick={handleToggleFavorite}
                    className={clsx(
                      'btn-ghost',
                      inFavorites && 'border-neon-pink/60 text-neon-pink bg-neon-pink/10',
                    )}
                    title={inFavorites ? 'Убрать из избранного' : 'В избранное'}
                  >
                    <Heart size={18} fill={inFavorites ? 'currentColor' : 'none'} />
                    {inFavorites ? 'В избранном' : 'В избранное'}
                  </button>

                  {/* Статус просмотра — отдельная сущность */}
                  <div className="relative">
                    <button
                      onClick={() => setShowListMenu((v) => !v)}
                      className={clsx(
                        'btn-ghost',
                        currentStatus && 'border-neon-purple/60 text-neon-purple',
                      )}
                    >
                      {currentStatus ? <Check size={18} /> : <BookmarkPlus size={18} />}
                      {currentStatus ? LIST_LABELS[currentStatus] : 'В список'}
                      <ChevronDown size={14} />
                    </button>
                    {showListMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowListMenu(false)} />
                        <div className="absolute left-0 top-full mt-2 w-56 glass-strong rounded-xl p-1 z-50 animate-fade-in">
                          {(['watching', 'planned', 'completed', 'dropped'] as ListType[]).map((l) => (
                            <button
                              key={l}
                              onClick={() => handleSetStatus(l)}
                              className={clsx(
                                'w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-hover-strong transition flex items-center justify-between',
                                currentStatus === l && 'text-neon-pink font-semibold',
                              )}
                            >
                              <span>{LIST_LABELS[l]}</span>
                              {currentStatus === l && <span className="text-xs">✓ снять</span>}
                            </button>
                          ))}
                          {currentStatus && (
                            <>
                              <div className="border-t border-app my-1" />
                              <button
                                onClick={handleClearStatus}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-hover-strong transition"
                              >
                                Убрать из списка
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Подписка на новые серии — toggle */}
                  <button
                    onClick={handleToggleNotification}
                    className={clsx(
                      'btn-ghost',
                      isSubscribed && 'border-neon-cyan/60 text-neon-cyan bg-neon-cyan/10',
                    )}
                    title={isSubscribed ? 'Отписаться от уведомлений' : 'Подписаться на новые серии'}
                  >
                    {isSubscribed ? <BellOff size={18} /> : <Bell size={18} />}
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-ghost text-sm">
                  Войдите, чтобы добавить в список
                </Link>
              )}
            </div>

            {anime.description && (
              <div className="text-text-muted leading-relaxed">
                <p className={clsx(!showFullDesc && 'line-clamp-4')}>{anime.description}</p>
                {anime.description.length > 400 && (
                  <button onClick={() => setShowFullDesc((v) => !v)} className="text-neon-pink hover:text-neon-purple text-sm mt-2 font-medium">
                    {showFullDesc ? 'Свернуть' : 'Читать полностью'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {episodes.length > 0 ? (
          <div id="player" className="grid lg:grid-cols-[1fr_320px] gap-6 mb-12">
            <div>
              <VideoPlayer
                key={currentEp}
                sources={allSources}
                poster={currentEpisode?.preview ? posterUrl(currentEpisode.preview) : posterUrl(anime.poster)}
                onTimeUpdate={handleTimeUpdate}
                onNext={handleNextEp}
                onPrev={handlePrevEp}
                onEnded={handleNextEp}
                autoplay
              />

              {/* Источники и статус мульти-провайдеров */}
              <div className="mt-4 glass rounded-2xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Серия {currentEp}
                      {currentEpisode?.name && <span className="text-text-muted font-normal"> — {currentEpisode.name}</span>}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Доступно источников: <span className="text-text font-semibold">{allSources.length}</span>
                      {loadingExtraForEp === currentEp && (
                        <span className="ml-2 inline-flex items-center gap-1 text-neon-cyan">
                          <Loader2 size={10} className="animate-spin" /> ищем дополнительные...
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handlePrevEp} disabled={!episodes.find(e => e.ordinal < (currentEp ?? 0))} className="btn-ghost disabled:opacity-30 text-sm">
                      ← Предыдущая
                    </button>
                    <button onClick={handleNextEp} disabled={!episodes.find(e => e.ordinal > (currentEp ?? 0))} className="btn-ghost disabled:opacity-30 text-sm">
                      Следующая →
                    </button>
                  </div>
                </div>

                {/* Бейджи провайдеров */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip chip-active text-[11px]">
                    🇷🇺 AniLibria · {voices.length ? voices.slice(0,2).join(', ') : 'Дубляж'}
                  </span>
                  {hianimeLoading && (
                    <span className="chip text-[11px] inline-flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> Поиск на HiAnime...
                    </span>
                  )}
                  {hianimeMatch && hianimeStats && (
                    <span className="chip text-[11px] text-neon-cyan border-neon-cyan/30">
                      🌐 HiAnime · {hianimeStats.sub} sub{hianimeStats.dub > 0 ? ` / ${hianimeStats.dub} dub` : ''}
                      <span className="text-text-dim ml-1">(совпадение {Math.round(hianimeMatch.score * 100)}%)</span>
                    </span>
                  )}
                  {!hianimeLoading && !hianimeMatch && (
                    <span className="chip text-[11px] text-text-dim">
                      <Globe size={10} className="inline mr-1" /> HiAnime: не найдено
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-3 max-h-[700px] flex flex-col">
              <h3 className="font-semibold p-2 mb-2 flex items-center gap-2">
                <Play size={16} /> Серии ({episodes.length})
              </h3>
              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => setCurrentEp(ep.ordinal)}
                    className={clsx(
                      'w-full text-left p-2.5 rounded-xl transition flex items-center gap-3 group',
                      currentEp === ep.ordinal
                        ? 'bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 border border-neon-purple/40'
                        : 'hover:bg-hover border border-transparent'
                    )}
                  >
                    <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-bg-elevated">
                      {ep.preview ? (
                        <img src={thumbUrl(ep.preview)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-dim text-xs">{ep.ordinal}</div>
                      )}
                      {currentEp === ep.ordinal && (
                        <div className="absolute inset-0 bg-bg/60 flex items-center justify-center">
                          <Play size={14} fill="white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">Серия {ep.ordinal}</div>
                      {ep.name && <div className="text-xs text-text-muted truncate">{ep.name}</div>}
                      {ep.duration && <div className="text-[10px] text-text-dim">{Math.round(ep.duration / 60)} мин</div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center mb-12">
            <p className="text-text-muted">Видео для этого релиза пока недоступно</p>
            {anime.notification && <p className="text-sm text-text-dim mt-2">{anime.notification}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <DetailRow label="Тип" value={anime.type?.description} />
          <DetailRow
            label="Эпизодов (AniLibria)"
            value={`${episodes.length}${anime.episodes_total ? ` / ${anime.episodes_total}` : ''}`}
          />
          {hianimeStats && (
            <DetailRow
              label="Эпизодов (HiAnime)"
              value={`${hianimeStats.sub} sub${hianimeStats.dub > 0 ? ` / ${hianimeStats.dub} dub` : ''}`}
            />
          )}
          <DetailRow label="Сезон" value={`${anime.season?.description || ''} ${anime.year || ''}`.trim()} />
          <DetailRow label="Статус" value={anime.is_ongoing ? 'Онгоинг' : 'Завершён'} />
          <DetailRow label="Озвучка" value={voices.length ? voices.join(', ') : '—'} />
          <DetailRow label="Возрастной рейтинг" value={anime.age_rating?.label} />
        </div>

        <CommentsSection animeId={anime.id} />
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="glass rounded-xl p-4 flex justify-between gap-4">
      <span className="text-text-muted text-sm">{label}</span>
      <span className="text-sm font-medium text-right">{value || '—'}</span>
    </div>
  )
}

function CommentsSection({ animeId }: { animeId: number }) {
  const { user } = useAuthStore()
  const { getComments, addComment, removeComment, toggleLike } = useUserStore()
  const comments = getComments(animeId)
  const [text, setText] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !text.trim()) return
    addComment(animeId, {
      animeId,
      userId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      userAvatar: user.photoURL,
      text: text.trim(),
    })
    setText('')
  }

  return (
    <section className="mb-16">
      <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
        <MessageCircle size={22} /> Комментарии
        <span className="text-sm text-text-muted font-normal">({comments.length})</span>
      </h2>

      {user ? (
        <form onSubmit={submit} className="glass rounded-2xl p-4 mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Поделитесь мнением..."
            rows={3}
            className="input resize-none"
          />
          <div className="flex justify-end mt-3">
            <button type="submit" disabled={!text.trim()} className="btn-primary disabled:opacity-50">
              <Send size={16} /> Отправить
            </button>
          </div>
        </form>
      ) : (
        <div className="glass rounded-2xl p-6 text-center mb-6">
          <p className="text-text-muted mb-3">Войдите, чтобы оставить комментарий</p>
          <Link to="/login" className="btn-primary">Войти</Link>
        </div>
      )}

      <div className="space-y-3">
        {comments.length === 0 && (
          <div className="text-center text-text-muted py-8">Будьте первым, кто оставит комментарий</div>
        )}
        {comments.map((c) => {
          const liked = user ? c.likes.includes(user.uid) : false
          return (
            <div key={c.id} className="glass rounded-2xl p-4">
              <div className="flex items-start gap-3">
                {c.userAvatar ? (
                  <img src={c.userAvatar} alt="" className="w-10 h-10 rounded-full shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-neon flex items-center justify-center font-bold shrink-0">
                    {c.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{c.userName}</span>
                    <span className="text-xs text-text-dim">{relTime(c.createdAt)}</span>
                  </div>
                  <p className="text-text whitespace-pre-wrap">{c.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => user && toggleLike(animeId, c.id, user.uid)}
                      disabled={!user}
                      className={clsx('flex items-center gap-1 text-xs transition', liked ? 'text-neon-pink' : 'text-text-muted hover:text-text')}
                    >
                      <ThumbsUp size={14} fill={liked ? 'currentColor' : 'none'} />
                      {c.likes.length || ''}
                    </button>
                    {user?.uid === c.userId && (
                      <button
                        onClick={() => removeComment(animeId, c.id, user.uid)}
                        className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition"
                      >
                        <Trash2 size={14} /> Удалить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function relTime(ts: number) {
  const diff = (Date.now() - ts) / 1000
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  return new Date(ts).toLocaleDateString('ru-RU')
}
