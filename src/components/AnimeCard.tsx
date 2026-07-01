import { Heart, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Anime } from '../types/anime';

type Props = { anime: Anime; favorite: boolean; onFavorite: (id: string) => void };
export function AnimeCard({ anime, favorite, onFavorite }: Props) {
  return <article className="anime-card">
    <Link className="poster-link" to={`/anime/${anime.source}/${anime.id}`}>
      <img src={anime.poster} alt={anime.title} loading="lazy" />
      <div className="poster-glow" />
      <span className="source-pill">{anime.source}</span>
      <span className="play-pill"><Play size={16} /> Смотреть</span>
    </Link>
    <div className="card-body">
      <div className="card-topline"><span>{anime.year || '—'}</span><span>{anime.type || 'TV'}</span>{anime.rating && <span><Star size={14} /> {anime.rating}</span>}</div>
      <Link to={`/anime/${anime.source}/${anime.id}`} className="card-title">{anime.title}</Link>
      <p>{anime.description.slice(0, 120)}{anime.description.length > 120 ? '…' : ''}</p>
      <div className="tags">{anime.genres.slice(0, 3).map((g) => <span key={g}>{g}</span>)}</div>
      <div className="episode-strip">
        {(anime.episodes.length ? anime.episodes : Array.from({ length: Math.min(anime.episodesCount || 1, 4) }, (_, i) => ({ number: i + 1 }))).slice(0,4).map((ep: any) => <Link key={ep.id || ep.number} to={`/anime/${anime.source}/${anime.id}?episode=${ep.number}`}>Серия {ep.number || 1}</Link>)}
      </div>
      <button className={`fav-btn ${favorite ? 'active' : ''}`} onClick={() => onFavorite(anime.id)}><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'В избранном' : 'В избранное'}</button>
    </div>
  </article>;
}
