import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/anime';

type AuthContextValue = { user: User | null; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => void; };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const KEY = 'animenova_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
  });
  const save = (u: User | null) => { setUser(u); if (u) localStorage.setItem(KEY, JSON.stringify(u)); else localStorage.removeItem(KEY); };
  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email) { save({ email, name: email.split('@')[0] || 'Anime fan' }); },
    async register(name, email) { save({ email, name }); },
    logout() { save(null); },
  }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used inside AuthProvider'); return ctx; }
