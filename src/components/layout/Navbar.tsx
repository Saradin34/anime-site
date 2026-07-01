import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useProfileStore } from '@/store/profileStore';
import SearchModal from '@/components/SearchModal';
import ThemeToggle from '@/components/ThemeToggle';
import clsx from 'clsx';
export default function Navbar(){ const user=useAuthStore(s=>s.user); const notifications=useUserStore(s=>(user?s.getNotifications(user.uid):[])); const unread=notifications.filter(n=>!n.read).length; const profile=useProfileStore(s=>(user?s.getProfile(user.uid):null)); return <div className={clsx('navbar')}><Link to="/">AnimeFlux</Link><SearchModal/><ThemeToggle/><span>{unread}</span><span>{profile?.name||user?.name}</span></div>; }
