import { SunMoon } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';
import clsx from 'clsx';
export default function ThemeToggle(){ const toggle=useThemeStore(s=>s.toggle); const theme: ThemeMode=useThemeStore(s=>s.theme); return <button className={clsx('ghost-btn')} onClick={toggle} title={theme}><SunMoon size={16}/></button>; }
