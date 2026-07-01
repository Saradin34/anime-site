import { animeApi } from '@/api/anilibria';
import type { Release, Episode as LibriaEpisode } from '@/types/anime';
export async function searchAll(query: string): Promise<Release[]> { return animeApi.search(query) as Promise<Release[]>; }
export async function getAggregatedRelease(id: string): Promise<Release | null> { return animeApi.get(id) as Promise<Release | null>; }
export type { Release, LibriaEpisode };
