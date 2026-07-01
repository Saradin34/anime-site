import type { ReleaseShort } from '@/types/anime';
import clsx from 'clsx';
export default function HeroSlider({items=[]}:{items?:ReleaseShort[]}){ const cur=items[0]; return <section className={clsx('hero')}><div><h1>{cur?.title||cur?.name?.main||'AnimeFlux'}</h1><div className="tags">{cur?.genres?.slice(0,3).map((g)=><span key={g.name}>{g.name}</span>)}</div></div></section>; }
