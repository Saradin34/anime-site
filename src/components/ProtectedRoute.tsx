import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { ReactNode } from 'react';
export default function ProtectedRoute({ children }: { children: ReactNode }) { const user = useAuthStore((s) => s.user); return user ? <>{children}</> : <Navigate to="/login" replace />; }
