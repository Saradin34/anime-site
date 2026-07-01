import type { Anime, Episode } from '../types/anime';
import { demoAnime } from '../data';

const AL_BASE = '/api/anilibria-v3';
const JIKAN_BASE = '/api/jikan';
const POSTER_HOST = 'https://anilibria.top';

type AniLibriaTitle = {
  id: number; code: string;
  names?: { ru?: string; en?: string; alternative?: string | null };
  posters?: { original?: { url?: string }; medium?: { url?: string } };
  type?: { full_string?: string; string?: string; episodes?: number; series?: number };
  genres?: string[]; season?: { year?: number };
  description?: string; status?: { string?: string };
  updated?: number;
  player?: { host?: string; alternative_player?: string | null; episodes?: { last?: number }; list?: Record<string, { episode: number; name?: string | null; preview?: string | null; hls?: { sd?: string; hd?: string; fhd?: string } }> };
};

function absUrl(url?: string, host = POSTER_HOST) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
}

function mapAniLibria(item: AniLibriaTitle): Anime {
  const poster = absUrl(item.posters?.original?.url || item.posters?.medium?.url) || demoAnime[0].poster;
  const playerHost = item.player?.host ? `https://${item.player.host}` : '';
  const episodes: Episode[] = Object.values(item.player?.list || {}).map((ep) => ({
    id: `${item.id}-${ep.episode}`,
    number: ep.episode,
    title: ep.name || `Серия ${ep.episode}`,
    preview: absUrl(ep.preview || undefined, playerHost || POSTER_HOST),
    hls: {
      sd: absUrl(ep.hls?.sd, playerHost),
      hd: absUrl(ep.hls?.hd, playerHost),
      fhd: absUrl(ep.hls?.fhd, playerHost),
    },
    embedUrl: item.player?.alternative_player ? absUrl(item.player.alternative_player) : undefined,
  }));

  return {
    id: String(item.id), code: item.code, source: 'anilibria',
    title: item.names?.ru || item.names?.en || 'Без названия', englishTitle: item.names?.en,
    poster, banner: poster,
    description: item.description || 'Описание скоро появится.',
    genres: item.genres || [], year: item.season?.year,
    status: item.status?.string, type: item.type?.full_string || item.type?.string,
    episodesCount: item.type?.episodes || item.type?.series || item.player?.episodes?.last || episodes.length,
    episodes, updatedAt: item.updated,
  };
}

function mapJikan(item: any): Anime {
  return {
    id: String(item.mal_id), source: 'jikan', title: item.title_russian || item.title || 'Без названия', englishTitle: item.title_english,
    poster: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || demoAnime[1].poster,
    banner: item.trailer?.images?.maximum_image_url || item.images?.webp?.large_image_url,
    description: item.synopsis || 'Описание недоступно в Jikan.',
    genres: (item.genres || []).map((g: any) => g.name), year: item.year,
    status: item.status, type: item.type, rating: item.score, episodesCount: item.episodes,
    episodes: item.trailer?.embed_url ? [{ id: `${item.mal_id}-trailer`, number: 0, title: 'Трейлер', embedUrl: item.trailer.embed_url }] : [],
  };
}

async function jsonFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function getLatestAnime(): Promise<Anime[]> {
  try {
    const data = await jsonFetch<{ list: AniLibriaTitle[] }>(`${AL_BASE}/title/updates?limit=18&items_per_page=18&playlist_type=array`);
    const list = (data.list || []).map(mapAniLibria);
    if (list.length) return list;
  } catch (e) {
    console.warn('AniLibria unavailable, using Jikan fallback', e);
  }

  try {
    const data = await jsonFetch<{ data: any[] }>(`${JIKAN_BASE}/top/anime?filter=airing&limit=18`);
    const list = (data.data || []).map(mapJikan);
    return [...demoAnime, ...list];
  } catch (e) {
    console.warn('Jikan unavailable, using demo data', e);
    return demoAnime;
  }
}

export async function searchAnime(query: string): Promise<Anime[]> {
  if (!query.trim()) return getLatestAnime();
  try {
    const data = await jsonFetch<{ list: AniLibriaTitle[] }>(`${AL_BASE}/title/search?search=${encodeURIComponent(query)}&limit=24&playlist_type=array`);
    const list = (data.list || []).map(mapAniLibria);
    if (list.length) return list;
  } catch {}
  try {
    const data = await jsonFetch<{ data: any[] }>(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=24`);
    return (data.data || []).map(mapJikan);
  } catch {
    return demoAnime.filter((a) => `${a.title} ${a.englishTitle}`.toLowerCase().includes(query.toLowerCase()));
  }
}

export async function getAnimeById(id: string, source: string = 'anilibria'): Promise<Anime | undefined> {
  const local = demoAnime.find((a) => a.id === id);
  if (local) return local;
  if (source === 'jikan') {
    try { const data = await jsonFetch<{ data: any }>(`${JIKAN_BASE}/anime/${id}`); return mapJikan(data.data); } catch { return undefined; }
  }
  try {
    const data = await jsonFetch<AniLibriaTitle>(`${AL_BASE}/title?id=${encodeURIComponent(id)}&playlist_type=array`);
    return mapAniLibria(data);
  } catch {
    const all = await getLatestAnime();
    return all.find((a) => a.id === id);
  }
}

export const apiInfo = [
  'AniLibria/AniLiberty: публичный каталог, плеер и HLS-серии, если API доступен из региона.',
  'Jikan: бесплатный API MyAnimeList для каталога/рейтингов/трейлеров без ключа.',
  'AnimeVost/Anime-bit: добавлены как план расширения через backend/proxy, потому парсинг чужих сайтов в браузере часто блокируется CORS и может нарушать правила сайта.',
];
