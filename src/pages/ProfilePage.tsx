import { useAuthStore } from '@/store/authStore';
export default function ProfilePage(){ const user=useAuthStore(s=>s.user); return <div className="page"><div className="page-title"><h1>Профиль</h1><p>{user?.email}</p></div></div>; }
