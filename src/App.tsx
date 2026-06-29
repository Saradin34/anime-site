import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import CatalogPage from '@/pages/CatalogPage'
import AnimePage from '@/pages/AnimePage'
import TopPage from '@/pages/TopPage'
import GenresPage from '@/pages/GenresPage'
import SchedulePage from '@/pages/SchedulePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfilePage from '@/pages/ProfilePage'
import FavoritesPage from '@/pages/FavoritesPage'
import HistoryPage from '@/pages/HistoryPage'
import ListsPage from '@/pages/ListsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useProfileStore } from '@/store/profileStore'

export default function App() {
  const init = useAuthStore((s) => s.init)
  const initTheme = useThemeStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const getProfile = useProfileStore((s) => s.getProfile)
  const updateProfile = useProfileStore((s) => s.updateProfile)

  // Инициализация авторизации и темы
  useEffect(() => { init(); initTheme() }, [init, initTheme])

  // Автосинхронизация Google-данных (фото + имя) в локальный профиль.
  // Срабатывает только если в локальном профиле этих полей ещё нет —
  // не перетирает кастомные значения пользователя.
  useEffect(() => {
    if (!user) return
    const p = getProfile(user.uid)
    const patch: Record<string, string | null> = {}
    if (!p.avatar && user.photoURL) patch.avatar = user.photoURL
    if (!p.displayName && user.displayName) patch.displayName = user.displayName
    if (Object.keys(patch).length) updateProfile(user.uid, patch)
  }, [user, getProfile, updateProfile])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/top" element={<TopPage />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/genres/:genre" element={<CatalogPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/anime/:code" element={<AnimePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/lists" element={<ListsPage />} />
          <Route path="/lists/:list" element={<ListsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
