import { create } from 'zustand';
export type AuthUser = { uid: string; email: string; name?: string; avatar?: string };
type AuthState = { user: AuthUser | null; init: () => void; login: (email: string, password?: string) => void; register: (name: string, email: string, password?: string) => void; logout: () => void };
const KEY='animeflux_auth_user';
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  init: () => { try { set({ user: JSON.parse(localStorage.getItem(KEY) || 'null') }); } catch { set({ user: null }); } },
  login: (email) => { const user={ uid: btoa(email).replace(/=/g,''), email, name: email.split('@')[0] }; localStorage.setItem(KEY, JSON.stringify(user)); set({ user }); },
  register: (name,email) => { const user={ uid: btoa(email).replace(/=/g,''), email, name }; localStorage.setItem(KEY, JSON.stringify(user)); set({ user }); },
  logout: () => { localStorage.removeItem(KEY); set({ user: null }); },
}));
