import { useEffect, useState } from 'react';
const KEY = 'animenova_favorites';
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } });
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(favorites)), [favorites]);
  const toggle = (id: string) => setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  return { favorites, toggle, isFavorite: (id: string) => favorites.includes(id) };
}
