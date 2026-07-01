import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Heart, PlayCircle, Star } from 'lucide-react';
import { getAnimeById } from '../services/animeApi';
import type { Anime } from '../types/anime';
import { VideoPlayer } from '../components/VideoPlayer';
import { useFavorites } from '../hooks/useFavorites';

export function AnimeDetails() {
  const { id, source } = useParams(); const [params, setParams] = useSearchParams(); const [anime, setAnime] = useState<Anime>(); const [loading, setLoading] = useState(true); const fav = useFavorites();
  useEffect(() => { if (id) getAnimeById(id, source).then(setAnime).finally(() => setLoading(false)); }, [id, source]);
  const selected = useMemo(() => { const n = Number(params.get('episode') || 1); return anime?.episodes.find((e) => e.number === n) || anime?.episodes[0]; }, [anime, params]);
  if (loading) return <div className="loader page">Загружаем страницу тайтла…</div>;
  if (!anime) return <div className="page"><h1>Тайтл не найден</h1><Link to="/catalog">Назад в каталог</Link></div>;
  const videoSrc = selected?.hls?.fhd || selected?.hls?.hd || selected?.hls?.sd;
  return <div className="details">
    <section className="details-hero" style={{backgroundImage:`linear-gradient(90deg, rgba(11,7,20,.98), rgba(11,7,20,.7)), url(${anime.banner || anime.poster})`}}><img src={anime.poster} alt={anime.title}/><div><span className="source-pill">{anime.source}</span><h1>{anime.title}</h1>{anime.englishTitle && <p className="en-title">{anime.englishTitle}</p>}<div className="meta"><span>{anime.year || '—'}</span><span>{anime.status || 'Статус неизвестен'}</span><span>{anime.type || 'TV'}</span>{anime.rating && <span><Star size={16}/> {anime.rating}</span>}</div><p>{anime.description}</p><div className="tags">{anime.genres.map((g) => <span key={g}>{g}</span>)}</div><button className={`primary-btn ${fav.isFavorite(anime.id) ? 'active' : ''}`} onClick={() => fav.toggle(anime.id)}><Heart size={18} fill={fav.isFavorite(anime.id) ? 'currentColor' : 'none'}/> {fav.isFavorite(anime.id) ? 'В избранном' : 'Добавить в избранное'}</button></div></section>
    <section className="watch-card"><div className="watch-head"><h2><PlayCircle/> {selected?.title || 'Плеер'}</h2><span>{selected ? `Серия ${selected.number}` : 'Нет серий'}</span></div><VideoPlayer src={videoSrc} embedUrl={selected?.embedUrl} poster={selected?.preview || anime.poster} title={selected?.title}/></section>
    <section className="episodes"><h2>Серии внутри карточек</h2><div className="episode-grid">{anime.episodes.length ? anime.episodes.map((ep) => <button className={selected?.id === ep.id ? 'active' : ''} key={ep.id} onClick={() => setParams({ episode: String(ep.number) })}><b>Серия {ep.number}</b><span>{ep.title}</span></button>) : <p>У этого источника нет прямых серий. Можно подключить дополнительный backend-парсер или другой легальный API.</p>}</div></section>
  </div>;
}
