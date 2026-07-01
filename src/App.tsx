import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useProfileStore } from '@/store/profileStore';
import HomePage from '@/pages/HomePage';

const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const AnimePage = lazy(() => import('@/pages/AnimePage'));
const TopPage = lazy(() => import('@/pages/TopPage'));
const GenresPage = lazy(() => import('@/pages/GenresPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const ListsPage = lazy(() => import('@/pages/ListsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function Loader() { return <div className="loader page">Загружаем…</div>; }

export default function App() {
  const init = useAuthStore((s) => s.init);
  const initTheme = useThemeStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const getProfile = useProfileStore((s) => s.getProfile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  useEffect(() => { init(); initTheme(); }, [init, initTheme]);
  useEffect(() => {
    if (user && !getProfile(user.uid)) updateProfile(user.uid, { uid: user.uid, name: user.name || user.email.split('@')[0], email: user.email });
  }, [user, getProfile, updateProfile]);

  return <Suspense fallback={<Loader />}><Routes><Route element={<Layout />}><Route index element={<HomePage />} /><Route path="catalog" element={<CatalogPage />} /><Route path="anime/:source/:id" element={<AnimePage />} /><Route path="anime/:id" element={<AnimePage />} /><Route path="top" element={<TopPage />} /><Route path="genres" element={<GenresPage />} /><Route path="schedule" element={<SchedulePage />} /><Route path="login" element={<LoginPage />} /><Route path="register" element={<RegisterPage />} /><Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /><Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} /><Route path="history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} /><Route path="lists" element={<ProtectedRoute><ListsPage /></ProtectedRoute>} /><Route path="about" element={<Navigate to="/genres" replace />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes></Suspense>;
}
