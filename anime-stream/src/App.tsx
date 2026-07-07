import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useProfileStore } from '@/store/profileStore'

// Главная — НЕ lazy: грузится сразу, ничего не ждём (LCP-критично)
import HomePage from '@/pages/HomePage'

// Остальные страницы — lazy: каждая отдельный чанк
const CatalogPage = lazy(() => import('@/pages/CatalogPage'))
const AnimePage = lazy(() => import('@/pages/AnimePage'))
const TopPage = lazy(() => import('@/pages/TopPage'))
const GenresPage = lazy(() => import('@/pages/GenresPage'))
const SchedulePage = lazy(() => import('@/pages/SchedulePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const ListsPage = lazy(() => import('@/pages/ListsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-2 border-neon-purple border-t-transparent animate-spin" />
    </div>
  )
}

export default function App() {
  const init = useAuthStore((s) => s.init)
  const initTheme = useThemeStore((s) => s.init)
  const user = useAuthStore((s) => s.user)
  const getProfile = useProfileStore((s) => s.getProfile)
  const updateProfile = useProfileStore((s) => s.updateProfile)

  useEffect(() => { init(); initTheme() }, [init, initTheme])

  // Автосинхронизация Google-данных в локальный профиль
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
        <Route path="/catalog" element={<Suspense fallback={<PageFallback />}><CatalogPage /></Suspense>} />
        <Route path="/top" element={<Suspense fallback={<PageFallback />}><TopPage /></Suspense>} />
        <Route path="/genres" element={<Suspense fallback={<PageFallback />}><GenresPage /></Suspense>} />
        <Route path="/genres/:genre" element={<Suspense fallback={<PageFallback />}><CatalogPage /></Suspense>} />
        <Route path="/schedule" element={<Suspense fallback={<PageFallback />}><SchedulePage /></Suspense>} />
        <Route path="/anime/:code" element={<Suspense fallback={<PageFallback />}><AnimePage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<PageFallback />}><LoginPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<PageFallback />}><RegisterPage /></Suspense>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Suspense fallback={<PageFallback />}><ProfilePage /></Suspense>} />
          <Route path="/favorites" element={<Suspense fallback={<PageFallback />}><FavoritesPage /></Suspense>} />
          <Route path="/history" element={<Suspense fallback={<PageFallback />}><HistoryPage /></Suspense>} />
          <Route path="/lists" element={<Suspense fallback={<PageFallback />}><ListsPage /></Suspense>} />
          <Route path="/lists/:list" element={<Suspense fallback={<PageFallback />}><ListsPage /></Suspense>} />
        </Route>

        <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFoundPage /></Suspense>} />
      </Route>
    </Routes>
  )
}
