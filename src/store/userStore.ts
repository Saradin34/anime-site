import { create } from 'zustand';
import type { NotificationItem } from '@/types/anime';
type UserState={ notifications: Record<string, NotificationItem[]>; getNotifications:(uid:string)=>NotificationItem[]; markRead:(uid:string,id:string)=>void };
export const useUserStore=create<UserState>((set,get)=>({ notifications:{}, getNotifications:(uid)=>get().notifications[uid]||[], markRead:(uid,id)=>set((s)=>({notifications:{...s.notifications,[uid]:(s.notifications[uid]||[]).map(n=>n.id===id?{...n,read:true}:n)}})) }));
