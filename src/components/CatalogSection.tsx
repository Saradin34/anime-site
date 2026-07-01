import { useEffect, useState } from 'react';
import { animeApi } from '@/api/anilibria';
import type { ReleaseShort, Genre } from '@/types/anime';
import AnimeGrid from '@/components/AnimeGrid';
import InfiniteSentinel from '@/components/InfiniteSentinel';
import clsx from 'clsx';
export default function CatalogSection(){ const [items,setItems]=useState<ReleaseShort[]>([]); const [years,setYears]=useState<number[]>([]); const [genres,setGenres]=useState<Genre[]>([]); useEffect(()=>{ animeApi.latest().then(setItems); animeApi.years().then((y:number[])=>setYears(y.slice().reverse())).catch(()=>{}); animeApi.genres().then(setGenres).catch(()=>{}); },[]); return <section className={clsx('page')}><AnimeGrid items={items}/><InfiniteSentinel/></section>; }
