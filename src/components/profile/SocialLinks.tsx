import type { ReactElement } from 'react';
import type { SocialLinks as SocialLinksType } from '@/types/anime';
type LinkKey = Extract<keyof SocialLinksType, string>;
const LINK_DEFS: { key: LinkKey; label: string; icon: ReactElement; placeholder: string; format?: (v: string) => string }[] = [
  { key:'telegram', label:'Telegram', icon:<span>tg</span>, placeholder:'@username' },
  { key:'vk', label:'VK', icon:<span>vk</span>, placeholder:'vk.com/id' },
];
export default function SocialLinks({links={}}:{links?:SocialLinksType}){ return <div>{LINK_DEFS.map(d=><div key={d.key} className="flex items-center gap-2"><span>{d.icon}</span><span>{d.label}</span><span>{links[d.key]}</span></div>)}</div>; }
