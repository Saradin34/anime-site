import { create } from 'zustand';
import type { UserProfile, NotificationItem } from '@/types/anime';
type ProfileState = { profiles: Record<string, UserProfile>; getProfile: (uid: string) => UserProfile | null; updateProfile: (uid: string, patch: Partial<UserProfile>) => void };
const KEY='animeflux_profiles';
const read=()=>{ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}} };
export const useProfileStore=create<ProfileState>((set,get)=>({ profiles: read(), getProfile:(uid)=>get().profiles[uid]||null, updateProfile:(uid,patch)=>set((s)=>{ const next={...s.profiles,[uid]:{...(s.profiles[uid]||{uid}),...patch}}; localStorage.setItem(KEY,JSON.stringify(next)); return {profiles:next}; }) }));
export type { NotificationItem };
