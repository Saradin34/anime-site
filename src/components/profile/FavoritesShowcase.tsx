import type { ReleaseShort } from '@/types/anime';
import { posterUrl } from '@/api/anilibria';
import clsx from 'clsx';
export default function FavoritesShowcase({items=[]}:{items?:ReleaseShort[]}){ return <div className={clsx('grid')}>{items.map(i=><img key={i.id} src={posterUrl(i.poster)} />)}</div>; }
