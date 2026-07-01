import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimeCard } from '../components/AnimeCard';
import { getLatestAnime, searchAnime } from '../services/animeApi';
import type { Anime } from '../types/anime';
import { useFavorites } from '../hooks/useFavorites';

export function Catalog() {
  const [items, setItems] = useState<Anime[]>([]); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const fav = useFavorites();
  useEffect(() => { getLatestAnime().then(setItems).finally(() => setLoading(false)); }, []);
  async function submit(e: React.FormEvent) { e.preventDefault(); setLoading(true); setItems(await searchAnime(query)); setLoading(false); }
  return <div className="page"><div className="page-title"><h1>Каталог аниме</h1><p>Поиск работает через AniLibria, затем через Jikan fallback.</p></div><form className="searchbar" onSubmit={submit}><Search/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Наруто, ван пис, магия…"/><button>Найти</button></form>{loading ? <div className="loader">Ищем тайтлы…</div> : <div className="grid">{items.map((a) => <AnimeCard key={`${a.source}-${a.id}`} anime={a} favorite={fav.isFavorite(a.id)} onFavorite={fav.toggle}/>)}</div>}</div>;
}
