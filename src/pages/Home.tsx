import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, ShieldCheck, Tv } from 'lucide-react';
import { AnimeCard } from '../components/AnimeCard';
import { getLatestAnime } from '../services/animeApi';
import type { Anime } from '../types/anime';
import { useFavorites } from '../hooks/useFavorites';

export function Home() {
  const [anime, setAnime] = useState<Anime[]>([]); const [loading, setLoading] = useState(true);
  const fav = useFavorites();
  useEffect(() => { getLatestAnime().then(setAnime).finally(() => setLoading(false)); }, []);
  const hero = anime[0];
  return <div>
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(11,7,20,.98), rgba(11,7,20,.72), rgba(11,7,20,.94)), url(${hero?.banner || ''})` }}>
      <div className="hero-content"><span className="eyebrow"><Flame size={18}/> новый уровень аниме-портала</span><h1>Смотри серии прямо внутри красивых карточек</h1><p>Каталог, поиск, маршрутизация, авторизация, избранное и видеоплеер HLS. Данные подтягиваются из бесплатных API, а при недоступности включается демо-режим.</p><div className="hero-actions"><Link to="/catalog" className="primary-btn">Открыть каталог <ArrowRight size={18}/></Link><Link to="/about" className="ghost-btn">Источники API</Link></div></div>
      <div className="hero-card"><Tv/><h3>{hero?.title || 'AnimeNova'}</h3><p>{hero?.description?.slice(0, 150)}</p></div>
    </section>
    <section className="features"><div><ShieldCheck/><b>Авторизация</b><span>Локальная демо-авторизация готова к замене на Supabase/Firebase.</span></div><div><Tv/><b>Серии в карточках</b><span>В каждой карточке есть быстрые ссылки на эпизоды.</span></div><div><Flame/><b>API fallback</b><span>AniLibria → Jikan → демо-данные.</span></div></section>
    <section className="section-head"><h2>Последние обновления</h2><Link to="/catalog">Все тайтлы</Link></section>
    {loading ? <div className="loader">Загружаем аниме…</div> : <div className="grid">{anime.slice(0,8).map((a) => <AnimeCard key={`${a.source}-${a.id}`} anime={a} favorite={fav.isFavorite(a.id)} onFavorite={fav.toggle}/>)}</div>}
  </div>;
}
