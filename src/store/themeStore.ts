import { create } from 'zustand';
export type ThemeMode = 'dark' | 'light' | 'system';
type ThemeState = { theme: ThemeMode; init: () => void; setTheme: (theme: ThemeMode) => void; toggle: () => void };
const KEY='animeflux_theme';
function apply(theme: ThemeMode){ document.documentElement.dataset.theme=theme; }
export const useThemeStore = create<ThemeState>((set,get)=>({ theme:'dark', init:()=>{ const t=(localStorage.getItem(KEY) as ThemeMode)||'dark'; apply(t); set({theme:t}); }, setTheme:(theme)=>{ localStorage.setItem(KEY,theme); apply(theme); set({theme}); }, toggle:()=> get().setTheme(get().theme==='dark'?'light':'dark') }));
