import { useState } from 'react';
import { Link } from 'react-router-dom';
import { animeApi } from '@/api/anilibria';
import type { ReleaseShort } from '@/types/anime';
export default function SearchModal(){ const [q,setQ]=useState(''); const [items,setItems]=useState<ReleaseShort[]>([]); async function onChange(v:string){ setQ(v); if(v.trim().length>1) setItems(await animeApi.search(v)); else setItems([]); } return <div className="searchbar" style={{margin:0,maxWidth:420}}><input value={q} onChange={e=>onChange(e.target.value)} placeholder="Поиск аниме..." />{items.length>0&&<div style={{position:'absolute',top:64,background:'#151022',border:'1px solid rgba(255,255,255,.12)',borderRadius:16,padding:12,zIndex:50}}>{items.slice(0,5).map(r=><Link key={r.id} to={`/anime/${r.source||'anilibria'}/${r.id}`} style={{display:'block',padding:8}}>{r.title||r.name?.main}</Link>)}</div>}</div>; }
