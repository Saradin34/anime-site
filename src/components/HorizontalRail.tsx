import AnimeGrid from './AnimeGrid';
import type { ReleaseShort } from '@/types/anime';
export default function HorizontalRail({items=[]}:{items?:ReleaseShort[]}){ return <AnimeGrid items={items}/>; }
