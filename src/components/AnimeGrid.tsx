import { AnimeCard } from './AnimeCard';
import type { ReleaseShort, Anime } from '@/types/anime';
function toAnime(r: ReleaseShort): Anime { return { id:String(r.id), code:r.code, source:(r.source as any)||'anilibria', title:r.title||r.name?.main||'Без названия', englishTitle:r.name?.english, poster:r.posterUrl||r.poster||r.image||'', banner:r.posterUrl||r.poster, description:r.description||'', genres:(r.genres||[]).map(g=>g.name), year:r.year, type: typeof r.type==='string'?r.type:r.type?.description, rating:r.rating, episodes:r.episodes||[] }; }
export default function AnimeGrid({ items=[] }: { items?: ReleaseShort[] }){ return <div className="grid">{items.map(r=><AnimeCard key={r.id} anime={toAnime(r)} favorite={false} onFavorite={()=>{}} />)}</div>; }
