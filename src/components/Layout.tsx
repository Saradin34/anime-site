import { Link, NavLink, Outlet } from 'react-router-dom';
import { LogOut, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  return <>
    <header className="navbar">
      <Link to="/" className="logo"><span><Sparkles size={22} /></span>AnimeNova</Link>
      <nav><NavLink to="/">Главная</NavLink><NavLink to="/catalog">Каталог</NavLink><NavLink to="/favorites">Избранное</NavLink><NavLink to="/about">API</NavLink></nav>
      <div className="auth-area">{user ? <><span className="user-chip"><UserRound size={16}/>{user.name}</span><button onClick={logout}><LogOut size={16}/></button></> : <Link className="login-link" to="/login">Войти</Link>}</div>
    </header>
    <main><Outlet /></main>
    <footer className="footer"><b>AnimeNova</b><span>React + TypeScript + Vite + Netlify. Видео открываются внутри карточек/страниц серий.</span></footer>
  </>;
}
