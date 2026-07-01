import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AnimeCard } from '../components/AnimeCard';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { getLatestAnime } from '../services/animeApi';
import type { Anime } from '../types/anime';

export function Favorites() {
  const { user } = useAuth(); const fav = useFavorites(); const [items, setItems] = useState<Anime[]>([]);
  useEffect(() => { getLatestAnime().then((all) => setItems(all.filter((a) => fav.favorites.includes(a.id)))); }, [fav.favorites.join(',')]);
  if (!user) return <Navigate to="/login" />;
  return <div className="page"><div className="page-title"><h1>Избранное</h1><p>Тайтлы, которые вы сохранили в профиле.</p></div>{items.length ? <div className="grid">{items.map((a) => <AnimeCard key={a.id} anime={a} favorite={fav.isFavorite(a.id)} onFavorite={fav.toggle}/>)}</div> : <div className="empty"><h2>Пока пусто</h2><p>Добавьте понравившиеся аниме из каталога.</p><Link className="primary-btn" to="/catalog">Перейти в каталог</Link></div>}</div>;
}
