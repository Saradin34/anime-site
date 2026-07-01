import type { ReleaseShort } from '@/types/anime';
import { posterUrl } from '@/api/anilibria';
import clsx from 'clsx';
export default function ShowcasePicker({items=[]}:{items?:ReleaseShort[]}){ return <div className={clsx('info-card')}>{items.length}</div>; }
